"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, prepareUpload } from "./ui";

/**
 * Tải cả bộ ảnh xoay 360° từ máy lên trong MỘT lần lưu.
 *
 * Luồng: chọn/kéo thả nhiều ảnh → xếp theo tên tệp → xem thử xoay → bấm lưu:
 *   1. trình duyệt nén từng ảnh sang WebP (tối đa 1600px ngang);
 *   2. gửi theo lô 20 ảnh tới /api/admin/360/blobs (Worker chỉ được gọi ra ngoài
 *      giới hạn số lần mỗi lượt);
 *   3. gọi /api/admin/360/commit một lần → GitHub nhận đúng 1 commit gồm ảnh +
 *      content/exterior.json + xoá bộ ảnh cũ → Cloudflare chỉ build 1 lần.
 */

const MIN_FRAMES = 2;
const MAX_FRAMES = 72;
const BATCH_SIZE = 20;
const FRAME_MAX_WIDTH = 1600;
const ACCEPT = "image/png,image/jpeg,image/webp";

type Pending = { key: string; file: File; url: string; w: number; h: number };
type Step = { label: string; done: number; total: number } | null;

/** Sắp theo tên tệp, số so theo giá trị: 2.png đứng trước 10.png. */
const byName = (a: File, b: File) =>
  a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });

function newBatchId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}-${rand}`;
}

async function readSize(file: File): Promise<{ w: number; h: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const size = { w: bmp.width, h: bmp.height };
    bmp.close();
    return size;
  } catch {
    return { w: 0, h: 0 };
  }
}

export function Frame360Input<T extends { view360: { frames: string[] } }>({
  data,
  dirtyOther,
  onSaved,
  onManualChange,
}: {
  /** Toàn bộ nội dung khối Ngoại thất đang sửa — lưu kèm trong cùng commit. */
  data: T;
  /** Trang còn thay đổi khác chưa lưu (để nhắc người dùng). */
  dirtyOther: boolean;
  onSaved: (next: T, msg: string) => void;
  onManualChange: (frames: string[]) => void;
}) {
  const current = data.view360.frames;
  const [pending, setPending] = useState<Pending[]>([]);
  const [step, setStep] = useState<Step>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);

  // Giải phóng ảnh xem trước khi bỏ chọn / rời trang.
  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), [pending]);

  async function addFiles(list: FileList | File[]) {
    setError(null);
    const files = [...list].filter((f) => ACCEPT.split(",").includes(f.type)).sort(byName);
    if (!files.length) {
      setError("Không có ảnh PNG / JPG / WebP nào trong số tệp đã chọn.");
      return;
    }
    const items = await Promise.all(
      files.map(async (file, i) => ({
        key: `${file.name}-${file.size}-${i}-${Date.now()}`,
        file,
        url: URL.createObjectURL(file),
        ...(await readSize(file)),
      }))
    );
    setPending(items);
  }

  const warnings = useMemo(() => {
    const out: string[] = [];
    if (pending.length && pending.length < MIN_FRAMES)
      out.push(`Cần tối thiểu ${MIN_FRAMES} ảnh.`);
    if (pending.length > MAX_FRAMES)
      out.push(`Tối đa ${MAX_FRAMES} ảnh — đang chọn ${pending.length}.`);
    const sizes = new Set(pending.filter((p) => p.w).map((p) => `${p.w}×${p.h}`));
    if (sizes.size > 1)
      out.push(
        `Các ảnh không cùng khổ (${[...sizes].slice(0, 3).join(", ")}${sizes.size > 3 ? "…" : ""}) — xe sẽ bị giật khi xoay.`
      );
    const small = pending.filter((p) => p.w && p.w < 1200).length;
    if (small) out.push(`${small} ảnh rộng dưới 1200px — lên màn lớn sẽ mờ.`);
    return out;
  }, [pending]);

  const canUpload =
    pending.length >= MIN_FRAMES && pending.length <= MAX_FRAMES && !step;

  async function commit(blobs: { path: string; sha: string }[], frames: string[]) {
    const next = { ...data, view360: { ...data.view360, frames } };
    const res = await fetch("/api/admin/360/commit", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blobs, content: next }),
    });
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; removed?: number }
      | null;
    if (!res.ok || !body?.ok) throw new Error(body?.error || `Lưu thất bại (${res.status})`);
    return { next, removed: body.removed ?? 0 };
  }

  async function upload() {
    if (!canUpload) return;
    setError(null);
    const batch = newBatchId();
    try {
      // 1. nén
      const prepared: { index: number; dataBase64: string }[] = [];
      for (let i = 0; i < pending.length; i++) {
        setStep({ label: "Đang nén ảnh", done: i, total: pending.length });
        const out = await prepareUpload(pending[i].file, FRAME_MAX_WIDTH);
        if (out.mime !== "image/webp") {
          throw new Error(`Không chuyển được "${pending[i].file.name}" sang WebP.`);
        }
        prepared.push({ index: i + 1, dataBase64: out.dataBase64 });
      }

      // 2. gửi theo lô
      const blobs: { path: string; sha: string }[] = [];
      const lots = Math.ceil(prepared.length / BATCH_SIZE);
      for (let l = 0; l < lots; l++) {
        setStep({ label: "Đang tải ảnh lên", done: l, total: lots });
        const res = await fetch("/api/admin/360/blobs", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch,
            files: prepared.slice(l * BATCH_SIZE, (l + 1) * BATCH_SIZE),
          }),
        });
        const body = (await res.json().catch(() => null)) as
          | { ok?: boolean; error?: string; blobs?: { path: string; sha: string }[] }
          | null;
        if (!res.ok || !body?.ok || !body.blobs) {
          throw new Error(body?.error || `Tải ảnh thất bại (${res.status})`);
        }
        blobs.push(...body.blobs);
      }

      // 3. một commit duy nhất
      setStep({ label: "Đang lưu & xuất bản", done: 0, total: 1 });
      const frames = blobs.map((b) => b.path.replace(/^public/, ""));
      const { next, removed } = await commit(blobs, frames);
      onSaved(
        next,
        `Đã lưu bộ ${frames.length} ảnh 360°${removed ? `, xoá ${removed} ảnh cũ` : ""}. Trang sẽ cập nhật sau ~1–2 phút.`
      );
      setPending([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStep(null);
    }
  }

  async function clearAll() {
    if (!window.confirm("Xoá toàn bộ bộ ảnh 360° đang dùng? Trang sẽ quay về hiển thị 1 ảnh xe.")) return;
    setError(null);
    setStep({ label: "Đang xoá bộ ảnh", done: 0, total: 1 });
    try {
      const { next, removed } = await commit([], []);
      onSaved(next, `Đã xoá bộ ảnh 360° (${removed} ảnh).`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStep(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">Bộ ảnh xoay 360°</p>
          <p className="text-xs text-gray-500">
            {current.length >= MIN_FRAMES
              ? `Đang dùng ${current.length} ảnh.`
              : "Chưa có bộ ảnh — trang đang hiện 1 ảnh xe và ẩn thanh xoay."}
          </p>
        </div>
        {current.length > 0 && (
          <Button type="button" variant="ghost" disabled={!!step} onClick={clearAll}>
            Xoá bộ ảnh
          </Button>
        )}
      </div>

      {current.length >= MIN_FRAMES && !pending.length && (
        <Player label="Bộ đang dùng" srcs={current} />
      )}

      {/* Vùng chọn ảnh */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-[#00529c] bg-blue-50" : "border-gray-300 bg-gray-50/60"
        }`}
      >
        <p className="text-sm text-gray-700">
          {current.length ? "Thay bộ ảnh: kéo thả" : "Kéo thả"} <b>tất cả ảnh</b> vào đây, hoặc
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="ghost" disabled={!!step} onClick={() => fileRef.current?.click()}>
            Chọn ảnh
          </Button>
          <Button type="button" variant="ghost" disabled={!!step} onClick={() => dirRef.current?.click()}>
            Chọn cả thư mục
          </Button>
        </div>
        <p className="max-w-[34rem] text-xs leading-relaxed text-gray-500">
          {MIN_FRAMES}–{MAX_FRAMES} ảnh (nên 36), PNG nền trong suốt, cùng khổ, tối thiểu 1440×960.
          Đặt tên theo thứ tự xoay: <code>01.png</code>, <code>02.png</code>… — hệ thống xếp theo tên
          tệp và tự chuyển sang WebP. Không cần có sẵn đường dẫn ảnh.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={dirRef}
          type="file"
          multiple
          className="hidden"
          // Chọn cả thư mục — thuộc tính chưa có trong kiểu React chuẩn.
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Ảnh vừa chọn */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">
              Đã chọn {pending.length} ảnh — kiểm tra thứ tự rồi bấm lưu
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={!!step}
                onClick={() => setPending((p) => [...p].reverse())}
              >
                Đảo chiều xoay
              </Button>
              <Button type="button" variant="ghost" disabled={!!step} onClick={() => setPending([])}>
                Bỏ chọn
              </Button>
            </div>
          </div>

          <Player label="Xem thử" srcs={pending.map((p) => p.url)} />

          <ol className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-9">
            {pending.map((p, i) => (
              <li key={p.key} className="group relative overflow-hidden rounded-md border border-gray-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="aspect-[3/2] w-full object-contain" />
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-semibold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  disabled={!!step}
                  title={`Bỏ ${p.file.name}`}
                  onClick={() => setPending((all) => all.filter((x) => x.key !== p.key))}
                  className="absolute right-1 top-1 hidden size-5 place-items-center rounded bg-white/90 text-xs text-red-600 group-hover:grid"
                >
                  ×
                </button>
                <span className="block truncate px-1 py-0.5 text-[10px] text-gray-500" title={p.file.name}>
                  {p.file.name}
                </span>
              </li>
            ))}
          </ol>

          {warnings.map((w) => (
            <p key={w} className="text-xs text-amber-700">
              ⚠ {w}
            </p>
          ))}
          {dirtyOther && (
            <p className="text-xs text-gray-500">
              Lưu bộ ảnh cũng lưu luôn các thay đổi khác đang nhập trong trang Ngoại thất.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled={!canUpload} onClick={upload}>
              Tải lên & xuất bản {pending.length} ảnh
            </Button>
            {step && (
              <div className="flex min-w-[14rem] flex-1 flex-col gap-1">
                <span className="text-xs text-gray-600">
                  {step.label}
                  {step.total > 1 ? ` (${Math.min(step.done + 1, step.total)}/${step.total})` : "…"}
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <span
                    className="block h-full bg-[#00529c] transition-[width]"
                    style={{ width: `${Math.round((step.done / Math.max(step.total, 1)) * 100)}%` }}
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Nâng cao: sửa tay danh sách đường dẫn */}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-500">Nâng cao: sửa tay danh sách đường dẫn</summary>
        <p className="mt-2 text-xs text-gray-500">
          Mỗi dòng một đường dẫn ảnh. Sửa ở đây thì bấm “Lưu & xuất bản” ở cuối trang.
        </p>
        <textarea
          rows={4}
          value={current.join("\n")}
          onChange={(e) =>
            onManualChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
          }
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-[#00529c]"
        />
      </details>
    </div>
  );
}

/** Khung xem thử xoay: kéo thanh trượt hoặc bấm tự quay. */
function Player({ label, srcs }: { label: string; srcs: string[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const idx = Math.min(i, srcs.length - 1);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((v) => (v + 1) % srcs.length), 90);
    return () => clearInterval(t);
  }, [playing, srcs.length]);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#f4f7fb] p-3">
      <span className="text-xs font-medium text-gray-600">
        {label} — ảnh {idx + 1}/{srcs.length}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={srcs[idx]} alt="" className="mx-auto aspect-[3/2] w-full max-w-[28rem] object-contain" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
        >
          {playing ? "Dừng" : "Tự quay"}
        </button>
        <input
          type="range"
          min={0}
          max={srcs.length - 1}
          value={idx}
          onChange={(e) => {
            setPlaying(false);
            setI(Number(e.target.value));
          }}
          aria-label={`${label}: chọn ảnh`}
          className="flex-1 accent-[#00529c]"
        />
      </div>
    </div>
  );
}
