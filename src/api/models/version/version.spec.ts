import { Version } from "./version";

describe(Version.name, () => {
  it("should be defined", () => {
    const version = new Version("1.0.0");
    expect(version).toBeTruthy();
  });
});
