import Image from "next/image";
import { header } from "@/lib/content";

/**
 * Đầu trang: thanh menu xanh 40px + ảnh lớn.
 *
 * Khung thiết kế 1440×1064. Từ `lg` (=1440px) trở lên:
 *  · NỀN tràn hết bề ngang màn hình;
 *  · NỘI DUNG (menu, logo, chữ) neo trong khung 1440 căn giữa.
 * Ảnh lớn đặt bằng đơn vị `vw` theo đúng tỉ lệ Figma (1938×1551 tại -249,-244
 * trên khung 1440) nên bố cục ảnh giữ nguyên ở mọi bề ngang, không lộ thêm/mất
 * bớt phần nào. Chiều cao khối vì thế cũng co giãn theo: 1024/1440 = 71.11vw.
 */
export function Header() {
  const { menu, logo, background, title, description } = header;

  return (
    <header className="relative">
      {/* Thanh menu — nền tràn viền, các mục neo trong khung 1440 */}
      <nav className="w-full bg-brand-deep">
        <ul className="mx-auto flex max-w-[1440px] overflow-x-auto px-4 lg:overflow-visible lg:px-[40px]">
          {menu.map((item) => (
            <li key={item.href} className="shrink-0 lg:w-[117px]">
              <a
                href={item.href}
                className="flex h-[40px] items-center gap-[10px] px-3 text-body-xs text-white transition-opacity hover:opacity-70 lg:justify-center lg:px-0"
              >
                <span aria-hidden className="size-[4px] shrink-0 rounded-full bg-white" />
                <span className="whitespace-nowrap">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Ảnh lớn — tràn viền */}
      <div className="relative overflow-hidden bg-white lg:h-[71.11vw]">
        <Image
          src={background.srcMobile || background.src}
          alt={background.alt}
          width={1938}
          height={1551}
          priority
          sizes="140vw"
          className="h-auto w-full object-cover lg:absolute lg:left-[-17.29vw] lg:top-[-16.94vw] lg:h-auto lg:w-[134.58vw] lg:max-w-none"
        />

        {/* Vệt sáng trắng làm nền cho chữ (Figma: ellipse trắng, mờ 356px,
            chế độ hoà trộn soft-light) */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[-100vw] top-[-35.42vw] hidden h-[70.9vw] w-[200vw] rounded-[50%] bg-white [filter:blur(24.7vw)] [mix-blend-mode:soft-light] lg:block"
        />

        {/* Nội dung — neo trong khung 1440 căn giữa */}
        <div className="relative mx-auto w-full max-w-[1440px] lg:h-full">
          <div className="px-6 py-10 lg:absolute lg:left-[80px] lg:top-[95px] lg:w-[640px] lg:p-0">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={640}
              height={142}
              priority
              className="h-auto w-[280px] lg:w-[640px]"
            />
            <div className="mt-6 flex flex-col gap-[12px] lg:mt-[39px] lg:pl-[13px]">
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
