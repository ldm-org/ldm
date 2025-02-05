import { createDummyJSDelivrGithubSource } from "../source/source.spec";
import { JSDelivrGithubVersionSpecifier } from "./specifier";

describe(JSDelivrGithubVersionSpecifier.name, () => {
  const client = createDummyClient();
  let specifier: JSDelivrGithubVersionSpecifier;

  it("should create a new instance", () => {
    specifier = new JSDelivrGithubVersionSpecifier({
      specifier: "latest",
      source: createDummyJSDelivrGithubSource({ client: client as any }),
    });
    expect(specifier).toBeInstanceOf(JSDelivrGithubVersionSpecifier);
  });
});

function createDummyClient() {
  return {
    getResolvedRepoVersion: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        version: "1.0.0",
      },
    }),
  };
}
