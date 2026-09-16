import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Khách đăng ký — Thaco Towner E",
  robots: { index: false, follow: false },
};

export default function LeadsPage() {
  return <AdminApp defaultTab="leads" />;
}
