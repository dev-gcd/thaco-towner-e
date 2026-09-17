"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { exterior } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Car360 } from "@/components/Car360";

/**
 * Ngoại thất = 2 khối chồng nhau (khung thiết kế 1440×2000):
 *  · 0–1025  : ảnh xe toàn cảnh + thanh trượt xoay 360°
 *  · 1025–2000: tiêu đề lớn + băng chuyền chi tiết (thẻ lớn 900 + thẻ hé 340)
 */
/** Figma: đổi thẻ 833ms, nhịp lò xo SLOW. */
const SWAP = { duration: 0.833, ease: [0.22, 1, 0.36, 1] } as const;

export function Exterior() {
  const { label, ghostTitle, view360, heading, headingAccent, description, items } = exterior;
  const [frame, setFrame] = useState(0);
  const [index, setIndex] = useState(0);

  const hasFrames = view360.frames.length > 1;
  const go = (n: number) => setIndex(((n % items.length) + items.length) % items.length);
  // Thẻ đang xem luôn đứng đầu; các thẻ còn lại xếp sau dưới dạng thẻ hé.
  const ordered = [...items.slice(index), ...items.slice(0, index)];

  return (
    <section id="ngoai-that" className="bg-white">
      {/* ── Khối 1: ảnh toàn cảnh + thanh trượt 360° ───────────── */}
      {/* Ảnh tràn hết bề ngang; chữ và thanh trượt neo trong khung 1440. */}
      <div className="relative w-full lg:h-[1025px]">
        <div className="relative h-[380px] sm:h-[520px] md:h-[620px] lg:absolute lg:inset-x-0 lg:top-[65px] lg:h-[960px]">
          <Image
            src={view360.background.srcMobile || view360.background.src}
            alt={view360.background.alt}
            width={1440}
            height={960}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[244px] bg-linear-to-b from-white to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[352px] bg-linear-to-t from-white to-transparent"
          />
          <Car360
            frames={view360.frames}
            fallbackSrc={view360.car.src}
            alt={view360.car.alt}
            frame={frame}
            onFrame={setFrame}
            className="absolute inset-0 outline-none"
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-4 pt-10 lg:absolute lg:inset-x-0 lg:top-[80px] lg:px-[80px] lg:pt-0">
          <SectionLabel>{label}</SectionLabel>
          <p className="text-[40px] font-medium uppercase leading-[46px] text-brand-deep sm:text-[64px] sm:leading-[72px] lg:text-[136px] lg:leading-[144px]">
            {ghostTitle}
          </p>
        </div>

        {hasFrames && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-[32px] lg:absolute lg:inset-x-0 lg:top-[889px] lg:mt-0 lg:mx-auto">
            <RoundButton label="Xoay trái" onClick={() => setFrame((f) => (f - 1 + view360.frames.length) % view360.frames.length)}>
              <ArrowLeft className="size-[14px]" />
            </RoundButton>
            <input
              type="range"
              min={0}
              max={view360.frames.length - 1}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              aria-label="Xoay xe 360 độ"
              className="h-[4px] w-[260px] cursor-pointer appearance-none rounded-full bg-stroke-mute accent-brand"
            />
            <RoundButton label="Xoay phải" onClick={() => setFrame((f) => (f + 1) % view360.frames.length)}>
              <ArrowRight className="size-[14px]" />
            </RoundButton>
          </div>
        )}
      </div>

      {/* ── Khối 2: tiêu đề + băng chuyền chi tiết ─────────────── */}
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-12 pt-10 sm:pt-14 lg:h-[975px] lg:px-0 lg:pb-0 lg:pt-0">
        <div className="flex flex-col gap-[32px] lg:absolute lg:left-[80px] lg:top-0 lg:w-[797px]">
          <h2 className="flex flex-col gap-[4px] text-[28px] font-extrabold uppercase leading-[34px] sm:gap-[8px] sm:text-[40px] sm:leading-[48px] lg:text-[64px] lg:leading-[72px]">
            <span className="text-brand-deep">{heading}</span>
            <span className="text-brand">{headingAccent}</span>
          </h2>
          <p className="text-body-md font-medium text-text-heading">{description}</p>
        </div>

        {/* Bản dựng play: bấm thẻ hé thì hai thẻ ĐỔI CHỖ và đổi cỡ mượt
            (900 ↔ 340), 833ms. Dùng hiệu ứng layout của motion để cả vị trí lẫn
            bề rộng cùng chạy, thay vì đổi ảnh tức thì như trước. */}
        {/* Điện thoại: khách cuộn từ trên xuống nên hiện ĐỦ mọi mục theo đúng thứ
            tự, mục nào cũng sáng, không có bấm-để-đổi và không có thẻ tối. */}
        <ol className="mt-10 flex flex-col gap-[32px] md:hidden">
          {items.map((item, i) => (
            <li key={item.title} className="flex flex-col gap-[16px]">
              <div className="relative aspect-[900/506] overflow-hidden rounded-[16px]">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={900}
                  height={506}
                  sizes="100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className="flex items-center gap-[8px]">
                  <span className="shrink-0 text-heading-sm font-semibold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-[2px] w-[24px] shrink-0 bg-brand" />
                  <span className="text-heading-sm font-semibold text-text-heading">
                    {item.title}
                  </span>
                </span>
                <p className="text-body-md text-text-heading">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Từ máy tính bảng trở lên: giữ cơ chế đổi thẻ như bản dựng play. */}
        <div className="mt-10 hidden md:block lg:absolute lg:left-[80px] lg:top-[284px] lg:mt-0 lg:w-[1280px]">
          <div className="flex flex-row gap-[20px] lg:gap-[40px]">
            {ordered.map((item, pos) => {
              const active = pos === 0;
              const so = String((items.indexOf(item) % items.length) + 1).padStart(2, "0");
              return (
                <motion.div
                  key={item.title}
                  layout
                  transition={SWAP}
                  onClick={() => !active && go(index + pos)}
                  className={`flex flex-col gap-[20px] lg:gap-[40px] ${
                    active ? "md:flex-1 lg:w-[900px] lg:flex-none" : "group cursor-pointer md:w-[36%] lg:w-[340px]"
                  }`}
                >
                  <motion.div
                    layout
                    transition={SWAP}
                    className="relative aspect-[900/506] overflow-hidden rounded-[16px] lg:aspect-auto lg:h-[506px]"
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={900}
                      height={506}
                      sizes="(max-width: 1439px) 100vw, 900px"
                      className="absolute inset-0 h-full w-full max-w-none object-cover lg:w-[900px]"
                    />
                    {!active && (
                      <>
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-[#2e2e2e]/60 transition-colors duration-200 group-hover:bg-[#2e2e2e]/80"
                        />
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-1/2 grid size-[56px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          <ArrowRight className="size-[14px]" />
                        </span>
                      </>
                    )}
                  </motion.div>

                  <motion.figcaption layout transition={SWAP} className="flex flex-col gap-[16px]">
                    <span className="flex min-w-0 items-center gap-[8px]">
                      <span className="shrink-0 text-heading-md font-semibold text-brand">{so}</span>
                      <span
                        aria-hidden
                        className={`h-[2px] shrink-0 bg-brand ${active ? "w-[32px]" : "w-[10px]"}`}
                      />
                      <span className="min-w-0 truncate text-heading-md font-semibold text-text-heading">
                        {item.title}
                      </span>
                    </span>
                    {active && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="max-w-[718px] text-body-md text-text-heading"
                      >
                        {item.description}
                      </motion.p>
                    )}
                  </motion.figcaption>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoundButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group relative grid size-[56px] place-items-center rounded-full bg-white text-text-heading shadow-[0_4px_16px_rgba(30,126,216,0.12)]"
    >
      <span
        aria-hidden
        className="absolute size-[70px] rounded-full bg-brand/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative">{children}</span>
    </button>
  );
}
