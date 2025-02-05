import { createDummyJSDelivrNPMSource } from "../source/source.spec";
import { JSDelivrNPMVersionSpecifier } from "./specifier";

const cases = [
  {
    name: "plan",
    inputs: {
      specifier: "latest",
      scoped: false,
    },
  },
  {
    name: "scoped",
    inputs: {
      specifier: "latest",
      scoped: true,
    },
  },
];

describe(JSDelivrNPMVersionSpecifier.name, () => {
  cases.forEach(({ name, inputs }) => {
    describe(name, () => {
      let specifier: JSDelivrNPMVersionSpecifier;

      it("should create a new instance", () => {
        specifier = new JSDelivrNPMVersionSpecifier({
          specifier: inputs.specifier,
          source: createDummyJSDelivrNPMSource({
            scoped: inputs.scoped,
            client: {} as any,
          }),
        });
        expect(specifier).toBeDefined();
      });
    });
  });
});
