import "core-js/actual/iterator";
import z from "zod";
import merge from "lodash/merge";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/Array";
import { JSONSerializable } from "@/api/json";
import { DependencyLock } from "../dependency";
import { keyexclude } from "@/utils";

export class LockInfo implements JSONSerializable<LockInfoSchema> {
  public version?: string;
  public dependencies: Map<string, DependencyLock>;

  constructor(properties: LockInfoSchema) {
    const parsed = LockInfoSchema.parse(properties);
    this.version = parsed.version;
    this.dependencies = new Map(
      pipe(
        Object.entries(parsed.dependencies),
        map(([id, d]) => [id, new DependencyLock(merge({ id }, d))] as const),
      ),
    );
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
          .map(d => [d.id, pipe(d, keyexclude(["id"]))] as [string, any]),
      ),
    };
  }
}

export const LockInfoSchema = z.object({
  version: z.string().optional(),
  dependencies: z.record(z.any()),
});

export type LockInfoSchema = z.infer<typeof LockInfoSchema>;
