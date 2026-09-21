"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { exterior, exteriorSlides } from "@/lib/content";
import { VersionSwitch } from "@/components/VersionSwitch";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { ExteriorSlider, SliderTrack } from "@/components/ExteriorSlider";

/**
 * Ngoại thất = 2 khối chồng nhau (khung thiết kế 1440×2000):
 *  · 0–1025  : ảnh xe toàn cảnh + băng ảnh các góc xe (mũi tên + thanh vị trí)
 *  · 1025–2000: tiêu đề lớn + băng chuyền chi tiết (thẻ lớn 900 + thẻ hé 340)
 *
 * Từ `lg` (800) co theo `--u` (khối gắn `.canvas-1440`). Khối 2 ở dải laptop xếp theo
 * dòng chảy (tiêu đề rồi băng chuyền) thay vì ghim toạ độ: chữ có cỡ sàn nên cao hơn
 * tỉ lệ, ghim cứng 975·u thì mô tả thẻ bị cắt. Từ `xl` ghim đúng toạ độ Figma.
 */
/** Figma: đổi thẻ 833ms, nhịp lò xo SLOW. */
const SWAP = { duration: 0.833, ease: [0.22, 1, 0.36, 1] } as const;

export function Exterior({
  versionId,
  onVersion,
}: {
  /** Phiên bản đang xem (dùng chung cả trang) — quyết định bộ ảnh các góc xe. */
  versionId: string;
  onVersion: (id: string) => void;
}) {
  const { label, ghostTitle, view360, heading, headingAccent, description, items } = exterior;
  const [index, setIndex] = useState(0);
  // Băng ảnh các góc xe CỦA PHIÊN BẢN đang xem; phiên bản chưa có ảnh riêng thì dùng
  // ảnh mặc định (xem `exteriorSlides`). Luôn có ít nhất 1 ảnh.
  const slides = exteriorSlides(view360, versionId);
  const [slide, setSlide] = useState<{ i: number; dir: 1 | -1 | 0 }>({ i: 0, dir: 1 });
  const many = slides.length > 1;
  // Đổi phiên bản: giữ góc đang xem (bộ mới ít ảnh hơn thì về ảnh cuối), mờ dần tại chỗ.
  const [lastVersion, setLastVersion] = useState(versionId);
  if (lastVersion !== versionId) {
    setLastVersion(versionId);
    setSlide(({ i }) => ({ i: Math.min(i, slides.length - 1), dir: 0 }));
  }
  const cur = Math.min(slide.i, slides.length - 1);
  // Hướng trượt theo chiều SỐ THỨ TỰ, không theo nút bấm: bấm "sau" ở ảnh cuối quay về
  // ảnh đầu thì xe mới vào từ TRÁI (đúng như video dựng play).
  const step = (delta: 1 | -1) =>
    setSlide(({ i }) => {
      const next = (i + delta + slides.length) % slides.length;
      return { i: next, dir: next > i ? 1 : -1 };
    });
  const go = (n: number) => setIndex(((n % items.length) + items.length) % items.length);
  // Thẻ đang xem luôn đứng đầu; các thẻ còn lại xếp sau dưới dạng thẻ hé.
  const ordered = [...items.slice(index), ...items.slice(0, index)];

  return (
    <section id="ngoai-that" className="canvas-1440 bg-white">
      {/* ── Khối 1: ảnh toàn cảnh + thanh trượt 360° ───────────── */}
      {/* Ảnh tràn hết bề ngang; chữ và thanh trượt neo trong khung 1440. */}
      {/* Điện thoại: xếp dọc ảnh xe → mũi tên + thanh vị trí → tiêu đề (mũi tên nằm sát
          ảnh để biết là bấm đổi ảnh). Từ `lg` các phần tử ghim toạ độ, thứ tự không còn tác dụng. */}
      <div className="relative flex w-full flex-col lg:block lg:h-[calc(1025*var(--u))]">
        <div className="relative h-[380px] sm:h-[520px] md:h-[620px] lg:absolute lg:inset-x-0 lg:top-[calc(65*var(--u))] lg:h-[calc(960*var(--u))]">
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
            className="pointer-events-none absolute inset-x-0 top-0 h-[244px] bg-linear-to-b from-white to-transparent lg:h-[calc(244*var(--u))]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[352px] bg-linear-to-t from-white to-transparent lg:h-[calc(352*var(--u))]"
          />
          <ExteriorSlider
            slides={slides}
            alt={view360.car.alt}
            index={cur}
            // Khoá theo ĐƯỜNG DẪN ảnh: đổi phiên bản mà ảnh không đổi (phiên bản chưa có
            // ảnh riêng) thì không chớp.
            slideKey={slides[cur]}
            direction={slide.dir}
            onStep={step}
            className="absolute inset-0 outline-none"
          />
        </div>

        <div className="relative order-2 mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-4 pt-10 lg:absolute lg:inset-x-0 lg:top-[calc(80*var(--u))] lg:gap-[calc(12*var(--u))] lg:px-[calc(80*var(--u))] lg:pt-0">
          <SectionLabel>{label}</SectionLabel>
          <p className="text-[40px] font-medium uppercase leading-[46px] text-brand-deep sm:text-[64px] sm:leading-[72px] lg:text-[calc(136*var(--u))] lg:leading-[calc(144*var(--u))]">
            {ghostTitle}
          </p>
        </div>

        {/* Chuyển nhanh phiên bản — máy tính: góc trên-phải, neo mép khung 1440;
            điện thoại: ngay dưới ảnh xe. */}
        <VersionSwitch
          versionId={versionId}
          onVersion={onVersion}
          className="order-1 mx-auto mt-6 lg:absolute lg:right-[max(calc(80*var(--u)),calc((100%_-_1440px)/2_+_80px))] lg:top-[calc(80*var(--u))] lg:mx-0 lg:mt-0"
        />

        {many && (
          <div className="order-1 mx-auto mt-6 flex w-fit items-center gap-4 sm:gap-[32px] lg:absolute lg:inset-x-0 lg:top-[calc(917*var(--u)_-_28px)] lg:mx-auto lg:mt-0 lg:gap-[calc(32*var(--u))]">
            <RoundButton label="Ảnh ngoại thất trước" onClick={() => step(-1)}>
              <ArrowLeft className="size-[14px]" />
            </RoundButton>
            <SliderTrack
              index={cur}
              count={slides.length}
              className="w-[160px] sm:w-[260px] lg:w-[max(160px,calc(260*var(--u)))]"
            />
            <RoundButton label="Ảnh ngoại thất sau" onClick={() => step(1)}>
              <ArrowRight className="size-[14px]" />
            </RoundButton>
          </div>
        )}
      </div>

      {/* ── Khối 2: tiêu đề + băng chuyền chi tiết ─────────────── */}
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-12 pt-10 sm:pt-14 lg:px-[calc(80*var(--u))] lg:pb-[calc(96*var(--u))] lg:pt-0 xl:h-[975px] xl:px-0 xl:pb-0 xl:pt-0">
        <div className="flex flex-col gap-[32px] lg:w-[calc(797*var(--u))] lg:gap-[calc(32*var(--u))] xl:absolute xl:left-[80px] xl:top-0 xl:w-[797px]">
          <h2 className="flex flex-col gap-[4px] text-[28px] font-extrabold uppercase leading-[34px] sm:gap-[8px] sm:text-[40px] sm:leading-[48px] lg:gap-[calc(8*var(--u))] lg:text-[length:max(28px,calc(64*var(--u)))] lg:leading-[1.125]">
            <span className="text-brand-deep">{heading}</span>
            <span className="text-brand">{headingAccent}</span>
          </h2>
          <p className="text-body-md font-medium text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]">{description}</p>
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
        <div className="mt-10 hidden md:block lg:mt-[calc(60*var(--u))] xl:absolute xl:left-[80px] xl:top-[284px] xl:mt-0 xl:w-[1280px]">
          <div className="flex flex-row gap-[20px] lg:gap-[calc(40*var(--u))]">
            {ordered.map((item, pos) => {
              const active = pos === 0;
              const so = String((items.indexOf(item) % items.length) + 1).padStart(2, "0");
              return (
                <motion.div
                  key={item.title}
                  layout
                  transition={SWAP}
                  onClick={() => !active && go(index + pos)}
                  className={`flex flex-col gap-[20px] lg:gap-[calc(40*var(--u))] ${
                    active ? "md:flex-1 lg:w-[calc(900*var(--u))] lg:flex-none" : "group cursor-pointer md:w-[36%] lg:w-[calc(340*var(--u))]"
                  }`}
                >
                  <motion.div
                    layout
                    transition={SWAP}
                    className="relative aspect-[900/506] overflow-hidden rounded-[16px] lg:aspect-auto lg:h-[calc(506*var(--u))]"
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={900}
                      height={506}
                      sizes="(max-width: 1439px) 100vw, 900px"
                      className="absolute inset-0 h-full w-full max-w-none object-cover lg:w-[calc(900*var(--u))]"
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

                  <motion.figcaption layout transition={SWAP} className="flex flex-col gap-[16px] lg:gap-[calc(16*var(--u))]">
                    <span className="flex min-w-0 items-center gap-[8px]">
                      <span className="shrink-0 text-heading-md font-semibold text-brand lg:text-[length:max(16px,calc(24*var(--u)))] lg:leading-[1.3333]">{so}</span>
                      <span
                        aria-hidden
                        className={`h-[2px] shrink-0 bg-brand ${active ? "w-[32px]" : "w-[10px]"}`}
                      />
                      <span className="min-w-0 truncate text-heading-md font-semibold text-text-heading lg:text-[length:max(16px,calc(24*var(--u)))] lg:leading-[1.3333]">
                        {item.title}
                      </span>
                    </span>
                    {active && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="max-w-[718px] text-body-md text-text-heading lg:max-w-[calc(718*var(--u))] lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]"
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
