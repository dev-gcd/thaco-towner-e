import Image from "next/image";
import { cta } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight } from "@/components/icons";

/**
 * Hai thẻ kêu gọi hành động, khung thiết kế 1440×718: thẻ 630×558 ở 80,80 và
 * 730,80, ảnh tràn ra ngoài mép thẻ rồi bị cắt bởi bo góc 16.
 */
export function Cta({ onDriveTestClick }: { onDriveTestClick?: () => void }) {
  const { driveTest, brochure } = cta;

  return (
    <section id="dang-ky" className="bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-12 dsk:h-[718px] dsk:grid-cols-2 dsk:gap-[20px] dsk:px-[80px] dsk:py-[80px]">
        {/* Thẻ 1 — đăng ký lái thử */}
        <article className="relative h-[420px] overflow-hidden rounded-[16px] bg-bg-soft dsk:h-[558px]">
          <Image
            src={driveTest.image.src}
            alt={driveTest.image.alt}
            width={705}
            height={558}
            sizes="(max-width: 1023px) 100vw, 705px"
            className="absolute inset-y-0 right-0 h-full w-full object-cover dsk:left-[-13px] dsk:w-[705px] dsk:max-w-none"
          />
          <div className="relative flex h-full flex-col justify-start gap-[24px] p-6 dsk:p-[40px]">
            <div className="flex flex-col gap-[12px]">
              <SectionLabel>{driveTest.label}</SectionLabel>
              <h2 className="whitespace-pre-line text-[32px] font-bold uppercase leading-[40px] text-brand-deep dsk:text-display-md">
                {driveTest.heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={onDriveTestClick}
              className="inline-flex h-[40px] w-fit items-center gap-[6px] rounded-full bg-brand px-6 text-body-md font-medium text-white transition-colors hover:bg-brand-deep"
            >
              {driveTest.buttonLabel}
              <ArrowRight className="size-5" />
            </button>
          </div>
        </article>

        {/* Thẻ 2 — tải brochure */}
        <article className="relative h-[420px] overflow-hidden rounded-[16px] bg-bg-soft dsk:h-[558px]">
          <Image
            src={brochure.image.src}
            alt={brochure.image.alt}
            width={732}
            height={676}
            sizes="(max-width: 1023px) 100vw, 732px"
            className="absolute inset-y-0 right-0 h-full w-full object-cover dsk:left-[-91px] dsk:top-[-36px] dsk:h-[676px] dsk:w-[732px] dsk:max-w-none"
          />
          <div className="relative flex h-full flex-col justify-start gap-[24px] p-6 dsk:p-[40px]">
            <div className="flex flex-col gap-[12px]">
              <SectionLabel>{brochure.label}</SectionLabel>
              <h2 className="whitespace-pre-line text-[32px] font-bold uppercase leading-[40px] text-brand-deep dsk:text-display-md">
                {brochure.heading}
              </h2>
            </div>
            {/* Chưa có tệp thì không hiện nút — tránh nút bấm vào không ra gì */}
            {brochure.file && (
              <a
                href={brochure.file}
                download
                className="inline-flex h-[40px] w-fit items-center gap-[6px] rounded-full bg-stroke px-6 text-body-md font-medium text-text-heading transition-colors hover:bg-brand hover:text-white"
              >
                {brochure.buttonLabel}
                <DownloadIcon />
              </a>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5">
      <path
        d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
