import { SourceSchema } from "@/api/models/source";
import { JSDelivrSource } from "../../jsdelivr/source";

const packageNameRegex =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export class JSDelivrNPMSource extends JSDelivrSource {
  declare public readonly provider: "jsdelivr:npm";

  get isScoped(): boolean {
    return this.uri.startsWith("@") && this.uri.split("/").length === 2;
  }

  get package() {
    return {
      scope: this.isScoped ? this.uri.split("/").at(0)!.slice(1) : undefined,
      name: this.isScoped ? this.uri.split("/").at(1)! : this.uri,
    };
  }

  constructor(properties: SourceSchema, opts?: JSDelivrSource.Options) {
    super(properties, opts);
    if (!packageNameRegex.test(this.uri)) {
      throw new Error(`Invalid npm package name: ${this.uri}`);
    }
  }
}
