import { Montserrat } from "next/font/google";

// Bản thiết kế dùng đúng một họ chữ: Montserrat, các mức đậm 400/500/600/700/800.
export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
