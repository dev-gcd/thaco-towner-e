import type { Metadata } from "next";
import { montserrat } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  // Địa chỉ workers.dev của tài khoản dev@gcd.vn (deploy lần đầu 16/09).
  // Khách cấp tên miền riêng thì đổi sang tên miền đó.
  metadataBase: new URL("https://thaco-towner-e.yellow-mouse-f324.workers.dev"),
  title: "Thaco Towner E",
  description: "Xe tải van điện thế hệ mới — Thaco Towner E.",
  openGraph: {
    title: "Thaco Towner E",
    type: "website",
    locale: "vi_VN",
  },
};

// Mã theo dõi (GTM, GA4…) KHÔNG gắn ở đây: khách dán ở /admin → "Mã theo dõi", và
// scripts/inject-tracking.mjs chèn nguyên văn vào out/*.html sau `next build` — chỉ trang
// khách. `/admin` và `/leads` nằm ở root layout riêng (`app/(admin)/layout.tsx`).
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body className="bg-white text-text-heading antialiased">{children}</body>
    </html>
  );
}
