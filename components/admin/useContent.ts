"use client";

import { useCallback, useState } from "react";

type Status = { kind: "ok" | "error"; msg: string } | null;

/**
 * Editor state for one content file. Initial values come from the bundled
 * JSON (build-time import) — i.e. the last-deployed content. Saving PUTs the
 * edited object to the Worker, which commits it to GitHub and triggers a
 * redeploy.
 */
export function useContentEditor<T>(name: string, initial: T, defaults?: T) {
  const [data, setData] = useState<T>(() => clone(initial));
  const [saved, setSaved] = useState<T>(() => clone(initial));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(saved);

  // Load the frozen original into the form (does NOT publish — the admin still
  // reviews and presses Save). Falls back to the last-deployed content if no
  // separate defaults snapshot was provided.
  const reset = useCallback(() => {
    setData(clone(defaults ?? initial));
    setStatus(null);
  }, [defaults, initial]);

  const save = useCallback(async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/content/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ content: data }),
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ kind: "error", msg: e.error || "Lưu thất bại" });
      } else {
        setSaved(clone(data));
        setStatus({
          kind: "ok",
          msg: "Đã lưu. Trang sẽ tự cập nhật sau ~1–2 phút (build lại).",
        });
      }
    } catch {
      setStatus({ kind: "error", msg: "Lỗi kết nối" });
    } finally {
      setSaving(false);
    }
  }, [name, data]);

  return { data, setData, dirty, saving, status, save, reset };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/* Immutable array helpers for list editors. */

export function replaceAt<T>(arr: T[], i: number, value: T): T[] {
  const next = arr.slice();
  next[i] = value;
  return next;
}

export function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

export function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
