// Bộ đo bố cục — chạy sau mỗi lần sửa giao diện.
//
//   pnpm dev:cms          # bật trang ở :3002
//   pnpm audit:layout     # hoặc BASE_URL=... node scripts/audit-layout.mjs
//
// Các phép đo:
//   1. Toạ độ thật của từng phần tử ở đúng 1440px, so với toạ độ trong Figma;
//      1b. ở laptop 800–1439, khối có bản laptop phải co đúng tỉ lệ khung 1440.
//   2. Ở màn rộng (1920): NỘI DUNG (chữ, nút, thẻ) phải nằm trong khung 1440
//      căn giữa. Riêng ẢNH NỀN được phép tràn — đó là chủ ý ("trung sách").
//   3. Không tràn ngang ở 12 độ phân giải (có 3 cỡ laptop), kể cả màn bật phóng to hệ điều hành.
//   4–6. Hiệu ứng · bản điện thoại/máy tính bảng · thao tác trên điện thoại.
//   7. Dải laptop 800–1439: chữ không bị cắt / đè nhau / ra ngoài khối / nhỏ hơn 12px.
//   8. Thanh menu cố định: bám đầu màn suốt trang, 6 mục + hotline không tràn, bấm menu
//      thì khối nằm ngay dưới thanh.
//   9. Băng ảnh các góc xe (Ngoại thất): bấm tới hết, quay vòng về ảnh đầu (xe vào từ trái),
//      thanh vị trí đúng chỗ, nút không tràn — bỏ qua khi nội dung chưa có ≥2 ảnh.
//  10. Phiên bản dùng chung: đổi ở Dòng xe thì Ngoại thất + Nội thất đổi theo, và ngược lại.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3002";
const CANVAS = 1440;

/** [khối, tên, selector, x, y, rộng, cao] — toạ độ lấy từ Figma, tính từ mép khối. */
const POSITIONS = [
  ["header", "logo", "div.relative > div > img", 80, 95, 640, 142], // Figma y=135 tính cả thanh menu 40px — thanh đã tách ra ngoài <header>
  ["header", "tiêu đề", "h1", 93, 276, null, null],
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
  ["#noi-that", "điểm nóng 1", "button[aria-expanded]", 756, 531, 40, 40],
  ["#tram-sac", "tiêu đề", "h2", 80, 76, null, null],
  ["#tram-sac", "thẻ trạm đầu", "ul li", 80, 238, 302, 372],
  ["#tram-sac", "ảnh xe", "img[alt*='sạc']", 0, 666, 1440, 610], // dải đáy khối (ảnh 25/09)
  ["#dang-ky", "thẻ 1", "article", 80, 80, 630, 558],
  ["footer", "logo", "img", 80, 100, 139, 60],
];

const SIZES = [
  [1920, 1080, 1], [1536, 864, 1.25], [1440, 900, 1], [1280, 800, 1],
  [1024, 768, 1], [1366, 768, 1], [1280, 720, 1.5], [1024, 640, 1.25], [853, 533, 1.5], [768, 1024, 1], [430, 932, 3], [390, 844, 3],
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

/* ── 1b. Laptop 800–1439: khung 1440 co theo bề ngang ─────
   Chỉ các khối đã có bản laptop (`lg:` + `--u`). Toạ độ mong đợi = Figma × (w/1440).
   Điểm nóng giữ 40px để dễ bấm nên so TÂM nút, không so góc. */
const LAPTOP = [
  // [khối, tên, selector, x, y, đo theo tâm?]
  ["header", "logo", ".canvas-1440 img", 80, 95, false],
  ["#gioi-thieu", "thẻ trắng", "div.overflow-hidden.rounded-\\[16px\\]", 80, 120, false],
  ["#dong-xe", "tâm nút trái", "button", 108, 577, true],
  ["#dang-ky", "thẻ 1", "article", 80, 80, false],
  ["#noi-that", "cụm tiêu đề", "div.flex-col", 386, 80, false],
  ["#noi-that", "tâm điểm nóng 1", "button[aria-expanded]", 776, 551, true],
  ["#noi-that", "tâm điểm nóng 5", "div.hidden > div:nth-child(5) > button", 740, 748, true],
];
console.log("\n①b Laptop: khối có bản laptop co đúng tỉ lệ khung 1440 (lệch ≤3px)\n");
for (const [w, h, dpr] of [[853, 533, 1.5], [1024, 640, 1.25], [1280, 720, 1.5], [1366, 768, 1]]) {
  const page = await mo(w, h, dpr);
  for (const [sec, ten, sel, ex, ey, tam] of LAPTOP) {
    await page.evaluate((q) => document.querySelector(q)?.scrollIntoView({ block: "center" }), sec);
    await page.waitForTimeout(900);
    const r = await page.evaluate(([sec, sel, tam]) => {
      const s = document.querySelector(sec);
      const el = s?.querySelector(sel);
      if (!el) return null;
      // khung đo = phần tử gắn `.canvas-1440` (có khi chính là khối)
      const khung = (s.matches(".canvas-1440") ? s : s.querySelector(".canvas-1440")).getBoundingClientRect();
      const a = el.getBoundingClientRect();
      return { x: a.left - khung.left + (tam ? a.width / 2 : 0), y: a.top - khung.top + (tam ? a.height / 2 : 0), k: khung.width / 1440 };
    }, [sec, sel, tam]);
    if (!r) { console.log(`  ✗ ${w} ${sec} ${ten}: không thấy phần tử`); loi++; continue; }
    const [mx, my] = [ex * r.k, ey * r.k];
    const dat = Math.abs(mx - r.x) <= 3 && Math.abs(my - r.y) <= 3;
    if (!dat) loi++;
    console.log(`  ${dat ? "✓" : "✗"} ${String(w).padStart(4)} ${sec} ${ten}${dat ? "" : `: mong ${Math.round(mx)},${Math.round(my)} → ${Math.round(r.x)},${Math.round(r.y)}`}`);
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
console.log("\n③ Tràn ngang ở 12 độ phân giải\n");
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
  kiem("đổi phiên bản: nền trượt 0 → -684", Math.abs(v1.nen) <= 2 && Math.abs(v2.nen + 684) <= 2,
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
  await page.click("#noi-that button[aria-expanded]");
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

/* ── 5. Bản điện thoại / máy tính bảng ───────────────────── */
console.log("\n⑤ Bản điện thoại & máy tính bảng (320 → 768) + 1024 (laptop, kiểm vùng bấm cho iPad ngang)\n");
for (const [w, h] of [[320, 568], [360, 780], [390, 844], [430, 932], [768, 1024], [1024, 768]]) {
  const page = await mo(w, h, 2);
  const kq = await page.evaluate((vw) => {
    const ra = [];
    for (const s of document.querySelectorAll("main > section, header, footer")) {
      const id = s.id || s.tagName.toLowerCase();

      // tràn ngang (bỏ qua thứ đã bị tổ tiên cắt/cuộn)
      for (const el of s.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.right <= vw + 2) continue;
        let cat = false;
        for (let a = el.parentElement; a; a = a.parentElement) {
          const ov = getComputedStyle(a).overflowX;
          if (["hidden", "clip", "auto", "scroll"].includes(ov)) { cat = true; break; }
        }
        if (!cat) { ra.push(`${id}: tràn ${Math.round(r.right - vw)}px (${el.tagName})`); break; }
      }

      // chữ đè chữ
      const chu = [...s.querySelectorAll("h1,h2,h3,p,span,dd,dt,li,a,button")]
        .filter((e) => e.textContent.trim() && !e.children.length)
        .map((e) => {
          // Ngang: VÙNG CHỮ thật (Range) — thẻ <p> rộng hết hàng, lấy khung thẻ thì nút đứng
          // cùng hàng bị báo "đè chữ" nhầm. Dọc: khung dòng của thẻ — vùng nét chữ khổng lồ
          // (136px) cao hơn chiều cao dòng, lấy theo nét thì dòng trên bị báo đè nhầm.
          const g = document.createRange(); g.selectNodeContents(e);
          const t = g.getBoundingClientRect(), k = e.getBoundingClientRect();
          return { e, r: { left: t.left, right: t.right, top: k.top, bottom: k.bottom, width: t.width, height: k.height } };
        })
        .filter((o) => o.r.width > 8 && o.r.height > 8);
      outer: for (let i = 0; i < chu.length; i++)
        for (let j = i + 1; j < chu.length; j++) {
          const A = chu[i], B = chu[j];
          if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
          const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
          const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
          if (ox > 6 && oy > 6) {
            ra.push(`${id}: đè chữ "${A.e.textContent.trim().slice(0, 16)}" ⨯ "${B.e.textContent.trim().slice(0, 16)}"`);
            break outer;
          }
        }

      // chữ nhỏ hơn 12px
      for (const el of s.querySelectorAll("p,span,li,dd,dt,a")) {
        if (!el.textContent.trim() || el.children.length) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs && fs < 12) { ra.push(`${id}: chữ ${fs}px quá nhỏ`); break; }
      }

      // vùng bấm nhỏ hơn 40px
      const be = [...s.querySelectorAll("button,a")].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 2 && (r.height < 40 || r.width < 40);
      });
      if (be.length) ra.push(`${id}: ${be.length} vùng bấm < 40px`);

      // ảnh méo tỉ lệ
      for (const im of s.querySelectorAll("img")) {
        const r = im.getBoundingClientRect();
        if (r.width < 4 || !im.naturalWidth || r.height < 4) continue;
        const fit = getComputedStyle(im).objectFit;
        if (fit !== "fill" && fit !== "none") continue;
        const lech = Math.abs(r.width / r.height - im.naturalWidth / im.naturalHeight) /
          (im.naturalWidth / im.naturalHeight);
        if (lech > 0.12) { ra.push(`${id}: ảnh méo ${Math.round(lech * 100)}%`); break; }
      }
    }
    return [...new Set(ra)];
  }, w);

  // băng chuyền phải khớp bước trượt thật
  const bang = await page.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll(".snap-x")) {
      const con = [...t.children];
      // dải bị ẩn ở mốc này (vd dải thẻ Nội thất từ lg) thì không đo
      if (con.length < 2 || !t.getClientRects().length) continue;
      const b = Math.round(con[1].getBoundingClientRect().left - con[0].getBoundingClientRect().left);
      const rong = Math.round(con[0].getBoundingClientRect().width);
      if (b <= rong) out.push(`bước trượt ${b} ≤ bề rộng thẻ ${rong}`);
    }
    return out;
  });

  const tat = [...kq, ...bang];
  console.log(`  ${tat.length ? "✗" : "✓"} ${String(w).padStart(4)}×${String(h).padEnd(4)}${tat.length ? "" : "  sạch"}`);
  tat.forEach((x) => console.log(`        • ${x}`));
  loi += tat.length;
  await page.close();
}

/* ── 6. Thao tác trên điện thoại ─────────────────────────── */
console.log("\n⑥ Thao tác trên điện thoại (390px)\n");
{
  const page = await mo(390, 844, 2);
  const kiem = (ten, dat, chiTiet = "") => {
    console.log(`  ${dat ? "✓" : "✗"} ${ten}${chiTiet ? "  " + chiTiet : ""}`);
    if (!dat) loi++;
  };

  // đổi phiên bản phải đổi luôn chiếc xe trong ảnh nền (điện thoại: dải ảnh trượt ngang)
  await page.evaluate(() => document.querySelector("#dong-xe").scrollIntoView());
  await page.waitForTimeout(700);
  const viTri = () =>
    page.evaluate(() => Math.round(document.querySelector("#dong-xe img").getBoundingClientRect().left));
  const p1 = await viTri();
  await page.click("#dong-xe button[aria-label^='Phiên bản kế tiếp']");
  await page.waitForTimeout(1400);
  const p2 = await viTri();
  kiem("đổi phiên bản đổi luôn chiếc xe trong ảnh nền", p1 !== p2, `${p1} → ${p2}`);

  // bấm vào thẻ thì dải cuộn sang thẻ kế tiếp
  for (const [ten, khoi] of [["Ưu điểm", "#uu-diem"], ["Nội thất", "#noi-that"]]) {
    await page.evaluate((q) => document.querySelector(q).scrollIntoView(), khoi);
    await page.waitForTimeout(600);
    const truoc = await page.evaluate((q) => Math.round(document.querySelector(`${q} .snap-x`).scrollLeft), khoi);
    await page.locator(`${khoi} .snap-x > *`).nth(0).click({ position: { x: 60, y: 60 } });
    await page.waitForTimeout(900);
    const sau = await page.evaluate((q) => Math.round(document.querySelector(`${q} .snap-x`).scrollLeft), khoi);
    kiem(`bấm thẻ ở khối ${ten} thì chuyển thẻ`, sau !== truoc, `${truoc} → ${sau}`);
  }

  // Trạm sạc: lưới 2 cột — thấy cùng lúc trạm 1 + 2, cả 4 trạm đều nằm trong màn
  await page.evaluate(() => document.querySelector("#tram-sac").scrollIntoView());
  await page.waitForTimeout(900);
  const tram = await page.evaluate(() => {
    const li = [...document.querySelectorAll("#tram-sac li")].map((x) => x.getBoundingClientRect());
    return {
      soTram: li.length,
      canhNhau: li.length > 1 && Math.abs(li[0].top - li[1].top) < 2 && li[1].left > li[0].right,
      trongMan: li.every((r) => r.left >= 0 && r.right <= window.innerWidth),
    };
  });
  kiem("trạm sạc: trạm 1 và 2 nằm cạnh nhau", tram.canhNhau);
  kiem("trạm sạc: cả 4 trạm nằm trọn trong màn, không cần kéo ngang", tram.trongMan, `${tram.soTram} trạm`);
  await page.locator("#tram-sac li").first().locator("button:has-text('bản đồ')").click();
  await page.waitForTimeout(600);
  kiem("trạm sạc: nút Mở bản đồ mở hộp thoại", (await page.locator("[role='alertdialog']").count()) === 1);
  await page.keyboard.press("Escape");

  // Thiết kế mạnh mẽ: hiện đủ mọi mục theo thứ tự, không thẻ tối, không bấm-đổi
  await page.evaluate(() => document.querySelector("#ngoai-that ol").scrollIntoView());
  await page.waitForTimeout(700);
  const ext = await page.evaluate(() => {
    const ol = document.querySelector("#ngoai-that ol");
    const hien = ol && getComputedStyle(ol).display !== "none";
    const muc = ol ? [...ol.querySelectorAll("li")].map((li) => li.textContent.trim().slice(0, 22)) : [];
    const khoiDoi = document.querySelector("#ngoai-that ol + div");
    return {
      hien,
      muc,
      moTa: ol ? ol.querySelectorAll("p").length : 0,
      anKhoiDoi: khoiDoi ? getComputedStyle(khoiDoi).display === "none" : false,
    };
  });
  kiem("thiết kế mạnh mẽ: hiện đủ mọi mục theo thứ tự", ext.hien && ext.muc.length >= 2 && ext.moTa === ext.muc.length,
    ext.muc.join(" | "));
  kiem("thiết kế mạnh mẽ: tắt kiểu bấm-để-đổi trên điện thoại", ext.anKhoiDoi);

  await page.close();
}

/* ── 7. Dải laptop 800–1439 ───────────────────────────────────
   Bố cục 1440 co theo `--u` nhưng chữ có cỡ sàn, nên chữ "to hơn tỉ lệ" — dễ bị
   cắt bởi thẻ bo góc, đè nhau hoặc lòi ra ngoài khối. Đo ở đúng các máy khách hay
   dùng: 1280×800 phóng 150% (= 853), 1920 phóng 150% (= 1280), 1366 không phóng. */
console.log("\n⑦ Dải laptop 800–1439: chữ không bị cắt / đè nhau / ra ngoài khối\n");
for (const [w, h, dpr] of [[800, 500, 1.5], [853, 533, 1.5], [1024, 640, 1.25], [1280, 720, 1.5], [1366, 768, 1]]) {
  const page = await mo(w, h, dpr);
  const ra = await page.evaluate(() => {
    const out = [];
    for (const s of document.querySelectorAll("main > section, header, footer")) {
      const id = s.id || s.tagName.toLowerCase();
      const sr = s.getBoundingClientRect();
      const la = [...s.querySelectorAll("h1,h2,h3,p,span,dd,dt,li,a,button,figcaption")]
        .filter((e) => e.textContent.trim() && ![...e.children].some((c) => c.textContent.trim()))
        .filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden" && !e.closest("[aria-hidden=true]"))
        .map((e) => {
          // Ngang: VÙNG CHỮ thật (Range) — thẻ <p> rộng hết hàng, lấy khung thẻ thì nút đứng
          // cùng hàng bị báo "đè chữ" nhầm. Dọc: khung dòng của thẻ — vùng nét chữ khổng lồ
          // (136px) cao hơn chiều cao dòng, lấy theo nét thì dòng trên bị báo đè nhầm.
          const g = document.createRange(); g.selectNodeContents(e);
          const t = g.getBoundingClientRect(), k = e.getBoundingClientRect();
          return { e, r: { left: t.left, right: t.right, top: k.top, bottom: k.bottom, width: t.width, height: k.height } };
        })
        .filter((o) => o.r.width > 4 && o.r.height > 4);
      for (const { e, r } of la) {
        const t = e.textContent.trim().slice(0, 20);
        if (r.top < sr.top - 1 || r.bottom > sr.bottom + 1) out.push(`${id}: "${t}" ra ngoài khối`);
        if (parseFloat(getComputedStyle(e).fontSize) < 12) out.push(`${id}: "${t}" chữ ${getComputedStyle(e).fontSize}`);
        // tổ tiên gần nhất có cắt tràn: chữ phải nằm trọn trong nó (bỏ qua thẻ băng
        // chuyền đang nằm hẳn ngoài khung nhìn — cố ý)
        for (let a = e.parentElement; a && a !== s.parentElement; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (["auto", "scroll"].includes(cs.overflowX)) break;
          if (["hidden", "clip"].includes(cs.overflowX) || ["hidden", "clip"].includes(cs.overflowY)) {
            const ar = a.getBoundingClientRect();
            const ngoaiHan = r.right < ar.left || r.left > ar.right;
            if (!ngoaiHan && (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1))
              out.push(`${id}: "${t}" bị cắt`);
            break;
          }
        }
      }
      for (let i = 0; i < la.length; i++)
        for (let j = i + 1; j < la.length; j++) {
          const A = la[i], B = la[j];
          if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
          const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
          const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
          if (ox > 4 && oy > 4) out.push(`${id}: đè chữ "${A.e.textContent.trim().slice(0, 14)}" ⨯ "${B.e.textContent.trim().slice(0, 14)}"`);
        }
    }
    return [...new Set(out)];
  });
  if (ra.length) loi++;
  console.log(`  ${ra.length ? "✗" : "✓"} ${String(w).padStart(4)}@${dpr}${ra.length ? "\n        • " + ra.join("\n        • ") : "  sạch"}`);
  await page.close();
}

/* ── 8. Thanh menu cố định + hotline (yêu cầu khách 21/09) ─────
   Bám đầu màn suốt trang (kể cả khi đã xuống chân trang), 6 mục + hotline vừa một
   hàng không tràn, bấm menu thì khối nằm ngay dưới thanh (không bị che). */
console.log("\n⑧ Thanh menu cố định + hotline\n");
for (const [w, h, dpr] of [[320, 568, 2], [390, 844, 3], [800, 500, 1.5], [853, 533, 1.5], [1024, 640, 1.25], [1280, 720, 1.5], [1440, 900, 1], [1920, 1080, 1]]) {
  const page = await mo(w, h, dpr);
  const sai = [];
  const dau = await page.evaluate(() => {
    const n = document.querySelector("nav");
    const tel = n.querySelector("a[href^='tel:']");
    const muc = [...n.querySelectorAll("ul a")].filter((a) => a.getClientRects().length);
    const chu = muc.map((a) => a.querySelector("span").getBoundingClientRect());
    let khe = 999;
    for (let i = 1; i < chu.length; i++) khe = Math.min(khe, chu[i].left - chu[i - 1].right);
    const tr = tel?.getBoundingClientRect();
    // so với BIỂU TƯỢNG điện thoại, không so với mép khung hotline (khung có đệm trái 24px)
    const icon = tel?.querySelector("svg")?.getBoundingClientRect();
    return {
      tel: tel ? { href: tel.getAttribute("href"), right: tr.right, left: icon.left, h: tr.height } : null,
      muc: muc.length, khe, cuoi: chu.at(-1)?.right ?? 0, cao: n.getBoundingClientRect().height,
      tran: document.documentElement.scrollWidth > innerWidth,
    };
  });
  if (!dau.tel) sai.push("không thấy hotline");
  else {
    if (!/^tel:\+?\d{8,}$/.test(dau.tel.href)) sai.push(`hotline sai liên kết ${dau.tel.href}`);
    if (dau.tel.right > w + 1) sai.push("hotline tràn khỏi màn");
    if (dau.tel.h < 40) sai.push(`hotline cao ${dau.tel.h}px < 40`);
  }
  if (w >= 800 && dau.muc !== 6) sai.push(`chỉ hiện ${dau.muc}/6 mục menu`);
  if (w >= 800 && dau.khe < 16) sai.push(`chữ menu sát nhau ${Math.round(dau.khe)}px`);
  if (w >= 800 && dau.tel && dau.cuoi > dau.tel.left - 16) sai.push("mục menu cuối chạm hotline");
  if (dau.tran) sai.push("tràn ngang");
  for (const y of [1500, 5000, 1e6]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(300);
    const top = await page.evaluate(() => Math.round(document.querySelector("nav").getBoundingClientRect().top));
    if (top !== 0) sai.push(`cuộn tới ${y === 1e6 ? "cuối trang" : y} thì thanh lệch khỏi đầu màn (${top}px)`);
  }
  if (w >= 800) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.click("nav ul a[href='#noi-that']");
    await page.waitForTimeout(1500);
    const cach = await page.evaluate(() => Math.round(document.querySelector("#noi-that").getBoundingClientRect().top - document.querySelector("nav").getBoundingClientRect().bottom));
    if (Math.abs(cach) > 1) sai.push(`bấm "Nội thất": khối cách đáy thanh ${cach}px (mong 0)`);
  }
  if (sai.length) loi++;
  console.log(`  ${sai.length ? "✗" : "✓"} ${String(w).padStart(4)}@${dpr}  thanh ${Math.round(dau.cao)}px${sai.length ? "\n        • " + sai.join("\n        • ") : ""}`);
  await page.close();
}

/* ── 9. Băng ảnh các góc xe (khối Ngoại thất) ─────────────────
   Chỉ đo khi nội dung có ≥2 ảnh (chưa có bộ ảnh thì khối hiện 1 ảnh, ẩn mũi tên). */
console.log("\n⑨ Băng ảnh các góc xe ở khối Ngoại thất\n");
for (const [w, h, dpr] of [[320, 568, 2], [390, 844, 3], [853, 533, 1.5], [1440, 900, 1]]) {
  const page = await mo(w, h, dpr);
  const soAnh = await page.evaluate(() => {
    const box = document.querySelector("#ngoai-that [aria-roledescription]");
    return box ? +box.getAttribute("aria-label").split("/")[1] : 0;
  });
  if (soAnh < 2) {
    console.log(`  – ${String(w).padStart(4)}  bỏ qua: nội dung chưa có bộ ảnh các góc xe`);
    await page.close();
    continue;
  }
  const doc = () => page.evaluate(() => {
    const box = document.querySelector("#ngoai-that [aria-roledescription]");
    const tr = box.closest("section").querySelector("div[aria-hidden].rounded-full").getBoundingClientRect();
    const th = box.closest("section").querySelector("div[aria-hidden].rounded-full > span").getBoundingClientRect();
    return { so: +box.getAttribute("aria-label").match(/(\d+)\//)[1], vt: (th.left - tr.left) / (tr.width - th.width) };
  });
  const sai = [];
  await page.evaluate(() => document.querySelector("#ngoai-that").scrollIntoView());
  await page.waitForTimeout(500);
  const nut = await page.evaluate(() => [...document.querySelectorAll("#ngoai-that button[aria-label^='Ảnh ngoại thất']")].map((b) => { const r = b.getBoundingClientRect(); return [r.left, r.right, r.height]; }));
  if (nut.some(([l, r]) => l < 0 || r > w)) sai.push("nút mũi tên tràn khỏi màn");
  if (nut.some(([, , hh]) => hh < 40)) sai.push("nút mũi tên nhỏ hơn 40px");
  const sau = page.locator("button[aria-label='Ảnh ngoại thất sau']");
  for (let i = 1; i < soAnh; i++) { await sau.click(); await page.waitForTimeout(800); }
  const cuoi = await doc();
  if (cuoi.so !== soAnh || Math.abs(cuoi.vt - 1) > 0.03) sai.push(`bấm sau ${soAnh - 1} lần: ảnh ${cuoi.so}, thanh ${cuoi.vt.toFixed(2)} (mong ảnh ${soAnh}, thanh 1)`);
  await sau.click();
  await page.waitForTimeout(250);
  // quay vòng về ảnh đầu: xe mới phải vào từ TRÁI (đang ở toạ độ âm)
  const vao = await page.evaluate(() => { const imgs = [...document.querySelectorAll("#ngoai-that [aria-roledescription] img")]; return new DOMMatrix(getComputedStyle(imgs.at(-1)).transform).m41; });
  if (!(vao < 0)) sai.push(`quay vòng về ảnh đầu: xe mới không vào từ trái (x=${Math.round(vao)})`);
  await page.waitForTimeout(800);
  const dau = await doc();
  if (dau.so !== 1 || Math.abs(dau.vt) > 0.03) sai.push(`quay vòng: đang ở ảnh ${dau.so}, thanh ${dau.vt.toFixed(2)} (mong ảnh 1, thanh 0)`);
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) sai.push("tràn ngang");
  if (sai.length) loi++;
  console.log(`  ${sai.length ? "✗" : "✓"} ${String(w).padStart(4)}@${dpr}  ${soAnh} ảnh${sai.length ? "\n        • " + sai.join("\n        • ") : ""}`);
  await page.close();
}

/* ── 10. Phiên bản dùng chung cả trang (21/09) ────────────────
   Chọn phiên bản ở khối Dòng xe thì Ngoại thất + Nội thất đổi theo, và ngược lại —
   đo trên nút chuyển nhanh (aria-pressed), nên chạy được cả khi chưa có ảnh riêng. */
console.log("\n⑩ Phiên bản xe dùng chung cho Dòng xe / Ngoại thất / Nội thất\n");
for (const [w, h, dpr] of [[390, 844, 3], [853, 533, 1.5], [1440, 900, 1]]) {
  const page = await mo(w, h, dpr);
  const doc = () => page.evaluate(() => {
    const on = (sel) => [...document.querySelectorAll(`${sel} [role=group][aria-label='Chọn phiên bản xe'] button`)]
      .find((b) => b.getAttribute("aria-pressed") === "true")?.textContent.trim().toLowerCase();
    return { dongXe: document.querySelector("#dong-xe span.text-\\[44px\\]")?.textContent.trim().toLowerCase(), ngoai: on("#ngoai-that"), noi: on("#noi-that") };
  });
  const soPB = await page.evaluate(() => document.querySelectorAll("#ngoai-that [role=group][aria-label='Chọn phiên bản xe'] button").length);
  if (soPB < 2) { console.log(`  – ${String(w).padStart(4)}  bỏ qua: chỉ có 1 phiên bản`); await page.close(); continue; }
  const sai = [];
  const dau = await doc();
  if (!(dau.dongXe && dau.dongXe === dau.ngoai && dau.ngoai === dau.noi)) sai.push(`mở trang: 3 khối lệch nhau ${JSON.stringify(dau)}`);
  await page.evaluate(() => document.querySelector("#dong-xe").scrollIntoView());
  await page.click("#dong-xe button[aria-label^='Phiên bản kế tiếp']");
  await page.waitForTimeout(1200);
  const sau = await doc();
  if (sau.dongXe === dau.dongXe || !(sau.dongXe === sau.ngoai && sau.ngoai === sau.noi)) sai.push(`đổi ở Dòng xe: ${JSON.stringify(sau)}`);
  await page.evaluate(() => document.querySelector("#noi-that").scrollIntoView());
  await page.click("#noi-that [role=group][aria-label='Chọn phiên bản xe'] button:first-child");
  await page.waitForTimeout(1200);
  const lai = await doc();
  if (!(lai.dongXe === dau.dongXe && lai.ngoai === dau.ngoai)) sai.push(`đổi ở Nội thất: ${JSON.stringify(lai)}`);
  if (sai.length) loi++;
  console.log(`  ${sai.length ? "✗" : "✓"} ${String(w).padStart(4)}@${dpr}  ${soPB} phiên bản${sai.length ? "\n        • " + sai.join("\n        • ") : ""}`);
  await page.close();
}

await browser.close();
console.log(loi ? `\n⛔ ${loi} chỗ chưa đạt\n` : "\n✅ Tất cả đều đạt\n");
process.exit(loi ? 1 : 0);
