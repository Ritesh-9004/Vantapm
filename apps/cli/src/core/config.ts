import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import TOML from "@iarna/toml";
import { findProjectRoot } from "../utils/paths.js";

export interface VantaConfig {
  project: {
    name: string;
    version: string;
  };
  target: {
    board: string;
    chip: string;
    framework: string;
  };
  dependencies: Record<string, string>;
}

/**
 * Read vanta.toml from the project root.
 * Returns null if not found.
 */
export function readConfig(cwd = process.cwd()): VantaConfig | null {
  const root = findProjectRoot(cwd);
  if (!root) return null;
  const configPath = join(root, "vanta.toml");
  if (!existsSync(configPath)) return null;
  const content = readFileSync(configPath, "utf-8");
  const parsed = TOML.parse(content) as unknown as VantaConfig;
  // Ensure dependencies section exists
  if (!parsed.dependencies) parsed.dependencies = {};
  return parsed;
}

/**
 * Write a VantaConfig back to vanta.toml
 */
export function writeConfig(config: VantaConfig, cwd = process.cwd()) {
  const root = findProjectRoot(cwd) ?? cwd;
  const configPath = join(root, "vanta.toml");
  writeFileSync(configPath, TOML.stringify(config as any));
}

/**
 * Add a dependency to vanta.toml [dependencies]
 */
export function addDependency(name: string, version: string, cwd = process.cwd()) {
  const config = readConfig(cwd);
  if (!config) throw new Error("No vanta.toml found. Run `vanta init` first.");
  config.dependencies[name] = `^${version}`;
  writeConfig(config, cwd);
}
