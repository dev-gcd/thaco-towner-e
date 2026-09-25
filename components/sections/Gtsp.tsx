"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { gtsp } from "@/lib/content";
import { ArrowRight } from "@/components/icons";

/** Figma play: xe chạy vào từ mép phải ~1,6s rồi chữ mới hiện. */
const DRIVE = { duration: 1.6, ease: [0.16, 1, 0.3, 1] } as const;
const WHEEL = { duration: 1.6, ease: [0.16, 1, 0.3, 1] } as const;

/**
 * Khối giới thiệu sản phẩm — thẻ trắng bo góc 16px nằm trên quầng xanh 10%.
 * Khung thiết kế 1440×684; thẻ 1280×444 đặt ở 80,120. Từ `lg` (800) bố cục này co theo
 * `--u` (khối gắn `.canvas-1440`); chữ co theo nhưng có cỡ sàn.
 */
export function Gtsp({ onCtaClick }: { onCtaClick?: () => void }) {
  const { title, description, ctaLabel, background, car, wheelFront, wheelRear } = gtsp;

  return (
    <section id="gioi-thieu" className="canvas-1440 bg-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 lg:h-[calc(684*var(--u))] lg:px-0 lg:py-0">
        <div className="relative lg:h-full">
          {/* Quầng xanh nhạt phía sau thẻ */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[calc(60*var(--u))] top-[calc(100*var(--u))] hidden h-[calc(484*var(--u))] w-[calc(1320*var(--u))] rounded-[calc(26*var(--u))] bg-brand/10 lg:block"
          />

          <div className="relative overflow-hidden rounded-[16px] bg-white lg:absolute lg:left-[calc(80*var(--u))] lg:top-[calc(120*var(--u))] lg:h-[calc(444*var(--u))] lg:w-[calc(1280*var(--u))]">
            <Image
              src={background.srcMobile || background.src}
              alt={background.alt}
              width={1280}
              height={444}
              sizes="(max-width: 1023px) 100vw, 1280px"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Mảng trắng 30% làm sáng nửa trái để chữ đọc rõ */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-[317px] w-[753px] bg-white/30 lg:h-[calc(317*var(--u))] lg:w-[calc(753*var(--u))]"
            />

            {/* Xe chạy vào từ mép phải, hai bánh quay theo — bánh là ảnh rời nên
                quay được thật. Cả cụm trượt cùng nhau để xe và bánh không lệch.
                Xe đi sang TRÁI nên bánh quay ngược chiều kim đồng hồ (720° → 0°),
                dừng ở 0° = đúng tư thế trong ảnh xe.
                Ảnh xe (bộ ảnh 25/09) là 1 lớp PHỦ CẢ THẺ 2280×791 (cùng khổ ảnh nền), bánh
                đã vẽ sẵn trong ảnh. Hai lớp bánh là hình tròn cắt từ CHÍNH ảnh xe đó, đặt
                đè đúng chỗ (đo tâm vành: trước 1197,600 · sau 1897.5,608 trên tệp 2280;
                quy về thẻ 1280 bằng ×0.5614). Đổi ảnh xe thì phải cắt + đo lại 2 bánh. */}
            <motion.div
              aria-hidden
              className="pointer-events-none hidden lg:block"
              // Lệch theo % bề rộng thẻ (900/1280), không px cố định: ở laptop thẻ hẹp
              // hơn 900px thì cả cụm nằm ngoài thẻ, không bao giờ "lọt vào tầm nhìn"
              // nên xe không chạy vào (đo được ở 800px).
              initial={{ x: "70.3125%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={DRIVE}
            >
              <Image
                src={car.src}
                alt={car.alt}
                width={2280}
                height={791}
                className="absolute left-0 top-0 h-[calc(444*var(--u))] w-[calc(1280*var(--u))] max-w-none"
              />
              <motion.span
                className="absolute left-[calc(631*var(--u))] top-[calc(295.9*var(--u))] block size-[calc(82*var(--u))]"
                initial={{ rotate: 720 }}
                whileInView={{ rotate: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={WHEEL}
              >
                <Image src={wheelFront.src} alt="" width={146} height={146} className="size-full max-w-none" />
              </motion.span>
              <motion.span
                className="absolute left-[calc(1025.7*var(--u))] top-[calc(301.5*var(--u))] block size-[calc(79.7*var(--u))]"
                initial={{ rotate: 720 }}
                whileInView={{ rotate: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={WHEEL}
              >
                <Image src={wheelRear.src} alt="" width={142} height={142} className="size-full max-w-none" />
              </motion.span>
            </motion.div>

            <motion.div
              className="relative flex flex-col gap-[28px] p-6 lg:absolute lg:left-[calc(64*var(--u))] lg:top-[calc(48*var(--u))] lg:w-[calc(505*var(--u))] lg:gap-[calc(28*var(--u))] lg:p-0"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col gap-[11px] lg:gap-[calc(11*var(--u))]">
                <h2 className="whitespace-pre-line text-heading-lg font-bold uppercase text-brand-deep sm:text-display-sm lg:text-[length:max(20px,calc(32*var(--u)))] lg:leading-[1.25]">
                  {title}
                </h2>
                <p className="text-body-lg text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">{description}</p>
              </div>
              <button
                type="button"
                onClick={onCtaClick}
                className="inline-flex h-[40px] w-fit items-center gap-[6px] rounded-full bg-brand px-6 text-body-md font-medium text-white transition-colors duration-200 hover:bg-brand-deep"
              >
                {ctaLabel}
                <ArrowRight className="size-5" />
              </button>
            </motion.div>

            {/* Ảnh xe bản điện thoại: nằm dưới chữ cho khỏi che. Ảnh xe phủ cả thẻ nên
                cắt bằng khung: chỉ lấy vùng có xe (1079,234 → 1037×445 trên tệp 2280×791). */}
            <div className="relative mx-auto mb-6 w-[calc(100%-32px)] max-w-[420px] lg:hidden">
              <div className="relative aspect-[1037/445] overflow-hidden">
                <Image
                  src={car.src}
                  alt={car.alt}
                  width={2280}
                  height={791}
                  className="absolute left-[-104.05%] top-[-52.58%] h-auto w-[219.86%] max-w-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto hidden h-px max-w-[1280px] bg-stroke lg:block lg:max-w-[calc(1280*var(--u))]" />
    </section>
  );
}
