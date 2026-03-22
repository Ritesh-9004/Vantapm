import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import TOML from "@iarna/toml";
import { findProjectRoot } from "../utils/paths.js";

export interface LockEntry {
  version: string;
  sha256: string;
  url: string;
}

export interface VantaLock {
  packages: Record<string, LockEntry>;
}

/**
 * Read vanta.lock from project root.
 * Returns empty lock if file doesn't exist.
 */
export function readLock(cwd = process.cwd()): VantaLock {
  const root = findProjectRoot(cwd);
  if (!root) return { packages: {} };
  const lockPath = join(root, "vanta.lock");
  if (!existsSync(lockPath)) return { packages: {} };
  const content = readFileSync(lockPath, "utf-8");
  const parsed = TOML.parse(content) as unknown as VantaLock;
  if (!parsed.packages) parsed.packages = {};
  return parsed;
}

/**
 * Write vanta.lock to project root.
 */
export function writeLock(lock: VantaLock, cwd = process.cwd()) {
  const root = findProjectRoot(cwd) ?? cwd;
  const lockPath = join(root, "vanta.lock");
  const header = "# vanta.lock — auto-generated, always commit this file\n# Do not edit manually\n\n";
  writeFileSync(lockPath, header + TOML.stringify(lock as any));
}

/**
 * Add or update a package in the lockfile.
 */
export function lockPackage(
  name: string,
  entry: LockEntry,
  cwd = process.cwd()
) {
  const lock = readLock(cwd);
  lock.packages[name] = entry;
  writeLock(lock, cwd);
}
