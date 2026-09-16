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
    <section id="dong-xe" className="relative bg-bg-soft">
      {/* NỀN tràn hết bề ngang. Figma PHÓNG ảnh gốc 2040×1532 lên 2812×2112 rồi
          đặt tại (-340,-536) trên khung 1440×951 — tức 195.28% × -23.61% / -56.36%.
          Phải giữ đúng cỡ phóng này: lấy nguyên cỡ tệp thì lọt chiếc xe thứ hai
          trong ảnh vào khung, sai hẳn thiết kế. Dùng phần trăm nên ở màn rộng ảnh
          được phóng to chứ không lộ thêm phần bên phải.
          Chiều dọc căn giữa khối (rồi bù 45px xuống) thay vì ghim `top` cứng: ghim
          cứng thì ở màn rộng ảnh phóng to nhưng khung nhìn đứng yên, xe tụt khỏi
          khung. Căn giữa cho ra đúng -536px ở 1440 và vẫn giữ xe trong khung ở 1920. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Image
          src={background.srcMobile || background.src}
          alt=""
          width={2812}
          height={2112}
          sizes="200vw"
          className="absolute inset-0 h-full w-full object-cover lg:left-[-23.61%] lg:top-1/2 lg:mt-[3.13vw] lg:h-auto lg:w-[195.28%] lg:max-w-none lg:-translate-y-1/2"
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[347px] bg-linear-to-b from-bg-soft to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[188px] bg-linear-to-t from-bg-soft to-transparent" />
      </div>

      {/* NỘI DUNG neo trong khung 1440 căn giữa */}
      <div className="relative mx-auto w-full max-w-[1440px] lg:h-[951px]">
        <div className="relative px-4 py-12 lg:h-full lg:px-0 lg:py-0">
          <div className="flex flex-col gap-[12px] lg:absolute lg:left-[80px] lg:top-[80px] lg:w-[686px]">
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-display-sm font-medium uppercase text-brand-deep lg:whitespace-nowrap">
              {heading} <span className="font-bold text-brand">{headingAccent}</span>
            </h2>
          </div>

          <div className="mt-10 lg:absolute lg:left-[735px] lg:top-[390px] lg:mt-0 lg:w-[590px]">
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-col">
                <span className="text-display-sm font-medium uppercase text-white">
                  {item.name}
                </span>
                <span className="text-[64px] font-normal uppercase leading-[72px] text-white lg:text-[136px] lg:leading-[144px]">
                  {item.code}
                </span>
              </div>
              <div className="flex w-fit items-center gap-[8px] rounded-[4px] bg-brand px-[8px] py-[6px] lg:h-[32px] lg:py-0">
                <span className="text-body-md text-white">{priceLabel}</span>
                <span className="text-heading-md font-semibold text-white">{item.price}</span>
              </div>
            </div>

            <dl className="mt-[24px] flex w-fit flex-wrap items-center gap-[16px] rounded-[8px] bg-white/60 px-[24px] py-[21px] backdrop-blur-[2px] lg:mt-[32px] lg:h-[97px] lg:w-[590px] lg:flex-nowrap lg:justify-between lg:gap-0">
              {item.specs.map((spec, i) => (
                <div key={spec.label} className="flex items-center gap-[16px]">
                  {i > 0 && (
                    <span aria-hidden className="hidden h-[56px] w-px bg-text-heading/20 lg:block" />
                  )}
                  <div className="flex flex-col gap-[4px] whitespace-nowrap">
                    <dd className="text-heading-md font-semibold text-brand">{spec.value}</dd>
                    <dt className="text-body-md font-medium text-text-heading">{spec.label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 flex items-center gap-[16px] text-body-md text-text-heading lg:absolute lg:left-[634px] lg:top-[888px] lg:mt-0">
            <span className="font-semibold">{String(index + 1).padStart(2, "0")}</span>
            <span>{item.displayName}</span>
          </div>

          <button
            type="button"
            aria-label="Phiên bản trước"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 grid size-[56px] -translate-y-1/2 place-items-center rounded-full bg-stroke-soft text-text-heading transition-colors hover:bg-white lg:left-[80px] lg:top-[549px] lg:translate-y-0"
          >
            <ArrowLeft className="size-[14px]" />
          </button>
          <button
            type="button"
            aria-label="Phiên bản kế tiếp"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 grid size-[56px] -translate-y-1/2 place-items-center rounded-full bg-white text-text-heading transition-colors hover:bg-brand hover:text-white lg:left-[1304px] lg:right-auto lg:top-[549px] lg:translate-y-0"
          >
            <ArrowRight className="size-[14px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
