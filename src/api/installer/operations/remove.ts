import { rmtree } from "@/utils";
import { DependencyLock } from "../../models/lock/dependency";
import { Operation } from "./operation";

export class RemoveOperation extends Operation<RemoveOperationEvent> {
  protected readonly deleteFilesOnRemove: boolean;

  constructor(
    public readonly lock: DependencyLock,
    opts: {
      deleteFilesOnRemove?: boolean;
    },
  ) {
    super("remove");

    const { deleteFilesOnRemove = false } = opts;
    this.deleteFilesOnRemove = deleteFilesOnRemove;
  }

  override async execute() {
    this.emit("start");
    if (this.deleteFilesOnRemove) {
      await Promise.all(this.lock.destinations.map(rmtree));
    }
    this.emit("complete");
  }
}

type RemoveOperationEvent =
  /**
   * @description
   * Emitted when the operation starts.
   *
   * Callback signature:
   * ```typescript
   * () => void
   * ```
   */
  | "start"
  /**
   * @description
   * Emitted when the operation completes.
   *
   * Callback signature:
   * ```typescript
   * () => void
   * ```
   */
  | "complete";
