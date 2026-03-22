import { existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Walk up from `cwd` looking for `vanta.toml`.
 * Returns the directory containing it, or null.
 */
export function findProjectRoot(cwd = process.cwd()): string | null {
  let dir = cwd;
  while (true) {
    if (existsSync(join(dir, "vanta.toml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null; // reached filesystem root
    dir = parent;
  }
}

/** Path to .vanta/ packages cache inside project root */
export function packagesDir(root: string): string {
  return join(root, ".vanta", "packages");
}
