import clone from "lodash/clone";
import { Version } from "@/api/models/version";
import { DependencyLock } from "@/api/models/lock/dependency";
import { LockedArtifact } from "@/api/models/lock/artifact";
import { Dependency } from "@/api/models/dependency/dependency";
import { Operation } from "./operation";
import { RemoveOperation } from "./remove";

export class UpdateOperation extends Operation {
  protected readonly deleteFilesOnRemove: boolean;

  constructor(
    public readonly spec: Dependency,
    public readonly lock: DependencyLock,
    public readonly version: Version,
    opts?: { deleteFilesOnRemove?: boolean },
  ) {
    const { deleteFilesOnRemove = false } = opts ?? {};
    super("update");
    this.deleteFilesOnRemove = deleteFilesOnRemove;
  }

  override async execute() {
    try {
      this.emit("start");

      //
      // Modify destinations
      //
      if (this.deleteFilesOnRemove) {
        const remove = new RemoveOperation(this.lock, {
          deleteFilesOnRemove: true,
        });
        await remove.execute();
      }
      this.lock.destinations = clone(this.spec.destinations);

      //
      // Plan upgrade
      //
      const plan = await this.spec.plan({
        version: this.version,
      });

      //
      // Download artifacts
      //
      let progress = 0;
      this.emit("progress", [progress / plan.artifacts.length]);
      const downloads = await Promise.all(
        plan.artifacts.map(async artifact => {
          const downloaded = await artifact.download();
          this.emit("progress", [++progress / plan.artifacts.length]);
          return downloaded;
        }),
      );

      //
      // Write lock file
      //
      this.lock.artifacts = new Map(
        downloads
          .map(download =>
            LockedArtifact.fromContent(download.path || ".", download.content),
          )
          .map(artifact => [artifact.path, artifact]),
      );
      this.lock.version = this.version;

      //
      // Extract artifacts
      //
      const extracts: Promise<any>[] = [];
      for (const destination of this.lock.destinations) {
        for (const download of downloads) {
          extracts.push(download.extract(destination));
        }
      }
      await Promise.all(extracts);

      this.emit("complete");
    } catch (error) {
      this.emit("fail", [error]);
      throw error;
    }
  }

  on(event: "start" | "complete", listener: () => void): void;
  on(event: "fail", listener: (error: any) => void): void;
  on(event: "progress", listener: (progress: number) => void): void;
  on(event: UpdateOperationEvent, listener: (...args: any[]) => void): void {
    return super.on(event, listener);
  }
}

type UpdateOperationEvent = "start" | "progress" | "complete" | "fail";
