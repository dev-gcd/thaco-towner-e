"use client";

import { useState } from "react";
import { Header } from "@/components/sections/Header";
import { Gtsp } from "@/components/sections/Gtsp";
import { Usp } from "@/components/sections/Usp";
import { Versions } from "@/components/sections/Versions";
import { Exterior } from "@/components/sections/Exterior";
import { Interior } from "@/components/sections/Interior";
import { Cta } from "@/components/sections/Cta";
import { Charging } from "@/components/sections/Charging";
import { Footer } from "@/components/sections/Footer";
import { LeadDialog } from "@/components/LeadDialog";

/**
 * Ghép toàn trang. Giữ ở một chỗ duy nhất trạng thái mở/đóng hộp thoại đăng ký
 * lái thử, vì có nhiều nút cùng mở nó (khối GTSP và khối CTA).
 */
export function LandingPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const openLead = () => setLeadOpen(true);

  return (
    <>
      <main>
        <Header />
        <Gtsp onCtaClick={openLead} />
        <Usp />
        <Versions />
        {/* 2 khoảng trống có sẵn trong bản thiết kế (50px và 100px) */}
        <div aria-hidden className="hidden bg-white lg:block lg:h-[50px]" />
        <Exterior />
        <div aria-hidden className="hidden bg-bg-soft lg:block lg:h-[100px]" />
        <Interior />
        <Charging />
        <Cta onDriveTestClick={openLead} />
      </main>
      <Footer />
      <LeadDialog open={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}
