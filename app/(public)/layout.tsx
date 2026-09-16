import type { Metadata } from "next";
import { montserrat } from "../fonts";
import "../globals.css";

// Google Tag Manager container. Khách chưa cấp mã — để rỗng thì không chèn thẻ
// nào. Khi có mã, dán vào đây là xong (chỉ trang khách, không áp cho /admin).
const GTM_ID = "";

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

// Google Tag Manager chỉ chạy trên trang khách. `/admin` và `/leads` nằm ở root
// layout riêng (`app/(admin)/layout.tsx`) nên thao tác nội bộ không vào số liệu.
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <head>
        {GTM_ID ? (
          /* Google Tag Manager — thẻ thô, KHÔNG dùng next/script
             (beforeInteractive không xuất ra <script> thật). */
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        ) : null}
      </head>
      <body className="bg-white text-text-heading antialiased">
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        {children}
      </body>
    </html>
  );
}
