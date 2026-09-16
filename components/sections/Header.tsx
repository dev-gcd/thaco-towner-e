import Image from "next/image";
import { header } from "@/lib/content";

/**
 * Đầu trang: thanh menu xanh 40px + ảnh lớn 1024px.
 *
 * Khung thiết kế 1440×1064. Từ `lg` trở lên dựng đúng số đo Figma bằng toạ độ
 * tuyệt đối; dưới `lg` xếp dọc lại cho vừa điện thoại. KHÔNG dùng `100vh` —
 * xem mục cạm bẫy trong AGENTS.md.
 */
export function Header() {
  const { menu, logo, background, title, description } = header;

  return (
    <header className="relative">
      {/* Thanh menu */}
      <nav className="w-full bg-brand-deep">
        <ul className="mx-auto flex max-w-[1440px] overflow-x-auto px-4 dsk:justify-start dsk:overflow-visible dsk:px-0 dsk:pl-[40px]">
          {menu.map((item) => (
            <li key={item.href} className="shrink-0 dsk:w-[117px]">
              <a
                href={item.href}
                className="flex h-[40px] items-center justify-center gap-[10px] px-3 text-body-xs text-white transition-opacity hover:opacity-70 dsk:px-0"
              >
                <span aria-hidden className="size-[4px] rounded-full bg-white" />
                <span className="whitespace-nowrap">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Ảnh lớn */}
      <div className="relative overflow-hidden bg-white dsk:h-[1024px]">
        <div className="relative mx-auto h-full w-full max-w-[1440px]">
          <Image
            src={background.srcMobile || background.src}
            alt={background.alt}
            width={1938}
            height={1551}
            priority
            sizes="100vw"
            className="h-auto w-full object-cover dsk:absolute dsk:left-[-249px] dsk:top-[-244px] dsk:h-[1551px] dsk:w-[1938px] dsk:max-w-none"
          />

          {/* Vệt sáng trắng làm nền cho chữ (Figma: ellipse trắng, mờ 356px,
              chế độ hoà trộn soft-light) */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[-1439px] top-[-510px] hidden h-[1021px] w-[2879px] rounded-[50%] bg-white [filter:blur(356px)] [mix-blend-mode:soft-light] dsk:block"
          />

          <div className="relative px-6 py-10 dsk:absolute dsk:left-[80px] dsk:top-[95px] dsk:w-[640px] dsk:p-0">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={640}
              height={142}
              priority
              className="h-auto w-[280px] dsk:w-[640px]"
            />
            <div className="mt-6 flex flex-col gap-[12px] dsk:mt-[39px] dsk:pl-[13px]">
              <h1 className="text-display-sm font-normal uppercase text-text-heading">
                {title}
              </h1>
              <p className="whitespace-pre-line text-body-md text-text-heading">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
