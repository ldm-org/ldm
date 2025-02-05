import "core-js/actual/iterator";

export function zipMap<K, V, W>(a: Map<K, V>, b: Map<K, W>) {
  const result = new Map<K, [V | undefined, W | undefined]>();
  for (const [key, value] of a) {
    result.set(key, [value, undefined]);
  }
  for (const [key, value] of b) {
    if (result.has(key)) {
      result.get(key)![1] = value;
    } else {
      result.set(key, [undefined, value]);
    }
  }
  return result.entries().toArray();
}
