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
  // Rê chuột = xem lướt; bấm = ghim lại (Figma có riêng trạng thái Click, dấu
  // cộng thu thành dấu trừ). Thẻ hiện khi được ghim, hoặc khi đang rê.
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const open = pinned ?? hover;

  return (
    <section id="noi-that" className="relative overflow-hidden bg-black">
      {/* NỀN đường nhựa tràn hết bề ngang. Ảnh xe + các điểm nóng neo trong khung
          1440 vì toạ độ điểm nóng gắn với khung đó. */}
      <Image
        src={background.srcMobile || background.src}
        alt=""
        width={1440}
        height={1917}
        sizes="100vw"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative mx-auto w-full max-w-[1440px] lg:h-[1200px]">
        <Image
          src={shadow.src}
          alt=""
          width={1440}
          height={1920}
          sizes="100vw"
          aria-hidden
          className="absolute inset-x-0 top-0 hidden h-[1920px] w-[1440px] max-w-none lg:block lg:top-[45px]"
        />
        <Image
          src={car.src}
          alt={car.alt}
          width={1440}
          height={1917}
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-[900px] w-full object-cover lg:top-[45px] lg:h-[1917px] lg:w-[1440px] lg:max-w-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-linear-to-b from-black/70 to-transparent"
        />

        <div className="relative px-4 py-12 lg:h-full lg:px-0 lg:py-0">
          <div className="flex flex-col items-center gap-[12px] text-white lg:absolute lg:left-[386px] lg:top-[80px] lg:w-[669px]">
            <span className="flex items-center gap-[8px] text-body-md font-medium">
              <span aria-hidden className="h-px w-[24px] bg-white" />
              {label}
              <span aria-hidden className="h-px w-[24px] bg-white" />
            </span>
            <p className="text-[64px] font-medium uppercase leading-[72px] lg:whitespace-nowrap lg:text-[136px] lg:leading-[144px]">
              {ghostTitle}
            </p>
          </div>

          {/* Điểm nóng — chỉ có ở màn rộng, vì toạ độ gắn với khung 1440 */}
          <div className="hidden lg:block">
            {hotspots.map((spot, i) => (
              <div key={spot.title}>
                <button
                  type="button"
                  aria-label={spot.title}
                  aria-expanded={open === i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((v) => (v === i ? null : v))}
                  onFocus={() => setHover(i)}
                  onClick={() => setPinned((v) => (v === i ? null : i))}
                  className="absolute grid size-[40px] place-items-center rounded-full bg-bg-soft/65 text-text-heading transition-colors duration-200 hover:bg-white"
                  style={{ left: spot.x, top: spot.y }}
                >
                  <PlusIcon open={open === i} />
                </button>

                {open === i && (
                  <figure
                    onMouseLeave={() => setHover(null)}
                    className="absolute overflow-hidden rounded-[16px] bg-white motion-safe:animate-[version-in_300ms_ease-out]"
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
          <ul className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:hidden">
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

/** Figma: khi mở thẻ, dấu cộng thu lại thành dấu trừ trong 300ms. */
function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden className="size-[14px]">
      <path d="M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7 1v12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className={`origin-center transition-transform duration-300 ${open ? "scale-y-0" : "scale-y-100"}`}
      />
    </svg>
  );
}
