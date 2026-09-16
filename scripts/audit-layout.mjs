// Bộ đo bố cục — chạy sau mỗi lần sửa giao diện.
//
//   pnpm dev:cms          # bật trang ở :3002
//   pnpm audit:layout     # hoặc BASE_URL=... node scripts/audit-layout.mjs
//
// Ba phép đo:
//   1. Toạ độ thật của từng phần tử ở đúng 1440px, so với toạ độ trong Figma.
//   2. Ở màn rộng (1920): NỘI DUNG (chữ, nút, thẻ) phải nằm trong khung 1440
//      căn giữa. Riêng ẢNH NỀN được phép tràn — đó là chủ ý ("trung sách").
//   3. Không tràn ngang ở 9 độ phân giải, kể cả màn bật phóng to hệ điều hành.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const CANVAS = 1440;

/** [khối, tên, selector, x, y, rộng, cao] — toạ độ lấy từ Figma, tính từ mép khối. */
const POSITIONS = [
  ["header", "logo", "div.relative > div > img", 80, 135, 640, 142],
  ["header", "tiêu đề", "h1", 93, 316, null, null],
  ["#gioi-thieu", "thẻ trắng", "div.overflow-hidden.rounded-\\[16px\\]", 80, 120, 1280, 444],
  ["#gioi-thieu", "tiêu đề", "h2", 144, 168, null, null],
  ["#gioi-thieu", "nút", "button", 144, 359, 242, 40],
  ["#uu-diem", "tiêu đề", "h2", 80, 112, null, null],
  ["#uu-diem", "thẻ đầu", "article", 80, 216, 400, 500],
  ["#dong-xe", "tiêu đề", "h2", 80, 112, null, null],
  ["#dong-xe", "ô giá", "div.bg-brand", 735, 590, 371, 32],
  ["#dong-xe", "bảng thông số", "dl", 735, 654, 590, 97],
  ["#dong-xe", "nút trái", "button", 80, 549, 56, 56],
  ["#ngoai-that", "chữ mờ", "p", 80, 112, null, null],
  ["#ngoai-that", "tiêu đề", "h2", 80, 1025, null, null],
  ["#ngoai-that", "ảnh chi tiết", "figure > div", 80, 1309, 900, 506],
  ["#noi-that", "chữ mờ", "p", 386, 112, null, null],
  ["#noi-that", "điểm nóng 1", "button", 756, 531, 40, 40],
  ["#tram-sac", "tiêu đề", "h2", 80, 76, null, null],
  ["#tram-sac", "thẻ trạm đầu", "ul li", 80, 238, 302, 372],
  ["#tram-sac", "ảnh xe", "img[alt*='sạc']", 110, 527, 1220, 809],
  ["#dang-ky", "thẻ 1", "article", 80, 80, 630, 558],
  ["footer", "logo", "img", 80, 100, 139, 60],
];

const SIZES = [
  [1920, 1080, 1], [1536, 864, 1.25], [1440, 900, 1], [1280, 800, 1],
  [1024, 768, 1], [853, 533, 1.5], [768, 1024, 1], [430, 932, 3], [390, 844, 3],
];

const browser = await chromium.launch();
let loi = 0;

async function mo(width, height = 1000, deviceScaleFactor = 1) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 600) {
      window.scrollTo(0, i);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  return page;
}

/* ── 1. Toạ độ ở 1440 ────────────────────────────────────── */
console.log("\n① Toạ độ ở đúng 1440px so với Figma (lệch ≤2px coi như khớp)\n");
{
  const page = await mo(CANVAS);
  for (const [sec, ten, sel, ex, ey, ew, eh] of POSITIONS) {
    const r = await page.evaluate(([sec, sel]) => {
      const s = document.querySelector(sec);
      if (!s) return { err: "không thấy khối" };
      const el = s.querySelector(sel);
      if (!el) return { err: "không thấy phần tử" };
      const a = el.getBoundingClientRect(), b = s.getBoundingClientRect();
      return { x: Math.round(a.left - b.left), y: Math.round(a.top - b.top), w: Math.round(a.width), h: Math.round(a.height) };
    }, [sec, sel]);
    if (r.err) { console.log(`  ✗ ${sec} ${ten}: ${r.err}`); loi++; continue; }
    const sai = [];
    if (Math.abs(ex - r.x) > 2) sai.push(`x ${ex}→${r.x}`);
    if (Math.abs(ey - r.y) > 2) sai.push(`y ${ey}→${r.y}`);
    if (ew && Math.abs(ew - r.w) > 2) sai.push(`rộng ${ew}→${r.w}`);
    if (eh && Math.abs(eh - r.h) > 2) sai.push(`cao ${eh}→${r.h}`);
    if (sai.length) { console.log(`  ✗ ${sec.padEnd(12)} ${ten.padEnd(16)} ${sai.join(", ")}`); loi++; }
    else console.log(`  ✓ ${sec.padEnd(12)} ${ten}`);
  }
  await page.close();
}

/* ── 2. Nội dung không được ra ngoài khung 1440 ───────────── */
console.log("\n② Ở 1920px: chữ/nút/thẻ phải nằm trong khung 1440 căn giữa (ảnh nền được phép tràn)\n");
{
  const page = await mo(1920);
  const ra = await page.evaluate((CANVAS) => {
    const L = (window.innerWidth - CANVAS) / 2, R = L + CANVAS;
    const out = [];
    for (const el of document.querySelectorAll("h1,h2,h3,p,button,a,dl,article,li,figcaption")) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (el.closest("[aria-hidden='true']")) continue;
      // Bỏ qua phần tử đã bị tổ tiên cắt (băng chuyền): hộp bố cục thò ra ngoài
      // nhưng thực tế không được vẽ.
      let biCat = false;
      for (let a = el.parentElement; a; a = a.parentElement) {
        const ov = getComputedStyle(a).overflowX;
        if (ov === "hidden" || ov === "clip" || ov === "auto" || ov === "scroll") {
          const ab = a.getBoundingClientRect();
          if (r.left < ab.left - 1 || r.right > ab.right + 1) { biCat = true; break; }
        }
      }
      if (biCat) continue;
      const lech = Math.round(Math.max(0, L - r.left) + Math.max(0, r.right - R));
      if (lech > 2) out.push(`${el.tagName} "${(el.textContent || "").trim().slice(0, 28)}" lệch ${lech}px`);
    }
    return [...new Set(out)];
  }, CANVAS);
  if (ra.length) { ra.forEach((x) => console.log(`  ✗ ${x}`)); loi += ra.length; }
  else console.log("  ✓ không có nội dung nào ra ngoài khung");
  await page.close();
}

/* ── 3. Tràn ngang ở nhiều độ phân giải ───────────────────── */
console.log("\n③ Tràn ngang ở 9 độ phân giải\n");
for (const [w, h, dpr] of SIZES) {
  const page = await mo(w, h, dpr);
  const tran = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const js = await page.evaluate(() => window.__err ?? 0);
  console.log(`  ${tran > 0 ? "✗" : "✓"} ${String(w).padStart(4)}×${String(h).padEnd(4)} dpr${dpr}  tràn=${tran}px`);
  if (tran > 0) loi++;
  void js;
  await page.close();
}

await browser.close();
console.log(loi ? `\n⛔ ${loi} chỗ chưa đạt\n` : "\n✅ Tất cả đều đạt\n");
process.exit(loi ? 1 : 0);
