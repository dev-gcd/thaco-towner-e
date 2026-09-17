"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Ảnh xe xoay 360°.
 *
 *  · Chưa có bộ ảnh (dưới 2 ảnh) → hiện 1 ảnh xe tĩnh như cũ.
 *  · Có bộ ảnh → TẢI TRƯỚC toàn bộ khi khối sắp lọt vào màn (không tải trước thì
 *    lần xoay đầu nháy trắng), và KÉO NGANG trên ảnh để xoay (chuột + ngón tay).
 *    Kéo hết bề ngang khung = quay đúng 1 vòng.
 *
 * `touch-action: pan-y` để trên điện thoại vuốt dọc vẫn cuộn trang bình thường,
 * chỉ vuốt ngang mới xoay xe.
 */
export function Car360({
  frames,
  fallbackSrc,
  alt,
  frame,
  onFrame,
  className = "",
}: {
  frames: string[];
  fallbackSrc: string;
  alt: string;
  frame: number;
  onFrame: (next: number) => void;
  className?: string;
}) {
  const count = frames.length;
  const has360 = count > 1;
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const [loaded, setLoaded] = useState(0);
  const [started, setStarted] = useState(false);
  const [touched, setTouched] = useState(false);

  // Tải trước khi khối còn cách màn ~800px.
  useEffect(() => {
    if (!has360 || started) return;
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
  }, [has360, started]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    setLoaded(0);
    for (const src of frames) {
      const img = new window.Image();
      img.decoding = "async";
      const done = () => !cancelled && setLoaded((n) => n + 1);
      img.onload = done;
      img.onerror = done;
      img.src = src;
    }
    return () => {
      cancelled = true;
    };
  }, [started, frames]);

  const ready = loaded >= count;

  function onPointerDown(e: React.PointerEvent) {
    if (!has360) return;
    drag.current = { x: e.clientX, start: frame };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setTouched(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const box = boxRef.current;
    if (!d || !box) return;
    const step = box.clientWidth / count;
    const moved = Math.round((e.clientX - d.x) / step);
    onFrame((((d.start - moved) % count) + count) % count);
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (!has360) return;
    if (e.key === "ArrowLeft") onFrame((frame - 1 + count) % count);
    else if (e.key === "ArrowRight") onFrame((frame + 1) % count);
    else return;
    e.preventDefault();
    setTouched(true);
  }

  return (
    <div
      ref={boxRef}
      data-car360={has360 ? "on" : "off"}
      className={`${className} ${has360 ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={has360 ? 0 : undefined}
      role={has360 ? "slider" : undefined}
      aria-label={has360 ? "Kéo ngang để xoay xe 360 độ" : undefined}
      aria-valuemin={has360 ? 1 : undefined}
      aria-valuemax={has360 ? count : undefined}
      aria-valuenow={has360 ? frame + 1 : undefined}
    >
      {has360 ? (
        // Ảnh đã tải trước nên chỉ đổi src là hiện ngay — không dùng next/image
        // để khỏi phát sinh thẻ mới / lazy-load cho từng khung.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frames[Math.min(frame, count - 1)]}
          alt={alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom"
        />
      ) : (
        <Image
          src={fallbackSrc}
          alt={alt}
          width={1440}
          height={960}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-contain object-bottom"
        />
      )}

      {has360 && !touched && (
        <span className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-body-sm font-medium text-text-heading shadow-sm backdrop-blur lg:bottom-[150px]">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4 text-brand">
            <path
              d="M4 12h16m-16 0 3-3m-3 3 3 3m13-3-3-3m3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {ready ? "Kéo để xoay 360°" : `Đang tải ảnh 360° ${Math.min(loaded, count)}/${count}`}
        </span>
      )}
    </div>
  );
}
