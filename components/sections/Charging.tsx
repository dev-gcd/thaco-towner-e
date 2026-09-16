import Image from "next/image";
import { charging } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";

/**
 * Trạm sạc — khung thiết kế 1440×1276: tiêu đề + 4 thẻ trạm (302×372, bo 24)
 * trên nền ảnh, bên dưới là ảnh xe đang sạc kèm một điểm nhấn về tốc độ sạc.
 */
export function Charging() {
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
        <div className="relative px-4 py-12 lg:h-full lg:px-0 lg:py-0">
          <div className="flex flex-col gap-[8px] lg:absolute lg:left-[80px] lg:top-[48px] lg:w-[1251px]">
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-[32px] font-bold uppercase leading-[40px] text-brand-deep lg:whitespace-nowrap lg:text-display-lg">
              {heading}
            </h2>
            <p className="max-w-[930px] text-body-lg text-text-heading">{description}</p>
          </div>

          <ul className="mt-8 grid gap-[24px] sm:grid-cols-2 lg:absolute lg:left-[80px] lg:top-[238px] lg:mt-0 lg:w-[1280px] lg:grid-cols-4">
            {stations.map((station) => (
              <li
                key={station.name}
                className="flex flex-col rounded-[24px] bg-bg-soft/90 p-[20px] backdrop-blur-[2px] lg:h-[372px] lg:w-[302px] lg:p-[24px]"
              >
                <p className="text-body-lg font-bold text-text-heading">{station.name}</p>
                <p className="text-body-lg text-text-heading">{station.area}</p>

                <dl className="mt-[20px] flex flex-col gap-[12px] lg:mt-[48px] lg:gap-[16px]">
                  {station.specs.map((spec) => (
                    <div key={spec.label} className="flex items-center gap-[16px]">
                      <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-brand/5 text-brand">
                        <SpecIcon name={spec.icon} />
                      </span>
                      <div className="flex flex-col">
                        <dd className="text-body-lg font-semibold text-text-heading">
                          {spec.value}
                        </dd>
                        <dt className="text-body-md text-text-heading">{spec.label}</dt>
                      </div>
                    </div>
                  ))}
                </dl>

                {station.mapUrl && (
                  <a
                    href={station.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex h-[40px] items-center justify-center gap-[6px] rounded-full bg-stroke text-body-md font-medium text-text-heading transition-colors duration-200 hover:bg-[#cfd2d6]"
                  >
                    {mapLabel}
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5">
                      <path
                        d="M5 15 15 5m0 0H7.5M15 5v7.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
              </li>
            ))}
          </ul>

          <Image
            src={car.src}
            alt={car.alt}
            width={1220}
            height={809}
            sizes="(max-width: 1023px) 100vw, 1220px"
            className="relative mt-10 h-auto w-full lg:absolute lg:left-[110px] lg:top-[527px] lg:mt-0 lg:h-[809px] lg:w-[1220px] lg:max-w-none"
          />

          <div className="relative mt-8 flex items-center gap-[16px] lg:absolute lg:left-[80px] lg:top-[666px] lg:mt-0 lg:w-[494px]">
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
