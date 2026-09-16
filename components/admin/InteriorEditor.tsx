"use client";

import { interior } from "@/lib/content";
import defaults from "@/content/defaults/interior.json";
import type { InteriorContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

export function InteriorEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<InteriorContent>(
    "interior",
    interior,
    defaults as InteriorContent
  );

  return (
    <EditorShell
      title="Nội thất"
      description="Ảnh cabin nhìn từ trên, mỗi điểm nóng mở một thẻ giới thiệu trang bị."
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
          label="Ảnh nền"
          recommended="1440×1917px, .webp"
          value={data.background}
          onChange={(background) => setData({ ...data, background })}
        />
        <ImageInput
          label="Ảnh xe"
          hint="Khuyến nghị: 1440×1917px, nền trong suốt."
          value={data.car.src}
          onChange={(src) => setData({ ...data, car: { ...data.car, src } })}
        />
        <ImageInput
          label="Ảnh bóng đổ"
          hint="Khuyến nghị: 1440×1920px, nền trong suốt."
          value={data.shadow.src}
          onChange={(src) => setData({ ...data, shadow: { ...data.shadow, src } })}
        />
      </Card>

      {data.hotspots.map((spot, i) => (
        <ItemCard
          key={i}
          title={spot.title || `Điểm nóng ${i + 1}`}
          onMoveUp={
            i > 0 ? () => setData({ ...data, hotspots: move(data.hotspots, i, -1) }) : undefined
          }
          onMoveDown={
            i < data.hotspots.length - 1
              ? () => setData({ ...data, hotspots: move(data.hotspots, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, hotspots: removeAt(data.hotspots, i) })}
        >
          <ImageInput
            label="Ảnh trang bị"
            hint="Khuyến nghị: 400×260px, .webp."
            value={spot.image.src}
            onChange={(src) =>
              setData({
                ...data,
                hotspots: replaceAt(data.hotspots, i, { ...spot, image: { ...spot.image, src } }),
              })
            }
          />
          <Field label="Tên trang bị">
            <TextInput
              value={spot.title}
              onChange={(e) =>
                setData({
                  ...data,
                  hotspots: replaceAt(data.hotspots, i, { ...spot, title: e.target.value }),
                })
              }
            />
          </Field>
          <Field label="Mô tả">
            <TextArea
              rows={2}
              value={spot.description}
              onChange={(e) =>
                setData({
                  ...data,
                  hotspots: replaceAt(data.hotspots, i, { ...spot, description: e.target.value }),
                })
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Vị trí ngang (px)"
              hint="Tính trên khung rộng 1440px, đếm từ mép trái."
            >
              <TextInput
                type="number"
                value={String(spot.x)}
                onChange={(e) =>
                  setData({
                    ...data,
                    hotspots: replaceAt(data.hotspots, i, { ...spot, x: Number(e.target.value) }),
                  })
                }
              />
            </Field>
            <Field
              label="Vị trí dọc (px)"
              hint="Tính trên khung cao 1200px, đếm từ mép trên của khối."
            >
              <TextInput
                type="number"
                value={String(spot.y)}
                onChange={(e) =>
                  setData({
                    ...data,
                    hotspots: replaceAt(data.hotspots, i, { ...spot, y: Number(e.target.value) }),
                  })
                }
              />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddButton
        label="Thêm điểm nóng"
        onClick={() =>
          setData({
            ...data,
            hotspots: [
              ...data.hotspots,
              { title: "", description: "", image: { src: "", alt: "" }, x: 700, y: 600 },
            ],
          })
        }
      />
    </EditorShell>
  );
}
