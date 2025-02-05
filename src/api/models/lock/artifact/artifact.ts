import z from "zod";
import SHA256 from "crypto-js/sha256";
import { JSONSerializable } from "@/api/json";

export class LockedArtifact implements JSONSerializable<LockedArtifactSchema> {
  public readonly path: string;
  public readonly hash: string;
  public readonly url?: string;

  static fromContent(path: string, content: string | Buffer) {
    return new LockedArtifact({
      path,
      hash: SHA256(content.toString()).toString(),
    });
  }

  constructor(properties: LockedArtifactSchema) {
    Object.assign(this, LockedArtifactSchema.parse(properties));
  }

  @JSONSerializable()
  toJSON() {
    return {
      path: this.path,
      hash: this.hash,
      url: this.url,
    };
  }
}

export const LockedArtifactSchema = z.object({
  path: z.string(),
  hash: z.string(),
  url: z.string().optional(),
});

export type LockedArtifactSchema = z.infer<typeof LockedArtifactSchema>;
