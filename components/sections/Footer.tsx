import Image from "next/image";
import { footer } from "@/lib/content";
import { FooterIcon, SocialIcon } from "@/components/FooterIcons";

/**
 * Chân trang — khung thiết kế 1440×530 (430 phần nội dung + 100 dòng bản quyền).
 * Nền chuyển màu tràn hết bề ngang; nội dung neo trong khung 1440 căn giữa, các
 * cột đặt đúng toạ độ Figma: 565 / 746 / 975 (rộng 117 / 165 / 385, cách 64).
 * Laptop (lg–xl): 2 phần LUÔN đứng cạnh nhau như Figma (khách yêu cầu 21/09, kể cả
 * 800px). Phần phải rộng theo nội dung (`minmax(0, max-content)`), phần công ty lấy phần
 * còn lại nhưng không dưới 190px. Chỗ không đủ thì chỉ cột cuối (Liên hệ) co lại và xuống
 * dòng — số điện thoại không bị tách, email ngắt sau "." / "@" (xem `ngatDongLienHe`).
 * Liên kết giữ cao ≥40px (vùng bấm) vì iPad ngang 1024 cũng rơi vào dải này.
 */
// Figma cho cột rộng 117 / 165 / 385, nhưng Montserrat trên trình duyệt rộng hơn
// trong Figma một chút nên ép cứng sẽ làm chữ xuống dòng. Dùng `w-max` để cột tự
// vừa nội dung — điểm bắt đầu 565 vẫn giữ nguyên.
const COL_W = ["xl:w-max xl:shrink-0", "xl:w-max xl:shrink-0", "xl:w-max xl:shrink-0"];

/**
 * Cột Liên hệ ở laptop hẹp (800px) chỉ rộng ~210px nên phải tự xuống dòng — cho nó
 * xuống dòng ĐÚNG CHỖ: số điện thoại không bị tách ("0933 / 805 902") vì cụm số nằm
 * trong 1 span không xuống dòng (KHÔNG dùng dấu cách không ngắt: trong Montserrat nó
 * rộng khác dấu cách thường, làm số xê dịch cả ở bản 1440); email ngắt được sau mỗi
 * "." của phần tên và sau "@", thay vì bị cắt giữa chữ ("…taib / us@…").
 */
function ngatDongLienHe(label: string) {
  const at = label.indexOf("@");
  if (at >= 0) {
    const start = label.lastIndexOf(" ", at) + 1;
    const parts = label.slice(start, at + 1).split(/(?<=\.)/);
    return (
      <>
        {label.slice(0, start)}
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            <wbr />
          </span>
        ))}
        {label.slice(at + 1)}
      </>
    );
  }
  // Cụm số điện thoại: chữ số nối nhau bằng dấu cách / chấm / gạch.
  return label.split(/(\+?\d[\d .-]*\d)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function Footer() {
  const { logo, companyName, registration, subLogo, columns, copyright, socials } = footer;
  const visibleSocials = socials.filter((s) => s.href);
  // Cột rỗng thì ẩn hẳn — không để tiêu đề trơ trọi không có dòng nào bên dưới.
  const visibleColumns = columns.filter((c) => c.links.some((l) => l.label.trim()));

  return (
    <footer className="canvas-1440 bg-linear-to-b from-white to-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-[calc(80*var(--u))]">
        <div className="grid gap-10 py-10 lg:gap-x-[max(24px,calc(48*var(--u)))] lg:py-[calc(100*var(--u))] lg:max-xl:grid-cols-[minmax(190px,1fr)_minmax(0,max-content)] xl:h-[430px] xl:grid-cols-[485px_795px] xl:gap-0">
          <div className="flex min-w-0 flex-col items-start gap-[16px]">
            <div className="flex flex-col items-start gap-[8px]">
              {/* Figma đặt ảnh này kiểu STRETCH + imageTransform (chỉ lấy dải 18,8%–70%
                  chiều cao), KHÔNG cắt chính giữa — `object-cover` từng cắt mất đỉnh vòng
                  elip. Tệp `logo-main.webp` đã cắt sẵn đúng dải đó, gấp 3 cỡ hiển thị cho
                  nét; `object-contain` để logo khách tự tải lên cũng không bị cắt. */}
              <span className="relative block h-[60px] w-[139px] shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={139}
                  height={60}
                  className="absolute inset-0 h-full w-full object-contain object-left"
                />
              </span>
              <p className="text-body-lg font-bold uppercase text-brand-deep lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">
                {companyName}
              </p>
            </div>
            <p className="whitespace-pre-line wrap-anywhere text-body-sm font-medium text-text-muted lg:text-[length:max(12px,calc(14*var(--u)))] lg:leading-[1.4286]">
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

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-[64px] lg:gap-[max(24px,calc(64*var(--u)))]">
            {visibleColumns.map((col, i) => (
              <div
                key={`${col.title}-${i}`}
                className={`flex min-w-0 flex-col gap-[16px] lg:max-xl:shrink-0 lg:max-xl:last:flex-1 lg:max-xl:last:shrink ${COL_W[i] ?? ""}`}
              >
                <p className="text-body-lg font-bold text-brand-deep lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.5]">{col.title}</p>
                <span aria-hidden className="h-px w-[48px] bg-brand" />
                <ul className="flex flex-col gap-[2px] xl:gap-[14px]">
                  {col.links
                    .filter((link) => link.label.trim())
                    .map((link, j) => (
                    <li key={`${link.label}-${j}`}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="flex items-start gap-[10px] py-[10px] text-body-md text-text-heading transition-colors hover:text-brand lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25] lg:min-h-[40px] xl:min-h-0 xl:py-0"
                        >
                          <FooterIcon name={link.icon} />
                          {/* Địa chỉ thư điện tử không có chỗ ngắt tự nhiên — ở màn
                              320px nó đẩy cả cột rộng 368px và làm tràn ngang. */}
                          <span className="min-w-0 whitespace-pre-line wrap-anywhere">
                            {ngatDongLienHe(link.label)}
                          </span>
                        </a>
                      ) : (
                        <span className="flex items-start gap-[10px] py-[10px] text-body-md text-text-heading lg:text-[length:max(12px,calc(16*var(--u)))] lg:leading-[1.25] lg:min-h-[40px] xl:min-h-0 xl:py-0">
                          <FooterIcon name={link.icon} />
                          <span className="min-w-0 whitespace-pre-line wrap-anywhere">
                            {ngatDongLienHe(link.label)}
                          </span>
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
            <div className="-mr-[11px] flex items-center">
              {visibleSocials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.icon}
                  className="grid size-[44px] place-items-center rounded-[4px] text-text-heading transition-colors hover:text-brand"
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
