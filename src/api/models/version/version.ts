import semver from "semver";

export class Version {
  get isSemver() {
    return !!semver.valid(this.version);
  }

  constructor(protected readonly version: string) {}

  toString(format: "preserve" | "clean" = "preserve") {
    switch (format) {
      case "clean":
        return semver.clean(this.version) || this.version;
      default:
        return this.version;
    }
  }

  equals(other: Version | string) {
    const literallyEquals = this.version === other.toString();
    try {
      const semverEquals = semver.eq(this.version, other.toString());
      return semverEquals || literallyEquals;
    } catch {
      return literallyEquals;
    }
  }
}
