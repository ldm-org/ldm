import logUpdate from "log-update";
import { createNoopLogUpdate } from "./log-update";
import { UpdatableSection } from "./updatable-section";

export type LogLevel = "debug" | "log" | "warn" | "error";
const levels: LogLevel[] = ["debug", "log", "warn", "error"];

export interface LoggerOptions {
  level: LogLevel;
}

export class Logger {
  protected readonly level: LogLevel;

  constructor(options?: LoggerOptions) {
    const { level = "log" } = options || {};
    this.level = level;
  }

  protected write(message: string): boolean {
    return process.stdout.write(`${message}\n`);
  }

  protected createWriter(options: { level: LogLevel }) {
    const { level: specifiedLevel } = options;
    const currentLevel = this.level;
    function writer(message: string) {
      return isLogLevelEnabled(currentLevel) && write(message);
    }
    writer.updatable = isLogLevelEnabled(currentLevel)
      ? () => logUpdate.create(process.stdout)
      : createNoopLogUpdate;
    writer.section = () => new UpdatableSection(writer.updatable());

    return writer;

    function isLogLevelEnabled(level: LogLevel) {
      return levels.indexOf(specifiedLevel) >= levels.indexOf(level);
    }
    function write(message: string) {
      return process.stdout.write(`${message}\n`);
    }
  }

  get debug() {
    return this.createWriter({ level: "debug" });
  }
  get log() {
    return this.createWriter({ level: "log" });
  }
  get warn() {
    return this.createWriter({ level: "warn" });
  }
  get error() {
    return this.createWriter({ level: "error" });
  }
}
