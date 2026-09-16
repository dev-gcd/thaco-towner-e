// TODO: phông tạm kế thừa từ thaco-truck-sale-page. Đổi theo bản thiết kế
// Towner E ngay khi đọc được Figma.
import { Lexend, Big_Shoulders } from "next/font/google";

export const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-big-shoulders",
  display: "swap",
});
