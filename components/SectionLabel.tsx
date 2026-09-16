/** Nhãn nhỏ phía trên tiêu đề khối: gạch ngang 24px + chữ 16px. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-[8px] text-body-md text-text-heading">
      <span aria-hidden className="h-px w-[24px] bg-text-heading" />
      {children}
    </span>
  );
}
