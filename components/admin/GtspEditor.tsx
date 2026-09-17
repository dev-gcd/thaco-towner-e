"use client";

import { gtsp } from "@/lib/content";
import defaults from "@/content/defaults/gtsp.json";
import type { GtspContent } from "@/lib/content";
import { useContentEditor } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, ResponsiveImageInput } from "./ui";
import { EditorShell } from "./EditorShell";

export function GtspEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<GtspContent>(
    "gtsp",
    gtsp,
    defaults as GtspContent
  );

  return (
    <EditorShell
      title="Giới thiệu sản phẩm"
      description="Thẻ trắng ngay dưới đầu trang, kèm nút mở biểu mẫu đăng ký lái thử."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <Field label="Tiêu đề" hint="Xuống dòng ở đâu thì trang hiển thị đúng ở đó.">
          <TextArea
            rows={2}
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </Field>
        <Field label="Mô tả">
          <TextArea
            rows={3}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </Field>
        <Field label="Chữ trên nút" hint="Bấm nút này sẽ mở hộp thoại đăng ký lái thử.">
          <TextInput
            value={data.ctaLabel}
            onChange={(e) => setData({ ...data, ctaLabel: e.target.value })}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <ResponsiveImageInput
          label="Ảnh nền của thẻ"
          recommended="1280×444px, .webp"
          value={data.background}
          onChange={(background) => setData({ ...data, background })}
        />
        <ImageInput
          label="Ảnh xe"
          hint="Khuyến nghị: 678×306px, nền trong suốt."
          value={data.car.src}
          onChange={(src) => setData({ ...data, car: { ...data.car, src } })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageInput
            label="Bánh trước"
            hint="Ảnh VUÔNG (vd 222×222px), chỉ có bánh xe nằm giữa, nền trong suốt. Không dùng ảnh cả chiếc xe."
            value={data.wheelFront.src}
            onChange={(src) => setData({ ...data, wheelFront: { ...data.wheelFront, src } })}
          />
          <ImageInput
            label="Bánh sau"
            hint="Ảnh VUÔNG (vd 222×222px), chỉ có bánh xe nằm giữa, nền trong suốt. Không dùng ảnh cả chiếc xe."
            value={data.wheelRear.src}
            onChange={(src) => setData({ ...data, wheelRear: { ...data.wheelRear, src } })}
          />
        </div>
      </Card>
    </EditorShell>
  );
}
