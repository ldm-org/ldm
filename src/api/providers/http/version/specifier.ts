import { PrintableError } from "@/api/error";
import { Version, VersionSpecifier } from "@/api/models/version";

export class HTTPVersionSpecifier extends VersionSpecifier {
  constructor(specifier: string) {
    super(specifier);
    if (!this.isLatest) {
      throw new PrintableError(
        "HTTP dependencies only support 'latest' version specifier",
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test(version: string | Version): boolean {
    return true;
  }
}
