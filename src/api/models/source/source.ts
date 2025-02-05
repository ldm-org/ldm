import z from "zod";
import { JSONSerializable } from "@/api/json";

export class Source implements JSONSerializable<SourceSchema> {
  public readonly id: string;
  public readonly uri: string;
  public readonly provider: string;

  constructor(properties: SourceSchema, opts?: { validate?: boolean }) {
    const { validate = true } = opts ?? {};
    if (validate) {
      SourceSchema.parse(properties);
    }
    Object.assign(this, properties);
  }

  prepare(): void | Promise<void> {}

  @JSONSerializable()
  toJSON() {
    return {
      id: this.id,
      uri: this.uri,
      provider: this.provider,
    };
  }
}

export const SourceSchema = z.object({
  id: z.string(),
  uri: z.string(),
  provider: z.string(),
});

export type SourceSchema = z.infer<typeof SourceSchema>;
