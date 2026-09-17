/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker entry point.
 *
 * Public:
 *   POST   /api/leads               → insert into D1 (the "Tư vấn miễn phí" form)
 *
 * Admin (password session, see /admin):
 *   POST   /api/admin/login         → password login → signed session cookie
 *   POST   /api/admin/logout        → clear session
 *   GET    /api/admin/leads         → list leads (search/filter/paginate)
 *   GET    /api/admin/leads.csv     → export leads as CSV
 *   PATCH  /api/admin/leads/:id     → update lead status
 *   DELETE /api/admin/leads/:id     → delete lead
 *   PUT    /api/admin/content/:name → commit content/<name>.json to GitHub
 *   POST   /api/admin/upload        → commit an uploaded image to public/images/uploads/
 *
 *   *                               → fall through to static assets in `out/`
 *
 * Content edits are committed to the repo via the GitHub Contents API using a
 * fine-grained PAT (GITHUB_TOKEN). The push triggers a Workers Build redeploy,
 * which bakes the new content into the static site — that is the "publish".
 *
 * On a successful lead, a notification email is sent (best-effort, via
 * ctx.waitUntil) when MAIL_* is configured — see sendLeadEmail().
 */

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  // Leads admin auth (set via `wrangler secret put`).
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  // GitHub commit credential for the CMS (fine-grained PAT, Contents: write).
  GITHUB_TOKEN?: string;
  // Branch to commit content to (defaults to "main").
  CONTENT_BRANCH?: string;
  // ── Lead notification email (optional — skipped if unset) ─────────────
  // Provider API key (secret). The default integration targets the Resend
  // HTTP API; point MAIL_API_URL at another provider with the same shape if
  // you switch hosts.
  MAIL_API_KEY?: string;
  // Override the provider endpoint (defaults to Resend's /emails).
  MAIL_API_URL?: string;
  // Verified sender, e.g. "Thaco Towner E <no-reply@your-domain.vn>".
  MAIL_FROM?: string;
  // Recipient(s) — sales inbox. Comma-separated for multiple.
  MAIL_TO?: string;
}

const REPO = "dev-gcd/thaco-towner-e";

// Editable content files (allowlist — :name must be a key here).
// Add a block as you build it, e.g. hero: "content/hero.json".
const CONTENT_FILES: Record<string, string> = {
  header: "content/header.json",
  gtsp: "content/gtsp.json",
  usp: "content/usp.json",
  versions: "content/versions.json",
  exterior: "content/exterior.json",
  interior: "content/interior.json",
  cta: "content/cta.json",
  charging: "content/charging.json",
  footer: "content/footer.json",
};

type LeadInput = {
  name: string;
  phone: string;
  note?: string;
  /** Honeypot — should always be empty when a real user submits. */
  hp?: string;
};

const MAX_NAME = 100;
const MAX_PHONE = 30;
const MAX_NOTE = 2000;

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/api/leads" && req.method === "POST") {
      return handleCreateLead(req, env, ctx);
    }

    if (url.pathname.startsWith("/api/admin/")) {
      return handleAdmin(req, env, url);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not Found" }, 404);
    }

    return env.ASSETS.fetch(req);
  },
};

/* ───────────────────────────── Leads ───────────────────────────── */

async function handleCreateLead(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  let body: LeadInput;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Honeypot: silently accept but don't persist.
  if (body.hp && body.hp.trim() !== "") {
    return json({ ok: true });
  }

  const name = sanitize(body.name, MAX_NAME);
  const phone = sanitizePhone(body.phone);
  const note = body.note ? sanitize(body.note, MAX_NOTE) : null;

  if (!name) return json({ error: "Vui lòng nhập họ và tên" }, 400);
  if (!phone) return json({ error: "Số điện thoại không hợp lệ" }, 400);

  const ip = req.headers.get("CF-Connecting-IP");
  const country =
    (req as Request & { cf?: { country?: string } }).cf?.country ?? null;
  const userAgent = req.headers.get("User-Agent");
  const referer = req.headers.get("Referer");

  try {
    await env.DB.prepare(
      `INSERT INTO leads (name, phone, note, ip, country, user_agent, referer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(name, phone, note, ip, country, userAgent, referer)
      .run();
  } catch (err) {
    console.error("D1 insert failed", err);
    return json({ error: "Có lỗi xảy ra, vui lòng thử lại" }, 500);
  }

  // Notify sales — best-effort, runs after the response is sent so a slow or
  // misconfigured mail provider never delays/breaks the form submission.
  ctx.waitUntil(sendLeadEmail(env, { name, phone, note }, { country, referer }));

  return json({ ok: true });
}

/* ─────────────────── Lead notification email (optional) ─────────────────── */

type LeadEmail = { name: string; phone: string; note: string | null };
type LeadMeta = { country: string | null; referer: string | null };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Send a "new lead" notification. No-ops unless MAIL_API_KEY + MAIL_FROM +
 * MAIL_TO are all set, so the site works fine before email hosting is wired up.
 * Failures are logged, never thrown — lead capture must not depend on email.
 */
async function sendLeadEmail(
  env: Env,
  lead: LeadEmail,
  meta: LeadMeta
): Promise<void> {
  if (!env.MAIL_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) return;

  const to = env.MAIL_TO.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return;

  try {
    const res = await fetch(env.MAIL_API_URL || RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to,
        subject: `[Lead mới] ${lead.name} — ${lead.phone}`,
        html: renderLeadEmail(lead, meta),
      }),
    });
    if (!res.ok) {
      console.error("Mail send failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mail send error", err);
  }
}

/** Clean, self-contained HTML email (inline styles — mail clients strip <style>). */
function renderLeadEmail(lead: LeadEmail, meta: LeadMeta): string {
  const when = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
  const rows: Array<[string, string]> = [
    ["Họ và tên", lead.name],
    ["Số điện thoại", lead.phone],
    ["Nội dung", lead.note || "—"],
    ["Thời gian", when],
    ["Nguồn", meta.referer || "—"],
    ["Quốc gia", meta.country || "—"],
  ];

  const cells = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#111827;font-size:14px;font-weight:500;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <tr>
      <td style="background:#00529c;padding:20px 24px;">
        <div style="color:#ffffff;font-size:16px;font-weight:700;">Thaco Towner E</div>
        <div style="color:#cfe0f1;font-size:13px;margin-top:2px;">Yêu cầu tư vấn mới từ landing page</div>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 8px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 20px;color:#9ca3af;font-size:12px;line-height:1.5;">
        Email tự động từ hệ thống — vui lòng liên hệ khách hàng trong thời gian sớm nhất.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ──────────────────────── Admin (password) ──────────────────────── */

const SESSION_COOKIE = "te_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

async function handleAdmin(req: Request, env: Env, url: URL): Promise<Response> {
  // Tolerate a trailing slash (Next's trailingSlash:true can add one).
  const path =
    url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;

  if (path === "/api/admin/login" && req.method === "POST") {
    return handleLogin(req, env);
  }
  if (path === "/api/admin/logout" && req.method === "POST") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      },
    });
  }

  // Everything below requires a valid session.
  const authed = await verifySession(req, env);
  if (!authed) return json({ error: "Unauthorized" }, 401);

  if (path === "/api/admin/leads" && req.method === "GET") {
    return handleListLeads(env, url);
  }
  if (path === "/api/admin/leads.csv" && req.method === "GET") {
    return handleExportLeads(env, url);
  }

  const idMatch = path.match(/^\/api\/admin\/leads\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    if (req.method === "PATCH") return handleUpdateLead(req, env, id);
    if (req.method === "DELETE") return handleDeleteLead(env, id);
  }

  const contentMatch = path.match(/^\/api\/admin\/content\/([a-z]+)$/);
  if (contentMatch && req.method === "PUT") {
    return handlePutContent(req, env, contentMatch[1]);
  }

  if (path === "/api/admin/upload" && req.method === "POST") {
    return handleUpload(req, env);
  }

  // Bộ ảnh xoay 360°: gửi ảnh theo lô (tạo blob), rồi gộp tất cả thành 1 commit.
  if (path === "/api/admin/360/blobs" && req.method === "POST") {
    return handle360Blobs(req, env);
  }
  if (path === "/api/admin/360/commit" && req.method === "POST") {
    return handle360Commit(req, env);
  }

  return json({ error: "Not Found" }, 404);
}

async function handleLogin(req: Request, env: Env): Promise<Response> {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return json({ error: "Admin auth not configured" }, 500);
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!body.password || !timingSafeEqual(body.password, env.ADMIN_PASSWORD)) {
    return json({ error: "Mật khẩu không đúng" }, 401);
  }

  const token = await signSession(env.ADMIN_SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
    },
  });
}

type LeadRow = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  note: string | null;
  status: string;
};

function buildLeadFilter(url: URL): { where: string; binds: unknown[] } {
  const clauses: string[] = [];
  const binds: unknown[] = [];

  const search = url.searchParams.get("search")?.trim();
  if (search) {
    clauses.push("(name LIKE ? OR phone LIKE ? OR note LIKE ?)");
    const like = `%${search}%`;
    binds.push(like, like, like);
  }
  const status = url.searchParams.get("status");
  if (status === "new" || status === "contacted") {
    clauses.push("status = ?");
    binds.push(status);
  }
  const from = url.searchParams.get("from");
  if (from) {
    clauses.push("created_at >= ?");
    binds.push(from);
  }
  const to = url.searchParams.get("to");
  if (to) {
    clauses.push("created_at <= ?");
    binds.push(`${to} 23:59:59`);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", binds };
}

async function handleListLeads(env: Env, url: URL): Promise<Response> {
  const { where, binds } = buildLeadFilter(url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM leads ${where}`
  )
    .bind(...binds)
    .first<{ n: number }>();

  const { results } = await env.DB.prepare(
    `SELECT id, created_at, name, phone, note, status
       FROM leads ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
  )
    .bind(...binds, perPage, offset)
    .all<LeadRow>();

  return json({
    leads: results ?? [],
    total: countRow?.n ?? 0,
    page,
    perPage,
  });
}

async function handleExportLeads(env: Env, url: URL): Promise<Response> {
  const { where, binds } = buildLeadFilter(url);
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, name, phone, note, status
       FROM leads ${where} ORDER BY created_at DESC`
  )
    .bind(...binds)
    .all<LeadRow>();

  const header = ["id", "created_at", "name", "phone", "note", "status"];
  const lines = [header.join(",")];
  for (const r of results ?? []) {
    lines.push(
      [r.id, r.created_at, r.name, r.phone, r.note ?? "", r.status]
        .map(csvCell)
        .join(",")
    );
  }
  const csv = "﻿" + lines.join("\r\n"); // BOM for Excel + Vietnamese

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${todayStamp()}.csv"`,
    },
  });
}

async function handleUpdateLead(
  req: Request,
  env: Env,
  id: number
): Promise<Response> {
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (body.status !== "new" && body.status !== "contacted") {
    return json({ error: "Invalid status" }, 400);
  }
  await env.DB.prepare(
    `UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(body.status, id)
    .run();
  return json({ ok: true });
}

async function handleDeleteLead(env: Env, id: number): Promise<Response> {
  await env.DB.prepare(`DELETE FROM leads WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

/* ──────────────── Content → GitHub commit (CMS writes) ──────────────── */

async function handlePutContent(
  req: Request,
  env: Env,
  name: string
): Promise<Response> {
  const filePath = CONTENT_FILES[name];
  if (!filePath) return json({ error: "Unknown content" }, 404);
  if (!env.GITHUB_TOKEN) {
    return json({ error: "GITHUB_TOKEN chưa được cấu hình" }, 500);
  }

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (body.content == null || typeof body.content !== "object") {
    return json({ error: "Thiếu nội dung" }, 400);
  }

  const branch = env.CONTENT_BRANCH || "main";
  const pretty = JSON.stringify(body.content, null, 2) + "\n";

  try {
    const sha = await ghFileSha(env, filePath, branch);
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: ghHeaders(env),
        body: JSON.stringify({
          message: `cms: update ${filePath}`,
          content: utf8ToBase64(pretty),
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("GitHub PUT failed", res.status, text);
      return json({ error: `GitHub ${res.status}` }, 502);
    }
    const data = (await res.json()) as { commit?: { sha?: string } };
    return json({ ok: true, commit: data.commit?.sha });
  } catch (err) {
    console.error("Content commit failed", err);
    return json({ error: "Commit thất bại" }, 502);
  }
}

/* ──────────────── Image upload → GitHub commit ──────────────── */

const UPLOAD_EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg", ".pdf"];

async function handleUpload(req: Request, env: Env): Promise<Response> {
  if (!env.GITHUB_TOKEN) {
    return json({ error: "GITHUB_TOKEN chưa được cấu hình" }, 500);
  }

  let body: { filename?: unknown; dataBase64?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const filename = typeof body.filename === "string" ? body.filename : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64 : "";
  if (!filename || !dataBase64) {
    return json({ error: "Thiếu tệp tải lên" }, 400);
  }

  // Strip any path component, lowercase, then validate extension.
  const baseName = filename.split(/[/\\]/).pop()!.toLowerCase();
  const ext = baseName.slice(baseName.lastIndexOf("."));
  if (!UPLOAD_EXTENSIONS.includes(ext)) {
    return json(
      { error: "Định dạng không hợp lệ (chỉ .webp .png .jpg .jpeg .pdf)" },
      400
    );
  }

  // Sanitize: keep [a-z0-9._-], replace the rest with "-"; prefix a short
  // uniqueness token so re-uploads of the same name don't collide.
  const cleaned = baseName.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
  const safeName = `${Date.now().toString(36)}-${cleaned}`;
  // Tài liệu (brochure) để riêng public/files/, ảnh vẫn ở public/images/uploads/.
  const dir = ext === ".pdf" ? "files" : "images/uploads";
  const filePath = `public/${dir}/${safeName}`;
  const publicPath = `/${dir}/${safeName}`;

  const branch = env.CONTENT_BRANCH || "main";

  try {
    const sha = await ghFileSha(env, filePath, branch);
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: ghHeaders(env),
        body: JSON.stringify({
          message: `cms: upload ${safeName}`,
          content: dataBase64,
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("GitHub upload PUT failed", res.status, text);
      return json({ error: `GitHub ${res.status}` }, 502);
    }
    return json({ ok: true, path: publicPath });
  } catch (err) {
    console.error("Upload commit failed", err);
    return json({ error: "Tải lên thất bại" }, 502);
  }
}

/* ──────────────── Bộ ảnh xoay 360° → 1 commit ──────────────── */
/*
 * Tải từng ảnh bằng /api/admin/upload thì N ảnh = N commit = N lần Cloudflare
 * build lại. Ở đây tách làm 2 bước để ra ĐÚNG 1 commit:
 *
 *   1. /360/blobs  (gọi nhiều lần, mỗi lần ≤ 20 ảnh)
 *      → tạo blob trên GitHub cho từng ảnh, trả về sha. Blob chưa gắn vào nhánh
 *        nào nên chưa có gì thay đổi trên repo.
 *   2. /360/commit (gọi 1 lần)
 *      → lấy đầu nhánh, dựng cây mới gồm: các blob ảnh + content/exterior.json
 *        + xoá bộ ảnh 360 cũ, tạo commit, dời nhánh tới commit đó.
 *
 * Mỗi lần Worker chạy chỉ được gọi ra ngoài giới hạn số lần (gói miễn phí: 50).
 * Bước 1 tốn 1 lần/ảnh nên chặn 20 ảnh/lô; bước 2 tốn cố định 6 lần.
 */

const FRAMES_DIR = "public/images/360";
const MAX_BLOBS_PER_CALL = 20;
const MAX_FRAMES = 72;
/** Mã lô: chữ thường, số, gạch ngang. Ảnh: 01.webp … 72.webp. */
const BATCH_RE = /^[a-z0-9][a-z0-9-]{5,40}$/;
const FRAME_PATH_RE = /^public\/images\/360\/[a-z0-9][a-z0-9-]{5,40}\/\d{2,3}\.webp$/;
const GH_SHA_RE = /^[0-9a-f]{40}$/;

type BlobInput = { index?: unknown; dataBase64?: unknown };

async function handle360Blobs(req: Request, env: Env): Promise<Response> {
  if (!env.GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN chưa được cấu hình" }, 500);

  let body: { batch?: unknown; files?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const batch = typeof body.batch === "string" ? body.batch : "";
  if (!BATCH_RE.test(batch)) return json({ error: "Mã lô không hợp lệ" }, 400);
  if (!Array.isArray(body.files) || body.files.length === 0) {
    return json({ error: "Không có ảnh nào" }, 400);
  }
  if (body.files.length > MAX_BLOBS_PER_CALL) {
    return json({ error: `Mỗi lượt tối đa ${MAX_BLOBS_PER_CALL} ảnh` }, 400);
  }

  const out: { path: string; sha: string }[] = [];
  for (const raw of body.files as BlobInput[]) {
    const index = Number(raw.index);
    const data = typeof raw.dataBase64 === "string" ? raw.dataBase64 : "";
    if (!Number.isInteger(index) || index < 1 || index > MAX_FRAMES || !data) {
      return json({ error: "Ảnh trong lô không hợp lệ" }, 400);
    }
    // Chỉ nhận WebP (trình duyệt đã chuyển sẵn). Kiểm chữ ký RIFF....WEBP ở đầu tệp.
    const head = atob(data.slice(0, 16));
    if (!(head.startsWith("RIFF") && head.slice(8, 12) === "WEBP")) {
      return json({ error: `Ảnh số ${index} không phải WebP` }, 400);
    }
    const res = await fetch(`https://api.github.com/repos/${REPO}/git/blobs`, {
      method: "POST",
      headers: ghHeaders(env),
      body: JSON.stringify({ content: data, encoding: "base64" }),
    });
    if (!res.ok) {
      console.error("GitHub blob failed", res.status, await res.text());
      return json({ error: `GitHub ${res.status} khi tải ảnh số ${index}` }, 502);
    }
    const blob = (await res.json()) as { sha?: string };
    if (!blob.sha) return json({ error: "GitHub không trả mã ảnh" }, 502);
    const name = String(index).padStart(2, "0");
    out.push({ path: `${FRAMES_DIR}/${batch}/${name}.webp`, sha: blob.sha });
  }
  return json({ ok: true, blobs: out });
}

async function handle360Commit(req: Request, env: Env): Promise<Response> {
  if (!env.GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN chưa được cấu hình" }, 500);

  let body: { blobs?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const blobs = Array.isArray(body.blobs) ? (body.blobs as { path?: unknown; sha?: unknown }[]) : [];
  if (blobs.length > MAX_FRAMES) return json({ error: `Tối đa ${MAX_FRAMES} ảnh` }, 400);
  for (const b of blobs) {
    if (typeof b.path !== "string" || !FRAME_PATH_RE.test(b.path)) {
      return json({ error: "Đường dẫn ảnh không hợp lệ" }, 400);
    }
    if (typeof b.sha !== "string" || !GH_SHA_RE.test(b.sha)) {
      return json({ error: "Mã ảnh không hợp lệ" }, 400);
    }
  }

  const content = body.content as { view360?: { frames?: unknown } } | null;
  if (!content || typeof content !== "object" || !content.view360) {
    return json({ error: "Thiếu nội dung khối Ngoại thất" }, 400);
  }
  const frames = content.view360.frames;
  if (!Array.isArray(frames) || frames.some((f) => typeof f !== "string")) {
    return json({ error: "Danh sách ảnh 360 không hợp lệ" }, 400);
  }
  // Mọi ảnh vừa tải lên phải có mặt trong danh sách lưu — chặn lưu lệch nhau.
  const inContent = new Set(frames as string[]);
  for (const b of blobs) {
    if (!inContent.has((b.path as string).replace(/^public/, ""))) {
      return json({ error: "Danh sách ảnh không khớp với ảnh đã tải" }, 400);
    }
  }

  const branch = env.CONTENT_BRANCH || "main";
  const api = `https://api.github.com/repos/${REPO}/git`;
  const gh = ghHeaders(env);

  try {
    // Thử lại 1 lần nếu nhánh vừa bị người khác đẩy commit mới giữa chừng.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const refRes = await fetch(`${api}/ref/heads/${encodeURIComponent(branch)}`, { headers: gh });
      if (!refRes.ok) return json({ error: `GitHub ${refRes.status} khi đọc nhánh` }, 502);
      const headSha = ((await refRes.json()) as { object: { sha: string } }).object.sha;

      const commitRes = await fetch(`${api}/commits/${headSha}`, { headers: gh });
      if (!commitRes.ok) return json({ error: `GitHub ${commitRes.status} khi đọc commit` }, 502);
      const baseTree = ((await commitRes.json()) as { tree: { sha: string } }).tree.sha;

      // Liệt kê ảnh 360 đang có để xoá bộ cũ không còn dùng.
      const treeRes = await fetch(`${api}/trees/${baseTree}?recursive=1`, { headers: gh });
      if (!treeRes.ok) return json({ error: `GitHub ${treeRes.status} khi đọc cây thư mục` }, 502);
      const existing = ((await treeRes.json()) as { tree: { path: string; type: string }[] }).tree
        .filter((t) => t.type === "blob" && t.path.startsWith(`${FRAMES_DIR}/`))
        .map((t) => t.path);
      const keep = new Set([...inContent].map((f) => `public${f}`));
      const remove = existing.filter((path) => !keep.has(path));

      const tree = [
        ...blobs.map((b) => ({ path: b.path as string, mode: "100644", type: "blob", sha: b.sha as string })),
        ...remove.map((path) => ({ path, mode: "100644", type: "blob", sha: null })),
        {
          path: CONTENT_FILES.exterior,
          mode: "100644",
          type: "blob",
          content: JSON.stringify(content, null, 2) + "\n",
        },
      ];
      const newTreeRes = await fetch(`${api}/trees`, {
        method: "POST",
        headers: gh,
        body: JSON.stringify({ base_tree: baseTree, tree }),
      });
      if (!newTreeRes.ok) {
        console.error("GitHub tree failed", newTreeRes.status, await newTreeRes.text());
        return json({ error: `GitHub ${newTreeRes.status} khi dựng cây thư mục` }, 502);
      }
      const newTree = ((await newTreeRes.json()) as { sha: string }).sha;

      const message = blobs.length
        ? `cms: update 360 view (${blobs.length} frames)`
        : "cms: clear 360 view";
      const newCommitRes = await fetch(`${api}/commits`, {
        method: "POST",
        headers: gh,
        body: JSON.stringify({ message, tree: newTree, parents: [headSha] }),
      });
      if (!newCommitRes.ok) return json({ error: `GitHub ${newCommitRes.status} khi tạo commit` }, 502);
      const newCommit = ((await newCommitRes.json()) as { sha: string }).sha;

      // force:false → chỉ dời nhánh nếu nhánh vẫn đang ở headSha (không ghi đè ai).
      const moveRes = await fetch(`${api}/refs/heads/${encodeURIComponent(branch)}`, {
        method: "PATCH",
        headers: gh,
        body: JSON.stringify({ sha: newCommit, force: false }),
      });
      if (moveRes.ok) {
        return json({ ok: true, commit: newCommit, frames: blobs.length, removed: remove.length });
      }
      if (moveRes.status !== 422 || attempt === 2) {
        return json({ error: `GitHub ${moveRes.status} khi cập nhật nhánh` }, 502);
      }
    }
    return json({ error: "Nhánh thay đổi liên tục, vui lòng thử lại" }, 409);
  } catch (err) {
    console.error("360 commit failed", err);
    return json({ error: "Lưu bộ ảnh 360 thất bại" }, 502);
  }
}

function ghHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "thaco-towner-e-cms",
    "Content-Type": "application/json",
  };
}

/** Current blob SHA of a file on a branch, or null if it doesn't exist. */
async function ghFileSha(
  env: Env,
  filePath: string,
  branch: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
    { headers: ghHeaders(env) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

/* ── session signing (HMAC-SHA256 over an expiry, via Web Crypto) ── */

async function signSession(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `exp=${exp}`;
  const sig = await hmac(secret, payload);
  return `${b64url(payload)}.${sig}`;
}

async function verifySession(req: Request, env: Env): Promise<boolean> {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const payload = unb64url(payloadB64);
  const expected = await hmac(env.ADMIN_SESSION_SECRET, payload);
  if (!timingSafeEqual(sig, expected)) return false;

  const exp = Number(payload.match(/exp=(\d+)/)?.[1] ?? 0);
  return exp > Math.floor(Date.now() / 1000);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(String.fromCharCode(...new Uint8Array(buf)));
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/* ───────────────────────────── helpers ───────────────────────────── */

function sanitize(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, max);
}

function sanitizePhone(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const cleaned = raw.replace(/[^\d+\s\-()]/g, "").trim().slice(0, MAX_PHONE);
  const digits = cleaned.replace(/\D/g, "");
  return digits.length >= 8 ? cleaned : "";
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): string {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

/** UTF-8 safe base64 (btoa only handles Latin-1). */
function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
