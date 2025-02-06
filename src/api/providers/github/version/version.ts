import crypto from "crypto";
import semver from "semver";
import { Version } from "@/api/models/version";

export class GithubVersion extends Version {
  public readonly type: "semver" | "commit-sha";

  constructor(version: string) {
    super(version);

    if (semver.valid(version)) {
      this.type = "semver";
    } else if (version.match(CommitSha.regex)) {
      this.type = "commit-sha";
    } else {
      throw new Error(
        `Invalid GithubVersion: ${version}. It should either be a valid semver version or a commit SHA.`,
      );
    }
  }

  toString(format: "preserve" | "clean" = "preserve"): string {
    if (this.type === "commit-sha" && format === "clean") {
      return this.version.slice(0, 7);
    }
    return super.toString(format);
  }
}

export namespace CommitSha {
  export const regex = /^[0-9a-f]{40}$/;
  export const random = () => crypto.randomBytes(20).toString("hex");
}
