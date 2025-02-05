import { VersionSpecifier } from "./specifier";

describe(VersionSpecifier.name, () => {
  let specifier: VersionSpecifier;
  it("should be defined", () => {
    specifier = new VersionSpecifier("^1.0.0");
    expect(specifier).toBeDefined();
  });

  describe("test", () => {
    it("should return true if version is in the range", () => {
      expect(specifier.test("1.0.0")).toBe(true);
      expect(specifier.test("1.0.1")).toBe(true);
    });

    it("should return false if version is not in the range", () => {
      expect(specifier.test("2.0.0")).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the specifier", () => {
      expect(specifier.toString()).toBe("^1.0.0");
    });
  });
});
