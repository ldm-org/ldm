import { Source } from "./source";

describe(Source.name, () => {
  let source: Source;

  it("should create an instance", () => {
    source = new Source({
      id: "id",
      uri: "uri",
      provider: "provider",
    });

    expect(source).toBeTruthy();
  });
});
