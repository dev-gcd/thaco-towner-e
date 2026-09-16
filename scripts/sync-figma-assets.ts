#!/usr/bin/env tsx
/**
 * Sync Figma MCP assets → public/images/
 *
 * Figma MCP asset URLs (https://www.figma.com/api/mcp/asset/...) expire 7 days
 * after generation. This script downloads every asset listed in
 * scripts/figma-assets.json into public/images/<section>/<name>.<ext>.
 *
 * Usage:
 *   pnpm tsx scripts/sync-figma-assets.ts
 *
 * After a fresh `get_design_context` pass, update scripts/figma-assets.json
 * with the new URLs and re-run.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "scripts", "figma-assets.json");
const OUT_DIR = path.join(ROOT, "public", "images");

type AssetItem = { name: string; url: string; ext: string };
type SectionGroup = { section: string; nodeId: string; items: AssetItem[] };
type Manifest = {
  fileKey: string;
  lastSynced: string | null;
  note: string;
  assets: SectionGroup[];
};

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

async function syncSection(group: SectionGroup): Promise<{ ok: number; failed: number }> {
  const dir = path.join(OUT_DIR, group.section);
  await fs.mkdir(dir, { recursive: true });

  let ok = 0;
  let failed = 0;

  for (const item of group.items) {
    const dest = path.join(dir, `${item.name}.${item.ext}`);
    try {
      await download(item.url, dest);
      console.log(`  ✓ ${group.section}/${item.name}.${item.ext}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${group.section}/${item.name}: ${(err as Error).message}`);
      failed++;
    }
  }
  return { ok, failed };
}

async function main(): Promise<void> {
  const raw = await fs.readFile(MANIFEST, "utf-8");
  const manifest: Manifest = JSON.parse(raw);

  console.log(`Syncing Figma assets (file ${manifest.fileKey})…\n`);

  let totalOk = 0;
  let totalFailed = 0;

  for (const group of manifest.assets) {
    console.log(`[${group.section}]`);
    const { ok, failed } = await syncSection(group);
    totalOk += ok;
    totalFailed += failed;
    console.log();
  }

  manifest.lastSynced = new Date().toISOString();
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Done: ${totalOk} succeeded, ${totalFailed} failed.`);
  if (totalFailed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
