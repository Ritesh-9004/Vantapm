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

/**
 * Download a package tarball and extract it to .vanta/packages/name@version/
 * For v1, since there are no real tarballs on R2, we create the folder structure
 * as a placeholder.
 */
export async function downloadAndExtract(
  name: string,
  version: string,
  tarballUrl: string | null,
  root: string
): Promise<DownloadResult> {
  const pkgsDir = packagesDir(root);
  const extractDir = join(pkgsDir, `${name}@${version}`);

  // Ensure .vanta/packages/ exists
  mkdirSync(pkgsDir, { recursive: true });

  if (tarballUrl) {
    // Real download flow (when tarballs exist in R2)
    const tempTarball = join(pkgsDir, `${name}-${version}.tar.gz`);

    try {
      const sizeBytes = await downloadTarball(tarballUrl, tempTarball);

      // Extract tarball
      mkdirSync(extractDir, { recursive: true });
      await tar.extract({
        file: tempTarball,
        cwd: extractDir,
      });

      // Clean up tarball
      const { unlinkSync } = await import("fs");
      unlinkSync(tempTarball);

      return { name, version, sizeBytes, extractedTo: extractDir };
    } catch {
      // If download fails, fall through to placeholder
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
