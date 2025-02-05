import z from "zod";
import { JSONSerializable } from "@/api/json";
import { Source } from "../../source";
import { Plan } from "../plan";
import { Version, VersionSpecifier } from "../../version";

export abstract class Dependency implements JSONSerializable<Dependency.Init> {
  public readonly id: string;
  public readonly uri: string;
  public readonly destinations: string[];
  public readonly version: string;

  public readonly source: Source;

  abstract get specifier(): VersionSpecifier;

  get path(): string {
    const [, path] = this.uri.split("://");
    return path;
  }

  constructor(
    properties: DependencySchema,
    source: Source,
    options?: Dependency.InitOptions,
  ) {
    const { validate = true } = options ?? {};
    if (validate) {
      DependencySchema.parse(properties);
    }
    const destinations =
      "destination" in properties
        ? [properties.destination]
        : properties.destinations;

    this.id = properties.id;
    this.uri = properties.uri;
    this.version = properties.version ?? "latest";
    this.destinations = destinations;
    this.source = source;
  }

  abstract plan(options: Dependency.PlanOptions): Plan | Promise<Plan>;

  abstract getLatestVersion(
    specifier?: VersionSpecifier | string,
  ): Version | Promise<Version>;

  getExtendedURI(): string {
    return `${this.source.provider}+${this.uri}:${this.specifier.toString()}`;
  }

  @JSONSerializable()
  toJSON() {
    return {
      id: this.id,
      uri: this.uri,
      version: this.version,
      destinations: this.destinations,
    };
  }
}

export namespace Dependency {
  export interface Init {
    id: string;
    uri: string;
    version: string;
    destinations: string[];
  }

  export interface InitOptions {
    validate?: boolean;
  }

  export interface PlanOptions {
    version: Version;
  }
}

export const DependencySchema = z.intersection(
  z.object({
    id: z.string(),
    uri: z.string(),
    version: z.string().optional().default("latest"),
  }),
  z.union([
    z.object({
      destination: z.string(),
    }),
    z.object({
      destinations: z.array(z.string()),
    }),
  ]),
);

export type DependencySchema = z.infer<typeof DependencySchema>;
