import { getPackage } from "./registry.js";
import { readLock } from "./lockfile.js";
import type { Package } from "@vanta/types";

export interface ResolvedPackage {
  name: string;
  version: string;
  tarballUrl: string | null;
  sha256: string | null;
  repositoryUrl: string | null;
  pkg: Package;
}

/**
 * Resolve a package and its transitive dependencies.
 * Returns a flat list of all packages that need to be installed.
 * Skips packages already present in the lockfile with matching version.
 */
export async function resolve(
  packageName: string,
  cwd = process.cwd()
): Promise<ResolvedPackage[]> {
  const lock = readLock(cwd);
  const resolved: ResolvedPackage[] = [];
  const seen = new Set<string>();

  async function resolveOne(name: string) {
    if (seen.has(name)) return;
    seen.add(name);

    const pkg = await getPackage(name);
    const version = pkg.latest_version;

    // Check if already locked at this version
    const locked = lock.packages[name];
    if (locked && locked.version === version) return;

    // Find the tarball URL and sha256 from versions array
    const versionEntry = pkg.versions?.find((v) => v.version === version);
    const tarballUrl = versionEntry?.tarball_url ?? null;
    const sha256 = versionEntry?.checksum_sha256 ?? null;

    resolved.push({
      name,
      version,
      tarballUrl,
      sha256,
      repositoryUrl: pkg.repository ?? null,
      pkg,
    });

    // Recursively resolve dependencies
    const deps = versionEntry?.dependencies ?? {};
    for (const depName of Object.keys(deps)) {
      await resolveOne(depName);
    }
  }

  await resolveOne(packageName);
  return resolved;
}
