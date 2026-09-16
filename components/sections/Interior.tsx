"use client";

import Image from "next/image";
import { useState } from "react";
import { interior } from "@/lib/content";

const CARD_W = 400;
const CARD_H = 260;
const CARD_GAP = 16;

/**
 * Nội thất — ảnh cabin tràn viền, 5 điểm nóng. Rê chuột (hoặc chạm) vào một
 * điểm thì hiện thẻ 400×260 ngay phía trên nó, đúng vị trí trong bản thiết kế.
 * Khung thiết kế 1440×1200; dưới `lg` đổi thành danh sách thẻ xếp dọc.
 */
export function Interior() {
  const { label, ghostTitle, background, car, shadow, hotspots } = interior;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="noi-that" className="relative overflow-hidden bg-black">
      <div className="relative mx-auto w-full max-w-[1440px] dsk:h-[1200px]">
        <Image
          src={background.srcMobile || background.src}
          alt={background.alt}
          width={1440}
          height={1917}
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-[900px] w-full object-cover dsk:h-[1917px] dsk:w-[1440px] dsk:max-w-none"
        />
        <Image
          src={shadow.src}
          alt=""
          width={1440}
          height={1920}
          sizes="100vw"
          aria-hidden
          className="absolute inset-x-0 top-0 hidden h-[1920px] w-[1440px] max-w-none dsk:block dsk:top-[45px]"
        />
        <Image
          src={car.src}
          alt={car.alt}
          width={1440}
          height={1917}
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-[900px] w-full object-cover dsk:top-[45px] dsk:h-[1917px] dsk:w-[1440px] dsk:max-w-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-linear-to-b from-black/70 to-transparent"
        />

        <div className="relative px-4 py-12 dsk:h-full dsk:px-0 dsk:py-0">
          <div className="flex flex-col items-center gap-[12px] text-white dsk:absolute dsk:left-[386px] dsk:top-[80px] dsk:w-[669px]">
            <span className="flex items-center gap-[8px] text-body-md font-medium">
              <span aria-hidden className="h-px w-[24px] bg-white" />
              {label}
              <span aria-hidden className="h-px w-[24px] bg-white" />
            </span>
            <p className="text-[64px] font-medium uppercase leading-[72px] dsk:whitespace-nowrap dsk:text-[136px] dsk:leading-[144px]">
              {ghostTitle}
            </p>
          </div>

          {/* Điểm nóng — chỉ có ở màn rộng, vì toạ độ gắn với khung 1440 */}
          <div className="hidden dsk:block">
            {hotspots.map((spot, i) => (
              <div key={spot.title}>
                <button
                  type="button"
                  aria-label={spot.title}
                  aria-expanded={open === i}
                  onMouseEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="absolute grid size-[40px] place-items-center rounded-full bg-bg-soft/65 text-text-heading transition-colors hover:bg-white"
                  style={{ left: spot.x, top: spot.y }}
                >
                  <PlusIcon />
                </button>

                {open === i && (
                  <figure
                    onMouseLeave={() => setOpen(null)}
                    className="absolute overflow-hidden rounded-[16px] bg-white"
                    style={{
                      left: spot.x,
                      top: spot.y - CARD_H - CARD_GAP,
                      width: CARD_W,
                      height: CARD_H,
                    }}
                  >
                    <Image
                      src={spot.image.src}
                      alt={spot.image.alt}
                      width={CARD_W}
                      height={CARD_H}
                      sizes="400px"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[137px] bg-linear-to-t from-black/80 to-transparent"
                    />
                    <figcaption className="absolute inset-x-[16px] bottom-[16px] flex flex-col gap-[4px] text-white">
                      <span className="text-body-md font-semibold uppercase">{spot.title}</span>
                      <span className="text-body-md">{spot.description}</span>
                    </figcaption>
                  </figure>
                )}
              </div>
            ))}
          </div>

          {/* Bản điện thoại: danh sách thẻ */}
          <ul className="relative mt-8 grid gap-4 sm:grid-cols-2 dsk:hidden">
            {hotspots.map((spot) => (
              <li
                key={spot.title}
                className="relative h-[260px] overflow-hidden rounded-[16px] bg-white"
              >
                <Image
                  src={spot.image.src}
                  alt={spot.image.alt}
                  width={CARD_W}
                  height={CARD_H}
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[137px] bg-linear-to-t from-black/80 to-transparent"
                />
                <div className="absolute inset-x-[16px] bottom-[16px] flex flex-col gap-[4px] text-white">
                  <span className="text-body-md font-semibold uppercase">{spot.title}</span>
                  <span className="text-body-md">{spot.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden className="size-[14px]">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
