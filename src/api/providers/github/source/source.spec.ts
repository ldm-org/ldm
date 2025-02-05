import { GithubSource } from "./source";

describe(GithubSource.name, () => {
  it("should create an instance with valid properties", () => {
    const source = createDummyGithubSource();
    expect(source.provider).toBe("github");
    expect(source.owner).toBe("owner");
    expect(source.repo).toBe("repo");
  });

  it("should throw an error with invalid URI", () => {
    expect(
      () => new GithubSource({ id: "id", uri: "invalid", provider: "github" }),
    ).toThrowError();
  });
});

export function createDummyGithubSource() {
  return new GithubSource({
    id: "id",
    uri: "owner/repo",
    provider: "github",
  });
}
