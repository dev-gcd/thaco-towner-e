// Central content loader. Each landing block reads its content from a JSON file
// under content/, resolved at build time (the site is a static export).
//
// This project is Vietnamese-only: text fields are plain strings. If English is
// ever needed, switch the fields to { vi, en } and reintroduce a `pick()` helper
// (see thaco-truck-sale-page for the bilingual variant).
//
// ── Adding an editable block (recipe) ────────────────────────────────────────
// 1. content/<block>.json + snapshot content/defaults/<block>.json
// 2. type + `export const <block>` here
// 3. section component reads from this loader (literals only, keep layout/CSS)
// 4. components/admin/<Block>Editor.tsx using ui.tsx + useContent.ts
// 5. register the key in CONTENT_FILES (worker/index.ts AND scripts/cms-dev.mjs)
//    + CONTENT_ITEMS in components/admin/AdminApp.tsx

/** A content image with an optional per-breakpoint mobile override. */
export type CmsImage = {
  src: string;
  srcMobile?: string;
  alt: string;
};

// ── Blocks ───────────────────────────────────────────────────
// Empty until the Figma layout is readable. Blocks are added one at a time
// following the recipe above.

import headerData from "@/content/header.json";

// ── Header (đầu trang) ───────────────────────────────────────
export type MenuLink = { label: string; href: string };
export type HeaderContent = {
  menu: MenuLink[];
  logo: CmsImage;
  background: CmsImage;
  title: string;
  description: string;
};
export const header = headerData as HeaderContent;

import gtspData from "@/content/gtsp.json";

// ── GTSP (giới thiệu sản phẩm) ───────────────────────────────
export type GtspContent = {
  title: string;
  description: string;
  ctaLabel: string;
  background: CmsImage;
  car: CmsImage;
  wheelFront: CmsImage;
  wheelRear: CmsImage;
};
export const gtsp = gtspData as GtspContent;

import uspData from "@/content/usp.json";

// ── USP (ưu điểm nổi bật — băng chuyền) ──────────────────────
export type UspItem = {
  image: CmsImage;
  /** Ảnh thứ hai, hiện đè lên khi rê chuột (Figma có 2 biến thể ảnh cho mỗi thẻ). */
  imageHover: CmsImage;
  title: string;
  subtitle: string;
};
export type UspContent = { label: string; heading: string; items: UspItem[] };
export const usp = uspData as UspContent;

import versionsData from "@/content/versions.json";

// ── Dòng xe (các phiên bản) ──────────────────────────────────
export type VersionSpec = { value: string; label: string };
export type VersionItem = {
  name: string;
  code: string;
  displayName: string;
  price: string;
  specs: VersionSpec[];
};
export type VersionsContent = {
  label: string;
  heading: string;
  /** Nửa sau của tiêu đề, hiển thị bằng màu xanh sáng. */
  headingAccent: string;
  background: CmsImage;
  priceLabel: string;
  items: VersionItem[];
};
export const versions = versionsData as VersionsContent;

import exteriorData from "@/content/exterior.json";

// ── Ngoại thất ───────────────────────────────────────────────
export type DetailItem = { image: CmsImage; title: string; description: string };
export type ExteriorContent = {
  label: string;
  ghostTitle: string;
  view360: {
    background: CmsImage;
    car: CmsImage;
    /** Bộ ảnh xoay 360°. Để trống thì chỉ hiện 1 ảnh và thanh trượt bị khoá. */
    frames: string[];
  };
  heading: string;
  headingAccent: string;
  description: string;
  items: DetailItem[];
};
export const exterior = exteriorData as ExteriorContent;

import interiorData from "@/content/interior.json";

// ── Nội thất (điểm nóng trên ảnh) ────────────────────────────
export type Hotspot = {
  title: string;
  description: string;
  image: CmsImage;
  /** Toạ độ điểm nóng trên khung 1440×1200 của bản thiết kế. */
  x: number;
  y: number;
};
export type InteriorContent = {
  label: string;
  ghostTitle: string;
  background: CmsImage;
  car: CmsImage;
  shadow: CmsImage;
  hotspots: Hotspot[];
};
export const interior = interiorData as InteriorContent;

import ctaData from "@/content/cta.json";

// ── CTA + biểu mẫu đăng ký lái thử ───────────────────────────
export type CtaCard = {
  label: string;
  heading: string;
  buttonLabel: string;
  image: CmsImage;
};
export type LeadFormContent = {
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  noteLabel: string;
  notePlaceholder: string;
  submitLabel: string;
  successMessage: string;
};
/** Chữ trong hộp thoại báo thiếu dữ liệu (dùng chung cho brochure và bản đồ). */
export type NoticeContent = { title: string; message: string };
export type CtaContent = {
  driveTest: CtaCard;
  /** `file` trống ⇒ ẩn nút tải brochure (khách chưa gửi tệp). */
  brochure: CtaCard & { file: string };
  form: LeadFormContent;
  notice: NoticeContent;
};
export const cta = ctaData as CtaContent;

import chargingData from "@/content/charging.json";

// ── Trạm sạc ─────────────────────────────────────────────────
export type StationSpec = { icon: string; value: string; label: string };
export type Station = {
  name: string;
  area: string;
  /** Link bản đồ. Để trống ⇒ ẩn nút "Mở bản đồ". */
  mapUrl: string;
  specs: StationSpec[];
};
export type ChargingContent = {
  label: string;
  heading: string;
  description: string;
  background: CmsImage;
  car: CmsImage;
  mapLabel: string;
  stations: Station[];
  highlight: { title: string; description: string };
};
export const charging = chargingData as ChargingContent;

import footerData from "@/content/footer.json";

// ── Footer ───────────────────────────────────────────────────
export type FooterLink = { icon: string; label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type FooterContent = {
  logo: CmsImage;
  companyName: string;
  registration: string;
  subLogo: CmsImage;
  columns: FooterColumn[];
  copyright: string;
  /** Để trống `href` ⇒ ẩn biểu tượng đó. */
  socials: { icon: string; href: string }[];
};
export const footer = footerData as FooterContent;
