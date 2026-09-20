"use client";

import Image from "next/image";
import { useState } from "react";
import { versions } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";

/**
 * Dòng xe — khung thiết kế 1440×951, hai góc dưới bo 80px (Figma:
 * rectangleCornerRadii [0,0,80,80]).
 *
 * Cơ chế đổi phiên bản đọc từ 2 biến thể của component "Dòng xe" trong Figma:
 *
 *            | ảnh nền x | bảng V2.6 x | bảng V2.7 x
 *   biến thể 1 |   -340    |     735     |    -295
 *   biến thể 2 |  -1024    |    1145     |     176
 *
 * Tức là ảnh nền TRƯỢT NGANG 684px, còn hai bảng thông số trượt ngược lại ~410px.
 * Ảnh gốc vốn có SẴN HAI chiếc xe — chiếc thứ hai chính là xe của bản V2.7, lộ ra
 * sau khi nền trượt. Đừng "sửa" cho mất chiếc xe đó.
 *
 * Từ `lg` (800) bố cục co theo `--u` (khối gắn `.canvas-1440`), chữ co theo nhưng có
 * cỡ sàn. Bảng thông số 590·u không đủ chỗ cho 4 chỉ số 1 hàng ở laptop hẹp nên
 * dưới `xl` được xuống hàng; từ `xl` giữ đúng 1 hàng 590×97 như Figma.
 */

// Quy về phần trăm bề rộng khung 1440 để giữ đúng bố cục ở mọi bề ngang màn.
const BG_X = [-340 / 1440, -1024 / 1440]; // vị trí ảnh nền theo từng phiên bản
const PANEL_X = [735 / 1440, 176 / 1440]; // vị trí bảng thông số đang hiển thị

/**
 * Điện thoại không trượt ảnh nền được (ảnh bị `object-cover` cắt vừa khung), nên
 * đổi phiên bản bằng cách NGẮM điểm cắt sang chiếc xe kia. Ảnh gốc 2040×1532:
 * xe của bản 1 nằm quanh x=580, xe của bản 2 quanh x=1460 → quy ra 16% và 84%.
 */
const BG_POS = ["16% 56%", "84% 56%"];

export function Versions() {
  const { label, heading, headingAccent, background, priceLabel, items } = versions;
  const [index, setIndex] = useState(0);
  const item = items[index];
  const step = (n: number) => setIndex(((n % items.length) + items.length) % items.length);
  // Chỉ có 2 khung hình nền trong thiết kế; phiên bản thứ 3 trở đi dùng lại khung 2.
  const frame = Math.min(index, BG_X.length - 1);

  return (
    <section
      id="dong-xe"
      className="canvas-1440 relative overflow-hidden rounded-b-[40px] bg-bg-soft lg:rounded-b-[calc(80*var(--u))]"
    >
      {/* NỀN tràn hết bề ngang, trượt ngang khi đổi phiên bản */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Image
          src={background.srcMobile || background.src}
          alt=""
          width={2812}
          height={2112}
          sizes="200vw"
          className="absolute inset-0 h-full w-full object-cover [object-position:var(--bg-pos)] transition-[left,object-position] duration-[1022ms] [transition-timing-function:var(--ease-gentle)] lg:left-[var(--bg-x)] lg:top-1/2 lg:mt-[3.13vw] lg:h-auto lg:w-[195.28%] lg:max-w-none lg:-translate-y-1/2 lg:[object-position:50%_50%]"
          style={
            {
              "--bg-x": `${BG_X[frame] * 100}%`,
              "--bg-pos": BG_POS[frame] ?? BG_POS[BG_POS.length - 1],
            } as React.CSSProperties
          }
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[347px] bg-linear-to-b from-bg-soft to-transparent lg:h-[calc(347*var(--u))]" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[188px] bg-linear-to-t from-bg-soft to-transparent lg:h-[calc(188*var(--u))]" />
        {/* Điện thoại: ảnh nền sáng, chữ trắng khó đọc. Phủ tối phần dưới (chỗ có
            chữ) thay vì phủ đều cả khối — phủ đều làm mất luôn chiếc xe. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4 bg-linear-to-b from-transparent via-black/45 to-black/70 lg:hidden" />
      </div>

      {/* NỘI DUNG neo trong khung 1440 căn giữa */}
      <div className="relative mx-auto w-full max-w-[1440px] lg:h-[calc(951*var(--u))]">
        <div className="relative px-4 pb-24 pt-12 lg:h-full lg:px-0 lg:py-0">
          <div className="flex flex-col gap-[12px] lg:absolute lg:left-[calc(80*var(--u))] lg:top-[calc(80*var(--u))] lg:w-[calc(686*var(--u))] lg:gap-[calc(12*var(--u))]">
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-display-sm font-medium uppercase text-brand-deep lg:whitespace-nowrap lg:text-[length:max(20px,calc(32*var(--u)))] lg:leading-[1.25]">
              {heading} <span className="font-bold text-brand">{headingAccent}</span>
            </h2>
          </div>

          {/* Bảng thông số — trượt sang bên kia khi đổi phiên bản */}
          <div
            className="mt-[230px] transition-[left,opacity] duration-[1022ms] [transition-timing-function:var(--ease-gentle)] sm:mt-[280px] lg:absolute lg:left-[var(--panel-x)] lg:top-[calc(390*var(--u))] lg:mt-0 lg:w-[calc(590*var(--u))]"
            style={{ "--panel-x": `${PANEL_X[frame] * 100}%` } as React.CSSProperties}
          >
            <div key={index} className="flex flex-col gap-[16px] lg:gap-[calc(16*var(--u))] motion-safe:animate-[version-in_1022ms_var(--ease-gentle)]">
              <div className="flex flex-col">
                <span className="text-heading-md font-medium uppercase text-white sm:text-display-sm lg:text-[length:max(20px,calc(32*var(--u)))] lg:leading-[1.25]">
                  {item.name}
                </span>
                <span className="text-[44px] font-normal uppercase leading-[52px] text-white sm:text-[64px] sm:leading-[72px] lg:text-[calc(136*var(--u))] lg:leading-[calc(144*var(--u))]">
                  {item.code}
                </span>
              </div>
              <div className="flex w-fit max-w-full flex-wrap items-center gap-x-[8px] rounded-[4px] bg-brand px-[8px] py-[6px] lg:h-[max(24px,calc(32*var(--u)))] lg:flex-nowrap lg:py-0">
                <span className="text-body-sm text-white sm:text-body-md lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]">{priceLabel}</span>
                <span className="whitespace-nowrap text-body-lg font-semibold text-white sm:text-heading-md lg:text-[length:max(16px,calc(24*var(--u)))] lg:leading-[1.3333]">
                  {item.price}
                </span>
              </div>

              <dl className="mt-[8px] flex w-fit flex-wrap items-center gap-[16px] rounded-[8px] bg-white/60 px-[24px] py-[21px] backdrop-blur-[2px] lg:mt-[calc(16*var(--u))] lg:grid lg:w-[calc(590*var(--u))] lg:grid-cols-2 xl:flex xl:h-[97px] xl:flex-nowrap xl:justify-between xl:gap-0">
                {item.specs.map((spec, i) => (
                  <div key={spec.label} className="flex items-center gap-[16px]">
                    {i > 0 && (
                      <span aria-hidden className="hidden h-[56px] w-px bg-text-heading/20 xl:block" />
                    )}
                    <div className="flex flex-col gap-[4px] whitespace-nowrap">
                      <dd className="text-heading-md font-semibold text-brand lg:text-[length:max(16px,calc(24*var(--u)))] lg:leading-[1.3333]">{spec.value}</dd>
                      <dt className="text-body-md font-medium text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]">{spec.label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <NavButton
            side="left"
            label={`Phiên bản trước (${item.displayName})`}
            onClick={() => step(index - 1)}
          >
            <ArrowLeft className="size-[14px]" />
          </NavButton>
          <NavButton
            side="right"
            label={`Phiên bản kế tiếp (${item.displayName})`}
            onClick={() => step(index + 1)}
          >
            <ArrowRight className="size-[14px]" />
          </NavButton>
        </div>
      </div>
    </section>
  );
}

function NavButton({
  side,
  label,
  onClick,
  children,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const place =
    side === "left"
      ? "bottom-4 left-4 lg:bottom-auto lg:left-[calc(108*var(--u)_-_28px)] lg:top-[calc(577*var(--u)_-_28px)]"
      : "bottom-4 left-[76px] lg:bottom-auto lg:left-[calc(1332*var(--u)_-_28px)] lg:top-[calc(577*var(--u)_-_28px)]";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group absolute ${place} grid size-[48px] place-items-center rounded-full bg-white/90 text-text-heading lg:size-[56px] lg:bg-white`}
    >
      {/* Figma: rê chuột hiện quầng xanh 10% rộng 70px, 300ms */}
      <span
        aria-hidden
        className="absolute size-[62px] rounded-full bg-brand/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:size-[70px]"
      />
      <span className="relative">{children}</span>
    </button>
  );
}
