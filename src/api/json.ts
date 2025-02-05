import { valfilter } from "@/utils";
import { pipe } from "fp-ts/lib/function";

export interface JSONSerializable<T> {
  toJSON(): T;
}

export function JSONSerializable(): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, ...args);
      return pipe(
        result,
        valfilter(v => v !== undefined),
      );
    };

    return descriptor;
  };
}
