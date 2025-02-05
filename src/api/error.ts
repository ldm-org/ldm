import { raise } from "@/utils";
import { match, P } from "ts-pattern";

export class PrintableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrintableError";
  }

  toString() {
    return this.message;
  }
}

type MatchValue = { error: any; status?: number };
type CatchCase = [
  P.Pattern<MatchValue>,
  Error | ((self: any, value: MatchValue) => Error),
];
export function Catch(cases: CatchCase[]): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (error: any) {
        let matcher = match({
          error,
          status: error?.status as number | undefined,
        });
        for (const [value, errorOrFunction] of cases) {
          matcher = matcher.with(value, value =>
            raise(
              typeof errorOrFunction === "function"
                ? errorOrFunction(this, value)
                : errorOrFunction,
            ),
          );
        }
        matcher = matcher.otherwise(() => raise(error));
      }
    };

    return descriptor;
  };
}
