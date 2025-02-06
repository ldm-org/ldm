import semver from "semver";
import { Version } from "../version";

export class VersionSpecifier {
  public get semver() {
    return parseRange(this.specifier);
    function parseRange(specifier: string) {
      try {
        const range = new semver.Range(specifier);
        return range;
      } catch {
        return undefined;
      }
    }
  }

  get isSemver(): boolean {
    return this.semver !== undefined;
  }

  get isLatest(): boolean {
    return this.specifier === "latest";
  }

  constructor(protected readonly specifier: string) {}

  test(version: string | Version): boolean {
    if (this.isSemver) {
      // If the specifier is a semver range,
      // use the semver library to test the version.
      return this.semver!.test(version.toString());
    } else if (this.isLatest) {
      // If the specifier is "latest",
      // always return true.
      return true;
    } else {
      // Otherwise, do a simple string comparison.
      return this.specifier === version.toString();
    }
  }

  toString() {
    return this.specifier;
  }
}
