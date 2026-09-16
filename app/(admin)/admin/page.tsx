import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "CMS — Thaco Towner E",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp defaultTab="content" />;
}
