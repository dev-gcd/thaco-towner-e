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
  ["#uu-diem", "thẻ đầu", "article:nth-of-type(6)", 80, 216, 400, 500],
  ["#dong-xe", "tiêu đề", "h2", 80, 112, null, null],
  ["#dong-xe", "ô giá", "div.bg-brand", 735, 590, 371, 32],
  ["#dong-xe", "bảng thông số", "dl", 735, 654, 590, 97],
  ["#dong-xe", "nút trái", "button", 80, 549, 56, 56],
  ["#ngoai-that", "chữ mờ", "p", 80, 112, null, null],
  ["#ngoai-that", "tiêu đề", "h2", 80, 1025, null, null],
  ["#ngoai-that", "chú thích ảnh", "figcaption", 80, 1855, null, null],
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
  // Chờ các hiệu ứng "hiện khi cuộn tới" chạy xong rồi mới đo — khối Giải pháp
  // trễ tới 1,1s + 0,7s, đo sớm sẽ thấy phần tử còn lệch 24px.
  await page.waitForTimeout(2500);
  return page;
}

/* ── 1. Toạ độ ở 1440 ────────────────────────────────────── */
console.log("\n① Toạ độ ở đúng 1440px so với Figma (lệch ≤2px coi như khớp)\n");
{
  const page = await mo(CANVAS);
  for (const [sec, ten, sel, ex, ey, ew, eh] of POSITIONS) {
    // Cuộn tới khối rồi mới đo: các khối có hiệu ứng "hiện khi cuộn tới" chỉ về
    // đúng vị trí sau khi đã lọt vào tầm nhìn.
    await page.evaluate((q) => document.querySelector(q)?.scrollIntoView({ block: "center" }), sec);
    await page.waitForTimeout(900);
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

/* ── 4. Hiệu ứng (đọc từ bản dựng play của Figma) ─────────── */
console.log("\n④ Hiệu ứng\n");
{
  const page = await mo(CANVAS, 1000);
  const kiem = (ten, dat, chiTiet = "") => {
    console.log(`  ${dat ? "✓" : "✗"} ${ten}${chiTiet ? "  " + chiTiet : ""}`);
    if (!dat) loi++;
  };

  // Thẻ ưu điểm: rê chuột đổi sang ảnh chi tiết
  await page.evaluate(() => document.querySelector("#uu-diem").scrollIntoView());
  await page.waitForTimeout(700);
  const the = page.locator("#uu-diem article").nth(5);
  const hop = await the.boundingBox();
  const anh = () =>
    page.evaluate(() => {
      const a = [...document.querySelectorAll("#uu-diem article")][5];
      const [i1, i2] = a.querySelectorAll("img");
      return [getComputedStyle(i1).opacity, getComputedStyle(i2).opacity];
    });
  const truoc = await anh();
  await page.mouse.move(hop.x + 200, hop.y + 250);
  await page.waitForTimeout(1000);
  const sau = await anh();
  kiem("thẻ ưu điểm đổi sang ảnh chi tiết khi rê chuột", truoc[1] === "0" && sau[1] === "1");

  // Băng chuyền: 3 thẻ đầy + 2 thẻ hé
  const nhinThay = await page.evaluate(() => {
    const r = [...document.querySelectorAll("#uu-diem article")]
      .map((a) => a.getBoundingClientRect())
      .filter((b) => b.right > 0 && b.left < window.innerWidth);
    return { tong: r.length, day: r.filter((b) => b.left >= 0 && b.right <= window.innerWidth).length };
  });
  kiem("băng chuyền hé 2 thẻ ở rìa", nhinThay.tong === 5 && nhinThay.day === 3,
    `thấy ${nhinThay.tong} thẻ, ${nhinThay.day} thẻ đầy`);

  // Dòng xe: đổi phiên bản thì nền trượt và bảng đổi bên
  await page.evaluate(() => document.querySelector("#dong-xe").scrollIntoView());
  await page.waitForTimeout(600);
  const doDongXe = () =>
    page.evaluate(() => {
      const s = document.querySelector("#dong-xe"), sb = s.getBoundingClientRect();
      return {
        nen: Math.round(s.querySelector("img").getBoundingClientRect().left - sb.left),
        bang: Math.round(s.querySelector("dl").getBoundingClientRect().left - sb.left),
      };
    });
  const v1 = await doDongXe();
  await page.click("#dong-xe button[aria-label^='Phiên bản kế tiếp']");
  await page.waitForTimeout(1300);
  const v2 = await doDongXe();
  kiem("đổi phiên bản: nền trượt -340 → -1024", Math.abs(v1.nen + 340) <= 2 && Math.abs(v2.nen + 1024) <= 2,
    `${v1.nen} → ${v2.nen}`);
  kiem("đổi phiên bản: bảng đổi bên 735 → 176", Math.abs(v1.bang - 735) <= 2 && Math.abs(v2.bang - 176) <= 2,
    `${v1.bang} → ${v2.bang}`);

  // Ngoại thất: bấm thẻ hé thì hai thẻ đổi chỗ
  await page.evaluate(() => document.querySelector("#ngoai-that").scrollIntoView({ block: "end" }));
  await page.waitForTimeout(800);
  const doNgoai = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("#ngoai-that figcaption")].map((f) =>
        Math.round(f.parentElement.getBoundingClientRect().width)
      )
    );
  const n1 = await doNgoai();
  await page.click("#ngoai-that .cursor-pointer");
  await page.waitForTimeout(1200);
  const n2 = await doNgoai();
  kiem("ngoại thất: hai thẻ đổi cỡ 900 ↔ 340", n1[0] > n1[1] && n2[0] > n2[1] && n1[0] === n2[0],
    `${n1.join("/")} → ${n2.join("/")}`);

  // Nội thất: bấm điểm nóng thì nền tối 70%
  await page.evaluate(() => document.querySelector("#noi-that").scrollIntoView());
  await page.waitForTimeout(800);
  const phu = () =>
    page.evaluate(() => {
      const s = document.querySelector("#noi-that");
      const el = [...s.querySelectorAll("span")].find((x) =>
        getComputedStyle(x).backgroundColor.includes("46, 46, 46")
      );
      return el ? getComputedStyle(el).opacity : "?";
    });
  const p1 = await phu();
  await page.click("#noi-that button");
  await page.waitForTimeout(500);
  const p2 = await phu();
  kiem("nội thất: bấm điểm nóng thì nền tối 70%", p1 === "0" && Math.abs(Number(p2) - 0.7) < 0.05,
    `${p1} → ${p2}`);

  // Hai nút luôn hiện dù CMS chưa có dữ liệu
  const nutBrochure = await page.locator("#dang-ky button:has-text('Brochure'), #dang-ky a:has-text('Brochure')").count();
  const nutBanDo = await page.locator("#tram-sac button:has-text('bản đồ'), #tram-sac a:has-text('bản đồ')").count();
  kiem("nút Tải Brochure luôn hiện", nutBrochure === 1);
  kiem("nút Mở bản đồ hiện đủ 4 trạm", nutBanDo === 4, `đếm được ${nutBanDo}`);

  await page.close();
}

await browser.close();
console.log(loi ? `\n⛔ ${loi} chỗ chưa đạt\n` : "\n✅ Tất cả đều đạt\n");
process.exit(loi ? 1 : 0);
