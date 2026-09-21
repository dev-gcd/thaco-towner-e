"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Nhịp đổi ảnh đo từ video `_docs/slider_ngoai_that.mp4`: ~0,7s, nhanh đầu chậm cuối. */
const SWAP = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;
/** Xe mới trượt vào từ khoảng 40% bề ngang khung (đo từ video). */
const SLIDE = "40%";

/**
 * Băng ảnh các góc xe ở khối Ngoại thất (thay trình xem 360° cũ — Figma và video
 * dựng play đều là băng ảnh: 1 ảnh xe + 2 mũi tên + thanh vị trí, KHÔNG kéo xoay).
 *
 * Đổi ảnh = xe cũ trượt ra và nhạt dần, xe mới trượt vào và rõ dần, CÙNG LÚC. Hướng
 * theo chiều số thứ tự: sang ảnh sau thì xe mới vào từ phải; lùi lại — kể cả quay
 * vòng từ ảnh cuối về ảnh đầu — thì vào từ trái (đúng như video).
 *
 * Mọi ảnh cùng khổ 1536×1024, xe cùng chiều cao và cùng đường chân bánh, nên chỉ cần
 * `object-contain object-bottom` là xe đứng đúng chỗ ở mọi góc.
 */
export function ExteriorSlider({
  slides,
  alt,
  index,
  direction,
  onStep,
  className = "",
}: {
  slides: string[];
  alt: string;
  index: number;
  /** 1 = xe mới vào từ phải, -1 = vào từ trái. */
  direction: 1 | -1;
  onStep: (delta: 1 | -1) => void;
  className?: string;
}) {
  const count = slides.length;
  const many = count > 1;
  const boxRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const [started, setStarted] = useState(false);

  // Tải trước cả bộ khi khối còn cách màn ~800px — không thì lần bấm đầu xe mới
  // hiện chậm, lệch nhịp với xe cũ đang trượt ra.
  useEffect(() => {
    if (!many || started) return;
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [many, started]);

  useEffect(() => {
    if (!started) return;
    for (const src of slides) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [started, slides]);

  // Vuốt ngang trên điện thoại: quá 40px mới tính, để chạm nhẹ không đổi ảnh.
  function onPointerDown(e: React.PointerEvent) {
    if (many) swipe.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    const x0 = swipe.current;
    swipe.current = null;
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (!many) return;
    if (e.key === "ArrowLeft") onStep(-1);
    else if (e.key === "ArrowRight") onStep(1);
    else return;
    e.preventDefault();
  }

  return (
    <div
      ref={boxRef}
      className={`${className} overflow-hidden ${many ? "touch-pan-y select-none" : ""}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onKeyDown={onKeyDown}
      tabIndex={many ? 0 : undefined}
      role={many ? "group" : undefined}
      aria-roledescription={many ? "băng ảnh" : undefined}
      aria-label={many ? `Ảnh ngoại thất ${index + 1}/${count}` : undefined}
    >
      <AnimatePresence initial={false} custom={direction}>
        {/* Ảnh đã tải trước nên chỉ đổi src là hiện ngay — không dùng next/image
            (xuất tĩnh đã tắt tối ưu ảnh, lại sinh thêm lazy-load cho từng ảnh). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={index}
          src={slides[index]}
          alt={alt}
          draggable={false}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? SLIDE : `-${SLIDE}`, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? `-${SLIDE}` : SLIDE, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SWAP}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
        />
      </AnimatePresence>
    </div>
  );
}

/**
 * Thanh vị trí dưới băng ảnh (Figma: thanh 260×4, đoạn xanh 54×4). Đoạn xanh chạy
 * từ mép trái (ảnh đầu) tới mép phải (ảnh cuối), cùng nhịp với lúc đổi ảnh.
 */
export function SliderTrack({ index, count, className = "" }: { index: number; count: number; className?: string }) {
  const pos = count > 1 ? index / (count - 1) : 0;
  return (
    <div aria-hidden className={`relative h-[4px] overflow-hidden rounded-full bg-stroke-mute ${className}`}>
      <span
        className="absolute inset-y-0 w-[20.77%] rounded-full bg-brand transition-[left] duration-700 [transition-timing-function:var(--ease-slow)]"
        style={{ left: `${pos * 79.23}%` }}
      />
    </div>
  );
}
