import "core-js/actual/iterator";
import z from "zod";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/Array";
import merge from "lodash/merge";
import { keyexclude } from "@/utils";
import { JSONSerializable } from "@/api/json";
import { PrintableError } from "@/api/error";
import { LockedArtifact } from "../artifact";
import { Version, VersionSpecifier } from "../../version";

export class DependencyLock implements JSONSerializable<DependencyLockSchema> {
  public readonly id: string;
  public uri: string;
  public version: Version;
  public artifacts: Map<string, LockedArtifact>;
  public destinations: string[];
  public url?: string;

  get locked(): boolean {
    return !!this.artifacts;
  }

  get specifier(): VersionSpecifier {
    const specifier = this.uri.split(":").at(-1);
    if (!specifier) {
      throw new PrintableError(
        `Invalid dependency lock ID: ${this.id}. Missing version specifier.`,
      );
    }
    return new VersionSpecifier(specifier);
  }

  set specifier(specifier: VersionSpecifier) {
    const segments = this.uri.split(":");
    segments[segments.length - 1] = specifier.toString();
  }

  get source(): { provider: string; id: string } {
    const [provider, uri] = this.uri.split("+", 2);
    const [sourceId] = uri.split("://", 2);
    return { provider, id: sourceId };
  }

  constructor(properties: DependencyLockSchema) {
    const parsed = DependencyLockSchema.parse(properties);
    this.id = parsed.id;
    this.uri = parsed.uri;
    this.url = parsed.url;
    this.version = new Version(parsed.version);
    this.artifacts = pipe(
      Object.entries(parsed.artifacts),
      map(
        ([path, artifact]) =>
          [path, new LockedArtifact(merge({ path }, artifact))] as const,
      ),
      entries => new Map(entries),
    );
    this.destinations = parsed.destinations;
  }

  @JSONSerializable()
  toJSON() {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      version: this.version.toString(),
      destinations: this.destinations,
      artifacts:
        this.artifacts &&
        Object.fromEntries(
          this.artifacts
            .values()
            .toArray()
            .map(a => a.toJSON())
            .map(a => [a.path, pipe(a, keyexclude(["path"]))] as [string, any]),
        ),
    };
  }
}

export const DependencyLockSchema = z.object({
  id: z.string(),
  uri: z.string(),
  version: z.string(),
  artifacts: z.record(z.any()),
  destinations: z.array(z.string()),
  url: z.string().optional(),
});

export type DependencyLockSchema = z.infer<typeof DependencyLockSchema>;
