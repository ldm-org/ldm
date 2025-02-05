import { Source } from "../../source";
import { Version, VersionSpecifier } from "../../version";
import { Plan } from "../plan";
import { Dependency } from "./dependency";

describe(Dependency.name, () => {
  let dependency: Dependency;

  it("should create an instance", () => {
    dependency = new MockDependency(
      {
        id: "dependency",
        uri: "scheme:///path",
        version: "latest",
        destinations: ["some/path"],
      },
      new Source({
        provider: "scheme",
        id: "scheme",
        uri: "scheme",
      }),
    );
    expect(dependency).toBeTruthy();
  });

  describe("path", () => {
    it("should return the path", () => {
      expect(dependency.path).toBe("/path");
    });
  });

  describe("source", () => {
    it("should return the source", () => {
      expect(dependency.source.id).toEqual("scheme");
    });
  });
});

class MockDependency extends Dependency {
  get specifier() {
    return new VersionSpecifier("latest");
  }

  getLatestVersion(specifier: VersionSpecifier) {
    return new Version(specifier.toString());
  }

  plan(): Plan {
    return new Plan([]);
  }
}
