"use client";

import { useState } from "react";
import { Header, SiteNav } from "@/components/sections/Header";
import { Gtsp } from "@/components/sections/Gtsp";
import { Usp } from "@/components/sections/Usp";
import { Versions } from "@/components/sections/Versions";
import { Exterior } from "@/components/sections/Exterior";
import { Interior } from "@/components/sections/Interior";
import { Cta } from "@/components/sections/Cta";
import { Charging } from "@/components/sections/Charging";
import { Footer } from "@/components/sections/Footer";
import { LeadDialog } from "@/components/LeadDialog";
import { NoticeDialog } from "@/components/NoticeDialog";
import { cta } from "@/lib/content";

/**
 * Ghép toàn trang. Giữ ở một chỗ duy nhất trạng thái mở/đóng hộp thoại đăng ký
 * lái thử, vì có nhiều nút cùng mở nó (khối GTSP và khối CTA).
 */
export function LandingPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const openLead = () => setLeadOpen(true);
  const openNotice = () => setNoticeOpen(true);

  return (
    <>
      {/* Thanh menu đứng NGOÀI <main> để `sticky` bám suốt trang, kể cả chân trang. */}
      <SiteNav />
      <main>
        <Header />
        <Gtsp onCtaClick={openLead} />
        <Usp />
        <Versions />
        {/* 2 khoảng trống có sẵn trong bản thiết kế (50px và 100px). Nằm ngoài mọi khối nên
            không có `--u`: co theo bề ngang màn, chặn ở 1px (ở ≥1440 đúng 50/100px). */}
        <div aria-hidden className="hidden bg-white lg:block lg:h-[calc(50*min(1px,100vw/1440))]" />
        <Exterior />
        <div aria-hidden className="hidden bg-bg-soft lg:block lg:h-[calc(100*min(1px,100vw/1440))]" />
        <Interior />
        <Cta onDriveTestClick={openLead} onMissingFile={openNotice} />
        <Charging onMissingLink={openNotice} />
      </main>
      <Footer />
      <LeadDialog open={leadOpen} onClose={() => setLeadOpen(false)} />
      <NoticeDialog
        open={noticeOpen}
        title={cta.notice.title}
        message={cta.notice.message}
        onClose={() => setNoticeOpen(false)}
      />
    </>
  );
}
