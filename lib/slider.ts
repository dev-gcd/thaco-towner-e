/**
 * Trợ giúp cho các dải cuộn ngang (Ưu điểm, Nội thất, Trạm sạc).
 *
 * Bước trượt luôn ĐO TỪ DOM chứ không ghi cứng: bề rộng thẻ và khoảng cách đổi
 * theo từng mốc màn hình, ghi cứng một con số là băng chuyền lệch ngay.
 */

/** Bề rộng một bước trượt = khoảng cách giữa mép trái hai thẻ liền nhau. */
export function doBuocTruot(khung: HTMLElement | null): number {
  if (!khung) return 0;
  const the = khung.children;
  if (the.length < 2) return 0;
  const b = Math.round(
    the[1].getBoundingClientRect().left - the[0].getBoundingClientRect().left
  );
  return b > 0 ? b : 0;
}

/**
 * Trượt sang thẻ kế tiếp (hoặc lùi lại). Tới cuối thì quay về đầu, để bấm liên
 * tục không bị kẹt ở thẻ cuối.
 */
export function truotThe(khung: HTMLElement | null, huong: 1 | -1 = 1): void {
  if (!khung) return;
  const buoc = doBuocTruot(khung);
  if (!buoc) return;
  const toiDa = khung.scrollWidth - khung.clientWidth;
  let dich = khung.scrollLeft + buoc * huong;
  if (dich > toiDa - 2) dich = 0;
  else if (dich < 0) dich = toiDa;
  khung.scrollTo({ left: dich, behavior: "smooth" });
}

/** Bấm vào thẻ thì chuyển thẻ — trừ khi bấm trúng nút/liên kết bên trong nó. */
export function bamDeChuyen(
  e: React.MouseEvent,
  khung: HTMLElement | null
): void {
  if ((e.target as HTMLElement).closest("a,button,input,textarea,select")) return;
  truotThe(khung, 1);
}
