"use client";

import Image from "next/image";
import { useState } from "react";
import { versions } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";

/**
 * Dòng xe — mỗi phiên bản một bảng thông số, chuyển bằng 2 nút mũi tên hai bên.
 * Khung thiết kế 1440×951. Ảnh nền 2812×2112 đặt lệch (-340,-536) đúng như Figma;
 * hai lớp chuyển màu #f9fcff làm mềm mép trên/dưới cho ăn với nền khối bên cạnh.
 */
export function Versions() {
  const { label, heading, headingAccent, background, priceLabel, items } = versions;
  const [index, setIndex] = useState(0);
  const item = items[index];
  const go = (n: number) => setIndex(((n % items.length) + items.length) % items.length);

  return (
    <section id="dong-xe" className="relative overflow-hidden bg-bg-soft">
      <div className="relative mx-auto w-full max-w-[1440px] dsk:h-[951px]">
        <Image
          src={background.srcMobile || background.src}
          alt={background.alt}
          width={2812}
          height={2112}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover dsk:left-[-340px] dsk:top-[-536px] dsk:h-[2112px] dsk:w-[2812px] dsk:max-w-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[347px] bg-linear-to-b from-bg-soft to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[188px] bg-linear-to-t from-bg-soft to-transparent"
        />

        <div className="relative px-4 py-12 dsk:h-full dsk:px-0 dsk:py-0">
          <div className="flex flex-col gap-[12px] dsk:absolute dsk:left-[80px] dsk:top-[80px] dsk:w-[686px]">
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-display-sm font-medium uppercase text-brand-deep dsk:whitespace-nowrap">
              {heading} <span className="font-bold text-brand">{headingAccent}</span>
            </h2>
          </div>

          <div className="mt-10 dsk:absolute dsk:left-[735px] dsk:top-[390px] dsk:mt-0 dsk:w-[590px]">
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-col">
                <span className="text-display-sm font-medium uppercase text-white">
                  {item.name}
                </span>
                <span className="text-[64px] font-normal uppercase leading-[72px] text-white dsk:text-[136px] dsk:leading-[144px]">
                  {item.code}
                </span>
              </div>
              <div className="flex w-fit items-center gap-[8px] rounded-[4px] bg-brand px-[8px] py-[6px]">
                <span className="text-body-md text-white">{priceLabel}</span>
                <span className="text-heading-md font-semibold text-white">{item.price}</span>
              </div>
            </div>

            <dl className="mt-[32px] flex w-fit flex-wrap items-center gap-[24px] rounded-[8px] bg-white/60 px-[24px] py-[21px] backdrop-blur-[2px] dsk:flex-nowrap">
              {item.specs.map((spec, i) => (
                <div key={spec.label} className="flex items-center gap-[24px]">
                  {i > 0 && (
                    <span aria-hidden className="hidden h-[56px] w-px bg-text-heading/20 dsk:block" />
                  )}
                  <div className="flex flex-col gap-[4px] whitespace-nowrap">
                    <dd className="text-heading-md font-semibold text-brand">{spec.value}</dd>
                    <dt className="text-body-md font-medium text-text-heading">{spec.label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 flex items-center gap-[16px] text-body-md text-text-heading dsk:absolute dsk:left-[634px] dsk:top-[888px] dsk:mt-0">
            <span className="font-semibold">{String(index + 1).padStart(2, "0")}</span>
            <span>{item.displayName}</span>
          </div>

          <button
            type="button"
            aria-label="Phiên bản trước"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 grid size-[56px] -translate-y-1/2 place-items-center rounded-full bg-stroke-soft text-text-heading transition-colors hover:bg-white dsk:left-[80px] dsk:top-[549px] dsk:translate-y-0"
          >
            <ArrowLeft className="size-[14px]" />
          </button>
          <button
            type="button"
            aria-label="Phiên bản kế tiếp"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 grid size-[56px] -translate-y-1/2 place-items-center rounded-full bg-white text-text-heading transition-colors hover:bg-brand hover:text-white dsk:left-[1304px] dsk:right-auto dsk:top-[549px] dsk:translate-y-0"
          >
            <ArrowRight className="size-[14px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
