import yaml from "js-yaml";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
import { raise, readFileOrNullSync } from "@/utils";
import { ProjectSpecification } from "./models/project-specification";
import { LockInfo } from "./models/lock/lockinfo";
import { PrintableError } from "./error";

const LDM_SPEC_PATH = "ldm.yaml";
const LDM_LOCK_PATH = "ldm-lock.yaml";

export class Config {
  get envFile() {
    return this.specification.config.envFile ?? ".env";
  }

  get deleteFilesOnRemove() {
    return this.specification.config.deleteFilesOnRemove ?? false;
  }

  static async Read() {
    const { subslate } = await import("subslate");

    //
    // Read environment variables and hydrate the configuration
    //
    const specRaw =
      readFileOrNullSync(LDM_SPEC_PATH, "utf-8") ??
      raise(new PrintableError(`Cannot find ${LDM_SPEC_PATH}`));
    const spec = yaml.load(specRaw) as any;

    const envFlie = spec.config?.envFile ?? ".env";
    dotenv.config({ path: envFlie });

    const specCompiled = yaml.load(subslate(specRaw, process.env)) as any;
    const specification = new ProjectSpecification(specCompiled);
    await specification.prepare();

    //
    // Read the lock file
    //
    const lockinfo = new LockInfo(
      yaml.load(
        readFileOrNullSync(LDM_LOCK_PATH, "utf-8") ??
          'version: "1"\ndependencies: {}',
      ) as any,
    );

    specification.config.envFile = envFlie;
    specification.config.deleteFilesOnRemove =
      spec.config?.deleteFilesOnRemove ?? false;

    return new Config(specification, lockinfo);
  }

  constructor(
    public readonly specification: ProjectSpecification,
    public readonly lockinfo: LockInfo,
  ) {}

  async write() {
    await writeFile(LDM_LOCK_PATH, yaml.dump(this.lockinfo.toJSON()));
  }
}
