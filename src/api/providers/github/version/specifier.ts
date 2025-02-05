import { PrintableError } from "@/api/error";
import { GithubSource } from "../source";
import { CommitSha } from "./version";
import { VersionSpecifier } from "@/api/models/version";

export class GithubVersionSpecifier extends VersionSpecifier {
  protected readonly source: GithubSource;
  protected readonly path: string;

  constructor(options: {
    specifier: string;
    path: string;
    source: GithubSource;
  }) {
    const { specifier, source } = options;
    super(specifier);
    this.source = source;
    this.path = options.path;

    if (!this.isSemver && !this.isCommitHash && !this.isLatest) {
      throw new PrintableError(`Invalid version specifier: ${specifier}`);
    }
  }

  get isCommitHash() {
    return this.specifier.match(CommitSha.regex) !== null;
  }
}
