import "core-js/actual/iterator";
import z from "zod";
import { match } from "ts-pattern";
import merge from "lodash/merge";
import { pipe } from "fp-ts/lib/function";
import { concat, map } from "fp-ts/lib/Array";
import { cross, keyexclude, raise } from "@/utils";
import { JSONSerializable } from "@/api/json";
import { PrintableError } from "@/api/error";
import { JSDelivrGithubDependency } from "@/api/providers/jsdelivr:github/dependency";
import { JSDelivrGithubSource } from "@/api/providers/jsdelivr:github/source";
import { httpSource, httpsSource } from "@/api/providers/http/source";
import { ForbiddenExplicitHTTPSource } from "@/api/providers/http/error";
import { GithubSource } from "@/api/providers/github/source";
import { JSDelivrNPMSource } from "@/api/providers/jsdelivr:npm/source";
import { HTTPDependency } from "@/api/providers/http/dependency";
import { GithubDependency } from "@/api/providers/github/dependency";
import { JSDelivrNPMDependency } from "@/api/providers/jsdelivr:npm/dependency";
import { Dependency } from "../dependency/dependency";
import { Source, SourceSchema } from "../source";
import { not } from "fp-ts/lib/Predicate";

export class ProjectSpecification
  implements JSONSerializable<ProjectSpecificationSchema>
{
  public readonly version?: string;
  public readonly dependencies: Map<string, Dependency>;
  public readonly sources: Map<string, Source>;
  public readonly config: ConfigSchema;

  constructor(properties: ProjectSpecificationSchema) {
    const parsed = ProjectSpecificationSchema.parse(properties);
    this.version = parsed.version;

    // Parse sources
    this.sources = pipe(
      Object.entries(parsed.sources ?? {}),
      map(([id, source]: [string, SourceSchema]) => merge({ id }, source)),
      map(s =>
        match(s)
          .with({ provider: "http" }, () =>
            raise(new ForbiddenExplicitHTTPSource()),
          )
          .with({ provider: "https" }, () =>
            raise(new ForbiddenExplicitHTTPSource()),
          )
          .with({ provider: "github" }, s => new GithubSource(s))
          .with({ provider: "jsdelivr:npm" }, s => new JSDelivrNPMSource(s))
          .with(
            { provider: "jsdelivr:github" },
            s => new JSDelivrGithubSource(s),
          )
          .otherwise(({ provider }) =>
            raise(new PrintableError(`Unknown source provider: ${provider}`)),
          ),
      ),
      map(source => [source.id, source] as [string, Source]),
      concat([
        ["http", httpSource] as [string, Source],
        ["https", httpsSource] as [string, Source],
      ]),
      entries => new Map<string, Source>(entries),
    );

    this.dependencies = pipe(
      Object.entries(parsed.dependencies),
      map(([id, dependency]: [string, Dependency]) => ({
        dependency: merge({ id }, dependency),
        sourceId:
          dependency.uri.split("://").at(0) ??
          raise(new PrintableError(`Invalid URI: ${dependency.uri}`)),
      })),
      map(({ dependency, sourceId }) => ({
        dependency,
        source:
          this.sources.get(sourceId) ??
          raise(new PrintableError(`Source ${sourceId} not found.`)),
      })),
      map(({ dependency, source }) => ({
        dependency,
        source,
        provider: source.provider,
      })),
      map(cfg =>
        match(cfg)
          .with(
            { provider: "http" },
            ({ dependency, source }) =>
              new HTTPDependency(dependency as any, source),
          )
          .with(
            { provider: "github" },
            ({ dependency, source }) =>
              new GithubDependency(dependency as any, source),
          )
          .with(
            { provider: "jsdelivr:npm" },
            ({ dependency, source }) =>
              new JSDelivrNPMDependency(
                dependency as any,
                source as JSDelivrNPMSource,
              ),
          )
          .with(
            { provider: "jsdelivr:github" },
            ({ dependency, source }) =>
              new JSDelivrGithubDependency(
                dependency as any,
                source as JSDelivrGithubSource,
              ),
          )
          .otherwise(({ provider }) =>
            raise(new PrintableError(`Unknown provider: ${provider}`)),
          ),
      ),
      map((dependency: Dependency) => [dependency.id, dependency] as const),
      entries => new Map<string, Dependency>(entries),
    );

    // Parse config
    this.config = parsed.config ?? ConfigSchema.parse({});

    // Validate destination paths
    const destinations = this.dependencies
      .values()
      .toArray()
      .map(({ destinations }) => destinations)
      .flat();
    for (const destination of destinations) {
      if (destination.endsWith("/")) {
        throw new PrintableError(
          `Destination configuration error: ${destination}. \n` +
            "You must specify a name of file or directory.",
        );
      }
    }
    for (const [a, b] of cross(destinations, destinations)) {
      if (a !== b && b.startsWith(a) && b[a.length] === "/") {
        throw new PrintableError(
          `Conflicting destination configuration: ${a} and ${b}. \n` +
            "Please make sure that the destination paths do not overlap.",
        );
      }
    }
  }

  @JSONSerializable()
  toJSON() {
    return {
      version: this.version,
      dependencies: Object.fromEntries(
        this.dependencies
          .values()
          .toArray()
          .map(d => d.toJSON())
          .map(d => [d.id, pipe(d, keyexclude(["id"]))]),
      ),
      sources:
        this.sources &&
        Object.fromEntries(
          this.sources
            ?.values()
            .toArray()
            .filter(not(s => ["http", "https"].includes(s.id)))
            .map(s => s.toJSON())
            .map(s => [s.id, pipe(s, keyexclude(["id"]))]),
        ),
      config: this.config,
    };
  }
}

const ConfigSchema = z.object({
  envFile: z.string().optional().default(".env"),
  deleteFilesOnRemove: z.boolean().optional().default(false),
});

type ConfigSchema = z.infer<typeof ConfigSchema>;

export const ProjectSpecificationSchema = z.object({
  version: z.string().optional(),
  dependencies: z.record(z.any()),
  sources: z.record(z.any()).optional(),
  config: ConfigSchema.optional(),
});

export type ProjectSpecificationSchema = z.infer<
  typeof ProjectSpecificationSchema
>;
