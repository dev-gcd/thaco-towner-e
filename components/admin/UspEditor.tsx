"use client";

import { usp } from "@/lib/content";
import defaults from "@/content/defaults/usp.json";
import type { UspContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

export function UspEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<UspContent>(
    "usp",
    usp,
    defaults as UspContent
  );

  return (
    <EditorShell
      title="Ưu điểm nổi bật"
      description="Băng chuyền thẻ ảnh. Số lượng thẻ bao nhiêu cũng được, chấm tròn điều hướng tự đếm theo."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <Field label="Nhãn nhỏ">
          <TextInput
            value={data.label}
            onChange={(e) => setData({ ...data, label: e.target.value })}
          />
        </Field>
        <Field label="Tiêu đề">
          <TextInput
            value={data.heading}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </Field>
      </Card>

      {data.items.map((item, i) => (
        <ItemCard
          key={i}
          title={item.title.replace("\n", " ") || `Thẻ ${i + 1}`}
          onMoveUp={i > 0 ? () => setData({ ...data, items: move(data.items, i, -1) }) : undefined}
          onMoveDown={
            i < data.items.length - 1
              ? () => setData({ ...data, items: move(data.items, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, items: removeAt(data.items, i) })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageInput
              label="Ảnh thường"
              hint="Khuyến nghị: 400×500px (dọc), .webp."
              value={item.image.src}
              onChange={(src) =>
                setData({
                  ...data,
                  items: replaceAt(data.items, i, { ...item, image: { ...item.image, src } }),
                })
              }
            />
            <ImageInput
              label="Ảnh khi rê chuột"
              hint="Cùng khổ 400×500px. Hiện đè lên ảnh thường khi khách đưa chuột vào thẻ."
              value={item.imageHover.src}
              onChange={(src) =>
                setData({
                  ...data,
                  items: replaceAt(data.items, i, {
                    ...item,
                    imageHover: { ...item.imageHover, src },
                  }),
                })
              }
            />
          </div>
          <Field label="Mô tả ảnh (alt)">
            <TextInput
              value={item.image.alt}
              onChange={(e) =>
                setData({
                  ...data,
                  items: replaceAt(data.items, i, {
                    ...item,
                    image: { ...item.image, alt: e.target.value },
                  }),
                })
              }
            />
          </Field>
          <Field label="Tiêu đề thẻ" hint="Xuống dòng ở đâu thì trang hiển thị đúng ở đó.">
            <TextArea
              rows={2}
              value={item.title}
              onChange={(e) =>
                setData({ ...data, items: replaceAt(data.items, i, { ...item, title: e.target.value }) })
              }
            />
          </Field>
          <Field label="Dòng phụ">
            <TextInput
              value={item.subtitle}
              onChange={(e) =>
                setData({
                  ...data,
                  items: replaceAt(data.items, i, { ...item, subtitle: e.target.value }),
                })
              }
            />
          </Field>
        </ItemCard>
      ))}
      <AddButton
        label="Thêm thẻ ưu điểm"
        onClick={() =>
          setData({
            ...data,
            items: [
              ...data.items,
              {
                image: { src: "", alt: "" },
                imageHover: { src: "", alt: "" },
                title: "Tiêu đề",
                subtitle: "",
              },
            ],
          })
        }
      />
    </EditorShell>
  );
}
