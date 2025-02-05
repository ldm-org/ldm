import { JSDelivrSource } from "./source";

describe(JSDelivrSource.name, () => {
  it("should create an instance", () => {
    const source = new JSDelivrSource({
      uri: "test",
      id: "test",
      provider: "jsdelivr:npm",
    });
    expect(source).toBeInstanceOf(JSDelivrSource);
  });
});
