"use client";

import { footer } from "@/lib/content";
import defaults from "@/content/defaults/footer.json";
import type { FooterContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, Select } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

const SOCIALS = [
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
];

const LINK_ICONS = [
  { value: "truck", label: "Xe tải" },
  { value: "doc", label: "Tài liệu" },
  { value: "wrench", label: "Cờ lê (sửa chữa)" },
  { value: "shield", label: "Khiên (bảo dưỡng)" },
  { value: "check", label: "Dấu tích (bảo hành)" },
  { value: "location", label: "Ghim bản đồ" },
  { value: "phone", label: "Điện thoại" },
  { value: "headset", label: "Tai nghe (hỗ trợ)" },
  { value: "mail", label: "Phong bì" },
];

export function FooterEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<FooterContent>(
    "footer",
    footer,
    defaults as FooterContent
  );

  return (
    <EditorShell
      title="Chân trang"
      description="Thông tin công ty, các cột liên kết và dòng bản quyền. Cột không có dòng nào sẽ tự ẩn trên trang."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <ImageInput
          label="Logo chính"
          hint="Khuyến nghị: 139×60px, nền trong suốt."
          value={data.logo.src}
          onChange={(src) => setData({ ...data, logo: { ...data.logo, src } })}
        />
        <Field label="Tên công ty">
          <TextInput
            value={data.companyName}
            onChange={(e) => setData({ ...data, companyName: e.target.value })}
          />
        </Field>
        <Field label="Thông tin đăng ký kinh doanh" hint="Xuống dòng ở đâu thì hiển thị đúng ở đó.">
          <TextArea
            rows={3}
            value={data.registration}
            onChange={(e) => setData({ ...data, registration: e.target.value })}
          />
        </Field>
        <ImageInput
          label="Logo phụ"
          hint="Khuyến nghị: 175×66px. Thường là huy hiệu Bộ Công Thương."
          value={data.subLogo.src}
          onChange={(src) => setData({ ...data, subLogo: { ...data.subLogo, src } })}
        />
        <Field label="Dòng bản quyền">
          <TextInput
            value={data.copyright}
            onChange={(e) => setData({ ...data, copyright: e.target.value })}
          />
        </Field>
      </Card>

      {data.columns.map((col, i) => (
        <ItemCard
          key={i}
          title={col.title || `Cột ${i + 1}`}
          onMoveUp={i > 0 ? () => setData({ ...data, columns: move(data.columns, i, -1) }) : undefined}
          onMoveDown={
            i < data.columns.length - 1
              ? () => setData({ ...data, columns: move(data.columns, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, columns: removeAt(data.columns, i) })}
        >
          <Field label="Tiêu đề cột">
            <TextInput
              value={col.title}
              onChange={(e) =>
                setData({
                  ...data,
                  columns: replaceAt(data.columns, i, { ...col, title: e.target.value }),
                })
              }
            />
          </Field>
          {col.links.map((link, j) => (
            <div key={j} className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
              <Field label="Biểu tượng">
                <Select
                  value={link.icon}
                  onChange={(e) =>
                    setData({
                      ...data,
                      columns: replaceAt(data.columns, i, {
                        ...col,
                        links: replaceAt(col.links, j, { ...link, icon: e.target.value }),
                      }),
                    })
                  }
                >
                  {LINK_ICONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Chữ hiển thị">
                <TextInput
                  value={link.label}
                  onChange={(e) =>
                    setData({
                      ...data,
                      columns: replaceAt(data.columns, i, {
                        ...col,
                        links: replaceAt(col.links, j, { ...link, label: e.target.value }),
                      }),
                    })
                  }
                />
              </Field>
              <Field label="Liên kết" hint="Để trống = chỉ hiện chữ, không bấm được.">
                <TextInput
                  value={link.href}
                  placeholder="https://… hoặc tel:… hoặc mailto:…"
                  onChange={(e) =>
                    setData({
                      ...data,
                      columns: replaceAt(data.columns, i, {
                        ...col,
                        links: replaceAt(col.links, j, { ...link, href: e.target.value }),
                      }),
                    })
                  }
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    columns: replaceAt(data.columns, i, { ...col, links: removeAt(col.links, j) }),
                  })
                }
                className="mb-1 rounded-md border border-red-200 px-2 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                Xoá
              </button>
            </div>
          ))}
          <AddButton
            label="Thêm dòng"
            onClick={() =>
              setData({
                ...data,
                columns: replaceAt(data.columns, i, {
                  ...col,
                  links: [...col.links, { icon: "truck", label: "", href: "" }],
                }),
              })
            }
          />
        </ItemCard>
      ))}
      <AddButton
        label="Thêm cột"
        onClick={() => setData({ ...data, columns: [...data.columns, { title: "", links: [] }] })}
      />

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Mạng xã hội</p>
        {data.socials.map((s, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <Field label="Biểu tượng">
              <Select
                value={s.icon}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: replaceAt(data.socials, i, { ...s, icon: e.target.value }),
                  })
                }
              >
                {SOCIALS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Liên kết" hint="Để trống = ẩn biểu tượng này.">
              <TextInput
                value={s.href}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: replaceAt(data.socials, i, { ...s, href: e.target.value }),
                  })
                }
              />
            </Field>
            <button
              type="button"
              onClick={() => setData({ ...data, socials: removeAt(data.socials, i) })}
              className="mb-1 rounded-md border border-red-200 px-2 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
            >
              Xoá
            </button>
          </div>
        ))}
        <AddButton
          label="Thêm mạng xã hội"
          onClick={() => setData({ ...data, socials: [...data.socials, { icon: "facebook", href: "" }] })}
        />
      </Card>
    </EditorShell>
  );
}
