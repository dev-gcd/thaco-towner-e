"use client";

import { useState } from "react";
import { exterior } from "@/lib/content";
import defaults from "@/content/defaults/exterior.json";
import type { ExteriorContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";
import { Frame360Input } from "./Frame360Input";
import { VersionTabs, DungAnhMacDinh, tenMacDinh, type VersionTab } from "./VersionTabs";
import { defaultVersionId } from "@/lib/content";

export function ExteriorEditor() {
  const { data, setData, dirty, saving, status, save, reset, applySaved } = useContentEditor<ExteriorContent>(
    "exterior",
    exterior,
    defaults as ExteriorContent
  );
  // Tab phiên bản đang sửa ảnh: "" = ảnh mặc định (dùng cho phiên bản chưa có ảnh riêng).
  // Tab đang chọn (mở ra ở phiên bản mặc định). `tab` rỗng = đang sửa phiên bản mặc định
  // (ảnh hiện có của khối); khác rỗng = mã phiên bản đang sửa ảnh riêng.
  const [ver, setVer] = useState<VersionTab>(defaultVersionId);
  const tab = ver === defaultVersionId ? "" : ver;
  const own = (id: string) => data.view360.byVersion?.[id];
  const hasOwn = (id: string) => !!(own(id)?.frames?.length || own(id)?.car?.src);
  /** Ghi đè 1 phần ảnh riêng của phiên bản `id`, giữ nguyên phần còn lại. */
  const withOwn = (
    d: ExteriorContent,
    id: string,
    patch: Partial<{ car: { src: string; alt: string }; frames: string[] }>
  ): ExteriorContent => ({
    ...d,
    view360: {
      ...d.view360,
      byVersion: {
        ...d.view360.byVersion,
        [id]: {
          car: { src: "", alt: d.view360.car.alt },
          frames: [],
          ...d.view360.byVersion?.[id],
          ...patch,
        },
      },
    },
  });

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
      </Card>

      {/* Ảnh xe THEO PHIÊN BẢN: chọn V2.7 ở khối Dòng xe thì khối này hiện ảnh V2.7. */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Ảnh xe theo phiên bản</p>
        <VersionTabs value={ver} onChange={setVer} hasOwn={hasOwn} />
        {/* key theo tab: đổi tab thì 2 ô dưới làm lại từ đầu, không mang ảnh đang chọn dở sang. */}
        <ImageInput
          key={`car-${tab}`}
          label="Ảnh xe"
          hint={
            tab
              ? "Ảnh xe riêng của phiên bản này, 1536×1024px, nền trong suốt. Để trống = dùng ảnh của phiên bản mặc định. Chỉ hiện khi phiên bản này chưa có bộ ảnh các góc bên dưới."
              : "Khuyến nghị: 1536×1024px, nền trong suốt. Chỉ hiện khi chưa có ảnh các góc xe bên dưới."
          }
          value={tab ? own(tab)?.car?.src ?? "" : data.view360.car.src}
          onChange={(src) =>
            setData(
              tab
                ? withOwn(data, tab, { car: { src, alt: data.view360.car.alt } })
                : { ...data, view360: { ...data.view360, car: { ...data.view360.car, src } } }
            )
          }
        />
        {tab && !own(tab)?.car?.src && <DungAnhMacDinh src={data.view360.car.src} />}
        <Frame360Input
          key={`frames-${tab}`}
          data={data}
          frames={tab ? own(tab)?.frames ?? [] : data.view360.frames}
          withFrames={(d, frames) =>
            tab ? withOwn(d, tab, { frames }) : { ...d, view360: { ...d.view360, frames } }
          }
          emptyText={
            tab
              ? `Chưa có bộ ảnh riêng — khi khách chọn phiên bản này, trang dùng ảnh của ${tenMacDinh}.`
              : undefined
          }
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
