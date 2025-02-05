import { JSDelivrAPIClient } from "../../jsdelivr/api";
import { JSDelivrNPMSource } from "./source";

describe(JSDelivrNPMSource.name, () => {
  it("should create a new instance", () => {
    const source = createDummyJSDelivrNPMSource({ scoped: false });
    expect(source).toBeInstanceOf(JSDelivrNPMSource);

    expect(source.isScoped).toBe(false);
    expect(source.package).toEqual({
      scope: undefined,
      name: "test",
    });
  });

  it("should create a new instance with a scoped package", () => {
    const source = createDummyJSDelivrNPMSource({ scoped: true });
    expect(source).toBeInstanceOf(JSDelivrNPMSource);

    expect(source.isScoped).toBe(true);
    expect(source.package).toEqual({
      scope: "test",
      name: "test",
    });
  });
});

export function createDummyJSDelivrNPMSource(options?: {
  scoped?: boolean;
  client?: JSDelivrAPIClient;
}) {
  const { client, scoped = false } = options ?? {};
  if (scoped) {
    return new JSDelivrNPMSource(
      {
        uri: "@test/test",
        id: "test",
        provider: "jsdelivr:npm",
      },
      { client: client },
    );
  } else {
    return new JSDelivrNPMSource(
      {
        uri: "test",
        id: "test",
        provider: "jsdelivr:npm",
      },
      { client: client },
    );
  }
}
