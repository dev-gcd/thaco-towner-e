import Image from "next/image";
import { gtsp } from "@/lib/content";
import { ArrowRight } from "@/components/icons";

/**
 * Khối giới thiệu sản phẩm — thẻ trắng bo góc 16px nằm trên quầng xanh 10%.
 * Khung thiết kế 1440×684; thẻ 1280×444 đặt ở 80,120.
 */
export function Gtsp({ onCtaClick }: { onCtaClick?: () => void }) {
  const { title, description, ctaLabel, background, car, wheelFront, wheelRear } = gtsp;

  return (
    <section id="gioi-thieu" className="bg-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 lg:h-[684px] lg:px-0 lg:py-0">
        <div className="relative lg:h-full">
          {/* Quầng xanh nhạt phía sau thẻ */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[60px] top-[100px] hidden h-[484px] w-[1320px] rounded-[26px] bg-brand/10 lg:block"
          />

          <div className="relative overflow-hidden rounded-[16px] bg-white lg:absolute lg:left-[80px] lg:top-[120px] lg:h-[444px] lg:w-[1280px]">
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
              className="pointer-events-none absolute left-0 top-0 h-[317px] w-[753px] bg-white/30"
            />

            {/* Xe + 2 bánh (ảnh rời để sau này có thể cho quay) */}
            <div aria-hidden className="pointer-events-none hidden lg:block">
              <Image
                src={car.src}
                alt={car.alt}
                width={678}
                height={306}
                className="absolute left-[544px] top-[87px] h-[306px] w-[678px] max-w-none"
              />
              <Image
                src={wheelFront.src}
                alt=""
                width={81}
                height={81}
                className="absolute left-[638px] top-[294px] size-[81px] max-w-none"
              />
              <Image
                src={wheelRear.src}
                alt=""
                width={81}
                height={81}
                className="absolute left-[1023px] top-[294px] size-[81px] max-w-none"
              />
            </div>

            <div className="relative flex flex-col gap-[28px] p-6 lg:absolute lg:left-[64px] lg:top-[48px] lg:w-[505px] lg:p-0">
              <div className="flex flex-col gap-[11px]">
                <h2 className="whitespace-pre-line text-display-sm font-bold uppercase text-brand-deep">
                  {title}
                </h2>
                <p className="text-body-lg text-text-heading">{description}</p>
              </div>
              <button
                type="button"
                onClick={onCtaClick}
                className="inline-flex h-[40px] w-fit items-center gap-[6px] rounded-full bg-brand px-6 text-body-md font-medium text-white transition-colors hover:bg-brand-deep"
              >
                {ctaLabel}
                <ArrowRight className="size-5" />
              </button>
            </div>

            {/* Ảnh xe bản điện thoại: nằm dưới chữ cho khỏi che */}
            <Image
              src={car.src}
              alt={car.alt}
              width={678}
              height={306}
              className="relative mx-auto h-auto w-full max-w-[420px] px-4 pb-6 lg:hidden"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto hidden h-px max-w-[1280px] bg-stroke lg:block" />
    </section>
  );
}
