// Kiểm nhanh chức năng chính ở máy (cần `pnpm dev:cms` đang chạy).
//   pnpm test:smoke
// Có GỬI 1 đăng ký thử vào kho ở máy (.cms-dev/leads.json) rồi tự XOÁ lại.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const PASS = process.env.CMS_DEV_PASSWORD ?? "Admin@12345";
const LEADS = ".cms-dev/leads.json";
const leadsTruoc = existsSync(LEADS) ? readFileSync(LEADS, "utf8") : "[]";
let loi = 0;
const kiem = (t, ok, x = "") => { if (!ok) loi++; console.log(`${ok ? "✓" : "✗"} ${t}${x ? "  " + x : ""}`); };

const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message.slice(0, 90)));
p.on("console", (m) => { if (m.type() === "error" && !m.text().includes("401")) errs.push(m.text().slice(0, 90)); });

try {
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.evaluate(async () => { for (let i = 0; i < document.body.scrollHeight; i += 500) { window.scrollTo(0, i); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
  await p.waitForLoadState("networkidle");
  const srcs = await p.evaluate(() => [...new Set([...document.querySelectorAll("img")].map((i) => new URL(i.src).pathname))]);
  const hong = [];
  for (const s of srcs) if (!(await p.request.get(BASE + s)).ok()) hong.push(s);
  kiem("ảnh tải được", !hong.length, `${srcs.length} tệp${hong.length ? ", hỏng: " + hong.join(", ") : ""}`);
  const thuTu = (await p.evaluate(() => [...document.querySelectorAll("main > section")].map((s) => s.id))).join(" → ");
  kiem("thứ tự khối", thuTu === "gioi-thieu → uu-diem → dong-xe → ngoai-that → noi-that → dang-ky → tram-sac", thuTu);

  await p.click("text=Đăng ký lái thử ngay");
  await p.waitForSelector('[role="dialog"]');
  await p.fill('input[name="name"]', "Kiểm thử tự động");
  await p.fill('input[name="phone"]', "0900000009");
  await p.click('button[type="submit"]');
  await p.waitForTimeout(1200);
  kiem("gửi đăng ký lái thử", (await p.textContent('[role="dialog"]')).includes("Đã nhận"));
  await p.keyboard.press("Escape");

  for (const [khoi, nut] of [["#dang-ky", "Brochure"], ["#tram-sac", "bản đồ"]]) {
    await p.evaluate((q) => document.querySelector(q).scrollIntoView(), khoi);
    await p.waitForTimeout(800);
    await p.locator(`${khoi} button:has-text('${nut}')`).first().click();
    await p.waitForTimeout(400);
    kiem(`nút "${nut}" chưa có dữ liệu → hộp thoại đang cập nhật`,
      ((await p.locator('[role="alertdialog"]').textContent().catch(() => "")) || "").includes("cập nhật"));
    await p.locator("[role='alertdialog'] button").click();
  }

  await p.goto(`${BASE}/admin/`, { waitUntil: "networkidle" });
  await p.fill('input[type="password"]', PASS);
  await p.click('button[type="submit"]');
  await p.waitForSelector("aside nav button");
  const muc = await p.evaluate(() => [...document.querySelectorAll("aside nav button")].map((x) => x.textContent.trim()));
  let o = 0;
  for (const m of muc) { await p.click(`aside nav button:text-is("${m}")`); await p.waitForTimeout(250); o += await p.locator("main input, main textarea, main select").count(); }
  kiem("trang quản trị mở đủ mục", muc.length === 10, `${muc.length} mục, ${o} ô nhập`);
} finally {
  await b.close();
  writeFileSync(LEADS, leadsTruoc); // trả kho đăng ký ở máy về như cũ
}
kiem("không có lỗi JS", !errs.length, errs.join(" | "));
console.log(loi ? `\n⛔ ${loi} mục sai\n` : "\n✅ Đạt hết\n");
process.exit(loi ? 1 : 0);
