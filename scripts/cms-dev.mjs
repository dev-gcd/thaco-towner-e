// Local CMS dev backend — DEV ONLY. Never deployed.
//
// Mirrors the Cloudflare Worker's admin API (worker/index.ts) but writes to the
// local filesystem instead of committing to GitHub, so editing in /admin saves
// straight to content/*.json + public/images/uploads/ and `next dev` hot-reloads
// the change instantly. No GitHub token, no rebuild loop.
//
// Run with: pnpm dev:cms   (starts this server AND `next dev`)
// next.config.ts proxies /api/* here in development.

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8790; // riêng project này (truck/van dùng 8788) — xem PORT.md

// Trivial dev auth — this server only ever listens on localhost.
const DEV_PASSWORD = process.env.CMS_DEV_PASSWORD || "Admin@12345";
const SESSION_COOKIE = "te_admin";
const LEADS_FILE = join(ROOT, ".cms-dev", "leads.json");

// Must match CONTENT_FILES in worker/index.ts.
const CONTENT_FILES = {
  // Danh sách nháp đọc từ bảng Layers của Figma (frame "Thaco Towner E - Full").
  // Chốt lại tên khoá khi dựng từng khối; khoá ở đây PHẢI khớp scripts/cms-dev.mjs.
  //   header, gtsp, usp, versions, exterior, interior, cta, charging, footer
};

const UPLOAD_EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg"];

/* ───────────────────────── helpers ───────────────────────── */

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function readBody(req, maxBytes = 32 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > maxBytes) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function authed(req) {
  return readCookie(req, SESSION_COOKIE) === "dev";
}

async function readLeads() {
  try {
    return JSON.parse(await readFile(LEADS_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeLeads(leads) {
  await mkdir(dirname(LEADS_FILE), { recursive: true });
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2) + "\n");
}

/* ───────────────────────── handlers ───────────────────────── */

async function handleCreateLead(req, res) {
  const body = JSON.parse((await readBody(req)) || "{}");
  if (body.hp && String(body.hp).trim() !== "") return sendJson(res, 200, { ok: true });
  const name = String(body.name || "").trim().slice(0, 100);
  const phone = String(body.phone || "").trim().slice(0, 30);
  if (!name) return sendJson(res, 400, { error: "Vui lòng nhập họ và tên" });
  if (phone.replace(/\D/g, "").length < 8)
    return sendJson(res, 400, { error: "Số điện thoại không hợp lệ" });

  const leads = await readLeads();
  const id = leads.reduce((m, l) => Math.max(m, l.id), 0) + 1;
  leads.push({
    id,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    name,
    phone,
    note: body.note ? String(body.note).trim().slice(0, 2000) : null,
    status: "new",
  });
  await writeLeads(leads);
  console.log(`[cms-dev] lead #${id} saved → ${LEADS_FILE}`);
  return sendJson(res, 200, { ok: true });
}

function filterLeads(leads, url) {
  const search = (url.searchParams.get("search") || "").toLowerCase();
  const status = url.searchParams.get("status");
  let out = leads;
  if (search)
    out = out.filter((l) =>
      [l.name, l.phone, l.note].some((f) => (f || "").toLowerCase().includes(search))
    );
  if (status === "new" || status === "contacted")
    out = out.filter((l) => l.status === status);
  return out.slice().sort((a, b) => b.id - a.id);
}

async function handleListLeads(res, url) {
  const all = filterLeads(await readLeads(), url);
  const perPage = 20;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const start = (page - 1) * perPage;
  return sendJson(res, 200, {
    leads: all.slice(start, start + perPage),
    total: all.length,
    page,
    perPage,
  });
}

async function handleExportLeads(res, url) {
  const all = filterLeads(await readLeads(), url);
  const header = ["id", "created_at", "name", "phone", "note", "status"];
  const cell = (v) => {
    const s = String(v ?? "");
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of all)
    lines.push([r.id, r.created_at, r.name, r.phone, r.note ?? "", r.status].map(cell).join(","));
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="leads-dev.csv"',
  });
  res.end("﻿" + lines.join("\r\n"));
}

async function handleUpdateLead(req, res, id) {
  const body = JSON.parse((await readBody(req)) || "{}");
  if (body.status !== "new" && body.status !== "contacted")
    return sendJson(res, 400, { error: "Invalid status" });
  const leads = await readLeads();
  const lead = leads.find((l) => l.id === id);
  if (lead) lead.status = body.status;
  await writeLeads(leads);
  return sendJson(res, 200, { ok: true });
}

async function handleDeleteLead(res, id) {
  const leads = await readLeads();
  await writeLeads(leads.filter((l) => l.id !== id));
  return sendJson(res, 200, { ok: true });
}

async function handlePutContent(req, res, name) {
  const rel = CONTENT_FILES[name];
  if (!rel) return sendJson(res, 404, { error: "Unknown content" });
  const body = JSON.parse((await readBody(req)) || "{}");
  if (body.content == null || typeof body.content !== "object")
    return sendJson(res, 400, { error: "Thiếu nội dung" });
  await writeFile(join(ROOT, rel), JSON.stringify(body.content, null, 2) + "\n");
  console.log(`[cms-dev] wrote ${rel}`);
  return sendJson(res, 200, { ok: true, commit: "local-dev" });
}

async function handleUpload(req, res) {
  const body = JSON.parse((await readBody(req)) || "{}");
  const filename = typeof body.filename === "string" ? body.filename : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64 : "";
  if (!filename || !dataBase64) return sendJson(res, 400, { error: "Thiếu tệp tải lên" });

  const baseName = filename.split(/[/\\]/).pop().toLowerCase();
  const ext = baseName.slice(baseName.lastIndexOf("."));
  if (!UPLOAD_EXTENSIONS.includes(ext))
    return sendJson(res, 400, { error: "Định dạng không hợp lệ (.webp .png .jpg .jpeg)" });

  const cleaned = baseName.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
  const safeName = `${Date.now().toString(36)}-${cleaned}`;
  const dir = join(ROOT, "public", "images", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, safeName), Buffer.from(dataBase64, "base64"));
  console.log(`[cms-dev] uploaded /images/uploads/${safeName}`);
  return sendJson(res, 200, { ok: true, path: `/images/uploads/${safeName}` });
}

/* ───────────────────────── router ───────────────────────── */

async function route(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  // Next's `trailingSlash: true` 308-redirects /api/x → /api/x/ before the dev
  // rewrite, so requests arrive with a trailing slash. Normalize it away.
  const pathname =
    url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;
  const method = req.method;

  if (pathname === "/api/leads" && method === "POST") return handleCreateLead(req, res);

  if (pathname === "/api/admin/login" && method === "POST") {
    const body = JSON.parse((await readBody(req)) || "{}");
    if (body.password !== DEV_PASSWORD)
      return sendJson(res, 401, { error: "Mật khẩu không đúng (dev)" });
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=dev; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`,
    });
  }
  if (pathname === "/api/admin/logout" && method === "POST") {
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    });
  }

  if (pathname.startsWith("/api/admin/")) {
    if (!authed(req)) return sendJson(res, 401, { error: "Unauthorized" });

    if (pathname === "/api/admin/leads" && method === "GET") return handleListLeads(res, url);
    if (pathname === "/api/admin/leads.csv" && method === "GET")
      return handleExportLeads(res, url);

    const idMatch = pathname.match(/^\/api\/admin\/leads\/(\d+)$/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      if (method === "PATCH") return handleUpdateLead(req, res, id);
      if (method === "DELETE") return handleDeleteLead(res, id);
    }

    const contentMatch = pathname.match(/^\/api\/admin\/content\/([a-z]+)$/);
    if (contentMatch && method === "PUT") return handlePutContent(req, res, contentMatch[1]);

    if (pathname === "/api/admin/upload" && method === "POST") return handleUpload(req, res);
  }

  return sendJson(res, 404, { error: "Not Found" });
}

const server = createServer((req, res) => {
  route(req, res).catch((err) => {
    console.error("[cms-dev] error", err);
    if (!res.headersSent) sendJson(res, 500, { error: "Dev server error" });
  });
});

server.listen(PORT, () => {
  console.log(`\n[cms-dev] API → http://localhost:${PORT}  (password: ${DEV_PASSWORD})`);
  console.log("[cms-dev] Lưu/Upload trong admin sẽ ghi thẳng vào file local.\n");
});

// Spawn `next dev` so one command runs everything.
const child = spawn("pnpm", ["exec", "next", "dev"], { stdio: "inherit", cwd: ROOT });

function shutdown() {
  child.kill("SIGINT");
  server.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
child.on("exit", (code) => {
  server.close();
  process.exit(code ?? 0);
});
