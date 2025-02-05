import { LockedArtifact } from "./artifact";

describe(LockedArtifact.name, () => {
  it("should be defined", () => {
    expect(createDummyLockedArtifact()).toBeDefined();
  });
});

export function createDummyLockedArtifact() {
  return new LockedArtifact({
    path: ".",
    hash: "hash",
  });
}
