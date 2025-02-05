import "core-js/actual/iterator";
import { isRecord } from "./record";

export function diffZip<T, U>(
  a: Map<string, T>,
  b: Map<string, U>,
): [string, [T | undefined, U | undefined]][];
export function diffZip<T, U>(
  a: Record<string, T>,
  b: Record<string, U>,
): [string, [T | undefined, U | undefined]][];
export function diffZip<T extends string, U extends string>(
  a: Array<T>,
  b: Array<U>,
): [string, [true | undefined, true | undefined]][];
export function diffZip<T, U>(
  a: Record<string, T> | Map<string, T> | Array<T>,
  b: Record<string, U> | Map<string, U> | Array<U>,
): [string, [T | undefined, U | undefined]][] {
  const inputIsMap = a instanceof Map && b instanceof Map;
  const inputIsRecord = isRecord(a) && isRecord(b);
  const inputIsArray = Array.isArray(a) && Array.isArray(b);
  if (!inputIsMap && !inputIsRecord && !inputIsArray) {
    throw new Error("Both inputs must be either a Map, Record, or Array");
  }

  const normalizedA = normalize(a);
  const normalizedB = normalize(b);

  const entriesMap = new Map<string, [T | undefined, U | undefined]>();
  for (const key of normalizedA.keys()) {
    entriesMap.set(key, [undefined, undefined]);
  }
  for (const key of normalizedB.keys()) {
    entriesMap.set(key, [undefined, undefined]);
  }
  for (const key of entriesMap.keys()) {
    entriesMap.set(key, [normalizedA.get(key), normalizedB.get(key)]);
  }
  return entriesMap.entries().toArray();

  function normalize<T>(
    input: Record<string, T> | Map<string, T> | Array<T>,
  ): Map<string, T> {
    if (Array.isArray(input)) {
      return new Map(input.map(v => [v as string, true as any as T]));
    } else if (input instanceof Map) {
      return input;
    } else {
      return new Map(Object.entries(input));
    }
  }
}
