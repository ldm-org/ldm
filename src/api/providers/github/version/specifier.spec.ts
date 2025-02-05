import { GithubVersionSpecifier } from "./specifier";
import { createDummyGithubSource } from "../source/source.spec";
import { CommitSha } from "./version";

describe(GithubVersionSpecifier.name, () => {
  it("should create an instance with valid specifiers", () => {
    const source = createDummyGithubSource();
    expect(
      new GithubVersionSpecifier({
        specifier: "latest",
        path: "some/path",
        source: source,
      }).isLatest,
    ).toBe(true);
    expect(
      new GithubVersionSpecifier({
        specifier: "^1.0.0",
        path: "some/path",
        source: source,
      }).isSemver,
    ).toBe(true);
    expect(
      new GithubVersionSpecifier({
        specifier: "1.0.0",
        path: "some/path",
        source: source,
      }).isSemver,
    ).toBe(true);
    expect(
      new GithubVersionSpecifier({
        specifier: CommitSha.random(),
        path: "some/path",
        source: source,
      }).isCommitHash,
    ).toBe(true);
  });
});
