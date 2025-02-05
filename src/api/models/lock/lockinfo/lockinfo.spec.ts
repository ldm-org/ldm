import { createDummyDependencyLock } from "../dependency/dependency.spec";
import { LockInfo } from "./lockinfo";

describe(LockInfo.name, () => {
  let lockinfo: LockInfo;

  it("should be defined", () => {
    lockinfo = new LockInfo({
      version: "1",
      dependencies: {
        test: createDummyDependencyLock().toJSON(),
      },
    });
  });

  describe("dependencies", () => {
    it("should return a map of dependencies", () => {
      const map = lockinfo.dependencies;
      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(1);
    });
  });
});
