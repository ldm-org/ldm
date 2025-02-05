import { CommitSha, GithubVersion } from "./version";

describe(GithubVersion.name, () => {
  it("should create an instance with a valid semver version", () => {
    const version = new GithubVersion("1.0.0");
    expect(version.type).toEqual("semver");
  });

  it("should create an instance with a valid commit SHA", () => {
    const sha = CommitSha.random();
    const version = new GithubVersion(sha);
    expect(version.type).toEqual("commit-sha");
  });
});
