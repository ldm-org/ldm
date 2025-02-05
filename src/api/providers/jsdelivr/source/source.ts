import { Source, SourceSchema } from "@/api/models/source";
import { JSDelivrAPIClient } from "../../jsdelivr/api";

export class JSDelivrSource extends Source {
  protected readonly client: JSDelivrAPIClient;

  constructor(properties: SourceSchema, opts?: JSDelivrSource.Options) {
    const parsed = SourceSchema.parse(properties);
    super(parsed);
    const { client } = opts ?? {};
    this.client = client ?? JSDelivrAPIClient;
  }

  getClient() {
    return this.client;
  }
}

export namespace JSDelivrSource {
  export interface Options {
    client?: JSDelivrAPIClient;
  }
}
