"use client";

import { exterior } from "@/lib/content";
import defaults from "@/content/defaults/exterior.json";
import type { ExteriorContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";
import { Frame360Input } from "./Frame360Input";

export function ExteriorEditor() {
  const { data, setData, dirty, saving, status, save, reset, applySaved } = useContentEditor<ExteriorContent>(
    "exterior",
    exterior,
    defaults as ExteriorContent
  );

  return (
    <EditorShell
      title="Ngoại thất"
      description="Ảnh xe toàn cảnh ở trên, danh sách chi tiết ngoại thất ở dưới."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <Field label="Nhãn nhỏ">
          <TextInput value={data.label} onChange={(e) => setData({ ...data, label: e.target.value })} />
        </Field>
        <Field label="Chữ lớn mờ">
          <TextInput
            value={data.ghostTitle}
            onChange={(e) => setData({ ...data, ghostTitle: e.target.value })}
          />
        </Field>
        <ResponsiveImageInput
          label="Ảnh nền khu trưng bày"
          recommended="1440×960px, .webp"
          value={data.view360.background}
          onChange={(background) => setData({ ...data, view360: { ...data.view360, background } })}
        />
        <ImageInput
          label="Ảnh xe"
          hint="Khuyến nghị: 1536×1024px, nền trong suốt. Chỉ hiện khi chưa có ảnh các góc xe bên dưới."
          value={data.view360.car.src}
          onChange={(src) =>
            setData({ ...data, view360: { ...data.view360, car: { ...data.view360.car, src } } })
          }
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <Frame360Input
          data={data}
          dirtyOther={dirty}
          onSaved={applySaved}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề — dòng 1 (xanh đậm)">
            <TextInput
              value={data.heading}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </Field>
          <Field label="Tiêu đề — dòng 2 (xanh sáng)">
            <TextInput
              value={data.headingAccent}
              onChange={(e) => setData({ ...data, headingAccent: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Mô tả">
          <TextArea
            rows={2}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </Field>
      </Card>

      {data.items.map((item, i) => (
        <ItemCard
          key={i}
          title={item.title || `Chi tiết ${i + 1}`}
          onMoveUp={i > 0 ? () => setData({ ...data, items: move(data.items, i, -1) }) : undefined}
          onMoveDown={
            i < data.items.length - 1
              ? () => setData({ ...data, items: move(data.items, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, items: removeAt(data.items, i) })}
        >
          <ImageInput
            label="Ảnh"
            hint="Khuyến nghị: 900×506px (16:9), .webp."
            value={item.image.src}
            onChange={(src) =>
              setData({
                ...data,
                items: replaceAt(data.items, i, { ...item, image: { ...item.image, src } }),
              })
            }
          />
          <Field label="Tên chi tiết">
            <TextInput
              value={item.title}
              onChange={(e) =>
                setData({ ...data, items: replaceAt(data.items, i, { ...item, title: e.target.value }) })
              }
            />
          </Field>
          <Field label="Mô tả">
            <TextArea
              rows={2}
              value={item.description}
              onChange={(e) =>
                setData({
                  ...data,
                  items: replaceAt(data.items, i, { ...item, description: e.target.value }),
                })
              }
            />
          </Field>
        </ItemCard>
      ))}
      <AddButton
        label="Thêm chi tiết ngoại thất"
        onClick={() =>
          setData({
            ...data,
            items: [...data.items, { image: { src: "", alt: "" }, title: "", description: "" }],
          })
        }
      />
    </EditorShell>
  );
}
