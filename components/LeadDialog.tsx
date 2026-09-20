"use client";

import { useEffect, useRef, useState } from "react";
import { cta } from "@/lib/content";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Hộp thoại đăng ký lái thử. Bản thiết kế không vẽ biểu mẫu — chốt với chủ dự án
 * 16/09: nút "Đăng ký lái thử" mở hộp thoại này, dữ liệu vào kho D1 qua
 * `POST /api/leads` (cùng đường với 2 landing trước).
 */
export function LeadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const form = cta.form;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          phone: String(data.get("phone") || ""),
          note: String(data.get("note") || ""),
          hp: String(data.get("company") || ""),
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setStatus("error");
        setMessage(body?.error || "Gửi không thành công, vui lòng thử lại.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Không kết nối được máy chủ, vui lòng thử lại.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={form.title}
        className="max-h-full w-full max-w-[520px] overflow-y-auto rounded-[16px] bg-white p-6 xl:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-md font-bold uppercase text-brand-deep">
              {form.title}
            </h2>
            <p className="mt-2 text-body-md text-text-heading">{form.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-stroke-soft text-text-heading transition-colors hover:bg-stroke"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === "done" ? (
          <p className="rounded-[8px] bg-bg-tint px-4 py-6 text-center text-body-lg text-brand-deep">
            {form.successMessage}
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label={form.nameLabel}>
              <input
                name="name"
                required
                maxLength={100}
                placeholder={form.namePlaceholder}
                className={inputCls}
              />
            </Field>
            <Field label={form.phoneLabel}>
              <input
                name="phone"
                required
                inputMode="tel"
                maxLength={30}
                // Trình duyệt mới biên dịch `pattern` ở chế độ `v`: trong lớp ký tự
                // KHÔNG được để ( ) chưa thoát, và `-` phải thoát.
                pattern="[0-9+\-. ]{8,}"
                placeholder={form.phonePlaceholder}
                className={inputCls}
              />
            </Field>
            <Field label={form.noteLabel}>
              <textarea
                name="note"
                rows={3}
                maxLength={2000}
                placeholder={form.notePlaceholder}
                className={`${inputCls} resize-y`}
              />
            </Field>

            {/* Bẫy máy gửi rác — người thật không nhìn thấy ô này */}
            <input
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute left-[-9999px] size-px opacity-0"
            />

            {status === "error" && (
              <p className="text-body-sm text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 h-[44px] rounded-full bg-brand text-body-md font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
            >
              {status === "sending" ? "Đang gửi…" : form.submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-stroke px-3 py-2 text-body-md text-text-heading outline-none transition-colors focus:border-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-body-sm font-medium text-text-heading">{label}</span>
      {children}
    </label>
  );
}
