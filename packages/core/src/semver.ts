/**
 * Lightweight semver parsing and comparison utilities.
 * Handles ^, ~, >=, =, and exact version ranges.
 */

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

/**
 * Parse a version string like "2.4.1" or "2.4.1-beta.1"
 */
export function parseVersion(version: string): SemVer | null {
  const clean = version.replace(/^v/, "");
  const match = clean.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?$/
  );
  if (!match) return null;

  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    prerelease: match[4],
  };
}

/**
 * Compare two SemVer values. Returns -1, 0, or 1.
 */
export function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;
  // pre-release versions have lower precedence
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;
  return 0;
}

/**
 * Check if a version satisfies a semver range string.
 * Supports: ^1.2.3, ~1.2.3, >=1.2.3, =1.2.3, 1.2.3
 */
export function isCompatible(version: string, range: string): boolean {
  const ver = parseVersion(version);
  if (!ver) return false;

  const trimmed = range.trim();

  // Caret range: ^1.2.3 → >=1.2.3, <2.0.0
  if (trimmed.startsWith("^")) {
    const base = parseVersion(trimmed.slice(1));
    if (!base) return false;
    if (ver.major !== base.major) return false;
    return compareSemVer(ver, base) >= 0;
  }

  // Tilde range: ~1.2.3 → >=1.2.3, <1.3.0
  if (trimmed.startsWith("~")) {
    const base = parseVersion(trimmed.slice(1));
    if (!base) return false;
    if (ver.major !== base.major || ver.minor !== base.minor) return false;
    return ver.patch >= base.patch;
  }

  // Greater-than-or-equal: >=1.2.3
  if (trimmed.startsWith(">=")) {
    const base = parseVersion(trimmed.slice(2));
    if (!base) return false;
    return compareSemVer(ver, base) >= 0;
  }

  // Exact match: =1.2.3 or just 1.2.3
  const exactStr = trimmed.startsWith("=") ? trimmed.slice(1) : trimmed;
  const exact = parseVersion(exactStr);
  if (!exact) return false;
  return compareSemVer(ver, exact) === 0;
}

/**
 * From a list of available versions, find the latest that satisfies a range.
 */
export function getLatestCompatible(
  versions: string[],
  range: string
): string | null {
  const compatible = versions
    .filter((v) => isCompatible(v, range))
    .map((v) => ({ raw: v, parsed: parseVersion(v)! }))
    .filter((v) => v.parsed !== null)
    .sort((a, b) => compareSemVer(b.parsed, a.parsed));

  return compatible[0]?.raw ?? null;
}
