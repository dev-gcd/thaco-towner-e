/**
 * Convert all JPG/PNG under public/images to WebP, cap at 2400px wide.
 *
 * Strategy:
 * - Walk public/images/** recursively
 * - For each .jpg/.jpeg/.png: produce a .webp sibling at quality 82
 * - Resize down only (never upscale)
 * - Skip if .webp already exists and is newer than source
 *
 * Run with: pnpm tsx scripts/optimize-images.ts [--delete-originals]
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public/images/", import.meta.url).pathname;
const MAX_WIDTH = 2400;
const QUALITY = 82;
const DELETE = process.argv.includes("--delete-originals");

type Stats = {
  processed: number;
  skipped: number;
  bytesBefore: number;
  bytesAfter: number;
};

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function isRaster(path: string) {
  const ext = extname(path).toLowerCase();
  return ext === ".jpg" || ext === ".jpeg" || ext === ".png";
}

async function optimize(file: string, stats: Stats) {
  const webp = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const before = (await stat(file)).size;
  stats.bytesBefore += before;

  // Skip if up-to-date webp already exists
  try {
    const webpStat = await stat(webp);
    const srcStat = await stat(file);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      stats.skipped++;
      stats.bytesAfter += webpStat.size;
      return;
    }
  } catch {
    // webp doesn't exist yet, fall through
  }

  const img = sharp(file).rotate(); // honor EXIF orientation
  const meta = await img.metadata();
  const pipeline =
    meta.width && meta.width > MAX_WIDTH
      ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true })
      : img;

  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(webp);
  const after = (await stat(webp)).size;
  stats.bytesAfter += after;
  stats.processed++;

  const pct = ((1 - after / before) * 100).toFixed(0);
  const rel = file.replace(ROOT, "");
  console.log(`✓ ${rel} — ${human(before)} → ${human(after)} (-${pct}%)`);

  if (DELETE) await unlink(file);
}

function human(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)}MB`;
}

async function main() {
  const stats: Stats = {
    processed: 0,
    skipped: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };
  for await (const file of walk(ROOT)) {
    if (!isRaster(file)) continue;
    try {
      await optimize(file, stats);
    } catch (err) {
      console.error(`✗ ${file}:`, err);
    }
  }

  console.log("\n---");
  console.log(
    `${stats.processed} processed, ${stats.skipped} skipped (up-to-date)`
  );
  console.log(
    `Total: ${human(stats.bytesBefore)} → ${human(stats.bytesAfter)} (-${(
      (1 - stats.bytesAfter / stats.bytesBefore) *
      100
    ).toFixed(0)}%)`
  );
  if (DELETE) console.log("Originals deleted.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
