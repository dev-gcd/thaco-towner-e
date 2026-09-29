// Nguồn của 1 khách đăng ký (cột `source` trong D1 `leads`, migration 0003).
// Dùng chung cho form trang khách, Worker và trang Khách đăng ký.
// scripts/cms-dev.mjs (JS thường) giữ bản sao danh sách khoá — thêm nguồn thì sửa cả ở đó.
export const LEAD_SOURCES = {
  test_drive: "Lái thử",
  quote: "Báo giá",
} as const;

export type LeadSource = keyof typeof LEAD_SOURCES;

export const DEFAULT_LEAD_SOURCE: LeadSource = "test_drive";

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && Object.hasOwn(LEAD_SOURCES, value);
}
