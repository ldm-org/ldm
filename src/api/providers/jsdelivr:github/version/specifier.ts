import { PrintableError } from "@/api/error";
import { VersionSpecifier } from "@/api/models/version";
import { JSDelivrAPIClient } from "../../jsdelivr/api";
import { JSDelivrGithubSource } from "../source";

export class JSDelivrGithubVersionSpecifier extends VersionSpecifier {
  public readonly source: JSDelivrGithubSource;
  protected readonly client: JSDelivrAPIClient;

  constructor(options: { specifier: string; source: JSDelivrGithubSource }) {
    const { specifier, source } = options;
    super(specifier);
    this.source = source;

    if (!this.isSemver && !this.isLatest) {
      throw new PrintableError(`Invalid version specifier: ${specifier}`);
    }
  }
}
