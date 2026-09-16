"use client";

import { useCallback, useEffect, useState } from "react";

type Lead = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  note: string | null;
  status: "new" | "contacted";
};

type LeadsResponse = { leads: Lead[]; total: number; page: number; perPage: number };

type Filters = { search: string; status: "" | "new" | "contacted"; from: string; to: string };
const EMPTY: Filters = { search: "", status: "", from: "", to: "" };

function queryString(f: Filters, page: number): string {
  const p = new URLSearchParams();
  if (f.search) p.set("search", f.search);
  if (f.status) p.set("status", f.status);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (page > 1) p.set("page", String(page));
  return p.toString();
}

export function LeadsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/admin/leads?${queryString(filters, page)}`, {
        credentials: "same-origin",
      });
      if (res.status === 401) return onUnauthorized();
      const data = (await res.json()) as LeadsResponse;
      setLeads(data.leads);
      setTotal(data.total);
      setPerPage(data.perPage);
    } finally {
      setLoading(false);
    }
  }, [filters, page, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: number) {
    if (!confirm("Xóa lead này?")) return;
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE", credentials: "same-origin" });
    load();
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOnPageSelected =
    leads.length > 0 && leads.every((l) => selected.has(l.id));

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) leads.forEach((l) => next.delete(l.id));
      else leads.forEach((l) => next.add(l.id));
      return next;
    });
  }

  async function removeSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(`Xóa ${ids.length} lead đã chọn? Không thể hoàn tác.`)) return;
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/leads/${id}`, { method: "DELETE", credentials: "same-origin" })
      )
    );
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} leads</p>
        <a
          href={`/api/admin/leads.csv?${queryString(filters, 1)}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ⤓ Xuất CSV
        </a>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <FilterField label="Tìm kiếm">
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Tên / SĐT / ghi chú"
            className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#00529c]"
          />
        </FilterField>
        <FilterField label="Trạng thái">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#00529c]"
          >
            <option value="">Tất cả</option>
            <option value="new">Mới</option>
            <option value="contacted">Đã liên hệ</option>
          </select>
        </FilterField>
        <FilterField label="Từ ngày">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#00529c]"
          />
        </FilterField>
        <FilterField label="Đến ngày">
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#00529c]"
          />
        </FilterField>
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
          className="rounded-lg bg-[#00529c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0086ff]"
        >
          Lọc
        </button>
        <button
          onClick={() => {
            setFilters(EMPTY);
            setPage(1);
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          Xóa lọc
        </button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
          <span className="font-medium text-amber-800">Đã chọn {selected.size}</span>
          <button
            onClick={removeSelected}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            ⌫ Xóa đã chọn
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  aria-label="Chọn tất cả trên trang"
                  className="cursor-pointer"
                />
              </th>
              <Th>Thời gian</Th>
              <Th>Họ tên</Th>
              <Th>Điện thoại</Th>
              <Th>Ghi chú</Th>
              <Th>Trạng thái</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Không có lead nào.
                </td>
              </tr>
            )}
            {!loading &&
              leads.map((l) => (
                <tr
                  key={l.id}
                  className={selected.has(l.id) ? "bg-blue-50" : "hover:bg-gray-50"}
                >
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggleOne(l.id)}
                      aria-label={`Chọn lead ${l.name}`}
                      className="cursor-pointer"
                    />
                  </Td>
                  <Td className="whitespace-nowrap text-gray-500">
                    {formatDate(l.created_at)}
                  </Td>
                  <Td className="font-medium text-gray-900">{l.name}</Td>
                  <Td>
                    <a href={`tel:${l.phone}`} className="text-[#00529c] hover:underline">
                      {l.phone}
                    </a>
                  </Td>
                  <Td className="max-w-[16rem] truncate text-gray-600">{l.note || "—"}</Td>
                  <Td>
                    <button
                      onClick={() =>
                        setStatus(l.id, l.status === "new" ? "contacted" : "new")
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        l.status === "contacted"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {l.status === "contacted" ? "✓ Đã liên hệ" : "● Mới"}
                    </button>
                  </Td>
                  <Td>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Xóa"
                    >
                      ⌫
                    </button>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function formatDate(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
