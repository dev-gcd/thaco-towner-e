"use client";

import { useEffect } from "react";

/**
 * Hộp thoại báo "nội dung đang cập nhật" — hiện khi khách bấm một nút mà trong
 * CMS chưa nạp đường dẫn (tệp brochure, link bản đồ). Cố ý KHÔNG ẩn nút đi: ẩn
 * thì người quản trị không biết là còn thiếu dữ liệu.
 */
export function NoticeDialog({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[420px] rounded-[16px] bg-white p-6 text-center"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-bg-tint text-brand">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-6">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="mt-4 text-heading-sm font-bold uppercase text-brand-deep">{title}</h2>
        <p className="mt-2 text-body-md text-text-heading">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-[40px] w-full rounded-full bg-brand text-body-md font-medium text-white transition-colors duration-200 hover:bg-brand-deep"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
