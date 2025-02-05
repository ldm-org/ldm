import { pipe } from "fp-ts/lib/function";
import { exclude, include } from "./array";

type Key = string | number | symbol;

export function keymap<K extends Key, L extends Key>(mapper: (key: K) => L) {
  return <T>(obj: Record<K, T>): Record<L, T> => {
    return pipe(
      Object.entries(obj),
      entries => entries.map(([key, value]) => [mapper(key as K), value]),
      Object.fromEntries,
    );
  };
}

export function valmap<T, U>(mapper: (value: T) => U) {
  return <K extends Key>(obj: Record<K, T>): Record<K, U> => {
    return pipe(
      Object.entries(obj),
      entries => entries.map(([key, value]) => [key, mapper(value as T)]),
      Object.fromEntries,
    );
  };
}

export function keyfilter<K extends Key>(predicate: (key: Key) => boolean) {
  return <T>(obj: Record<K, T>): Record<K, T> => {
    return pipe(
      Object.entries(obj),
      entries => entries.filter(([key]) => predicate(key)),
      Object.fromEntries,
    );
  };
}

export function valfilter<T>(predicate: (value: T) => boolean) {
  return <K extends Key>(obj: Record<K, T>): Record<K, T> => {
    return pipe(
      Object.entries(obj),
      entries => entries.filter(([, value]) => predicate(value as T)),
      Object.fromEntries,
    );
  };
}

export function keyinclude(keys: string[]) {
  return keyfilter(include(keys) as (key: Key) => boolean);
}

export function keyexclude(keys: string[]) {
  return keyfilter(exclude(keys) as (key: Key) => boolean);
}

export function isRecord(obj: unknown): obj is Record<Key, unknown> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    !(obj instanceof Map)
  );
}
