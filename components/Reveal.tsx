"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Hiện dần khi cuộn tới. Chỉ chạy một lần, và tự tắt nếu máy khách bật chế độ
 * giảm chuyển động của hệ điều hành (motion tự xử lý qua `useReducedMotion`,
 * nhưng ta cũng để biên độ nhỏ cho an toàn).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Quãng trượt lên, px. Đặt 0 nếu chỉ muốn mờ dần. */
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
