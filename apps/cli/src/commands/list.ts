import chalk from "chalk";
import { readConfig } from "../core/config.js";
import { readLock } from "../core/lockfile.js";
import { log, qualityBar, pad } from "../utils/logger.js";

export async function listCommand() {
  const config = readConfig();
  if (!config) {
    log.error('No vanta.toml found. Run "vanta init" first.');
    process.exit(1);
  }

  const lock = readLock();
  const lockEntries = Object.entries(lock.packages);

  if (lockEntries.length === 0) {
    log.info(
      `No packages installed in ${chalk.bold(config.project.name)}.`
    );
    log.dim(`  Run ${chalk.green("vanta install <package>")} to add one.`);
    return;
  }

  console.log();
  console.log(
    `Installed packages in ${chalk.bold(config.project.name)}:\n`
  );

  for (const [name, entry] of lockEntries) {
    const version = chalk.dim(`v${entry.version}`);
    const nameStr = chalk.green(pad(name, 24));
    console.log(`  ${nameStr} ${pad(entry.version, 10)}`);
  }

  console.log();
  log.success(
    `${lockEntries.length} package${lockEntries.length !== 1 ? "s" : ""} installed.`
  );
}
