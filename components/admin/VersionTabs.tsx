"use client";

import { defaultVersionId, versions } from "@/lib/content";

/** Tab đang chọn = `VersionItem.id`. Tab của phiên bản mặc định sửa ảnh hiện có của khối. */
export type VersionTab = string;

const tenPhienBan = (id: string) => {
  const v = versions.items.find((x) => x.id === id);
  return v?.displayName || v?.code || id;
};
/** Tên phiên bản mặc định để ghi trong thông báo, vd "Towner E V2.6-2S". */
export const tenMacDinh = tenPhienBan(defaultVersionId);

/**
 * Hàng tab chọn phiên bản để sửa ảnh ở khối Ngoại thất / Nội thất.
 *
 *  · Tab phiên bản MẶC ĐỊNH (V2.6) sửa ảnh hiện có của khối — ảnh này cũng dùng cho mọi
 *    phiên bản chưa có ảnh riêng.
 *  · Tab phiên bản khác: tải ảnh riêng; ô nào để trống thì trang dùng ảnh của bản mặc định
 *    (có thông báo rõ để khách không tưởng là trang bị trống ảnh).
 *
 * Danh sách phiên bản lấy từ bản đã xuất bản: thêm phiên bản mới ở mục "Dòng xe" thì sau
 * khi trang cập nhật (~1–2 phút) tab của nó mới hiện ở đây.
 */
export function VersionTabs({
  value,
  onChange,
  hasOwn,
}: {
  value: VersionTab;
  onChange: (tab: VersionTab) => void;
  /** Phiên bản (không phải mặc định) đã có ảnh riêng chưa — hiện chấm xanh trên tab. */
  hasOwn: (id: string) => boolean;
}) {
  const macDinh = value === defaultVersionId;
  const coAnh = !macDinh && hasOwn(value);
  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Sửa ảnh cho phiên bản" className="flex flex-wrap gap-2">
        {versions.items.map((v) => {
          const on = v.id === value;
          const md = v.id === defaultVersionId;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(v.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                on ? "border-[#00529c] bg-[#00529c] text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {v.displayName || v.code}
              {md && <span className={on ? "text-white/80" : "text-gray-400"}>(mặc định)</span>}
              {!md && hasOwn(v.id) && (
                <span
                  aria-label="đã có ảnh riêng"
                  className={`size-2 rounded-full ${on ? "bg-white" : "bg-[#1e7ed8]"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {macDinh ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900">
          <b>Đây là phiên bản mặc định.</b> Trang mở ra ở phiên bản này, và ảnh ở đây cũng được dùng cho
          mọi phiên bản <b>chưa có ảnh riêng</b>.
        </p>
      ) : coAnh ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-700">
          Ảnh riêng của <b>{tenPhienBan(value)}</b>. Ô nào còn trống thì trang dùng ảnh của{" "}
          <b>{tenMacDinh}</b> (có ghi ngay dưới ô).
        </p>
      ) : (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <b>{tenPhienBan(value)} chưa có ảnh riêng.</b> Khi khách chọn phiên bản này, trang đang hiện ảnh
          của <b>{tenMacDinh}</b>. Tải ảnh lên các ô dưới đây để dùng ảnh riêng.
        </p>
      )}
    </div>
  );
}

/**
 * Ghi chú dưới 1 ô ảnh đang để trống ở tab phiên bản không phải mặc định: trang đang dùng
 * ảnh nào (kèm ảnh thu nhỏ mờ) — để khách không tưởng là trang bị thiếu ảnh.
 */
export function DungAnhMacDinh({ src }: { src: string }) {
  if (!src) return null;
  return (
    <p className="-mt-2 flex items-center gap-2 text-xs text-gray-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-8 rounded border border-gray-200 object-cover opacity-60" />
      Đang để trống → trang dùng ảnh của <b className="font-medium">{tenMacDinh}</b>.
    </p>
  );
}
