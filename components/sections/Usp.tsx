"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usp } from "@/lib/content";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "@/components/icons";

/**
 * Băng chuyền ưu điểm. Khung thiết kế 1440×900.
 *
 * Khung nhìn TRÀN hết bề ngang màn: trong bản dựng play thấy rõ 3 thẻ đầy đủ +
 * 2 thẻ HÉ ở hai rìa. Thẻ đầu vẫn bắt đầu đúng x=80 của khung 1440. Danh sách
 * lặp 3 vòng để hai rìa lúc nào cũng có thẻ.
 *
 * Mỗi thẻ có 2 ảnh — Figma dùng 2 biến thể với mã ảnh khác hẳn nhau: ảnh thường
 * và ảnh chi tiết hiện đè lên khi rê chuột.
 *
 * 🔴 Dùng CUỘN NGANG THẬT (scroll + snap) chứ không dịch bằng `transform`:
 *  · điện thoại vuốt được bằng ngón tay, không phải bấm mũi tên;
 *  · bước trượt ĐO TỪ DOM nên tự đúng ở mọi bề ngang. Bản cũ ghi cứng 440px
 *    (thẻ 400 + cách 40 của khung 1440) nên ở màn hẹp — thẻ 280 + cách 20 = 300 —
 *    băng chuyền lệch, thẻ đầu tiên nằm ngoài màn 84px và chữ bị cắt.
 */
export function Usp() {
  const { label, heading, items } = usp;
  const count = items.length;
  const loop = [...items, ...items, ...items];

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(440);

  /** Đo bề rộng một bước trượt từ chính DOM (thẻ + khoảng cách). */
  const doBuoc = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 440;
    const cards = track.querySelectorAll<HTMLElement>("article");
    if (cards.length < 2) return 440;
    const b = Math.round(
      cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
    );
    return b > 0 ? b : 440;
  }, []);

  const toiThe = useCallback(
    (i: number, muot = true) => {
      const track = trackRef.current;
      if (!track) return;
      const b = doBuoc();
      track.scrollTo({ left: (count + i) * b, behavior: muot ? "smooth" : "auto" });
    },
    [count, doBuoc]
  );

  // Đặt vị trí ban đầu ở vòng lặp GIỮA để hai rìa đều có thẻ hé.
  useEffect(() => {
    const b = doBuoc();
    setStep(b);
    trackRef.current?.scrollTo({ left: count * b, behavior: "auto" });
    const onResize = () => {
      const moi = doBuoc();
      setStep(moi);
      trackRef.current?.scrollTo({ left: (count + index) * moi, behavior: "auto" });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vuốt tay cũng phải cập nhật chấm đang sáng.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || !step) return;
    const i = Math.round(track.scrollLeft / step) - count;
    const chuan = ((i % count) + count) % count;
    setIndex((truoc) => (truoc === chuan ? truoc : chuan));
  }, [count, step]);

  const go = (next: number) => {
    const chuan = ((next % count) + count) % count;
    setIndex(chuan);
    toiThe(chuan);
  };

  return (
    <section id="uu-diem" className="bg-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-12 lg:h-0 lg:px-0 lg:pt-0">
        <div className="flex flex-col gap-[12px] lg:relative lg:left-[80px] lg:top-[80px] lg:w-[399px]">
          <SectionLabel>{label}</SectionLabel>
          <h2 className="text-heading-lg font-bold uppercase text-brand-deep sm:text-display-sm lg:whitespace-nowrap">
            {heading}
          </h2>
        </div>
      </div>

      <div className="lg:h-[900px]">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-[20px] overflow-x-auto scroll-smooth scroll-pl-4 px-4 pt-8 [scrollbar-width:none] md:gap-[24px] lg:gap-[40px] lg:scroll-pl-[max(1rem,calc((100vw-1440px)/2+80px))] lg:pt-[216px] lg:pl-[max(1rem,calc((100vw-1440px)/2+80px))] lg:pr-0 [&::-webkit-scrollbar]:hidden"
        >
          {loop.map((item, i) => (
            <article
              key={`${item.title}-${i}`}
              aria-hidden={i < count || i >= count * 2 ? true : undefined}
              className="group relative h-[380px] w-[280px] shrink-0 snap-start rounded-[40px] md:h-[440px] md:w-[320px] lg:h-[500px] lg:w-[400px] lg:rounded-[50px]"
            >
              {/* Figma: rê chuột thì hiện quầng xanh 10% loe ra 10px quanh thẻ */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-[10px] rounded-[40px] bg-brand/10 opacity-0 transition-opacity duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:opacity-100 lg:rounded-[50px]"
              />
              <span className="absolute inset-0 overflow-hidden rounded-[40px] lg:rounded-[50px]">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={400}
                  height={500}
                  sizes="(max-width: 767px) 280px, (max-width: 1439px) 320px, 400px"
                  className="absolute inset-0 h-full w-full object-cover transition-[scale,opacity] duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:scale-[1.125] group-hover:opacity-0"
                />
                <Image
                  src={item.imageHover.src}
                  alt=""
                  width={400}
                  height={500}
                  sizes="(max-width: 767px) 280px, (max-width: 1439px) 320px, 400px"
                  className="absolute inset-0 h-full w-full scale-[1.125] object-cover opacity-0 transition-[scale,opacity] duration-[833ms] [transition-timing-function:var(--ease-slow)] group-hover:scale-100 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-[#09386d]"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-black"
                />
              </span>
              <div className="absolute inset-x-[24px] bottom-[28px] flex flex-col gap-[4px] text-white lg:inset-x-[32px] lg:bottom-[40px]">
                <h3 className="whitespace-pre-line text-heading-md font-medium uppercase lg:text-heading-lg">
                  {item.title}
                </h3>
                <p className="text-body-md">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[1440px] items-center justify-center gap-[8px] lg:mt-[48px] lg:gap-[40px]">
          <NavButton label="Ưu điểm trước" onClick={() => go(index - 1)}>
            <ArrowLeft className="size-[14px]" />
          </NavButton>
          <div className="flex items-center">
            {items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Tới ưu điểm ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                /* Chấm vẫn 10px như thiết kế, nhưng vùng bấm 44px cho ngón tay. */
                className="grid size-[44px] place-items-center"
              >
                <span
                  className={`block size-[10px] rounded-full transition-colors ${
                    i === index ? "bg-brand" : "bg-stroke"
                  }`}
                />
              </button>
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
      className="group relative hidden size-[48px] shrink-0 place-items-center rounded-full bg-white text-text-heading shadow-[0_4px_16px_rgba(30,126,216,0.12)] sm:grid lg:size-[56px]"
    >
      <span
        aria-hidden
        className="absolute size-[62px] rounded-full bg-brand/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:size-[70px]"
      />
      <span className="relative">{children}</span>
    </button>
  );
}
