import { PrintableError } from "@/api/error";
import { Source, SourceSchema } from "@/api/models/source/source";

const httpProtocols = ["http", "https"];

export class HTTPSource extends Source {
  constructor(properties: SourceSchema) {
    super(properties);
    if (!httpProtocols.includes(this.id)) {
      throw new PrintableError(
        `Invalid source id: ${this.id}. HTTPSource only allows ${httpProtocols.join(", ")} as source ids.`,
      );
    }
    if (!httpProtocols.includes(this.uri)) {
      throw new PrintableError(
        `Invalid source uri: ${this.uri}. HTTPSource only allows ${httpProtocols.join(", ")} as source uris.`,
      );
    }
    if (this.id !== this.uri) {
      throw new PrintableError(
        `Source id and uri must be the same for HTTPSource. Found id: ${this.id}, uri: ${this.uri}.`,
      );
    }
  }
}

export const httpSource = new HTTPSource({
  id: "http",
  provider: "http",
  uri: "http",
});

export const httpsSource = new HTTPSource({
  id: "https",
  provider: "http",
  uri: "https",
});
