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
// Khối Trạm sạc đang TẠM ẨN (chốt 29/09) → không bấm nút "Mở bản đồ". Bỏ ẩn thì đặt lại false.
const TRAM_SAC_AN = true;
const kiem = (t, ok, x = "") => { if (!ok) loi++; console.log(`${ok ? "✓" : "✗"} ${t}${x ? "  " + x : ""}`); };

const b = await chromium.launch();
const QUOTE_KEY = "towner-e:quote-popup-seen"; // khớp QUOTE_POPUP_SEEN_KEY trong LandingPage.tsx
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
// Popup báo giá tự hiện khi cuộn qua khối Dòng xe — tắt ở đây, kiểm riêng ở cuối.
await p.addInitScript((k) => sessionStorage.setItem(k, "1"), QUOTE_KEY);
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

  for (const [khoi, nut] of [["#dang-ky", "Brochure"], ...(TRAM_SAC_AN ? [] : [["#tram-sac", "bản đồ"]])]) {
    await p.evaluate((q) => document.querySelector(q).scrollIntoView(), khoi);
    await p.waitForTimeout(800);
    await p.locator(`${khoi} button:has-text('${nut}')`).first().click();
    await p.waitForTimeout(400);
    kiem(`nút "${nut}" chưa có dữ liệu → hộp thoại đang cập nhật`,
      ((await p.locator('[role="alertdialog"]').textContent().catch(() => "")) || "").includes("cập nhật"));
    await p.locator("[role='alertdialog'] button").click();
  }

  // Popup "Nhận báo giá": tự hiện khi cuộn tới Dòng xe, chỉ 1 lần, ghi khách với nguồn "quote"
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const q = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    q.on("pageerror", (e) => errs.push(e.message.slice(0, 90)));
    await q.goto(BASE, { waitUntil: "networkidle" });
    await q.evaluate(() => document.querySelector("#dong-xe").scrollIntoView());
    await q.waitForTimeout(2500);
    const hop = q.locator('[role="dialog"]');
    const hien = (await hop.count()) === 1 && (await hop.textContent()).includes("Nhận báo giá");
    kiem(`${w}px: popup báo giá tự hiện ở khối Dòng xe`, hien);
    if (!hien) { await q.context().close(); continue; }
    kiem(`${w}px: popup chỉ 2 ô, có khung quà tặng`,
      (await hop.locator("textarea").count()) === 0 && (await hop.textContent()).includes("Tặng"));
    await q.fill('[role="dialog"] input[name="name"]', "Kiểm thử báo giá");
    await q.fill('[role="dialog"] input[name="phone"]', "0900000008");
    await q.click('[role="dialog"] button[type="submit"]');
    await q.waitForTimeout(1200);
    const lead = JSON.parse(readFileSync(LEADS, "utf8")).find((l) => l.phone === "0900000008" && l.source === "quote");
    kiem(`${w}px: gửi báo giá → lưu khách nguồn "quote"`, Boolean(lead), lead?.note ?? "");
    await q.keyboard.press("Escape");
    await q.reload({ waitUntil: "networkidle" });
    await q.evaluate(() => document.querySelector("#dong-xe").scrollIntoView());
    await q.waitForTimeout(2500);
    kiem(`${w}px: tải lại trang thì popup không hiện lại`, (await q.locator('[role="dialog"]').count()) === 0);
    await q.context().close();
    writeFileSync(LEADS, leadsTruoc);
  }

  await p.goto(`${BASE}/admin/`, { waitUntil: "networkidle" });
  await p.fill('input[type="password"]', PASS);
  await p.click('button[type="submit"]');
  await p.waitForSelector("aside nav button");
  const muc = await p.evaluate(() => [...document.querySelectorAll("aside nav button")].map((x) => x.textContent.trim()));
  let o = 0;
  for (const m of muc) { await p.click(`aside nav button:text-is("${m}")`); await p.waitForTimeout(250); o += await p.locator("main input, main textarea, main select").count(); }
  kiem("trang quản trị mở đủ mục", muc.length === 11, `${muc.length} mục, ${o} ô nhập`);
} finally {
  await b.close();
  writeFileSync(LEADS, leadsTruoc); // trả kho đăng ký ở máy về như cũ
}
kiem("không có lỗi JS", !errs.length, errs.join(" | "));
console.log(loi ? `\n⛔ ${loi} mục sai\n` : "\n✅ Đạt hết\n");
process.exit(loi ? 1 : 0);
