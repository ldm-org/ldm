import { Command } from "commander";
import { install, upgrade } from "./commands";

const program = new Command();

program
  .name("ldm")
  .summary("Loose Dependency Manager")
  .description(
    "Wire-up fragmented codes and files from various sources with a single command.",
  );

program
  .command("install")
  .description("Install dependencies based on the lockfile.")
  .option("--debug", "Enable debug mode.")
  .option("--silent", "Suppresses all output.")
  .option("--frozen-lockfile", "Fail if lockfile needs to be updated.")
  .action(install);

program
  .command("upgrade")
  .description("Upgrade dependencies based on the specification.")
  .argument("[targets...]", "The packages to upgrade.")
  .option("--debug", "Enable debug mode.")
  .option("--force", "Force upgrade dependencies.")
  .option("--silent", "Suppresses all output.")
  .action((targets, options) =>
    upgrade({
      ...options,
      targets: targets.length > 0 ? targets : undefined,
    }),
  );

program.parse();
