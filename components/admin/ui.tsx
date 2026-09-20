"use client";

// Shared admin form primitives. Tailwind only — note: this project's @theme
// redefines the named spacing scale, so named max-w-* utilities collide
// (max-w-sm => 12px). Always use arbitrary widths (max-w-[40rem]).

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CmsImage } from "@/lib/content";

const BRAND = "#00529c";

// Client-side image optimization — mirrors scripts/optimize-images.ts so uploads
// land as .webp regardless of the source format.
const MAX_WIDTH = 2400;
const WEBP_QUALITY = 0.82;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve(url.slice(url.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts PNG/JPEG to WebP (downscaled to MAX_WIDTH, quality 82) in the
 * browser. WebP and anything the canvas can't handle pass through unchanged so
 * the Worker can still validate/reject them. Alpha is preserved.
 */
export async function prepareUpload(
  file: File,
  maxWidth: number = MAX_WIDTH
): Promise<{ filename: string; dataBase64: string; mime: string }> {
  const convertible = file.type === "image/png" || file.type === "image/jpeg";
  if (!convertible) {
    return {
      filename: file.name,
      dataBase64: await blobToBase64(file),
      mime: file.type || "application/octet-stream",
    };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY)
    );
    if (!blob) throw new Error("webp encode failed");
    const filename = file.name.replace(/\.(png|jpe?g)$/i, "") + ".webp";
    return { filename, dataBase64: await blobToBase64(blob), mime: "image/webp" };
  } catch {
    // Fall back to the original bytes — Worker still accepts png/jpg/jpeg.
    return {
      filename: file.name,
      dataBase64: await blobToBase64(file),
      mime: file.type || "application/octet-stream",
    };
  }
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#00529c] focus:ring-1 focus:ring-[#00529c]";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

/**
 * Image path input with thumbnail preview + upload-from-disk.
 * Uploads to `POST /api/admin/upload` (Worker commits to
 * `public/images/uploads/`) and writes the resulting public path via onChange.
 */
export function ImageInput({
  value,
  onChange,
  label,
  hint = "Nên dùng ảnh .webp.",
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  /** Helper text under the field — pass a recommended size to guide uploads. */
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Preview the just-uploaded bytes locally. The committed path isn't served by
  // the deployed site until the next build (~1–2 min), so `<img src={path}>`
  // would 404 right after upload and look like a failure. Showing the local
  // data URL makes the upload feel instant regardless of build state.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setJustUploaded(false);
    setUploading(true);
    try {
      // PNG/JPG → WebP in the browser before upload (no-op for .webp).
      const { filename, dataBase64, mime } = await prepareUpload(file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, dataBase64 }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; path?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.path) {
        setError(data?.error || "Tải lên thất bại");
        return;
      }
      onChange(data.path);
      setLocalPreview(`data:${mime};base64,${dataBase64}`);
      setJustUploaded(true);
    } catch {
      setError("Tải lên thất bại");
    } finally {
      setUploading(false);
    }
  }

  // Local bytes win until the user edits the path by hand (which drops them).
  const previewSrc = localPreview ?? value;

  const inner = (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-400">no image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <TextInput
              value={value}
              placeholder="/images/…webp"
              onChange={(e) => {
                onChange(e.target.value);
                setLocalPreview(null);
                setJustUploaded(false);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="shrink-0"
            >
              {uploading ? "Đang tải lên…" : "Tải lên"}
            </Button>
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
          {justUploaded && !error && (
            <span className="text-xs text-green-600">
              ✓ Đã tải lên. Bấm “Lưu &amp; xuất bản” để áp dụng (ảnh hiện sau ~1–2 phút build).
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-400">{hint}</span>
      <span className="text-[11px] text-gray-400">
        Tải lên PNG/JPG sẽ tự tối ưu &amp; chuyển sang .webp.
      </span>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );

  return label ? <Field label={label}>{inner}</Field> : inner;
}

/**
 * Ô chọn tệp tài liệu (.pdf) — dùng cho brochure khách gửi sau. Không nén,
 * không chuyển định dạng; Worker lưu vào public/files/.
 */
export function FileInput({
  value,
  onChange,
  label,
  hint = "Chỉ nhận tệp .pdf.",
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setJustUploaded(false);
    setUploading(true);
    try {
      const dataBase64 = await blobToBase64(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, dataBase64 }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; path?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.path) {
        setError(data?.error || "Tải lên thất bại");
        return;
      }
      onChange(data.path);
      setJustUploaded(true);
    } catch {
      setError("Tải lên thất bại");
    } finally {
      setUploading(false);
    }
  }

  const inner = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TextInput
          value={value}
          placeholder="/files/…pdf  (để trống = ẩn nút tải brochure)"
          onChange={(e) => {
            onChange(e.target.value);
            setJustUploaded(false);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          {uploading ? "Đang tải lên…" : "Tải lên"}
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {justUploaded && !error && (
        <span className="text-xs text-green-600">
          ✓ Đã tải lên. Bấm “Lưu &amp; xuất bản” để áp dụng (~1–2 phút build).
        </span>
      )}
      <span className="text-xs text-gray-400">{hint}</span>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );

  return label ? <Field label={label}>{inner}</Field> : inner;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputCls} min-h-[5rem] resize-y leading-relaxed ${props.className ?? ""}`}
    />
  );
}

/**
 * Edits a CMS image with an optional mobile override. Desktop is the asset used
 * at all breakpoints; Mobile, when set, replaces it below the `xl` breakpoint.
 */
const MOBILE_FALLBACK_NOTE = "Bỏ trống = tự dùng ảnh Desktop cho điện thoại.";

export function ResponsiveImageInput({
  value,
  onChange,
  label,
  withAlt = true,
  recommended,
  recommendedMobile,
}: {
  value: CmsImage;
  onChange: (img: CmsImage) => void;
  label?: string;
  withAlt?: boolean;
  /** Recommended desktop size, e.g. "2400×1350px (16:9), .webp". */
  recommended?: string;
  /** Recommended mobile size; the fallback note is always appended. */
  recommendedMobile?: string;
}) {
  const desktopHint = recommended
    ? `Khuyến nghị: ${recommended}`
    : "Nên dùng ảnh .webp.";
  const mobileHint = recommendedMobile
    ? `Khuyến nghị: ${recommendedMobile}. ${MOBILE_FALLBACK_NOTE}`
    : MOBILE_FALLBACK_NOTE;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
      {label && (
        <span className="text-sm font-semibold text-gray-800">{label}</span>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageInput
          label="Ảnh Desktop"
          hint={desktopHint}
          value={value.src}
          onChange={(src) => onChange({ ...value, src })}
        />
        <ImageInput
          label="Ảnh Mobile (tùy chọn)"
          hint={mobileHint}
          value={value.srcMobile ?? ""}
          onChange={(srcMobile) => onChange({ ...value, srcMobile })}
        />
      </div>
      {withAlt && (
        <Field label="Mô tả ảnh (alt)" hint="Để trống nếu ảnh chỉ trang trí.">
          <TextInput
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
        </Field>
      )}
    </div>
  );
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} ${props.className ?? ""}`}>
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#00529c]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

export function Button({
  variant = "primary",
  children,
  ...props
}: {
  variant?: "primary" | "ghost" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-[#00529c] text-white hover:bg-[#0086ff]",
    ghost: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
    danger: "text-gray-400 hover:text-red-600",
  }[variant];
  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

/** Small icon button for list row controls (move/remove). */
export function IconButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`grid size-8 place-items-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

/** Sticky save bar shown at the bottom of each editor. */
export function SaveBar({
  dirty,
  saving,
  status,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  status: { kind: "ok" | "error"; msg: string } | null;
  onSave: () => void;
  /** When provided, shows a "restore defaults" button. */
  onReset?: () => void;
}) {
  function handleReset() {
    if (!onReset) return;
    if (
      window.confirm(
        "Khôi phục nội dung & ảnh mặc định cho khu vực này?\n\nMọi thay đổi đang nhập sẽ bị thay bằng bản gốc. Bạn vẫn cần bấm “Lưu & xuất bản” để áp dụng."
      )
    ) {
      onReset();
    }
  }

  return (
    <div className="sticky bottom-0 z-10 mt-6 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)] backdrop-blur">
      <div className="flex items-center gap-3">
        {onReset && (
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            ↺ Khôi phục mặc định
          </Button>
        )}
        <span className="text-sm">
          {status ? (
            <span className={status.kind === "ok" ? "text-green-600" : "text-red-600"}>
              {status.msg}
            </span>
          ) : dirty ? (
            <span className="text-amber-600">● Có thay đổi chưa lưu</span>
          ) : (
            <span className="text-gray-400">Chưa có thay đổi</span>
          )}
        </span>
      </div>
      <Button onClick={onSave} disabled={!dirty || saving} style={{ background: BRAND }}>
        {saving ? "Đang lưu…" : "Lưu & xuất bản"}
      </Button>
    </div>
  );
}
