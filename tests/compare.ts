import { compareSync, Difference } from "dir-compare";
import { readdirSync } from "fs";

export function compare(path1: string, path2: string) {
  const result = compareSync(path1, path2);
  expect(
    (result.diffSet ?? [])
      .filter(({ state }) => state !== "equal")
      .filter(isMissingEquivalent),
  ).toHaveLength(0);

  function isMissingEquivalent(diff: Difference) {
    return (
      (diff.type1 === "directory" &&
        diff.type2 === "missing" &&
        readdirSync(diff.path1!).length === 0) ||
      (diff.type1 === "missing" &&
        diff.type2 === "directory" &&
        readdirSync(diff.path2!).length === 0)
    );
  }
}
