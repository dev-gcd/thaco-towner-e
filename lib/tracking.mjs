// Kiểm mã theo dõi khách dán trong /admin → "Mã theo dõi" (GTM, GA4, Pixel…).
// Plain JS (không TS) vì dùng chung ở 3 nơi: trang quản trị (Next), Worker khi lưu,
// và scripts/inject-tracking.mjs lúc build (Node chạy thẳng, không qua bộ dịch TS).
//
// Mã được chèn NGUYÊN VĂN vào HTML trang khách, nên chỉ chặn những lỗi làm vỡ cả
// trang (thẻ mở mà không đóng, dán nhầm cả trang HTML), không lọc nội dung script.

export const TRACKING_MAX_LENGTH = 20000;

/** Thẻ khung trang — có mặt trong mã dán vào là dán nhầm cả trang HTML. */
const FORBIDDEN_TAGS = /<\/?(html|head|body)[\s>]/i;

/** Các cặp phải cân: thiếu thẻ đóng thì phần còn lại của trang bị nuốt mất. */
const PAIRS = [
  ["script", /<script[\s>]/gi, /<\/script\s*>/gi],
  ["noscript", /<noscript[\s>]/gi, /<\/noscript\s*>/gi],
  ["style", /<style[\s>]/gi, /<\/style\s*>/gi],
  ["iframe", /<iframe[\s>]/gi, /<\/iframe\s*>/gi],
  ["chú thích <!-- -->", /<!--/g, /-->/g],
];

const count = (text, re) => (text.match(re) ?? []).length;

/**
 * @param {unknown} code
 * @param {string} where tên ô, để câu báo lỗi chỉ đúng chỗ
 * @returns {string | null} câu báo lỗi, hoặc null nếu dùng được
 */
export function checkTrackingCode(code, where) {
  if (typeof code !== "string") return `${where}: phải là văn bản`;
  if (code.length > TRACKING_MAX_LENGTH) {
    return `${where}: dài quá ${TRACKING_MAX_LENGTH.toLocaleString("vi-VN")} ký tự`;
  }
  const tag = code.match(FORBIDDEN_TAGS);
  if (tag) return `${where}: không được chứa thẻ <${tag[1].toLowerCase()}> — chỉ dán đoạn mã, không dán cả trang`;
  for (const [name, open, close] of PAIRS) {
    const o = count(code, open);
    const c = count(code, close);
    if (o !== c) return `${where}: thẻ ${name} mở ${o} lần nhưng đóng ${c} lần`;
  }
  return null;
}

/**
 * @param {unknown} content nội dung content/tracking.json
 * @returns {string | null}
 */
export function checkTrackingContent(content) {
  if (content == null || typeof content !== "object") return "Thiếu nội dung";
  const { headCode, bodyCode } = /** @type {Record<string, unknown>} */ (content);
  return (
    checkTrackingCode(headCode, "Mã chèn vào <head>") ??
    checkTrackingCode(bodyCode, "Mã chèn đầu <body>")
  );
}
