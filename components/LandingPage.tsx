"use client";

import { useEffect, useRef, useState } from "react";
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
import { FloatingContact } from "@/components/FloatingContact";
import { cta, defaultVersionId, versions } from "@/lib/content";

/**
 * Ghép toàn trang. Giữ ở một chỗ duy nhất trạng thái mở/đóng hộp thoại đăng ký
 * lái thử, vì có nhiều nút cùng mở nó (khối GTSP và khối CTA).
 */
export function LandingPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const openLead = () => setLeadOpen(true);
  const openNotice = () => setNoticeOpen(true);
  // Phiên bản xe đang xem — DÙNG CHUNG cho khối Dòng xe, Ngoại thất, Nội thất: chọn
  // V2.7 ở một khối thì ảnh xe ở cả 3 khối đổi theo (khách yêu cầu 21/09).
  const [versionId, setVersionId] = useState(defaultVersionId);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const anyDialogOpen = leadOpen || noticeOpen || quoteOpen;
  useQuotePopup(anyDialogOpen, () => setQuoteOpen(true));
  const version = versions.items.find((v) => v.id === versionId) ?? versions.items[0];

  return (
    <>
      {/* Thanh menu đứng NGOÀI <main> để `sticky` bám suốt trang, kể cả chân trang. */}
      <SiteNav />
      <main>
        <Header />
        <Gtsp onCtaClick={openLead} />
        <Usp />
        <Versions versionId={versionId} onVersion={setVersionId} />
        {/* 2 khoảng trống có sẵn trong bản thiết kế (50px và 100px). Nằm ngoài mọi khối nên
            không có `--u`: co theo bề ngang màn, chặn ở 1px (ở ≥1440 đúng 50/100px). */}
        <div aria-hidden className="hidden bg-white lg:block lg:h-[calc(50*min(1px,100vw/1440))]" />
        <Exterior versionId={versionId} onVersion={setVersionId} />
        <div aria-hidden className="hidden bg-bg-soft lg:block lg:h-[calc(100*min(1px,100vw/1440))]" />
        <Interior versionId={versionId} onVersion={setVersionId} />
        <Cta onDriveTestClick={openLead} onMissingFile={openNotice} />
        <Charging onMissingLink={openNotice} />
      </main>
      <Footer />
      <FloatingContact />
      <LeadDialog
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        // Đã để lại số ở form lái thử thì không mời thêm lần nữa.
        onSubmitted={markQuotePopupSeen}
      />
      <LeadDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        source="quote"
        promo={version?.gift ?? ""}
        context={version ? `Phiên bản đang xem: ${version.displayName || version.code}` : ""}
      />
      <NoticeDialog
        open={noticeOpen}
        title={cta.notice.title}
        message={cta.notice.message}
        onClose={() => setNoticeOpen(false)}
      />
    </>
  );
}

/**
 * Khoá `sessionStorage`: đã hiện popup báo giá (hoặc khách đã gửi form lái thử) trong lần
 * truy cập này ⇒ không hiện nữa. Mở tab mới là lần truy cập mới. Bộ kiểm tự động
 * (scripts/audit-layout.mjs, smoke-test.mjs) đặt sẵn khoá này để popup không che trang.
 */
const QUOTE_POPUP_SEEN_KEY = "towner-e:quote-popup-seen";
/**
 * Mép trên khối Dòng xe phải lên quá 60% chiều cao màn (tức khối chiếm ≥40% dưới màn) mới
 * đếm giờ. Đo bằng lề co vùng nhìn, không bằng tỉ lệ khối: khối cao hơn 2,5 lần màn (điện
 * thoại) thì không bao giờ lọt đủ 40% diện tích.
 */
const QUOTE_POPUP_ROOT_MARGIN = "0px 0px -40% 0px";
const QUOTE_POPUP_DELAY_MS = 1500;

function isQuotePopupSeen(): boolean {
  try {
    return sessionStorage.getItem(QUOTE_POPUP_SEEN_KEY) === "1";
  } catch {
    return false; // trình duyệt chặn bộ nhớ: coi như chưa hiện, popup vẫn chỉ hiện 1 lần/lần tải trang
  }
}

function markQuotePopupSeen() {
  try {
    sessionStorage.setItem(QUOTE_POPUP_SEEN_KEY, "1");
  } catch {
    // Không lưu được thì thôi — cờ `shown` trong hook vẫn chặn hiện lại tới khi tải lại trang.
  }
}

/**
 * Popup "Nhận báo giá xe" (khách yêu cầu 29/09): lần đầu khối Dòng xe (`#dong-xe`) lên tới
 * 60% chiều cao màn, chờ 1,5 giây rồi mở — trừ khi CMS tắt, đã hiện/đã gửi form trong lần truy
 * cập này, hoặc đang có hộp thoại khác mở (khi đó bỏ qua luôn, không xếp hàng chờ).
 */
function useQuotePopup(anyDialogOpen: boolean, open: () => void) {
  const blockedRef = useRef(anyDialogOpen);
  blockedRef.current = anyDialogOpen;

  useEffect(() => {
    if (!cta.quote.enabled || isQuotePopupSeen()) return;
    const section = document.getElementById("dong-xe");
    if (!section) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return;
        observer.disconnect();
        timer = setTimeout(() => {
          if (blockedRef.current || isQuotePopupSeen()) return;
          markQuotePopupSeen();
          open();
        }, QUOTE_POPUP_DELAY_MS);
      },
      { rootMargin: QUOTE_POPUP_ROOT_MARGIN }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
    // `open` là setState bọc lại — chỉ gắn quan sát 1 lần khi tải trang.
  }, []);
}
