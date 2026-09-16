"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { charging } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";

/**
 * Trạm sạc — khung thiết kế 1440×1276: tiêu đề + 4 thẻ trạm (302×372, bo 24)
 * trên nền ảnh, bên dưới là ảnh xe đang sạc kèm một điểm nhấn về tốc độ sạc.
 */
export function Charging({ onMissingLink }: { onMissingLink?: () => void }) {
  const { label, heading, description, background, car, mapLabel, stations, highlight } =
    charging;

  return (
    <section id="tram-sac" className="relative overflow-hidden bg-bg-soft">
      {/* NỀN tràn hết bề ngang; thẻ trạm + ảnh xe neo trong khung 1440. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <Image
          src={background.srcMobile || background.src}
          alt=""
          width={1440}
          height={1315}
          sizes="100vw"
          className="absolute inset-x-0 top-0 h-full w-full object-cover object-top lg:top-[35px] lg:h-[1315px]"
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[697px] bg-linear-to-b from-bg-soft via-bg-soft/70 to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[460px] bg-linear-to-t from-bg-soft to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] lg:h-[1276px]">
        <div className="relative py-12 lg:h-full lg:py-0">
          <motion.div
            className="flex flex-col gap-[8px] px-4 lg:absolute lg:left-[80px] lg:top-[48px] lg:w-[1251px] lg:px-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-heading-lg font-bold uppercase text-brand-deep sm:text-[32px] sm:leading-[40px] lg:whitespace-nowrap lg:text-display-lg">
              {heading}
            </h2>
            <p className="max-w-[930px] text-body-lg text-text-heading">{description}</p>
          </motion.div>

          {/* Điện thoại: lưới 2 cột thay cho dải cuộn ngang. Dải ngang chỉ lộ 1 thẻ,
              khách cuộn dọc lướt qua sẽ tưởng chỉ có 1 trạm sạc. */}
          <ul className="mt-8 grid grid-cols-2 gap-3 px-4 sm:gap-[24px] sm:px-6 lg:absolute lg:left-[80px] lg:top-[238px] lg:mt-0 lg:w-[1280px] lg:grid-cols-4 lg:px-0">
            {stations.map((station, si) => (
              <motion.li
                key={station.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-w-0 flex-col rounded-[16px] bg-bg-soft/90 p-3 backdrop-blur-[2px] sm:rounded-[24px] sm:p-[20px] lg:h-[372px] lg:w-[302px] lg:p-[24px]"
              >
                <p className="text-body-md font-bold text-text-heading sm:text-body-lg">{station.name}</p>
                <p className="text-body-sm text-text-heading sm:text-body-lg">{station.area}</p>

                <dl className="mt-3 mb-3 flex flex-col gap-2 sm:mt-[20px] sm:gap-[12px] lg:mt-[48px] lg:gap-[16px]">
                  {station.specs.map((spec) => (
                    <div key={spec.label} className="flex min-w-0 items-center gap-2 sm:gap-[16px]">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/5 text-brand sm:size-[44px]">
                        <SpecIcon name={spec.icon} />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <dd className="text-body-sm font-semibold text-text-heading sm:text-body-lg">
                          {spec.value}
                        </dd>
                        <dt className="text-body-xs text-text-heading sm:text-body-md">{spec.label}</dt>
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
            className="pointer-events-none relative mt-10 h-auto w-full px-4 lg:absolute lg:px-0 lg:left-[110px] lg:top-[527px] lg:mt-0 lg:h-[809px] lg:w-[1220px] lg:max-w-none"
          />

          <div className="relative mt-8 flex items-center gap-[16px] px-4 lg:absolute lg:left-[80px] lg:top-[666px] lg:mt-0 lg:w-[494px] lg:px-0">
            <span className="grid size-[88px] shrink-0 place-items-center rounded-[24px] bg-white/70 text-brand backdrop-blur-[2px]">
              <BoltIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-body-lg font-semibold text-text-heading">
                {highlight.title}
              </span>
              <span className="text-heading-sm font-medium text-brand">
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
