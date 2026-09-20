"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { charging } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";

/**
 * Trạm sạc — khung thiết kế 1440×1276: tiêu đề + 4 thẻ trạm (302×372, bo 24)
 * trên nền ảnh, bên dưới là ảnh xe đang sạc kèm một điểm nhấn về tốc độ sạc.
 *
 * Từ `lg` (800) co theo `--u` (khối gắn `.canvas-1440`) nhưng xếp theo DÒNG CHẢY:
 * thẻ trạm ở 853px chỉ rộng ~179px, ghim cứng cao 372·u thì nội dung tràn khỏi thẻ.
 * Nên thẻ cao theo nội dung (tối thiểu 372·u), ảnh xe nối sau thẻ (vẫn đè lên thẻ
 * 83·u và bị cắt đáy 60·u như Figma), ô tốc độ sạc neo theo đáy khối. Khung cha phải
 * `flow-root`: không thì lề âm ở đáy ảnh bị gộp xuyên ra ngoài, mất tác dụng, ô tốc độ
 * sạc tụt xuống đè lên xe 60·u. Từ `xl` ghim đúng toạ độ Figma.
 */
export function Charging({ onMissingLink }: { onMissingLink?: () => void }) {
  const { label, heading, description, background, car, mapLabel, stations, highlight } =
    charging;

  return (
    <section id="tram-sac" className="canvas-1440 relative overflow-hidden bg-bg-soft">
      {/* NỀN tràn hết bề ngang; thẻ trạm + ảnh xe neo trong khung 1440. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Image
          src={background.srcMobile || background.src}
          alt=""
          width={1440}
          height={1315}
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-full w-full object-cover object-top lg:top-[calc(35*var(--u))] lg:h-[calc(1315*var(--u))]"
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[697px] bg-linear-to-b from-bg-soft via-bg-soft/70 to-transparent lg:h-[calc(697*var(--u))]" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[460px] bg-linear-to-t from-bg-soft to-transparent lg:h-[calc(460*var(--u))]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] xl:h-[1276px]">
        <div className="relative py-12 lg:flow-root lg:py-0 xl:h-full">
          <motion.div
            className="flex flex-col gap-[8px] px-4 lg:gap-[calc(8*var(--u))] lg:px-[calc(80*var(--u))] lg:pt-[calc(48*var(--u))] xl:absolute xl:left-[80px] xl:top-[48px] xl:w-[1251px] xl:px-0 xl:pt-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-heading-lg font-bold uppercase text-brand-deep sm:text-[32px] sm:leading-[40px] lg:whitespace-nowrap lg:text-[length:max(24px,calc(48*var(--u)))] lg:leading-[calc(40*var(--u))]">
              {heading}
            </h2>
            <p className="max-w-[930px] text-body-lg text-text-heading lg:max-w-[calc(930*var(--u))] lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">{description}</p>
          </motion.div>

          {/* Điện thoại: lưới 2 cột thay cho dải cuộn ngang. Dải ngang chỉ lộ 1 thẻ,
              khách cuộn dọc lướt qua sẽ tưởng chỉ có 1 trạm sạc.
              Laptop (lg–xl): mỗi thẻ là subgrid 4 hàng (tên · khu vực · thông số · nút)
              để hàng của 4 thẻ thẳng nhau dù tên trạm dài 1 hay 2 dòng. */}
          <ul className="mt-8 grid grid-cols-2 gap-3 px-4 sm:gap-[24px] sm:px-6 lg:mt-[calc(64*var(--u))] lg:grid-cols-4 lg:gap-[calc(24*var(--u))] lg:max-xl:gap-y-0 lg:px-[calc(80*var(--u))] xl:absolute xl:left-[80px] xl:top-[238px] xl:mt-0 xl:w-[1280px] xl:px-0">
            {stations.map((station, si) => (
              <motion.li
                key={station.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-w-0 flex-col rounded-[16px] bg-bg-soft/90 p-3 backdrop-blur-[2px] sm:rounded-[24px] sm:p-[20px] lg:min-h-[calc(372*var(--u))] lg:max-xl:row-span-4 lg:max-xl:grid lg:max-xl:grid-rows-subgrid lg:max-xl:gap-0 lg:rounded-[calc(24*var(--u))] lg:p-[calc(24*var(--u))] xl:h-[372px] xl:w-[302px]"
              >
                <p className="text-body-md font-bold text-text-heading sm:text-body-lg lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">{station.name}</p>
                <p className="text-body-sm text-text-heading sm:text-body-lg lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">{station.area}</p>

                <dl className="mt-3 mb-3 flex flex-col gap-2 sm:mt-[20px] sm:gap-[12px] lg:mt-[calc(48*var(--u))] lg:gap-[calc(16*var(--u))]">
                  {station.specs.map((spec) => (
                    <div key={spec.label} className="flex min-w-0 items-center gap-2 sm:gap-[16px] lg:gap-[calc(16*var(--u))]">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/5 text-brand sm:size-[44px] lg:size-[max(28px,calc(44*var(--u)))]">
                        <SpecIcon name={spec.icon} />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <dd className="text-body-sm font-semibold text-text-heading sm:text-body-lg lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">
                          {spec.value}
                        </dd>
                        <dt className="text-body-xs text-text-heading sm:text-body-md lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25]">{spec.label}</dt>
                      </div>
                    </div>
                  ))}
                </dl>

                {/* Nút LUÔN hiện; chưa có link bản đồ thì báo đang cập nhật. */}
                {station.mapUrl ? (
                  <a
                    href={station.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={MAP_BTN}
                  >
                    {mapLabel}
                    <MapIcon />
                  </a>
                ) : (
                  <button type="button" onClick={onMissingLink} className={MAP_BTN}>
                    {mapLabel}
                    <MapIcon />
                  </button>
                )}
              </motion.li>
            ))}
          </ul>

          <Image
            src={car.src}
            alt={car.alt}
            width={1220}
            height={809}
            sizes="(max-width: 1023px) 100vw, 1220px"
            className="pointer-events-none relative mt-10 h-auto w-full px-4 lg:-mb-[calc(60*var(--u))] lg:-mt-[calc(83*var(--u))] lg:ml-[calc(110*var(--u))] lg:w-[calc(1220*var(--u))] lg:max-w-none lg:px-0 xl:absolute xl:left-[110px] xl:top-[527px] xl:m-0 xl:h-[809px] xl:w-[1220px]"
          />

          <div className="relative mt-8 flex items-center gap-[16px] px-4 lg:absolute lg:bottom-[calc(522*var(--u))] lg:left-[calc(80*var(--u))] lg:mt-0 lg:w-[calc(494*var(--u))] lg:gap-[calc(16*var(--u))] lg:px-0 xl:top-[666px] xl:bottom-auto">
            <span className="grid size-[88px] shrink-0 place-items-center rounded-[24px] lg:size-[max(56px,calc(88*var(--u)))] lg:rounded-[max(16px,calc(24*var(--u)))] bg-white/70 text-brand backdrop-blur-[2px]">
              <BoltIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-body-lg font-semibold text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">
                {highlight.title}
              </span>
              <span className="text-heading-sm font-medium text-brand lg:text-[length:max(12px,calc(20*var(--u)))] lg:leading-[1.2]">
                {highlight.description}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MAP_BTN =
  "mt-auto inline-flex h-[40px] items-center justify-center gap-1 rounded-full bg-stroke px-2 text-body-sm font-medium whitespace-nowrap text-text-heading transition-colors duration-200 hover:bg-[#cfd2d6] sm:gap-[6px] sm:text-body-md";

function MapIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5">
      <path
        d="M5 15 15 5m0 0H7.5M15 5v7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpecIcon({ name }: { name: string }) {
  if (name === "plug") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path d="M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "standard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
        <circle cx="15" cy="10" r="1.6" fill="currentColor" />
        <circle cx="12" cy="15" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  return <BoltIcon />;
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-6">
      <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
