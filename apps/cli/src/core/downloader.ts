import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import * as tar from "tar";
import { packagesDir } from "../utils/paths.js";
import { downloadTarball } from "./registry.js";

export interface DownloadResult {
  name: string;
  version: string;
  sizeBytes: number;
  extractedTo: string;
}

function parseGitHubRepo(repositoryUrl: string | null): { owner: string; repo: string } | null {
  if (!repositoryUrl) return null;

  const match = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?$/i);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
  };
}

function githubArchiveCandidates(repositoryUrl: string | null, version: string): string[] {
  const parsed = parseGitHubRepo(repositoryUrl);
  if (!parsed) return [];

  const { owner, repo } = parsed;
  return [
    `https://codeload.github.com/${owner}/${repo}/tar.gz/refs/tags/${version}`,
    `https://codeload.github.com/${owner}/${repo}/tar.gz/refs/tags/v${version}`,
    `https://api.github.com/repos/${owner}/${repo}/tarball/${version}`,
    `https://api.github.com/repos/${owner}/${repo}/tarball/v${version}`,
    `https://api.github.com/repos/${owner}/${repo}/tarball`,
  ];
}

async function extractTarball(tempTarball: string, extractDir: string) {
  mkdirSync(extractDir, { recursive: true });
  await tar.extract({
    file: tempTarball,
    cwd: extractDir,
    strip: 1,
  });

  const { unlinkSync } = await import("fs");
  unlinkSync(tempTarball);
}

/**
 * Download a package tarball and extract it to .vanta/packages/name@version/
 * For v1, since there are no real tarballs on R2, we create the folder structure
 * as a placeholder.
 */
export async function downloadAndExtract(
  name: string,
  version: string,
  tarballUrl: string | null,
  repositoryUrl: string | null,
  root: string
): Promise<DownloadResult> {
  const pkgsDir = packagesDir(root);
  const extractDir = join(pkgsDir, `${name}@${version}`);
  const tempTarball = join(pkgsDir, `${name}-${version}.tar.gz`);

  // Ensure .vanta/packages/ exists
  mkdirSync(pkgsDir, { recursive: true });

  const candidateUrls = [
    ...(tarballUrl ? [tarballUrl] : []),
    ...githubArchiveCandidates(repositoryUrl, version),
  ];

  for (const candidateUrl of candidateUrls) {
    try {
      const sizeBytes = await downloadTarball(candidateUrl, tempTarball);
      await extractTarball(tempTarball, extractDir);

      return { name, version, sizeBytes, extractedTo: extractDir };
    } catch {
      // Try next candidate URL; if all fail, fall through to placeholder.
    }
  }

  // Placeholder: create directory structure for packages without tarballs
  mkdirSync(extractDir, { recursive: true });

  // Create a placeholder README
  const readmePath = join(extractDir, "README.md");
  if (!existsSync(readmePath)) {
    const { writeFileSync } = await import("fs");
    writeFileSync(
      readmePath,
      `# ${name}@${version}\n\nInstalled by vanta CLI.\nSource: registry.vanta.dev\n`
    );
  }

  return { name, version, sizeBytes: 0, extractedTo: extractDir };
}
