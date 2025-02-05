import { createDummyLockedArtifact } from "../artifact/artifact.spec";
import { DependencyLock } from "./dependency";

describe(DependencyLock.name, () => {
  let lock: DependencyLock;

  it("should be defined", () => {
    lock = createDummyDependencyLock();
  });

  describe("locked", () => {
    it("should return true if artifacts are defined", () => {
      expect(lock.locked).toBe(true);
    });
  });

  describe("source", () => {
    it("should return provider and id", () => {
      expect(lock.source).toEqual({ provider: "provider", id: "source" });
    });
  });

  describe("specifier", () => {
    it("should return version specifier", () => {
      expect(lock.specifier.toString()).toEqual("^1.0.0");
    });
  });

  describe("artifacts", () => {
    it("should return map of artifacts", () => {
      expect(lock.artifacts.keys().toArray()).toEqual(["."]);
    });
  });
});

export function createDummyDependencyLock(): DependencyLock {
  return new DependencyLock({
    id: "test",
    uri: "provider+source:///path:^1.0.0",
    version: "1.0.0",
    destinations: ["test"],
    artifacts: {
      ".": createDummyLockedArtifact().toJSON(),
    },
  });
}
