import Image from "next/image";
import type { CmsImage } from "@/lib/content";

/**
 * Renders a CMS image that may carry a separate mobile asset. When `srcMobile`
 * is set, emits two <Image>s toggled at the `xl` breakpoint (mobile shown
 * below lg, desktop at lg+); otherwise a single image used at all sizes.
 *
 * Use this only where the surrounding layout shares ONE image across
 * breakpoints. Sections that already branch their mobile/desktop DOM (Hero,
 * About) should feed `srcMobile || src` directly instead.
 */
type Common = {
  image: CmsImage;
  /** Override the alt (e.g. "" for decorative). Defaults to image.alt. */
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};
type FillProps = Common & { fill: true; width?: never; height?: never };
type FixedProps = Common & { fill?: false; width: number; height: number };

export function ResponsiveImage(props: FillProps | FixedProps) {
  const { image, alt, className = "", sizes, priority } = props;
  const resolvedAlt = alt ?? image.alt ?? "";
  const dims = props.fill
    ? ({ fill: true } as const)
    : { width: props.width, height: props.height };
  const shared = { sizes, priority, alt: resolvedAlt, ...dims };

  if (!image.srcMobile) {
    return <Image src={image.src} {...shared} className={className} />;
  }
  return (
    <>
      <Image
        src={image.srcMobile}
        {...shared}
        className={`${className} xl:hidden`.trim()}
      />
      <Image
        src={image.src}
        {...shared}
        className={`${className} hidden xl:block`.trim()}
      />
    </>
  );
}
