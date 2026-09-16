import Image from "next/image";
import { footer } from "@/lib/content";
import { FooterIcon, SocialIcon } from "@/components/FooterIcons";

/**
 * Chân trang — khung thiết kế 1440×530 (430 phần nội dung + 100 dòng bản quyền).
 * Nền chuyển màu tràn hết bề ngang; nội dung neo trong khung 1440 căn giữa, các
 * cột đặt đúng toạ độ Figma: 565 / 746 / 975 (rộng 117 / 165 / 385, cách 64).
 */
// Figma cho cột rộng 117 / 165 / 385, nhưng Montserrat trên trình duyệt rộng hơn
// trong Figma một chút nên ép cứng sẽ làm chữ xuống dòng. Dùng `w-max` để cột tự
// vừa nội dung — điểm bắt đầu 565 vẫn giữ nguyên.
const COL_W = ["lg:w-max lg:shrink-0", "lg:w-max lg:shrink-0", "lg:w-max lg:shrink-0"];

export function Footer() {
  const { logo, companyName, registration, subLogo, columns, copyright, socials } = footer;
  const visibleSocials = socials.filter((s) => s.href);

  return (
    <footer className="bg-linear-to-b from-white to-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-[80px]">
        <div className="grid gap-10 py-10 lg:h-[430px] lg:grid-cols-[485px_795px] lg:gap-0 lg:py-[100px]">
          <div className="flex flex-col items-start gap-[16px]">
            <div className="flex flex-col items-start gap-[8px]">
              <span className="relative block h-[60px] w-[139px] shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={139}
                  height={60}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </span>
              <p className="text-body-lg font-bold uppercase text-brand-deep">
                {companyName}
              </p>
            </div>
            <p className="whitespace-pre-line text-body-sm font-medium text-text-muted">
              {registration}
            </p>
            <span className="relative mt-[16px] block h-[66px] w-[175px] shrink-0">
              <Image
                src={subLogo.src}
                alt={subLogo.alt}
                width={175}
                height={66}
                className="absolute inset-0 h-full w-full object-contain object-left"
              />
            </span>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-[64px]">
            {columns.map((col, i) => (
              <div key={`${col.title}-${i}`} className={`flex flex-col gap-[16px] ${COL_W[i] ?? ""}`}>
                <p className="text-body-lg font-bold text-brand-deep">{col.title}</p>
                <span aria-hidden className="h-px w-[48px] bg-brand" />
                <ul className="flex flex-col gap-[14px]">
                  {col.links.map((link, j) => (
                    <li key={`${link.label}-${j}`}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="flex items-start gap-[10px] text-body-md text-text-heading transition-colors hover:text-brand"
                        >
                          <FooterIcon name={link.icon} />
                          <span className="whitespace-pre-line">{link.label}</span>
                        </a>
                      ) : (
                        <span className="flex items-start gap-[10px] text-body-md text-text-heading">
                          <FooterIcon name={link.icon} />
                          <span className="whitespace-pre-line">{link.label}</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-[100px] items-center justify-between border-t border-stroke-mute">
          <p className="text-body-sm font-medium text-text-heading">{copyright}</p>
          {visibleSocials.length > 0 && (
            <div className="flex items-center gap-[12px]">
              {visibleSocials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.icon}
                  className="grid place-items-center rounded-[4px] text-text-heading transition-colors hover:text-brand"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
