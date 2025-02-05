import { PrintableError } from "@/api/error";
import { VersionSpecifier } from "@/api/models/version";

export class HTTPVersionSpecifier extends VersionSpecifier {
  constructor(specifier: string) {
    super(specifier);
    if (!this.isLatest) {
      throw new PrintableError(
        "HTTP dependencies only support 'latest' version specifier",
      );
    }
  }
}
