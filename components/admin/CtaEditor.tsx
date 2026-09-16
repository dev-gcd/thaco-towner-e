"use client";

import { cta } from "@/lib/content";
import defaults from "@/content/defaults/cta.json";
import type { CtaContent } from "@/lib/content";
import { useContentEditor } from "./useContent";
import { Card, Field, TextInput, TextArea, ImageInput, FileInput } from "./ui";
import { EditorShell } from "./EditorShell";

export function CtaEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<CtaContent>(
    "cta",
    cta,
    defaults as CtaContent
  );

  return (
    <EditorShell
      title="Kêu gọi hành động & biểu mẫu"
      description="Hai thẻ cuối trang, kèm toàn bộ chữ trong hộp thoại đăng ký lái thử."
      dirty={dirty}
      saving={saving}
      status={status}
      onSave={save}
      onReset={reset}
    >
      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Thẻ 1 — Đăng ký lái thử</p>
        <Field label="Nhãn nhỏ">
          <TextInput
            value={data.driveTest.label}
            onChange={(e) => setData({ ...data, driveTest: { ...data.driveTest, label: e.target.value } })}
          />
        </Field>
        <Field label="Tiêu đề" hint="Xuống dòng ở đâu thì trang hiển thị đúng ở đó.">
          <TextArea
            rows={2}
            value={data.driveTest.heading}
            onChange={(e) =>
              setData({ ...data, driveTest: { ...data.driveTest, heading: e.target.value } })
            }
          />
        </Field>
        <Field label="Chữ trên nút">
          <TextInput
            value={data.driveTest.buttonLabel}
            onChange={(e) =>
              setData({ ...data, driveTest: { ...data.driveTest, buttonLabel: e.target.value } })
            }
          />
        </Field>
        <ImageInput
          label="Ảnh thẻ"
          hint="Khuyến nghị: 705×558px, .webp."
          value={data.driveTest.image.src}
          onChange={(src) =>
            setData({
              ...data,
              driveTest: { ...data.driveTest, image: { ...data.driveTest.image, src } },
            })
          }
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Thẻ 2 — Tải Brochure</p>
        <Field label="Nhãn nhỏ">
          <TextInput
            value={data.brochure.label}
            onChange={(e) => setData({ ...data, brochure: { ...data.brochure, label: e.target.value } })}
          />
        </Field>
        <Field label="Tiêu đề">
          <TextArea
            rows={2}
            value={data.brochure.heading}
            onChange={(e) =>
              setData({ ...data, brochure: { ...data.brochure, heading: e.target.value } })
            }
          />
        </Field>
        <Field label="Chữ trên nút">
          <TextInput
            value={data.brochure.buttonLabel}
            onChange={(e) =>
              setData({ ...data, brochure: { ...data.brochure, buttonLabel: e.target.value } })
            }
          />
        </Field>
        <FileInput
          label="Tệp brochure (.pdf)"
          hint="Chưa có tệp thì nút tải brochure sẽ tự ẩn trên trang. Tải tệp lên là nút hiện ra."
          value={data.brochure.file}
          onChange={(file) => setData({ ...data, brochure: { ...data.brochure, file } })}
        />
        <ImageInput
          label="Ảnh thẻ"
          hint="Khuyến nghị: 732×676px, .webp."
          value={data.brochure.image.src}
          onChange={(src) =>
            setData({
              ...data,
              brochure: { ...data.brochure, image: { ...data.brochure.image, src } },
            })
          }
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Hộp thoại đăng ký lái thử</p>
        <Field label="Tiêu đề hộp thoại">
          <TextInput
            value={data.form.title}
            onChange={(e) => setData({ ...data, form: { ...data.form, title: e.target.value } })}
          />
        </Field>
        <Field label="Mô tả">
          <TextArea
            rows={2}
            value={data.form.description}
            onChange={(e) => setData({ ...data, form: { ...data.form, description: e.target.value } })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nhãn ô Họ tên">
            <TextInput
              value={data.form.nameLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, nameLabel: e.target.value } })}
            />
          </Field>
          <Field label="Gợi ý ô Họ tên">
            <TextInput
              value={data.form.namePlaceholder}
              onChange={(e) =>
                setData({ ...data, form: { ...data.form, namePlaceholder: e.target.value } })
              }
            />
          </Field>
          <Field label="Nhãn ô Số điện thoại">
            <TextInput
              value={data.form.phoneLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, phoneLabel: e.target.value } })}
            />
          </Field>
          <Field label="Gợi ý ô Số điện thoại">
            <TextInput
              value={data.form.phonePlaceholder}
              onChange={(e) =>
                setData({ ...data, form: { ...data.form, phonePlaceholder: e.target.value } })
              }
            />
          </Field>
          <Field label="Nhãn ô Ghi chú">
            <TextInput
              value={data.form.noteLabel}
              onChange={(e) => setData({ ...data, form: { ...data.form, noteLabel: e.target.value } })}
            />
          </Field>
          <Field label="Gợi ý ô Ghi chú">
            <TextInput
              value={data.form.notePlaceholder}
              onChange={(e) =>
                setData({ ...data, form: { ...data.form, notePlaceholder: e.target.value } })
              }
            />
          </Field>
        </div>
        <Field label="Chữ trên nút gửi">
          <TextInput
            value={data.form.submitLabel}
            onChange={(e) => setData({ ...data, form: { ...data.form, submitLabel: e.target.value } })}
          />
        </Field>
        <Field label="Lời cảm ơn sau khi gửi">
          <TextArea
            rows={2}
            value={data.form.successMessage}
            onChange={(e) =>
              setData({ ...data, form: { ...data.form, successMessage: e.target.value } })
            }
          />
        </Field>
      </Card>
    </EditorShell>
  );
}
