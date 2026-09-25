"use client";

import Image from "next/image";
import { useState } from "react";
import { header } from "@/lib/content";
import { PhoneIcon } from "@/components/icons";

/** Số gọi được: bỏ mọi thứ không phải chữ số hoặc dấu +. */
const telHref = (so: string) => `tel:${so.replace(/[^\d+]/g, "")}`;

/**
 * Thanh menu xanh — CỐ ĐỊNH đầu màn khi cuộn (yêu cầu khách 21/09). Đứng NGOÀI
 * `<header>` và ngoài `<main>` (ngang hàng với chúng) vì `sticky` chỉ bám trong
 * phạm vi khối cha: nằm trong `<header>` thì trôi đi khi hết ảnh đầu trang.
 * Bấm menu nhảy tới khối không bị thanh che nhờ `scroll-padding-top` ở `html`.
 *
 * Figma: thanh 40px, chữ 12px. Khách chê nhỏ → thanh 48px, chữ 16px (ở 800px chữ
 * co còn 15px). 6 mục chia đều bề ngang, mỗi mục tối đa 117px như Figma, nên ở
 * laptop hẹp các mục tự khít lại thay vì tràn. Bên phải là hotline (sửa trong CMS).
 * Dưới `lg`: nút ba gạch bên trái, hotline bên phải.
 */
export function SiteNav() {
  const { menu } = header;
  // Nội dung cũ (trước 21/09) chưa có ô này — coi như trống thay vì lỗi.
  const hotline = header.hotline ?? "";
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-brand-deep">
      <div className="mx-auto flex max-w-[1440px] items-center lg:h-[48px] lg:px-[max(16px,2.78vw)] xl:px-[40px]">
        {/* Máy tính: 6 mục chia đều, mỗi mục tối đa 117px như Figma */}
        <ul className="hidden min-w-0 flex-1 lg:flex">
          {menu.map((item) => (
            <li key={item.href} className="max-w-[117px] min-w-max flex-1">
              <a
                href={item.href}
                className="flex h-[48px] items-center justify-center px-[6px] text-[length:clamp(15px,calc(15px_+_(100vw_-_800px)/224),16px)] font-medium text-white transition-colors duration-200 hover:bg-white/15"
              >
                {/* Figma có chấm tròn 4px trước chữ nhưng đặt `visible: false`
                    — thiết kế cố ý ẩn, nên không vẽ. */}
                <span className="whitespace-nowrap">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Điện thoại: nút ba gạch */}
        <button
          type="button"
          aria-label={open ? "Đóng danh mục" : "Mở danh mục"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[44px] items-center gap-2 px-4 text-body-sm font-medium text-white transition-colors hover:bg-white/15 lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
          Danh mục
        </button>

        {hotline.trim() && (
          <a
            href={telHref(hotline)}
            aria-label={`Gọi hotline ${hotline}`}
            className="ml-auto flex h-[44px] shrink-0 items-center gap-2 px-4 text-body-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-white/15 lg:h-[48px] lg:pl-6 lg:pr-3 lg:text-[length:clamp(15px,calc(15px_+_(100vw_-_800px)/224),16px)]"
          >
            <PhoneIcon className="size-5 shrink-0" />
            {hotline}
          </a>
        )}
      </div>

      {open && (
        <ul className="border-t border-white/15 bg-brand-deep lg:hidden">
          {menu.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-body-sm text-white transition-colors hover:bg-white/15"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

/**
 * Đầu trang: ảnh lớn + logo + dòng giới thiệu (thanh menu tách riêng ở `SiteNav`).
 *
 * Khung thiết kế 1440×1064 (Figma tính cả thanh menu 40px; phần ảnh từ y=40).
 * Từ `lg` (800px) trở lên — ở 800–1439 nội dung co theo `--u` của `.canvas-1440`,
 * chữ co theo nhưng có cỡ sàn (tiêu đề ≥20px, mô tả ≥12px) để không xuống dòng đè xe:
 *  · NỀN tràn hết bề ngang màn hình;
 *  · NỘI DUNG (logo, chữ) neo trong khung 1440 căn giữa.
 * Ảnh lớn (bộ ảnh 25/09) đã được cắt sẵn đúng khung 1440×1024 nên chỉ việc phủ kín
 * khối; chiều cao khối co giãn theo bề ngang: 1024/1440 = 71.11vw, nhờ vậy bố cục ảnh
 * giữ nguyên ở mọi bề ngang, không lộ thêm/mất bớt phần nào.
 */
export function Header() {
  const { logo, background, title, description } = header;

  return (
    <header className="relative">
      {/* Ảnh lớn — tràn viền */}
      <div className="relative overflow-hidden bg-white lg:h-[71.11vw]">
        <Image
          src={background.srcMobile || background.src}
          alt={background.alt}
          width={2100}
          height={1493}
          priority
          sizes="100vw"
          className="h-[62vw] max-h-[460px] w-full object-cover object-[62%_60%] sm:h-[56vw] lg:absolute lg:inset-0 lg:h-full lg:max-h-none lg:object-[50%_50%]"
        />

        {/* Vệt sáng trắng làm nền cho chữ (Figma: ellipse trắng, mờ 356px,
            chế độ hoà trộn soft-light) */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[-100vw] top-[-35.42vw] hidden h-[70.9vw] w-[200vw] rounded-[50%] bg-white [filter:blur(24.7vw)] [mix-blend-mode:soft-light] lg:block"
        />

        {/* Nội dung — neo trong khung 1440 căn giữa */}
        <div className="canvas-1440 relative mx-auto w-full max-w-[1440px] lg:h-full">
          <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:absolute lg:left-[calc(80*var(--u))] lg:top-[calc(95*var(--u))] lg:w-[calc(640*var(--u))] lg:p-0">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={640}
              height={142}
              priority
              className="h-auto w-[240px] sm:w-[320px] md:w-[420px] lg:w-[calc(640*var(--u))]"
            />
            <div className="mt-5 flex flex-col gap-[10px] sm:mt-6 sm:gap-[12px] lg:mt-[calc(39*var(--u))] lg:pl-[calc(13*var(--u))]">
              <h1 className="text-heading-lg font-normal uppercase text-text-heading sm:text-heading-lg md:text-display-sm lg:text-[length:max(20px,calc(32*var(--u)))] lg:leading-[1.25]">
                {title}
              </h1>
              <p className="whitespace-pre-line text-body-md text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
