"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { bamDeChuyen } from "@/lib/slider";
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
  const daiNgang = useRef<HTMLDivElement>(null);
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
        {/* Bản dựng play: xe trôi lên từ dưới khi cuộn tới khối này. */}
        <motion.div
          className="absolute inset-x-0 top-0 lg:top-[45px]"
          initial={{ y: 140, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={car.src}
            alt={car.alt}
            width={1440}
            height={1917}
            sizes="100vw"
            className="h-[900px] w-full object-cover lg:h-[1917px] lg:w-[1440px] lg:max-w-none"
          />
        </motion.div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-linear-to-b from-black/70 to-transparent"
        />
        {/* Figma: 5 biến thể mở thẻ đều thêm lớp `Cover` #2e2e2e 70% phủ toàn khối
            để làm nổi thẻ đang xem. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-[#2e2e2e] transition-opacity duration-300 ${
            open === null ? "opacity-0" : "opacity-70"
          }`}
        />

        <div className="relative px-4 py-12 lg:h-full lg:px-0 lg:py-0">
          <div className="flex flex-col items-center gap-[12px] text-white lg:absolute lg:left-[386px] lg:top-[80px] lg:w-[669px]">
            <span className="flex items-center gap-[8px] text-body-md font-medium">
              <span aria-hidden className="h-px w-[24px] bg-white" />
              {label}
              <span aria-hidden className="h-px w-[24px] bg-white" />
            </span>
            <p className="text-[40px] font-medium uppercase leading-[46px] sm:text-[64px] sm:leading-[72px] lg:whitespace-nowrap lg:text-[136px] lg:leading-[144px]">
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

          {/* Bản điện thoại: không đặt được điểm nóng theo toạ độ khung 1440 nên
              cho 5 thẻ CUỘN NGANG — vuốt bằng ngón tay, khối ngắn lại một nửa và
              ảnh xe phía sau vẫn nhìn được. */}
          <div
            ref={daiNgang}
            className="relative mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-pl-4 px-4 pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          >
            {hotspots.map((spot) => (
              <figure
                key={spot.title}
                onClick={(e) => bamDeChuyen(e, daiNgang.current)}
                className="relative h-[240px] w-[280px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[16px] bg-white sm:h-[260px] sm:w-[320px]"
              >
                <Image
                  src={spot.image.src}
                  alt={spot.image.alt}
                  width={CARD_W}
                  height={CARD_H}
                  sizes="320px"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[137px] bg-linear-to-t from-black/80 to-transparent"
                />
                <figcaption className="absolute inset-x-[16px] bottom-[16px] flex flex-col gap-[4px] text-white">
                  <span className="text-body-md font-semibold uppercase">{spot.title}</span>
                  <span className="text-body-sm">{spot.description}</span>
                </figcaption>
              </figure>
            ))}
          </div>
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
