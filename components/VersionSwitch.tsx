"use client";

import { versions } from "@/lib/content";

/**
 * Nút chuyển nhanh phiên bản xe ở khối Ngoại thất / Nội thất (thêm ngoài Figma theo
 * yêu cầu khách 21/09): đổi ở đây hay ở khối Dòng xe đều là CÙNG MỘT lựa chọn cho cả
 * trang, nên khách không phải cuộn ngược lên khối Dòng xe mới xem được xe V2.7.
 * Chỉ hiện khi có từ 2 phiên bản.
 */
export function VersionSwitch({
  versionId,
  onVersion,
  tone = "light",
  className = "",
}: {
  versionId: string;
  onVersion: (id: string) => void;
  /** light = nền sáng (Ngoại thất), dark = nền tối (Nội thất). */
  tone?: "light" | "dark";
  className?: string;
}) {
  if (versions.items.length < 2) return null;
  const idle =
    tone === "dark"
      ? // nền đen mờ chứ không trắng mờ: trên điện thoại nút nằm đè nóc xe màu trắng
        "bg-black/45 text-white hover:bg-black/60"
      : "bg-white/80 text-brand-deep hover:bg-white";
  return (
    <div role="group" aria-label="Chọn phiên bản xe" className={`flex gap-2 ${className}`}>
      {versions.items.map((v) => {
        const on = v.id === versionId;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={on}
            onClick={() => onVersion(v.id)}
            className={`h-[40px] rounded-full px-4 text-body-sm font-semibold uppercase whitespace-nowrap backdrop-blur-[2px] transition-colors duration-200 ${
              on ? "bg-brand text-white" : idle
            }`}
          >
            {v.code}
          </button>
        );
      })}
    </div>
  );
}
