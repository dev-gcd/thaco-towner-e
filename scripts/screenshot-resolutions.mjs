// Regression screenshots across the resolutions real customers reported issues on.
// Usage:
//   pnpm dev:cms        # serve the site (:3002), or set BASE_URL
//   pnpm test:screens   # in another terminal
//
// Customer monitors are mostly non-retina (DPR=1) — that's the case the dev's
// retina MacBook never reproduces. The "*-dev" row mimics the MacBook Air M2
// default scaling (~1470 logical @ DPR=2) for side-by-side comparison.
//
// Output (gitignored): _screens/<resolution>-full.png + overflow report on stdout.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "_screens");
mkdirSync(OUT, { recursive: true });

const CASES = [
  { name: "1024x768", w: 1024, h: 768, dpr: 1, note: "netbook 4:3" },
  { name: "1280x800", w: 1280, h: 800, dpr: 1, note: "laptop 16:10" },
  { name: "1366x768", w: 1366, h: 768, dpr: 1, note: "laptop phổ biến nhất" },
  { name: "1440x900", w: 1440, h: 900, dpr: 1, note: "canvas Figma" },
  { name: "1470x956-dev", w: 1470, h: 956, dpr: 2, note: "≈ MacBook Air M2 default" },
  { name: "1920x1080", w: 1920, h: 1080, dpr: 1, note: "Full HD" },
  { name: "2560x1600", w: 2560, h: 1600, dpr: 1, note: "2K 16:10" },
];

const browser = await chromium.launch();
let anyOverflow = false;

console.log(`\nTarget: ${BASE}\n`);
for (const c of CASES) {
  const ctx = await browser.newContext({
    viewport: { width: c.w, height: c.h },
    deviceScaleFactor: c.dpr,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000); // let motion + images settle

  const m = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    const offenders = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > vw + 1) {
        offenders.push(
          `<${el.tagName.toLowerCase()} class="${(el.className?.toString() || "").slice(0, 50)}"> right=${Math.round(r.right)}`,
        );
      }
    });
    return { overflowX: docW - vw, offenders: offenders.slice(0, 5) };
  });

  await page.screenshot({ path: join(OUT, `${c.name}-full.png`), fullPage: true });

  const flag = m.overflowX > 1 ? `  ⚠️  OVERFLOW-X ${m.overflowX}px` : "  ok";
  console.log(`${c.name.padEnd(14)} ${String(c.w + "×" + c.h).padEnd(10)} (${c.note})${flag}`);
  if (m.overflowX > 1) {
    anyOverflow = true;
    m.offenders.forEach((o) => console.log(`               ${o}`));
  }
  await ctx.close();
}

await browser.close();
console.log(`\nScreenshots → ${OUT}`);
console.log(anyOverflow ? "\n⚠️  Có overflow ngang ở ít nhất 1 độ phân giải.\n" : "\n✅ Không có overflow ngang.\n");
process.exit(anyOverflow ? 1 : 0);
