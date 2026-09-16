"use client";

import Image from "next/image";
import { useState } from "react";
import { header } from "@/lib/content";

/**
 * Đầu trang: thanh menu xanh 40px + ảnh lớn.
 *
 * Khung thiết kế 1440×1064. Từ `lg` (=1440px) trở lên:
 *  · NỀN tràn hết bề ngang màn hình;
 *  · NỘI DUNG (menu, logo, chữ) neo trong khung 1440 căn giữa.
 * Ảnh lớn đặt bằng đơn vị `vw` theo đúng tỉ lệ Figma (1938×1551 tại -249,-244
 * trên khung 1440) nên bố cục ảnh giữ nguyên ở mọi bề ngang, không lộ thêm/mất
 * bớt phần nào. Chiều cao khối vì thế cũng co giãn theo: 1024/1440 = 71.11vw.
 *
 * Bản thiết kế KHÔNG có phiên bản điện thoại — dưới `lg` dùng lại cách của
 * `thaco-truck-sale-page`: thu 6 mục vào nút ba gạch, mở ra danh sách dọc.
 */
export function Header() {
  const { menu, logo, background, title, description } = header;
  const [open, setOpen] = useState(false);

  return (
    <header className="relative">
      {/* Thanh menu — nền tràn viền, các mục neo trong khung 1440 */}
      <nav className="w-full bg-brand-deep">
        <div className="mx-auto flex max-w-[1440px] items-center lg:px-[40px]">
          {/* Máy tính: 6 mục nằm ngang, mỗi mục 117px như Figma */}
          <ul className="hidden lg:flex">
            {menu.map((item) => (
              <li key={item.href} className="w-[117px]">
                <a
                  href={item.href}
                  className="flex h-[40px] items-center justify-center text-body-xs text-white transition-colors duration-200 hover:bg-white/15"
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

      {/* Ảnh lớn — tràn viền */}
      <div className="relative overflow-hidden bg-white lg:h-[71.11vw]">
        <Image
          src={background.srcMobile || background.src}
          alt={background.alt}
          width={1938}
          height={1551}
          priority
          sizes="140vw"
          className="h-[62vw] max-h-[460px] w-full object-cover object-[62%_60%] sm:h-[56vw] lg:absolute lg:left-[-17.29vw] lg:top-[-16.94vw] lg:h-auto lg:max-h-none lg:w-[134.58vw] lg:max-w-none lg:object-[50%_50%]"
        />

        {/* Vệt sáng trắng làm nền cho chữ (Figma: ellipse trắng, mờ 356px,
            chế độ hoà trộn soft-light) */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[-100vw] top-[-35.42vw] hidden h-[70.9vw] w-[200vw] rounded-[50%] bg-white [filter:blur(24.7vw)] [mix-blend-mode:soft-light] lg:block"
        />

        {/* Nội dung — neo trong khung 1440 căn giữa */}
        <div className="relative mx-auto w-full max-w-[1440px] lg:h-full">
          <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:absolute lg:left-[80px] lg:top-[95px] lg:w-[640px] lg:p-0">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={640}
              height={142}
              priority
              className="h-auto w-[240px] sm:w-[320px] md:w-[420px] lg:w-[640px]"
            />
            <div className="mt-5 flex flex-col gap-[10px] sm:mt-6 sm:gap-[12px] lg:mt-[39px] lg:pl-[13px]">
              <h1 className="text-heading-lg font-normal uppercase text-text-heading sm:text-heading-lg md:text-display-sm">
                {title}
              </h1>
              <p className="whitespace-pre-line text-body-md text-text-heading">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
