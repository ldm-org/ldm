import { JSDelivrAPIClient } from "../../jsdelivr/api";
import { JSDelivrGithubSource } from "./source";

describe(JSDelivrGithubSource.name, () => {
  it("should create a new instance", () => {
    const source = createDummyJSDelivrGithubSource();
    expect(source).toBeInstanceOf(JSDelivrGithubSource);

    expect(source.owner).toBe("owner");
    expect(source.repo).toBe("repo");
  });
});

export function createDummyJSDelivrGithubSource(options?: {
  client?: JSDelivrAPIClient;
}) {
  const { client } = options ?? {};
  return new JSDelivrGithubSource(
    {
      uri: "owner/repo",
      id: "test",
      provider: "jsdelivr:github",
    },
    { client },
  );
}
