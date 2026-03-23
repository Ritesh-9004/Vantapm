import chalk from "chalk";
import ora from "ora";
import { searchPackages } from "../core/registry.js";
import { log, qualityBar, pad } from "../utils/logger.js";

function wrapText(text: string, width: number, maxLines = 2): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      if (lines.length === maxLines) {
        break;
      }
      current = word.length > width ? `${word.slice(0, Math.max(width - 1, 1))}…` : word;
    } else {
      lines.push(`${word.slice(0, Math.max(width - 1, 1))}…`);
      if (lines.length === maxLines) {
        break;
      }
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  const consumedWords = lines.join(" ").replace(/…$/, "").split(" ").filter(Boolean).length;
  if (consumedWords < words.length && lines.length > 0) {
    const lastIndex = lines.length - 1;
    const last = lines[lastIndex];
    lines[lastIndex] = last.length >= width ? `${last.slice(0, Math.max(width - 1, 1))}…` : `${last}…`;
  }

  return lines;
}

export async function searchCommand(
  query: string,
  options: { platform?: string; framework?: string }
) {
  const spinner = ora({
    text: `Searching vanta registry for "${query}"...`,
    color: "cyan",
  }).start();

  try {
    const result = await searchPackages(query, {
      platform: options.platform,
      framework: options.framework,
    });

    spinner.stop();

    if (result.data.length === 0) {
      log.warn(`No packages found for "${query}".`);
      log.dim("  Try a broader search term or different filters.");
      return;
    }

    console.log();

    // Table header
    const terminalWidth = process.stdout.columns ?? 100;
    const divider = chalk.dim("─".repeat(Math.max(72, Math.min(terminalWidth - 2, 100))));
    console.log(divider);

    for (const pkg of result.data) {
      const name = chalk.green.bold(pad(pkg.name, 20));
      const score = qualityBar(pkg.quality_score);
      const platforms = (pkg.platforms ?? [])
        .slice(0, 4)
        .map((p: string) => chalk.dim(p.toUpperCase()))
        .join(" ");

      console.log(`  ${name} ${score}  ${platforms}`);

      if (pkg.description) {
        const descriptionWidth = Math.max(44, Math.min(terminalWidth - 6, 92));
        for (const line of wrapText(pkg.description, descriptionWidth, 2)) {
          console.log(`  ${chalk.dim(line)}`);
        }
      }

      const meta: string[] = [];
      if (pkg.latest_version) meta.push(`v${pkg.latest_version}`);
      if (pkg.stars) meta.push(`★ ${pkg.stars.toLocaleString()}`);
      if (pkg.frameworks?.length) {
        meta.push(
          (pkg.frameworks as string[])
            .map((f: string) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(" + ")
        );
      }
      if (meta.length) {
        console.log(`  ${chalk.dim(meta.join(" · "))}`);
      }

      console.log(divider);
    }

    console.log();
    log.success(
      `${result.total} package${result.total !== 1 ? "s" : ""} found.` +
        chalk.dim(` Run ${chalk.green("vanta install <name>")} to install.`)
    );

    if (result.total_pages > 1) {
      log.dim(
        `  Showing page ${result.page} of ${result.total_pages}. Results are sorted by quality.`
      );
    }
  } catch (err: any) {
    spinner.fail("Search failed");
    log.error(err.message);
    process.exit(1);
  }
}
