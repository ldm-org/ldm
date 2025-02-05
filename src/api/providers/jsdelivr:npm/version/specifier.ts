import { PrintableError } from "@/api/error";
import { VersionSpecifier } from "@/api/models/version";
import { JSDelivrAPIClient } from "../../jsdelivr/api";
import { JSDelivrNPMSource } from "../source";

export class JSDelivrNPMVersionSpecifier extends VersionSpecifier {
  declare public readonly source: JSDelivrNPMSource;
  protected readonly client: JSDelivrAPIClient;

  constructor(options: { specifier: string; source: JSDelivrNPMSource }) {
    const { specifier, source } = options;
    super(specifier);
    this.source = source;

    if (!this.isSemver && !this.isLatest) {
      throw new PrintableError(`Invalid version specifier: ${specifier}`);
    }
  }
}
