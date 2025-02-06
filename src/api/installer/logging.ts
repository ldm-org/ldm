import kleur from "kleur";
import { LogUpdate } from "../logging/log-update";
import {
  InstallOperation,
  RemoveOperation,
  UpdateOperation,
} from "./operations";

export class Resolving {
  protected elapsed: number;
  protected interval: NodeJS.Timeout;
  protected consumed: boolean;

  constructor(protected readonly updatable: LogUpdate) {
    this.consumed = false;
    this.elapsed = 0;
  }

  start() {
    if (this.consumed) {
      throw new Error("Already consumed. Please create a new instance.");
    }
    this.interval = setInterval(() => {
      this.updatable(
        kleur.blue(
          `Resolving dependencies... (${kleur.gray(this.elapsed.toFixed(1).concat("s"))})`,
        ),
      );
      this.elapsed += 0.1;
    }, 100);
  }

  done() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.updatable.done();
    this.consumed = true;
  }

  wrap(callback: () => void | Promise<void>) {
    return {
      execute: async () => {
        try {
          this.start();
          await callback();
          this.done();
        } catch (error) {
          this.done();
          throw error;
        }
      },
    };
  }
}

export class Installing {
  constructor(protected readonly updatable: LogUpdate) {}

  watch(operation: InstallOperation) {
    const installing = this.updatable;

    const id = operation.spec.id;
    const version = operation.lock.version.toString("clean");

    operation.on("start", () => {
      installing(
        `  ${kleur.cyan("•")} Installing ${kleur.cyan(id)} (${kleur.bold().white(version)})`,
      );
    });
    operation.on("progress", progress => {
      installing(
        `  ${kleur.cyan("•")} Installing ${kleur.cyan(id)} (${kleur.bold().white(version)})` +
          `: ${kleur.blue("Downloading...")} ${kleur.bold().white((progress * 100).toFixed(0).concat("%"))}`,
      );
    });
    operation.on("complete", () => {
      installing(
        `  ${kleur.green("•")} Installing ${kleur.cyan(id)} (${kleur.green(version)})`,
      );
      installing.done();
    });
    operation.on("fail", () => {
      installing(
        `  ${kleur.red("•")} Installing ${kleur.cyan(id)} (${kleur.bold().white(version)})` +
          `: ${kleur.bold().red("Fail")}`,
      );
      installing.done();
    });
  }
}

export class Updating {
  constructor(protected readonly updatable: LogUpdate) {}

  watch(operation: UpdateOperation) {
    const installing = this.updatable;

    const id = operation.spec.id;
    const originalVersion = operation.lock.version.toString("clean");
    const targetVersion = operation.version.toString("clean");

    operation.on("start", () => {
      installing(
        `  ${kleur.cyan("•")} Updating ${kleur.cyan(id)} (${kleur.bold().white(originalVersion)} -> ${kleur.bold().white(targetVersion)})`,
      );
    });
    operation.on("progress", progress => {
      installing(
        `  ${kleur.cyan("•")} Updating ${kleur.cyan(id)} (${kleur.bold().white(originalVersion)} -> ${kleur.bold().white(targetVersion)})` +
          `: ${kleur.blue("Downloading...")} ${kleur.bold().white((progress * 100).toFixed(0).concat("%"))}`,
      );
    });
    operation.on("complete", () => {
      installing(
        `  ${kleur.green("•")} Updating ${kleur.cyan(id)} (${kleur.bold().white(originalVersion)} -> ${kleur.green(targetVersion)})`,
      );
      installing.done();
    });
    operation.on("fail", () => {
      installing(
        `  ${kleur.red("•")} Updating ${kleur.cyan(id)} (${kleur.bold().white(originalVersion)} -> ${kleur.bold().white(targetVersion)})` +
          `: ${kleur.bold().red("Fail")}`,
      );
      installing.done();
    });
  }
}

export class Removing {
  constructor(protected readonly updatable: LogUpdate) {}

  watch(operation: RemoveOperation) {
    const removing = this.updatable;

    const id = operation.lock.id;

    operation.on("start", () => {
      removing(`  ${kleur.cyan("•")} Removing ${kleur.cyan(id)}`);
    });
    operation.on("complete", () => {
      removing(`  ${kleur.green("•")} Removing ${kleur.cyan(id)}`);
      removing.done();
    });
  }
}
