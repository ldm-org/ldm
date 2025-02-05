type Callback = (...args: any[]) => void | Promise<void>;

export class Operation {
  protected readonly hooks: Map<string, Callback[]>;

  constructor(
    protected readonly type: string,
    protected readonly executor?: () => void | Promise<void>,
  ) {
    this.hooks = new Map();
  }

  execute() {
    if (this.executor) {
      return this.executor();
    }
  }

  on(event: string, callback: Callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(callback);
  }

  emit(event: string, args: any[] = []) {
    for (const callback of this.hooks.get(event) ?? []) {
      callback(...args);
    }
  }
}
