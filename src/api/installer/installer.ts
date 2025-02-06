import "core-js/actual/iterator";
import { z } from "zod";
import kleur from "kleur";
import { diffZip } from "@/utils";
import clone from "lodash/clone";
import { Config } from "../config";
import { Logger } from "../logging";
import {
  InstallOperation,
  Operation,
  RemoveOperation,
  UpdateOperation,
} from "./operations";
import { FrozenLockfileError } from "../models/lock/error";
import { ArtifactTree } from "./artifact-tree";
import { PrintableError } from "../error";
import { DependencyLock } from "../models/lock/dependency";
import { Installing, Removing, Resolving, Updating } from "./logging";
import { not } from "fp-ts/lib/Predicate";

export class Installer {
  protected readonly logger: Logger;
  protected readonly config: Config;

  constructor(options: InstallerOptions) {
    this.logger = options.logger;
    this.config = options.config;
  }

  async install(options?: InstallOptions) {
    let upgrade: boolean;
    let force: boolean = false;
    let targets: string[] | undefined;
    let frozenLockfile: boolean = false;
    if (options?.upgrade === true) {
      upgrade = true;
      targets = options.targets;
      if (Array.isArray(targets) && targets.length === 0) {
        targets = undefined;
      }
      force = !!options?.force;
      if (force && !targets) {
        throw new PrintableError(
          "Cannot force upgrade all dependencies. Please specify the targets.",
        );
      }
    } else {
      upgrade = false;
      frozenLockfile = !!options?.frozenLockfile;
    }

    const frozen = (predicate: any): boolean => {
      if (predicate && frozenLockfile) {
        throw new FrozenLockfileError();
      }
      return !!predicate;
    };

    const specification = this.config.specification;
    const lockinfo = this.config.lockinfo;
    const deleteFilesOnRemove = this.config.deleteFilesOnRemove;

    const operations: Operation[] = [];
    const operationOptions = { deleteFilesOnRemove };

    const resolving = new Resolving(this.logger.log.updatable());
    await resolving
      .wrap(async () => {
        for (const [id, [spec, lock]] of diffZip(
          clone(specification.dependencies),
          lockinfo.dependencies,
        )) {
          if (spec && lock) {
            if (frozen(spec.getExtendedURI() !== lock.uri)) {
              lock.uri = spec.getExtendedURI();
            }
            let latestVersion = lock.version;
            if (!lock.specifier.test(latestVersion) || upgrade) {
              latestVersion = await spec.getLatestVersion();
            }
            if (
              frozen(!lock.version.equals(latestVersion)) ||
              (force && targets!.includes(id))
            ) {
              operations.push(
                new UpdateOperation(
                  spec,
                  lock,
                  latestVersion,
                  operationOptions,
                ),
              ); // Update
            } else {
              const tree = new ArtifactTree(spec, lock, operationOptions);
              await tree.hydrate();
              if (frozen(!tree.isComplete)) {
                operations.push(
                  new InstallOperation(spec, lock, operationOptions),
                ); // Install
              } else {
                operations.push(
                  new Operation("ArtifactTree:apply", () => tree.apply()),
                ); // ArtifactTree:apply
              }
            }
          } else if (frozen(spec && !lock)) {
            const id = spec!.id;
            operations.push(
              new InstallOperation(
                spec!,
                lockinfo.dependencies
                  .set(
                    id,
                    new DependencyLock({
                      id: id,
                      uri: spec!.getExtendedURI(),
                      version: (await spec!.getLatestVersion()).toString(),
                      artifacts: {},
                      destinations: spec!.destinations,
                    }),
                  )
                  .get(id)!,
                operationOptions,
              ),
            ); // Install
          } else if (frozen(!spec && lock)) {
            const operation = new RemoveOperation(lock!, operationOptions);
            operation.on("complete", () => {
              lockinfo.dependencies.delete(lock!.id);
            });
            operations.push(operation); // Remove
          } else {
            throw new Error(
              "This should never happen. If you see this, please report this as a bug.",
            );
          }
        }
      })
      .execute();

    const isInstall = (o: Operation) => o instanceof InstallOperation;
    const isUpdate = (o: Operation) => o instanceof UpdateOperation;
    const isRemove = (o: Operation) => o instanceof RemoveOperation;

    const installs = operations.filter(isInstall);
    const updates = operations.filter(isUpdate);
    const removals = operations.filter(isRemove);

    this.logger.log("");
    this.logger.log(
      `${kleur.bold().white("Dependency operations")}: ` +
        `${kleur.blue(installs.length)} installs, ` +
        `${kleur.blue(updates.length)} updates, ` +
        `${kleur.blue(removals.length)} removals`,
    );
    this.logger.log("");

    const section = this.logger.log.section();
    for (const install of installs) {
      const installing = new Installing(section.createLine());
      installing.watch(install);
    }
    for (const update of updates) {
      const updating = new Updating(section.createLine());
      updating.watch(update);
    }
    for (const removal of removals) {
      const removing = new Removing(section.createLine());
      removing.watch(removal);
    }

    // Execute all operations
    try {
      await Promise.all(operations.filter(isRemove).map(o => o.execute())); // Removal goes first
      await Promise.all(operations.filter(not(isRemove)).map(o => o.execute())); // Rest of the operations go next
    } catch (error) {
      section.done();
      throw error;
    }
    if (installs.length + updates.length + removals.length === 0) {
      this.logger.log("Everything is up to date.");
    }

    // Clean & Format lockinfo
    lockinfo.dependencies = new Map(
      lockinfo.dependencies
        .entries()
        .toArray()
        .toSorted(([a], [b]) => a.localeCompare(b)),
    );
    for (const [, dependency] of lockinfo.dependencies) {
      dependency.destinations.sort();
    }

    this.logger.log("");
  }
}

interface InstallerOptions {
  logger: Logger;
  config: Config;
}

export const InstallOptions = z.union([
  z.object({
    upgrade: z.literal(true),
    force: z.boolean().optional(),
    targets: z.array(z.string()).optional(),
  }),
  z.object({
    upgrade: z.literal(false).optional(),
    frozenLockfile: z.boolean().optional(),
  }),
]);

export type InstallOptions = z.infer<typeof InstallOptions>;
