import { AsyncOrSync } from "ts-essentials";

type Callback<Args extends Array<any> = Array<any>, Return = any> = (
  ...args: Args
) => AsyncOrSync<Return>;

export class Operation<Event extends string = string> {
  protected readonly hooks: Map<Event, Callback[]>;

  constructor(
    protected readonly type: string,
    protected readonly executor?: () => AsyncOrSync<any>,
  ) {
    this.hooks = new Map();
  }

  execute() {
    if (this.executor) {
      return this.executor();
    }
  }

  on(event: Event, callback: Callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(callback);
  }

  emit(event: Event, args: any[] = []) {
    for (const callback of this.hooks.get(event) ?? []) {
      callback(...args);
    }
  }
}
