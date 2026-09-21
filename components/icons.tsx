/** Bộ icon dùng chung, vẽ lại từ bản thiết kế. */
export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M4 10h11m0 0-4.2-4.2M15 10l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M16 10H5m0 0 4.2-4.2M5 10l4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Điện thoại — cùng nét với biểu tượng "phone" ở chân trang, nhưng nhận màu từ ngoài. */
export function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M6.2 3.3 8 3l1.6 3.4-1.7 1.3a9 9 0 0 0 4.4 4.4l1.3-1.7L17 12l-.3 1.8a1.6 1.6 0 0 1-1.8 1.4C9.6 14.6 5.4 10.4 4.8 5.1a1.6 1.6 0 0 1 1.4-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
