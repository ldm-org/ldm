import kleur from "kleur";
import { Config } from "@/api/config";
import { PrintableError } from "@/api/error";
import { Installer, InstallOptions } from "@/api/installer/installer";
import { Logger, NoopLogger } from "@/api/logging";
import { LoggingOptions } from "./types";

export async function upgrade(options: Options) {
  const { debug, silent, ...installOptions } = options;
  const logger = silent
    ? new NoopLogger()
    : new Logger({
        level: debug ? "debug" : "log",
      });

  try {
    const config = await Config.Read();
    const installer = new Installer({
      config,
      logger,
    });

    logger.log(kleur.blue("Upgrading dependencies..."));
    await installer.install({ ...installOptions, upgrade: true });

    logger.log(kleur.blue("Writing lockfile..."));
    await config.write();

    logger.log("");
    logger.log(`Upgrade complete 🍋`);

    return 0;
  } catch (error) {
    if (error instanceof PrintableError) {
      logger.error(`\n${kleur.bold().red(error.toString())}`);
      if (silent) {
        throw error;
      }
      return 1;
    } else {
      throw error;
    }
  }
}

type Options = InstallOptions & LoggingOptions;
