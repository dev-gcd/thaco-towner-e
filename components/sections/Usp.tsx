"use client";

import Image from "next/image";
import { useState } from "react";
import { usp } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";

const CARD = 400;
const GAP = 40;
const STEP = CARD + GAP;

/**
 * Băng chuyền ưu điểm. Khung thiết kế 1440×900: khung nhìn 1280×500 đặt ở 80,216,
 * thẻ 400×500 bo góc 50, cách nhau 40. Danh sách thẻ được lặp 2 lần để khung nhìn
 * luôn đầy khi trượt tới thẻ cuối (Figma cũng nhân bản đúng như vậy).
 */
export function Usp() {
  const { label, heading, items } = usp;
  const [index, setIndex] = useState(0);
  const count = items.length;
  const loop = [...items, ...items];

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section id="uu-diem" className="bg-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 dsk:h-[900px] dsk:px-0 dsk:py-0">
        <div className="relative dsk:h-full">
          <div className="flex flex-col gap-[12px] dsk:absolute dsk:left-[80px] dsk:top-[80px] dsk:w-[399px]">
            <SectionLabel>{label}</SectionLabel>
            <h2 className="text-display-sm font-bold uppercase text-brand-deep dsk:whitespace-nowrap">
              {heading}
            </h2>
          </div>

          <div className="mt-8 overflow-hidden dsk:absolute dsk:left-[80px] dsk:top-[216px] dsk:mt-0 dsk:h-[500px] dsk:w-[1280px]">
            <div
              className="flex gap-[20px] transition-transform duration-500 ease-out dsk:gap-[40px]"
              style={{ transform: `translate3d(-${index * STEP}px, 0, 0)` }}
            >
              {loop.map((item, i) => (
                <article
                  key={`${item.title}-${i}`}
                  aria-hidden={i >= count ? true : undefined}
                  className="relative h-[380px] w-[280px] shrink-0 overflow-hidden rounded-[50px] dsk:h-[500px] dsk:w-[400px]"
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={400}
                    height={500}
                    sizes="400px"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Hai lớp chuyển màu chồng nhau đúng như bản thiết kế */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-[#09386d]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-black"
                  />
                  <div className="absolute bottom-[40px] left-[32px] right-[32px] flex flex-col gap-[4px] text-white">
                    <h3 className="whitespace-pre-line text-heading-lg font-medium uppercase">
                      {item.title}
                    </h3>
                    <p className="text-body-md">{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-[24px] dsk:absolute dsk:left-1/2 dsk:top-[764px] dsk:mt-0 dsk:-translate-x-1/2 dsk:gap-[64px]">
            <NavButton label="Ưu điểm trước" onClick={() => go(index - 1)}>
              <ArrowLeft className="size-[14px]" />
            </NavButton>
            <div className="flex items-center gap-[20px]">
              {items.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Tới ưu điểm ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`size-[10px] rounded-full transition-colors ${
                    i === index ? "bg-brand" : "bg-stroke"
                  }`}
                />
              ))}
            </div>
            <NavButton label="Ưu điểm kế tiếp" onClick={() => go(index + 1)}>
              <ArrowRight className="size-[14px]" />
            </NavButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavButton({
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
      className="grid size-[56px] place-items-center rounded-full bg-white text-text-heading shadow-[0_4px_16px_rgba(30,126,216,0.12)] transition-colors hover:bg-brand hover:text-white"
    >
      {children}
    </button>
  );
}
