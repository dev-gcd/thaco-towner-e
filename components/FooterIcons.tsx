/** Biểu tượng nhỏ đứng trước mỗi dòng ở chân trang (vẽ lại theo bản thiết kế). */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function FooterIcon({ name }: { name: string }) {
  const c = "size-4 shrink-0 text-brand";
  switch (name) {
    case "doc":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M5 2.5h6.5L15 6v11.5H5V2.5Z" />
          <path {...P} d="M11 2.5V6h4M7.5 10h5M7.5 13h5" />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M13.4 3.3a4 4 0 0 0-5.1 5.1l-5 5a1.6 1.6 0 0 0 2.3 2.3l5-5a4 4 0 0 0 5.1-5.1l-2.3 2.3-2-2 2-2.6Z" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M10 2.5 4.5 5v5c0 3.4 2.3 6.4 5.5 7.5 3.2-1.1 5.5-4.1 5.5-7.5V5L10 2.5Z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <circle {...P} cx="10" cy="10" r="7.5" />
          <path {...P} d="m6.8 10.2 2.2 2.2 4.2-4.4" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M10 17.5s5.5-4.6 5.5-9a5.5 5.5 0 1 0-11 0c0 4.4 5.5 9 5.5 9Z" />
          <circle {...P} cx="10" cy="8.5" r="2" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M6.2 3.3 8 3l1.6 3.4-1.7 1.3a9 9 0 0 0 4.4 4.4l1.3-1.7L17 12l-.3 1.8a1.6 1.6 0 0 1-1.8 1.4C9.6 14.6 5.4 10.4 4.8 5.1a1.6 1.6 0 0 1 1.4-1.8Z" />
        </svg>
      );
    case "headset":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M4 12V9.5a6 6 0 1 1 12 0V12" />
          <path {...P} d="M4 11.5h1.6a1 1 0 0 1 1 1v2.4a1 1 0 0 1-1 1H4.8A1.8 1.8 0 0 1 3 14v-.7a1.8 1.8 0 0 1 1-1.8ZM16 11.5h-1.6a1 1 0 0 0-1 1v2.4a1 1 0 0 0 1 1h.8a1.8 1.8 0 0 0 1.8-1.9v-.7a1.8 1.8 0 0 0-1-1.8Z" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <rect {...P} x="3" y="4.5" width="14" height="11" rx="1.6" />
          <path {...P} d="m3.5 6 6.5 4.5L16.5 6" />
        </svg>
      );
    default: // truck
      return (
        <svg viewBox="0 0 20 20" className={c} aria-hidden>
          <path {...P} d="M2.5 5.5h9v8h-9v-8ZM11.5 8h3l2.5 2.5v3h-5.5V8Z" />
          <circle {...P} cx="6" cy="15" r="1.5" />
          <circle {...P} cx="14" cy="15" r="1.5" />
        </svg>
      );
  }
}

export function SocialIcon({ name }: { name: string }) {
  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[22px]" aria-hidden>
        <path d="M4.5 3A1.5 1.5 0 1 0 4.5 6a1.5 1.5 0 0 0 0-3ZM3.2 8.2h2.6V21H3.2V8.2Zm5 0h2.5v1.8h.1c.35-.66 1.2-1.36 2.48-1.36 2.65 0 3.14 1.74 3.14 4V21h-2.6v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.19 1.48-2.19 3v5.8H8.2V8.2Z" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[22px]" aria-hidden>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[22px]" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
