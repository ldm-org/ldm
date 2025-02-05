import { rmtree } from "@/utils";
import { DependencyLock } from "../../models/lock/dependency";
import { Operation } from "./operation";

export class RemoveOperation extends Operation {
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

  on(event: RemoveOperationEvent, listener: (...args: any[]) => void): void {
    return super.on(event, listener);
  }
}

type RemoveOperationEvent = "start" | "complete";
