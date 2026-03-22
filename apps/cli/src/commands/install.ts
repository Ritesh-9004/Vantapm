import chalk from "chalk";
import ora from "ora";
import { readConfig, addDependency } from "../core/config.js";
import { lockPackage } from "../core/lockfile.js";
import { resolve } from "../core/resolver.js";
import { downloadAndExtract } from "../core/downloader.js";
import { findProjectRoot } from "../utils/paths.js";
import { log } from "../utils/logger.js";

export async function installCommand(packages: string[]) {
  // If no packages specified, install all from vanta.toml
  const config = readConfig();
  if (!config) {
    log.error('No vanta.toml found. Run "vanta init" first.');
    process.exit(1);
  }

  const root = findProjectRoot()!;

  // Determine what to install
  let toInstall: string[] = packages;
  if (toInstall.length === 0) {
    // Install all dependencies from vanta.toml
    toInstall = Object.keys(config.dependencies);
    if (toInstall.length === 0) {
      log.info("No dependencies in vanta.toml. Nothing to install.");
      return;
    }
    log.info(`Installing ${toInstall.length} dependencies from vanta.toml...`);
  }

  console.log();

  let totalInstalled = 0;

  for (const pkgName of toInstall) {
    // Step 1: Resolve versions and transitive deps
    const spinner = ora({
      text: `Resolving ${pkgName}...`,
      color: "cyan",
    }).start();

    let resolved;
    try {
      resolved = await resolve(pkgName);
    } catch (err: any) {
      spinner.fail(`Failed to resolve ${pkgName}`);
      log.error(err.message);
      continue;
    }

    if (resolved.length === 0) {
      spinner.succeed(`${pkgName} is already up-to-date`);
      continue;
    }

    spinner.succeed(
      `Resolved ${resolved.length} package${resolved.length > 1 ? "s" : ""}`
    );

    // Show what will be installed
    for (const r of resolved) {
      const qualityStr = r.pkg.quality_score
        ? chalk.dim(`(quality: ${r.pkg.quality_score})`)
        : "";
      console.log(
        `  ${chalk.green("→")} ${chalk.bold(r.name)}@${r.version} ${qualityStr}`
      );

      // Check compatibility
      const chip = config.target.chip;
      const framework = config.target.framework;
      const platforms = (r.pkg.platforms ?? []) as string[];
      const frameworks = (r.pkg.frameworks ?? []) as string[];

      if (platforms.length > 0 && !platforms.some((p: string) => p.includes(chip))) {
        log.warn(
          `  ${r.name} may not support ${chip.toUpperCase()} — proceed with caution`
        );
      }
      if (frameworks.length > 0 && !frameworks.includes(framework)) {
        log.warn(
          `  ${r.name} may not support ${framework} framework`
        );
      }
    }

    // Step 2: Download & extract
    const dlSpinner = ora({
      text: "Downloading packages...",
      color: "cyan",
    }).start();

    let dlCount = 0;
    for (const r of resolved) {
      dlSpinner.text = `Downloading ${r.name}@${r.version}...`;

      try {
        const result = await downloadAndExtract(
          r.name,
          r.version,
          r.tarballUrl,
          root
        );

        const sizeStr = result.sizeBytes
          ? `(${(result.sizeBytes / 1024).toFixed(1)} KB)`
          : "";

        dlCount++;
        dlSpinner.text = `Downloaded ${r.name}@${r.version} ${sizeStr}`;
      } catch (err: any) {
        dlSpinner.fail(`Failed to download ${r.name}`);
        log.error(err.message);
      }
    }

    if (dlCount > 0) {
      dlSpinner.succeed(`Downloaded ${dlCount} package${dlCount > 1 ? "s" : ""}`);
    }

    // Step 3: Update vanta.toml and vanta.lock
    for (const r of resolved) {
      // Only add the explicitly requested package to [dependencies]
      if (r.name === pkgName) {
        addDependency(r.name, r.version);
      }

      // Lock all resolved packages (including transitive deps)
      lockPackage(r.name, {
        version: r.version,
        sha256: r.sha256 ?? "",
        url: r.tarballUrl ?? "",
      });
    }

    totalInstalled += resolved.length;
  }

  console.log();
  if (totalInstalled > 0) {
    log.success(
      `${totalInstalled} package${totalInstalled !== 1 ? "s" : ""} installed successfully`
    );
    console.log();

    // Show include hints for requested packages
    for (const pkgName of toInstall) {
      log.info(`In your code:`);
      console.log(chalk.dim(`  #include "${pkgName}.h"`));
    }
  } else {
    log.info("All packages are already up-to-date.");
  }
}
