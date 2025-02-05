import { HTTPVersionSpecifier } from "./specifier";

describe(HTTPVersionSpecifier.name, () => {
  let version: HTTPVersionSpecifier;

  it("should create an instance", () => {
    version = new HTTPVersionSpecifier("latest");
  });

  it("should fail to create an instance with an invalid specifier", () => {
    expect(() => new HTTPVersionSpecifier("1.0.0")).toThrow();
  });

  describe("test", () => {
    it("should return true for latest", () => {
      expect(version.test("latest")).toBe(true);
    });

    it("should return false for other versions", () => {
      expect(version.test("1.0.0")).toBe(false);
    });
  });
});
