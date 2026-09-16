import Image from "next/image";
import { footer } from "@/lib/content";

/** Chân trang — khung thiết kế 1440×530 (430 phần nội dung + 100 dòng bản quyền). */
export function Footer() {
  const { logo, companyName, registration, subLogo, columns, copyright, socials } = footer;
  const visibleSocials = socials.filter((s) => s.href);

  return (
    <footer className="bg-linear-to-b from-white to-bg-soft">
      <div className="mx-auto w-full max-w-[1440px] px-4 dsk:px-[80px]">
        <div className="grid gap-10 py-10 dsk:h-[430px] dsk:grid-cols-[421px_1fr] dsk:gap-0 dsk:py-[100px]">
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={139}
                height={60}
                className="h-[60px] w-auto"
                style={{ height: 60, width: "auto" }}
              />
              <p className="text-body-lg font-bold uppercase text-brand-deep">
                {companyName}
              </p>
            </div>
            <p className="whitespace-pre-line text-body-sm font-medium text-text-muted">
              {registration}
            </p>
            <Image
              src={subLogo.src}
              alt={subLogo.alt}
              width={175}
              height={66}
              className="mt-[16px] h-[66px] w-auto"
              style={{ height: 66, width: "auto" }}
            />
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-[64px] dsk:justify-end">
            {columns.map((col, i) => (
              <div key={`${col.title}-${i}`} className="flex flex-col gap-[16px]">
                <p className="text-body-lg font-bold text-brand-deep">{col.title}</p>
                <span aria-hidden className="h-px w-[48px] bg-brand" />
                <ul className="flex flex-col gap-[14px]">
                  {col.links.map((link, j) => (
                    <li key={`${link.label}-${j}`} className="text-body-md text-text-heading">
                      {link.href ? (
                        <a href={link.href} className="whitespace-pre-line transition-colors hover:text-brand">
                          {link.label}
                        </a>
                      ) : (
                        <span className="whitespace-pre-line">{link.label}</span>
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
                  className="grid size-6 place-items-center rounded-[4px] text-text-heading transition-colors hover:text-brand"
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

function SocialIcon({ name }: { name: string }) {
  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[22px]">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.5-1.5H16.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.5v3h2.8v8h3.2Z" />
    </svg>
  );
}
