"use client";

import { motion } from "motion/react";
import { header } from "@/lib/content";
import { PhoneIcon } from "@/components/icons";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hai nút liên hệ nổi góc phải dưới — Zalo + gọi hotline, lấy theo
 * `thaco-truck-sale-page` (components/FloatingContact.tsx). CHỈ hiện dưới `lg`
 * (điện thoại, máy tính bảng); từ `lg` hotline đã nằm sẵn trên thanh menu cố định.
 *
 * Số lấy từ ô `hotline` của Đầu trang (`content/header.json`, sửa ở /admin) — cùng
 * nguồn với số trên thanh menu; để trống thì ẩn cả cụm.
 * Nút Zalo trỏ `zalo.me/<số>` (hồ sơ Zalo cá nhân): số chưa đăng ký Zalo, hoặc chưa
 * bật "Cho phép người lạ tìm thấy và kết bạn qua số điện thoại", thì chưa mở được.
 *
 * z-30: nằm DƯỚI thanh menu (z-40, có ngăn menu xổ) và hộp thoại (z-50).
 * `env(safe-area-inset-bottom)` để nút không bị thanh gesture iPhone che.
 */
export function FloatingContact() {
  const hotline = (header.hotline ?? "").trim();
  if (!hotline) return null;
  const digits = hotline.replace(/[^\d+]/g, "");

  return (
    <div className="fixed right-[16px] bottom-[calc(16px+env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-[12px] lg:hidden">
      <ContactButton
        href={`https://zalo.me/${digits.replace(/^\+84/, "0")}`}
        label={`Nhắn tin Zalo tới ${hotline}`}
        className="bg-[#0068ff]"
        external
      >
        <span className="text-[15px] font-bold leading-none tracking-[-0.02em]">Zalo</span>
      </ContactButton>
      <ContactButton href={`tel:${digits}`} label={`Gọi hotline ${hotline}`} className="bg-brand">
        <PhoneIcon className="size-6" />
      </ContactButton>
    </div>
  );
}

function ContactButton({
  href,
  label,
  className,
  external,
  children,
}: {
  href: string;
  label: string;
  className: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "tween", duration: 0.2, ease: EASE }}
      className={`flex size-[52px] items-center justify-center rounded-full border border-white/30 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </motion.a>
  );
}
