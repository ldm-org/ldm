import { diffZip } from "./diff";

describe("diffZip", () => {
  interface TestCase {
    name: string;
    inputs: [
      Map<string, any> | Record<string, any> | Array<any>,
      Map<string, any> | Record<string, any> | Array<any>,
    ];
    expected: [string, [any | undefined, any | undefined]][];
  }
  const cases: TestCase[] = [
    {
      name: "should diff zip two maps",
      inputs: [
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
        new Map([
          ["a", 1],
          ["b", 3],
          ["d", 4],
        ]),
      ],
      expected: [
        ["a", [1, 1]],
        ["b", [2, 3]],
        ["c", [3, undefined]],
        ["d", [undefined, 4]],
      ],
    },
    {
      name: "should diff zip two records",
      inputs: [
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 3,
          d: 4,
        },
      ],
      expected: [
        ["a", [1, 1]],
        ["b", [2, 3]],
        ["c", [3, undefined]],
        ["d", [undefined, 4]],
      ],
    },
    {
      name: "should diff zip two arrays",
      inputs: [
        ["a", "b", "c"],
        ["a", "c", "d"],
      ],
      expected: [
        ["a", [true, true]],
        ["b", [true, undefined]],
        ["c", [true, true]],
        ["d", [undefined, true]],
      ],
    },
  ];

  cases.forEach(({ name, inputs: [a, b], expected }) => {
    it(name, () => {
      const result = diffZip(a, b);
      expect(result).toEqual(expected);
    });
  });
});
