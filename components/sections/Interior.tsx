"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { bamDeChuyen } from "@/lib/slider";
import { interior, interiorCar, hotspotImage } from "@/lib/content";
import { VersionSwitch } from "@/components/VersionSwitch";

const CARD_W = 400;
const CARD_H = 260;

/**
 * Nội thất — ảnh cabin tràn viền, 5 điểm nóng. Rê chuột (hoặc chạm) vào một
 * điểm thì hiện thẻ 400×260 ngay phía trên nó, đúng vị trí trong bản thiết kế.
 * Khung thiết kế 1440×1200. Từ `xl` (1440) đúng toạ độ Figma; ở `lg` (800–1439,
 * laptop) cả khung co theo bề ngang qua đơn vị `--u` của `.canvas-1440`, nên 5
 * điểm nóng vẫn nằm đúng chỗ trên ảnh xe. Dưới `lg` đổi thành dải thẻ cuộn ngang.
 */
export function Interior({
  versionId,
  onVersion,
}: {
  /** Phiên bản đang xem (dùng chung cả trang) — quyết định ảnh xe và ảnh 5 điểm nóng. */
  versionId: string;
  onVersion: (id: string) => void;
}) {
  const { label, ghostTitle, background, shadow, hotspots } = interior;
  // Phiên bản chưa có ảnh riêng thì dùng ảnh mặc định (xem `interiorCar`, `hotspotImage`).
  const car = interiorCar(interior, versionId);
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
        height={1200}
        sizes="100vw"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="canvas-1440 relative mx-auto w-full max-w-[1440px] lg:aspect-[1440/1200]">
        {/* Ảnh xe bộ 25/09 đã có sẵn bóng đổ → lớp bóng riêng để trống thì không vẽ. */}
        {shadow.src && (
          <Image
            src={shadow.src}
            alt=""
            width={1440}
            height={1920}
            sizes="100vw"
            aria-hidden
            className="absolute inset-x-0 top-0 hidden h-[1920px] w-[1440px] max-w-none lg:top-[calc(45*var(--u))] lg:block lg:h-[calc(1920*var(--u))] lg:w-full"
          />
        )}
        {/* Bản dựng play: xe trôi lên từ dưới khi cuộn tới khối này. Ảnh xe bộ 25/09
            cắt sẵn đúng khung 1440×1200 (xe đã nằm đúng chỗ) nên đặt ở góc trên, không lệch. */}
        <motion.div
          className="absolute inset-x-0 top-0"
          initial={{ y: 140, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* key theo ảnh: đổi phiên bản có ảnh khác thì ảnh mới mờ dần hiện ra. */}
          <Image
            key={car.src}
            src={car.src}
            alt={car.alt}
            width={1440}
            height={1200}
            sizes="100vw"
            className="h-[900px] w-full object-cover motion-safe:animate-[fade-in_600ms_ease-out] lg:h-[calc(1200*var(--u))] lg:w-full"
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
          <div className="flex flex-col items-center gap-[12px] text-white lg:absolute lg:left-[calc(386*var(--u))] lg:top-[calc(80*var(--u))] lg:w-[calc(669*var(--u))]">
            <span className="flex items-center gap-[8px] text-body-md font-medium">
              <span aria-hidden className="h-px w-[24px] bg-white" />
              {label}
              <span aria-hidden className="h-px w-[24px] bg-white" />
            </span>
            <p className="text-[40px] font-medium uppercase leading-[46px] sm:text-[64px] sm:leading-[72px] lg:whitespace-nowrap lg:text-[calc(136*var(--u))] lg:leading-[calc(144*var(--u))]">
              {ghostTitle}
            </p>
          </div>

          {/* Chuyển nhanh phiên bản — máy tính: góc trên-phải khung 1440; điện thoại: dưới tiêu đề. */}
          <VersionSwitch
            versionId={versionId}
            onVersion={onVersion}
            tone="dark"
            className="mt-6 justify-center lg:absolute lg:right-[calc(80*var(--u))] lg:top-[calc(80*var(--u))] lg:mt-0"
          />

          {/* Điểm nóng — chỉ có ở màn rộng, vì toạ độ gắn với khung 1440.
              Toạ độ CMS (px khung 1440) nhân `--u`. Nút giữ 40px để dễ bấm nên
              neo theo TÂM: (x + 20)·u − 20px — ở 1440 đúng bằng x. Thẻ 400×260
              co theo nhưng không nhỏ hơn 320×208 để chữ mô tả còn đọc được. */}
          <div className="hidden lg:block">
            {hotspots.map((spot, i) => (
              <div
                key={spot.title}
                style={{ "--x": spot.x, "--y": spot.y } as React.CSSProperties}
              >
                <button
                  type="button"
                  aria-label={spot.title}
                  aria-expanded={open === i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((v) => (v === i ? null : v))}
                  onFocus={() => setHover(i)}
                  onClick={() => setPinned((v) => (v === i ? null : i))}
                  className="absolute left-[calc((var(--x)_+_20)*var(--u)_-_20px)] top-[calc((var(--y)_+_20)*var(--u)_-_20px)] grid size-[40px] place-items-center rounded-full bg-bg-soft/65 text-text-heading transition-colors duration-200 hover:bg-white"
                >
                  <PlusIcon open={open === i} />
                </button>

                {open === i && (
                  <figure
                    onMouseLeave={() => setHover(null)}
                    className="absolute left-[calc((var(--x)_+_20)*var(--u)_-_20px)] top-[calc((var(--y)_+_20)*var(--u)_-_20px_-_var(--card-h)_-_16*var(--u))] h-(--card-h) w-[max(320px,calc(400*var(--u)))] overflow-hidden rounded-[16px] bg-white [--card-h:max(208px,calc(260*var(--u)))] motion-safe:animate-[version-in_300ms_ease-out]"
                  >
                    <Image
                      src={hotspotImage(spot, versionId).src}
                      alt={hotspotImage(spot, versionId).alt}
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
                  src={hotspotImage(spot, versionId).src}
                  alt={hotspotImage(spot, versionId).alt}
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
