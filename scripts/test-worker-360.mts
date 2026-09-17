// Kiểm luồng lưu bộ ảnh 360° của Worker với GitHub GIẢ LẬP (không tạo commit thật).
//   pnpm test:worker

import sharp from "sharp";
import * as mod from "../worker/index";
const worker: any = (mod as any).default?.fetch ? (mod as any).default : (mod as any).default?.default;

const env: any = { ADMIN_PASSWORD: "pw", ADMIN_SESSION_SECRET: "s".repeat(64), GITHUB_TOKEN: "t", CONTENT_BRANCH: "main" };
const ctx: any = { waitUntil() {} };
let fail = 0;
const kiem = (t: string, ok: boolean, x = "") => { if (!ok) fail++; console.log(`${ok ? "✓" : "✗"} ${t}${x ? "  " + x : ""}`); };

let calls: { method: string; url: string; body?: any }[] = [];
let patchFails = 0, refReads = 0;
const hex = (c: string) => c.repeat(40);
(globalThis as any).fetch = async (url: string, init: any = {}) => {
  const method = init.method || "GET";
  const body = init.body ? JSON.parse(init.body) : undefined;
  calls.push({ method, url, body });
  const ok = (o: any, s = 200) => new Response(JSON.stringify(o), { status: s });
  if (url.endsWith("/git/blobs")) return ok({ sha: (Math.random().toString(16).slice(2) + "0".repeat(40)).slice(0, 40) }, 201);
  if (url.includes("/git/ref/heads/")) { refReads++; return ok({ object: { sha: hex(refReads === 1 ? "a" : "e") } }); }
  if (url.includes("/git/commits/")) return ok({ tree: { sha: hex("b") } });
  if (url.includes("/git/trees/")) return ok({ tree: [
    { path: "public/images/360/20260101-000000-old1/01.webp", type: "blob" },
    { path: "public/images/360/20260101-000000-old1/02.webp", type: "blob" },
    { path: "public/images/usp/pin.webp", type: "blob" },
    { path: "content/exterior.json", type: "blob" },
  ] });
  if (url.endsWith("/git/trees")) return ok({ sha: hex("c") }, 201);
  if (url.endsWith("/git/commits")) return ok({ sha: hex("d") }, 201);
  if (url.includes("/git/refs/heads/")) {
    if (patchFails > 0) { patchFails--; return ok({ message: "Update is not a fast forward" }, 422); }
    return ok({ ref: "refs/heads/main" });
  }
  return ok({ message: "không mô phỏng " + url }, 500);
};

async function call(path: string, body: any, cookie?: string) {
  const res = await worker.fetch(new Request("https://x.dev" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  }), env, ctx);
  return { status: res.status, body: (await res.json()) as any, headers: res.headers };
}

const login = await call("/api/admin/login", { password: "pw" });
const cookie = login.headers.get("set-cookie")!.split(";")[0];
const webp = (await sharp({ create: { width: 8, height: 8, channels: 4, background: "#08f" } }).webp().toBuffer()).toString("base64");
const png = (await sharp({ create: { width: 8, height: 8, channels: 4, background: "#08f" } }).png().toBuffer()).toString("base64");
const batch = "20260917-101500-abcd";

kiem("chưa đăng nhập → 401", (await call("/api/admin/360/blobs", { batch, files: [] })).status === 401);

calls = [];
const lot = Array.from({ length: 20 }, (_, i) => ({ index: i + 1, dataBase64: webp }));
const r1 = await call("/api/admin/360/blobs", { batch, files: lot }, cookie);
kiem("lô 20 ảnh → 20 blob", r1.status === 200 && r1.body.blobs.length === 20, `${calls.length} lần gọi GitHub`);
kiem("số lần gọi ra ngoài ≤ 50 (giới hạn gói miễn phí)", calls.length <= 50);
kiem("đường dẫn đúng quy ước", r1.body.blobs[0].path === `public/images/360/${batch}/01.webp` && r1.body.blobs[19].path.endsWith("/20.webp"));
kiem("lô 21 ảnh → 400", (await call("/api/admin/360/blobs", { batch, files: [...lot, { index: 21, dataBase64: webp }] }, cookie)).status === 400);
kiem("ảnh PNG (không phải WebP) → 400", (await call("/api/admin/360/blobs", { batch, files: [{ index: 1, dataBase64: png }] }, cookie)).status === 400);
kiem("mã lô có ký tự lạ → 400", (await call("/api/admin/360/blobs", { batch: "../../etc", files: lot.slice(0, 1) }, cookie)).status === 400);
kiem("số thứ tự 0 → 400", (await call("/api/admin/360/blobs", { batch, files: [{ index: 0, dataBase64: webp }] }, cookie)).status === 400);

const blobs = r1.body.blobs;
const frames = blobs.map((b: any) => b.path.replace(/^public/, ""));
const content = { label: "x", view360: { background: {}, car: {}, frames } };
calls = []; patchFails = 1; refReads = 0;
const r2 = await call("/api/admin/360/commit", { blobs, content }, cookie);
kiem("commit thành công sau 1 lần nhánh bị đổi", r2.status === 200 && r2.body.ok, JSON.stringify(r2.body));
kiem("số lần gọi GitHub", calls.length === 12, `${calls.length} lần (2 lượt × 6)`);
const t = calls.filter((c) => c.method === "POST" && c.url.endsWith("/git/trees")).at(-1)!.body;
kiem("cây mới dựa trên cây cũ", t.base_tree === hex("b"));
kiem("cây có đủ 20 ảnh", t.tree.filter((e: any) => e.sha && e.path.startsWith("public/images/360/")).length === 20);
kiem("xoá đúng 2 ảnh bộ cũ, không đụng ảnh khác",
  JSON.stringify(t.tree.filter((e: any) => e.sha === null).map((e: any) => e.path)) ===
  JSON.stringify(["public/images/360/20260101-000000-old1/01.webp", "public/images/360/20260101-000000-old1/02.webp"]));
const ext = t.tree.find((e: any) => e.path === "content/exterior.json");
kiem("exterior.json đi cùng commit", !!ext && JSON.parse(ext.content).view360.frames.length === 20);
const commits = calls.filter((c) => c.method === "POST" && c.url.endsWith("/git/commits"));
kiem("thử lại dựng trên đầu nhánh MỚI", commits[0].body.parents[0] === hex("a") && commits[1].body.parents[0] === hex("e"), commits[1].body.message);
kiem("dời nhánh không ép (force:false)", calls.filter((c) => c.method === "PATCH").every((c) => c.body.force === false));

calls = []; patchFails = 5;
const r3 = await call("/api/admin/360/commit", { blobs, content }, cookie);
kiem("nhánh đổi liên tục → báo lỗi, không ép", r3.status === 502 && calls.filter((c) => c.method === "PATCH").length === 2, JSON.stringify(r3.body));
patchFails = 0;

kiem("ảnh không có trong danh sách → 400",
  (await call("/api/admin/360/commit", { blobs, content: { view360: { frames: frames.slice(1) } } }, cookie)).status === 400);
kiem("đường dẫn ngoài thư mục 360 → 400",
  (await call("/api/admin/360/commit", { blobs: [{ path: "content/header.json", sha: hex("f") }], content }, cookie)).status === 400);
kiem("mã sha giả → 400",
  (await call("/api/admin/360/commit", { blobs: [{ ...blobs[0], sha: "xyz" }], content }, cookie)).status === 400);

calls = [];
const r4 = await call("/api/admin/360/commit", { blobs: [], content: { view360: { frames: [] } } }, cookie);
const t4 = calls.find((c) => c.url.endsWith("/git/trees"))!.body;
kiem("xoá bộ → xoá cả 2 ảnh cũ", r4.status === 200 && r4.body.removed === 2 && t4.tree.filter((e: any) => e.sha === null).length === 2,
  calls.find((c) => c.url.endsWith("/git/commits"))!.body.message);
console.log(fail ? `⛔ ${fail} mục sai` : "✅ Worker đạt hết");
process.exit(fail ? 1 : 0);
