import { not } from "fp-ts/lib/Predicate";

export function setsEqual<T>(a: Iterable<T>, b: Iterable<T>): boolean {
  const aSet = new Set(a);
  const bSet = new Set(b);
  if (aSet.size !== bSet.size) {
    return false;
  }

  for (const item of aSet) {
    if (!bSet.has(item)) {
      return false;
    }
  }

  return true;
}

export function cross<T, U>(a: Iterable<T>, b: Iterable<U>): [T, U][] {
  const result: [T, U][] = [];
  for (const x of a) {
    for (const y of b) {
      result.push([x, y]);
    }
  }
  return result;
}

export function include(keys: string[]) {
  return (key: string) => keys.includes(key);
}

export function exclude(keys: string[]) {
  return not(include(keys));
}
