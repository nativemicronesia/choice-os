import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

// Replaceable image slots. Drop a file named <slot>.<ext> into public/choice/
// and the matching placeholder is replaced on the next build. See
// public/choice/README.md for the slot list and recommended sizes.
const EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png", "svg"];
const DIR = path.join(process.cwd(), "public", "choice");

export function resolveAsset(slot: string): string | null {
  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(DIR, `${slot}.${ext}`))) return `/choice/${slot}.${ext}`;
  }
  return null;
}
