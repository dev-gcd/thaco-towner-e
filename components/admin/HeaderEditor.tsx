"use client";

import { header } from "@/lib/content";
import defaults from "@/content/defaults/header.json";
import type { HeaderContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ResponsiveImageInput, ImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

export function HeaderEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<HeaderContent>(
    "header",
    header,
    defaults as HeaderContent
  );

  return (
    <EditorShell
      title="Đầu trang"
      description="Thanh menu, ảnh lớn và dòng giới thiệu ở đầu trang."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <ImageInput
          label="Logo"
          hint="Khuyến nghị: 640×142px, nền trong suốt (.webp hoặc .png)."
          value={data.logo.src}
          onChange={(src) => setData({ ...data, logo: { ...data.logo, src } })}
        />
        <Field label="Mô tả logo (alt)">
          <TextInput
            value={data.logo.alt}
            onChange={(e) => setData({ ...data, logo: { ...data.logo, alt: e.target.value } })}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <ResponsiveImageInput
          label="Ảnh lớn đầu trang"
          recommended="1938×1551px, .webp"
          recommendedMobile="900×1200px"
          value={data.background}
          onChange={(background) => setData({ ...data, background })}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <Field label="Tiêu đề">
          <TextInput
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </Field>
        <Field label="Mô tả" hint="Xuống dòng ở đâu thì trang hiển thị đúng ở đó.">
          <TextArea
            rows={3}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </Field>
      </Card>

      <p className="text-sm font-semibold text-gray-800">Thanh menu</p>
      <Card className="flex flex-col gap-4">
        <Field
          label="Hotline"
          hint="Hiện bên phải thanh menu, khách bấm vào là gọi. Để trống thì ẩn."
        >
          <TextInput
            value={data.hotline ?? ""}
            placeholder="0933 805 902"
            onChange={(e) => setData({ ...data, hotline: e.target.value })}
          />
        </Field>
      </Card>
      {data.menu.map((item, i) => (
        <ItemCard
          key={i}
          title={item.label || `Mục ${i + 1}`}
          onMoveUp={i > 0 ? () => setData({ ...data, menu: move(data.menu, i, -1) }) : undefined}
          onMoveDown={
            i < data.menu.length - 1
              ? () => setData({ ...data, menu: move(data.menu, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, menu: removeAt(data.menu, i) })}
        >
          <Field label="Chữ hiển thị">
            <TextInput
              value={item.label}
              onChange={(e) =>
                setData({ ...data, menu: replaceAt(data.menu, i, { ...item, label: e.target.value }) })
              }
            />
          </Field>
          <Field
            label="Liên kết"
            hint="Dạng #ten-khoi để cuộn tới khối trong trang, hoặc dán link đầy đủ."
          >
            <TextInput
              value={item.href}
              onChange={(e) =>
                setData({ ...data, menu: replaceAt(data.menu, i, { ...item, href: e.target.value }) })
              }
            />
          </Field>
        </ItemCard>
      ))}
      <AddButton
        label="Thêm mục menu"
        onClick={() => setData({ ...data, menu: [...data.menu, { label: "Mục mới", href: "#" }] })}
      />
    </EditorShell>
  );
}
