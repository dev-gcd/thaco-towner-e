"use client";

import { useState } from "react";
import { interior } from "@/lib/content";
import defaults from "@/content/defaults/interior.json";
import type { InteriorContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";
import { VersionTabs, DungAnhMacDinh, type VersionTab } from "./VersionTabs";
import { defaultVersionId } from "@/lib/content";
import { versions } from "@/lib/content";

export function InteriorEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<InteriorContent>(
    "interior",
    interior,
    defaults as InteriorContent
  );
  // Tab phiên bản đang sửa ảnh: "" = ảnh mặc định. Áp cho ẢNH XE và ẢNH 5 ĐIỂM NÓNG;
  // chữ, toạ độ, ảnh nền, ảnh bóng đổ dùng chung mọi phiên bản.
  // Tab đang chọn (mở ra ở phiên bản mặc định). `tab` rỗng = đang sửa phiên bản mặc định
  // (ảnh hiện có của khối); khác rỗng = mã phiên bản đang sửa ảnh riêng.
  const [ver, setVer] = useState<VersionTab>(defaultVersionId);
  const tab = ver === defaultVersionId ? "" : ver;
  const tabV = versions.items.find((v) => v.id === tab);
  const tabName = tabV?.displayName || tabV?.code || "";
  const hasOwn = (id: string) =>
    !!(data.carByVersion?.[id]?.src || data.hotspots.some((h) => h.imageByVersion?.[id]?.src));

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
          label="Ảnh bóng đổ"
          hint="Khuyến nghị: 1440×1920px, nền trong suốt."
          value={data.shadow.src}
          onChange={(src) => setData({ ...data, shadow: { ...data.shadow, src } })}
        />
      </Card>

      {/* Ảnh THEO PHIÊN BẢN: chọn V2.7 ở khối Dòng xe thì khối này hiện ảnh V2.7. */}
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Ảnh theo phiên bản</p>
        <VersionTabs value={ver} onChange={setVer} hasOwn={hasOwn} />
        <p className="text-xs text-gray-500">
          Tab này áp cho <b>ảnh xe</b> ngay dưới và <b>ảnh trang bị của 5 điểm nóng</b> bên dưới.
        </p>
        <ImageInput
          key={`car-${tab}`}
          label={tab ? `Ảnh xe — ${tabName}` : "Ảnh xe"}
          hint={
            tab
              ? "Ảnh xe nhìn từ trên riêng của phiên bản này, 1440×1917px, nền trong suốt. Để trống = dùng ảnh của phiên bản mặc định."
              : "Khuyến nghị: 1440×1917px, nền trong suốt."
          }
          value={tab ? data.carByVersion?.[tab]?.src ?? "" : data.car.src}
          onChange={(src) =>
            setData(
              tab
                ? { ...data, carByVersion: { ...data.carByVersion, [tab]: { src, alt: data.car.alt } } }
                : { ...data, car: { ...data.car, src } }
            )
          }
        />
        {tab && !data.carByVersion?.[tab]?.src && <DungAnhMacDinh src={data.car.src} />}
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
            key={`spot-${i}-${tab}`}
            label={tab ? `Ảnh trang bị — ${tabName}` : "Ảnh trang bị"}
            hint={
              tab
                ? "Ảnh riêng của phiên bản này, 400×260px. Để trống = dùng ảnh của phiên bản mặc định."
                : "Khuyến nghị: 400×260px, .webp."
            }
            value={tab ? spot.imageByVersion?.[tab]?.src ?? "" : spot.image.src}
            onChange={(src) =>
              setData({
                ...data,
                hotspots: replaceAt(
                  data.hotspots,
                  i,
                  tab
                    ? { ...spot, imageByVersion: { ...spot.imageByVersion, [tab]: { src, alt: spot.image.alt } } }
                    : { ...spot, image: { ...spot.image, src } }
                ),
              })
            }
          />
          {tab && !spot.imageByVersion?.[tab]?.src && <DungAnhMacDinh src={spot.image.src} />}
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
