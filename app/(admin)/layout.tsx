import type { Metadata } from "next";
import { montserrat } from "../fonts";
import "../globals.css";

// Root layout riêng cho CMS: cố ý KHÔNG nhúng Google Tag Manager để thao tác
// quản trị không lẫn vào số liệu của trang khách.
export const metadata: Metadata = {
  title: "CMS — Thaco Towner E",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body className="bg-white text-text-heading antialiased">
        {children}
      </body>
    </html>
  );
}
