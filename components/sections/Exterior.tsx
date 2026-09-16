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
      <div className="relative mx-auto w-full max-w-[1440px] dsk:h-[1025px]">
        <div className="relative h-[280px] sm:h-[420px] dsk:absolute dsk:inset-x-0 dsk:top-[65px] dsk:h-[960px]">
          <Image
            src={view360.background.srcMobile || view360.background.src}
            alt={view360.background.alt}
            width={1440}
            height={960}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
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
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        <div className="relative flex flex-col gap-[12px] px-4 pt-10 dsk:absolute dsk:left-[80px] dsk:top-[80px] dsk:px-0 dsk:pt-0">
          <SectionLabel>{label}</SectionLabel>
          <p className="text-[64px] font-medium uppercase leading-[72px] text-brand-deep dsk:text-[136px] dsk:leading-[144px]">
            {ghostTitle}
          </p>
        </div>

        {hasFrames && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-[32px] dsk:absolute dsk:left-[502px] dsk:top-[889px] dsk:mt-0">
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
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-12 dsk:h-[975px] dsk:px-0 dsk:pb-0">
        <div className="flex flex-col gap-[32px] dsk:absolute dsk:left-[80px] dsk:top-0 dsk:w-[797px]">
          <h2 className="flex flex-col gap-[8px] text-[40px] font-extrabold uppercase leading-[48px] dsk:text-[64px] dsk:leading-[72px]">
            <span className="text-brand-deep">{heading}</span>
            <span className="text-brand">{headingAccent}</span>
          </h2>
          <p className="text-body-md font-medium text-text-heading">{description}</p>
        </div>

        <div className="mt-10 flex gap-[40px] dsk:absolute dsk:left-[80px] dsk:top-[284px] dsk:mt-0 dsk:w-[1280px]">
          <figure className="flex w-full flex-col gap-[40px] dsk:w-[900px]">
            <div className="relative aspect-[900/506] overflow-hidden rounded-[16px]">
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
            className="hidden w-[340px] shrink-0 flex-col gap-[40px] text-left dsk:flex"
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
              <span aria-hidden className="absolute inset-0 bg-[#2e2e2e]/60" />
            </span>
            <span className="flex items-center gap-[8px]">
              <span className="text-heading-md font-semibold text-brand">
                {String(((index + 1) % items.length) + 1).padStart(2, "0")}
              </span>
              <span aria-hidden className="h-[2px] w-[10px] bg-brand" />
              <span className="text-heading-md font-semibold text-text-heading">
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
      className="grid size-[56px] place-items-center rounded-full bg-white text-text-heading shadow-[0_4px_16px_rgba(30,126,216,0.12)] transition-colors hover:bg-brand hover:text-white"
    >
      {children}
    </button>
  );
}
