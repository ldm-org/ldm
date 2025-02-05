import clone from "lodash/clone";
import union from "lodash/union";
import { existsSync } from "fs";
import SHA256 from "crypto-js/sha256";
import { dirname, isAbsolute, join } from "path";
import { LockedArtifact } from "../models/lock/artifact";
import { DependencyLock } from "../models/lock/dependency";
import { mkdir, readFile, writeFile } from "fs/promises";
import { Dependency } from "../models/dependency/dependency";
import { diffZip, rmtree } from "@/utils";

export class ArtifactTree {
  public readonly files: Map<string, ArtifactTreeFile>;

  protected readonly cwd: string;
  protected readonly deleteFilesOnRemove: boolean;
  protected applied: boolean;

  get isComplete() {
    return this.files.size === this.lock.artifacts.size;
  }

  constructor(
    protected readonly spec: Dependency,
    protected readonly lock: DependencyLock,
    options?: { cwd?: string; deleteFilesOnRemove?: boolean },
  ) {
    this.files = new Map();

    const { cwd = process.cwd(), deleteFilesOnRemove = false } = options ?? {};
    this.cwd = cwd;
    this.deleteFilesOnRemove = deleteFilesOnRemove;

    this.applied = false;
  }

  async hydrate() {
    const tasks: Task[] = [];

    for (const artifact of this.lock.artifacts.values()) {
      for (const destination of union(
        this.spec.destinations,
        this.lock.destinations,
      )) {
        const path = join(
          isAbsolute(destination) ? destination : join(this.cwd, destination),
          artifact.path,
        );
        if (existsSync(path)) {
          tasks.push(async () => {
            const content = await readFile(path);
            if (artifact.hash === SHA256(content.toString()).toString()) {
              this.files.set(
                artifact.path,
                new ArtifactTreeFile(artifact, content),
              );
            }
          });
        }
      }
    }

    await Promise.all(tasks.map(task => task()));
  }

  async apply() {
    if (this.applied) {
      throw new Error(
        "Artifact tree has already been applied. Create a new instance to apply again.",
      );
    }

    let tasks: Task[] = [];

    for (const [path, [spec, lock]] of diffZip(
      clone(this.spec.destinations),
      clone(this.lock.destinations),
    )) {
      if (!spec && lock) {
        if (this.deleteFilesOnRemove) {
          const destination = isAbsolute(path) ? path : join(this.cwd, path);
          tasks.push(() => rmtree(destination));
        }
      }
    }

    await Promise.all(tasks.map(task => task()));
    tasks = [];
    this.lock.destinations = clone(this.spec.destinations);

    for (const [path, file] of this.files) {
      for (const destination of this.lock.destinations) {
        const dest = join(
          isAbsolute(destination) ? destination : join(this.cwd, destination),
          path,
        );
        tasks.push(async () => {
          if (!existsSync(dirname(dest))) {
            await mkdir(dirname(dest), { recursive: true });
          }
          await writeFile(dest, file.content);
        });
      }
    }

    await Promise.all(tasks.map(task => task()));

    this.applied = true;
  }
}

class ArtifactTreeFile {
  get path() {
    return this.artifact.path;
  }

  constructor(
    public readonly artifact: LockedArtifact,
    public readonly content: string | Buffer,
  ) {}
}

type Task = () => Promise<void>;
