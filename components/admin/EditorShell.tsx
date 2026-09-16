"use client";

import type { ReactNode } from "react";
import { Card, SaveBar } from "./ui";

/** Khung chung cho mọi trang sửa nội dung: tiêu đề, các thẻ, thanh lưu. */
export function EditorShell({
  title,
  description,
  children,
  dirty,
  saving,
  status,
  onSave,
  onReset,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  dirty: boolean;
  saving: boolean;
  status: { kind: "ok" | "error"; msg: string } | null;
  onSave: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[56rem] flex-col gap-5 pb-28">
      <header>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </header>
      {children}
      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={onSave}
        onReset={onReset}
      />
    </div>
  );
}

/** Thẻ con có tiêu đề — dùng cho từng mục trong danh sách. */
export function ItemCard({
  title,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: {
  title: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <div className="flex items-center gap-1">
          {onMoveUp && <SmallButton label="↑" title="Lên trên" onClick={onMoveUp} />}
          {onMoveDown && <SmallButton label="↓" title="Xuống dưới" onClick={onMoveDown} />}
          {onRemove && (
            <SmallButton
              label="Xoá"
              title="Xoá mục này"
              danger
              onClick={() => {
                if (window.confirm(`Xoá "${title}"?`)) onRemove();
              }}
            />
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}

function SmallButton({
  label,
  title,
  onClick,
  danger,
}: {
  label: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-xs transition-colors ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-gray-200 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

/** Nút thêm mục mới, đặt cuối danh sách. */
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#00529c] hover:text-[#00529c]"
    >
      + {label}
    </button>
  );
}
