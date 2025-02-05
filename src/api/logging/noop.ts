import { Logger } from "./logger";
import { createNoopLogUpdate } from "./log-update";
import { UpdatableSection } from "./updatable-section";

export class NoopLogger extends Logger {
  protected override createWriter() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function writer(message: string) {
      return true;
    }
    writer.updatable = createNoopLogUpdate;
    writer.section = () => new UpdatableSection(writer.updatable());
    return writer;
  }
}
