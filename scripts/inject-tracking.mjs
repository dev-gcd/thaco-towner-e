// Chạy SAU `next build` (xem "build" trong package.json): chèn mã theo dõi khách dán
// ở /admin → "Mã theo dõi" (content/tracking.json) vào mọi trang khách trong out/.
//
// Làm ở bước này vì React không chèn được HTML tuỳ ý (nhiều thẻ, <noscript>…) vào
// <head>. /admin và /leads KHÔNG được chèn — thao tác nội bộ không vào số liệu.
// Mã sai (thẻ không cân…) thì build DỪNG: Workers Build không deploy, bản thật giữ nguyên.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { checkTrackingContent } from "../lib/tracking.mjs";

const OUT = "out";
const INTERNAL_DIRS = ["admin", "leads"];

const tracking = JSON.parse(await readFile("content/tracking.json", "utf8"));
const error = checkTrackingContent(tracking);
if (error) {
  console.error(`[inject-tracking] content/tracking.json không hợp lệ — ${error}`);
  process.exit(1);
}

const headCode = tracking.headCode.trim();
const bodyCode = tracking.bodyCode.trim();
if (!headCode && !bodyCode) {
  console.log("[inject-tracking] chưa có mã theo dõi — bỏ qua");
  process.exit(0);
}

const pages = (await readdir(OUT, { recursive: true }))
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !INTERNAL_DIRS.includes(f.split(sep)[0]));

for (const page of pages) {
  const file = join(OUT, page);
  let html = await readFile(file, "utf8");
  // Hàm thay thế (không dùng chuỗi) để `$&`, `$1`… trong mã khách không bị hiểu nhầm.
  if (headCode) {
    // Ngay sau <meta charset> — càng cao càng tốt (Google khuyên), nhưng charset phải đứng đầu.
    const anchor = /<meta charSet="utf-8"\s*\/?>/i.test(html) ? /<meta charSet="utf-8"\s*\/?>/i : /<head[^>]*>/i;
    if (!anchor.test(html)) throw new Error(`[inject-tracking] không thấy <head> trong ${file}`);
    html = html.replace(anchor, (m) => `${m}${headCode}`);
  }
  if (bodyCode) {
    if (!/<body[^>]*>/i.test(html)) throw new Error(`[inject-tracking] không thấy <body> trong ${file}`);
    html = html.replace(/<body[^>]*>/i, (m) => `${m}${bodyCode}`);
  }
  await writeFile(file, html);
}
console.log(`[inject-tracking] đã chèn mã theo dõi vào ${pages.length} trang: ${pages.map((p) => relative(".", p)).join(", ")}`);
