"use client";

import { useCallback, useEffect, useState } from "react";
import { LeadsPanel } from "./LeadsPanel";

type NavKey = "leads";
type DefaultTab = "content" | "leads";

// Các khối nội dung sửa được. Rỗng cho tới khi dựng giao diện từ Figma; mỗi lần
// thêm một khối thì thêm 1 dòng ở đây + 1 nhánh render ở <main> bên dưới.
// Khoá phải khớp CONTENT_FILES trong worker/index.ts và scripts/cms-dev.mjs.
const CONTENT_ITEMS: { key: string; label: string }[] = [];

export function AdminApp({ defaultTab = "content" }: { defaultTab?: DefaultTab }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [active, setActive] = useState<NavKey | string>(
    defaultTab === "leads" || CONTENT_ITEMS.length === 0
      ? "leads"
      : CONTENT_ITEMS[0].key
  );

  const probe = useCallback(async () => {
    const res = await fetch("/api/admin/leads?page=1", { credentials: "same-origin" });
    setAuthed(res.ok);
  }, []);

  useEffect(() => {
    probe();
  }, [probe]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      setAuthed(true);
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setLoginError(data.error || "Đăng nhập thất bại");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 text-gray-400">
        Đang tải…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
        <form
          onSubmit={login}
          className="w-full max-w-[24rem] rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h1 className="mb-1 text-xl font-bold text-gray-900">Thaco Towner E CMS</h1>
          <p className="mb-6 text-sm text-gray-500">Nhập mật khẩu để tiếp tục.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            autoFocus
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#00529c]"
          />
          {loginError && <p className="mb-3 text-sm text-red-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#00529c] py-2 font-medium text-white hover:bg-[#0086ff]"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-gray-200 bg-white lg:h-screen lg:w-60 lg:border-r lg:border-b-0 lg:sticky lg:top-0">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid size-7 place-items-center rounded-md bg-[#00529c] text-xs font-bold text-white">
            T
          </span>
          <span className="font-bold text-gray-900">Thaco Towner E CMS</span>
        </div>

        <nav className="flex-1 px-3 lg:py-2">
          <span className="hidden px-2 text-[11px] font-semibold tracking-wider text-gray-400 lg:block">
            NỘI DUNG
          </span>
          {CONTENT_ITEMS.length === 0 ? (
            <p className="px-3 py-2 text-[11px] leading-relaxed text-gray-400">
              Chưa có khối nội dung nào. Các mục sẽ xuất hiện khi giao diện trang
              được dựng từ bản thiết kế.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {CONTENT_ITEMS.map((item) => (
                <NavButton
                  key={item.key}
                  label={item.label}
                  active={active === item.key}
                  onClick={() => setActive(item.key)}
                />
              ))}
            </div>
          )}
          <span className="mt-3 hidden px-2 text-[11px] font-semibold tracking-wider text-gray-400 lg:block">
            KHÁC
          </span>
          <div className="flex flex-col gap-0.5">
            <NavButton
              label="Khách đăng ký"
              active={active === "leads"}
              onClick={() => setActive("leads")}
            />
          </div>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={logout}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-8">
        {active === "leads" && <LeadsPanel onUnauthorized={() => setAuthed(false)} />}
      </main>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        active ? "bg-[#00529c] text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
