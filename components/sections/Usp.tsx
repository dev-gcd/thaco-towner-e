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
 * Băng chuyền ưu điểm. Khung thiết kế 1440×900.
 *
 * Khung nhìn TRÀN hết bề ngang màn (không phải 1280 khít 3 thẻ): trong bản dựng
 * play thấy rõ 3 thẻ đầy đủ + 2 thẻ HÉ ở hai rìa. Thẻ đầu vẫn bắt đầu đúng x=80
 * của khung 1440. Danh sách lặp 3 vòng để hai rìa lúc nào cũng có thẻ.
 *
 * Mỗi thẻ có 2 ảnh — Figma dùng 2 biến thể với mã ảnh khác hẳn nhau: ảnh thường
 * và ảnh chi tiết hiện đè lên khi rê chuột (vd đuôi xe đóng → mở cửa có thùng hàng).
 */
export function Usp() {
  const { label, heading, items } = usp;
  const [index, setIndex] = useState(0);
  const count = items.length;
  const loop = [...items, ...items, ...items];

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section id="uu-diem" className="bg-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-12 lg:h-0 lg:px-0 lg:pt-0">
        <div className="flex flex-col gap-[12px] lg:relative lg:left-[80px] lg:top-[80px] lg:w-[399px]">
          <SectionLabel>{label}</SectionLabel>
          <h2 className="text-display-sm font-bold uppercase text-brand-deep lg:whitespace-nowrap">
            {heading}
          </h2>
        </div>
      </div>

      <div className="lg:h-[900px]">
        <div className="overflow-hidden pt-8 lg:pt-[216px]">
          <div
            className="flex gap-[20px] pl-4 transition-transform lg:gap-[40px] lg:pl-[max(1rem,calc((100vw-1440px)/2+80px))]"
            style={{
              transform: `translate3d(-${(count + index) * STEP}px, 0, 0)`,
              transitionDuration: "833ms",
              transitionTimingFunction: "var(--ease-slow)",
            }}
          >
            {loop.map((item, i) => (
              <article
                key={`${item.title}-${i}`}
                aria-hidden={i < count || i >= count * 2 ? true : undefined}
                className="group relative h-[380px] w-[280px] shrink-0 rounded-[50px] lg:h-[500px] lg:w-[400px]"
              >
                {/* Figma: rê chuột thì hiện quầng xanh 10% loe ra 10px quanh thẻ */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[10px] rounded-[50px] bg-brand/10 opacity-0 transition-opacity duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:opacity-100"
                />
                <span className="absolute inset-0 overflow-hidden rounded-[50px]">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={400}
                    height={500}
                    sizes="400px"
                    className="absolute inset-0 h-full w-full object-cover transition-[scale,opacity] duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:scale-[1.125] group-hover:opacity-0"
                  />
                  {/* Ảnh chi tiết — hiện đè lên khi rê chuột */}
                  <Image
                    src={item.imageHover.src}
                    alt=""
                    width={400}
                    height={500}
                    sizes="400px"
                    className="absolute inset-0 h-full w-full scale-[1.125] object-cover opacity-0 transition-[scale,opacity] duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:scale-100 group-hover:opacity-100"
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
                </span>
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

        <div className="mx-auto mt-8 flex w-full max-w-[1440px] items-center justify-center gap-[24px] lg:mt-[48px] lg:gap-[64px]">
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
    // Figma: khi rê chuột hiện quầng xanh 10% rộng 70px quanh nút, 300ms.
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
