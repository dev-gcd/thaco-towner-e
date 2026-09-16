"use client";

import Image from "next/image";
import { useState } from "react";
import { exterior } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";

/**
 * Ngoại thất = 2 khối chồng nhau (khung thiết kế 1440×2000):
 *  · 0–1025  : ảnh xe toàn cảnh + thanh trượt xoay 360°
 *  · 1025–2000: tiêu đề lớn + băng chuyền chi tiết (thẻ lớn 900 + thẻ hé 340)
 */
export function Exterior() {
  const { label, ghostTitle, view360, heading, headingAccent, description, items } = exterior;
  const [frame, setFrame] = useState(0);
  const [index, setIndex] = useState(0);

  const hasFrames = view360.frames.length > 1;
  const carSrc = hasFrames ? view360.frames[frame] : view360.car.src;
  const active = items[index];
  const next = items[(index + 1) % items.length];
  const go = (n: number) => setIndex(((n % items.length) + items.length) % items.length);

  return (
    <section id="ngoai-that" className="bg-white">
      {/* ── Khối 1: ảnh toàn cảnh + thanh trượt 360° ───────────── */}
      {/* Ảnh tràn hết bề ngang; chữ và thanh trượt neo trong khung 1440. */}
      <div className="relative w-full lg:h-[1025px]">
        <div className="relative h-[280px] sm:h-[420px] lg:absolute lg:inset-x-0 lg:top-[65px] lg:h-[960px]">
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
          <Image
            src={carSrc}
            alt={view360.car.alt}
            width={1440}
            height={960}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-contain object-bottom"
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-4 pt-10 lg:absolute lg:inset-x-0 lg:top-[80px] lg:px-[80px] lg:pt-0">
          <SectionLabel>{label}</SectionLabel>
          <p className="text-[64px] font-medium uppercase leading-[72px] text-brand-deep lg:text-[136px] lg:leading-[144px]">
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
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-12 lg:h-[975px] lg:px-0 lg:pb-0">
        <div className="flex flex-col gap-[32px] lg:absolute lg:left-[80px] lg:top-0 lg:w-[797px]">
          <h2 className="flex flex-col gap-[8px] text-[40px] font-extrabold uppercase leading-[48px] lg:text-[64px] lg:leading-[72px]">
            <span className="text-brand-deep">{heading}</span>
            <span className="text-brand">{headingAccent}</span>
          </h2>
          <p className="text-body-md font-medium text-text-heading">{description}</p>
        </div>

        <div className="mt-10 flex gap-[40px] lg:absolute lg:left-[80px] lg:top-[284px] lg:mt-0 lg:w-[1280px]">
          <figure className="flex w-full flex-col gap-[40px] lg:w-[900px]">
            <div className="relative aspect-[900/506] overflow-hidden rounded-[16px] transition-opacity duration-[833ms] [transition-timing-function:var(--ease-slow)]">
              <Image
                src={active.image.src}
                alt={active.image.alt}
                width={900}
                height={506}
                sizes="(max-width: 1023px) 100vw, 900px"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption className="flex flex-col gap-[16px]">
              <span className="flex items-center gap-[8px]">
                <span className="text-heading-md font-semibold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-[2px] w-[32px] bg-brand" />
                <span className="text-heading-md font-semibold text-text-heading">
                  {active.title}
                </span>
              </span>
              <p className="max-w-[718px] text-body-md text-text-heading">
                {active.description}
              </p>
            </figcaption>
          </figure>

          {/* Thẻ hé bên phải — bấm để chuyển */}
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="group hidden w-[340px] shrink-0 flex-col gap-[40px] self-start text-left lg:flex"
          >
            <span className="relative block h-[506px] overflow-hidden rounded-[16px]">
              <Image
                src={next.image.src}
                alt={next.image.alt}
                width={900}
                height={506}
                sizes="340px"
                className="absolute inset-0 size-full object-cover"
              />
              {/* Figma: lớp phủ đậm dần 60% → 80% và hiện nút mũi tên khi rê chuột (200ms) */}
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
            </span>
            <span className="flex min-w-0 items-center gap-[8px]">
              <span className="shrink-0 text-heading-md font-semibold text-brand">
                {String(((index + 1) % items.length) + 1).padStart(2, "0")}
              </span>
              <span aria-hidden className="h-[2px] w-[10px] shrink-0 bg-brand" />
              {/* Thẻ hé chỉ rộng 340px — giữ đúng 1 dòng như Figma, dài quá thì cắt bớt */}
              <span className="min-w-0 truncate text-heading-md font-semibold text-text-heading">
                {next.title}
              </span>
            </span>
          </button>
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
