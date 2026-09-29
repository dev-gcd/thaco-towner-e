"use client";

import { tracking } from "@/lib/content";
import type { TrackingContent } from "@/lib/content";
import { checkTrackingCode } from "@/lib/tracking.mjs";
import { useContentEditor } from "./useContent";
import { Card, Field, TextArea } from "./ui";
import { EditorShell } from "./EditorShell";

const HEAD_LABEL = "Mã chèn vào <head>";
const BODY_LABEL = "Mã chèn đầu <body>";

export function TrackingEditor() {
  const { data, setData, dirty, saving, status, save } = useContentEditor<TrackingContent>(
    "tracking",
    tracking
  );
  const headError = checkTrackingCode(data.headCode, HEAD_LABEL);
  const bodyError = checkTrackingCode(data.bodyCode, BODY_LABEL);
  const hasError = Boolean(headError || bodyError);

  return (
    <EditorShell
      title="Mã theo dõi"
      description="Google Tag Manager, Google Analytics, Facebook Pixel… — dán nguyên đoạn mã nhà cung cấp đưa. Chỉ gắn vào trang khách, không gắn vào trang quản trị."
      dirty={dirty}
      saving={saving}
      status={status}
      // Worker cũng kiểm lại; chặn ở đây để khách thấy lỗi ngay, khỏi chờ gửi đi.
      onSave={hasError ? () => undefined : save}
    >
      <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <p>
          Mã dán ở đây chạy trên trang khách <b>đúng như dán</b>. Chỉ dán mã lấy trực tiếp từ
          trang của Google / Facebook, không dán mã do người lạ gửi.
        </p>
        <p>
          Với Google Tag Manager: phần thứ nhất dán vào ô <b>&lt;head&gt;</b>, phần{" "}
          <b>&lt;noscript&gt;</b> dán vào ô <b>&lt;body&gt;</b>. Để trống cả hai ô là gỡ mã.
          Lưu xong khoảng 1–2 phút trang mới cập nhật.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <CodeField
          label={HEAD_LABEL}
          hint="Chèn ngay đầu <head> của trang."
          value={data.headCode}
          error={headError}
          onChange={(headCode) => setData({ ...data, headCode })}
        />
        <CodeField
          label={BODY_LABEL}
          hint="Chèn ngay sau thẻ mở <body>."
          value={data.bodyCode}
          error={bodyError}
          onChange={(bodyCode) => setData({ ...data, bodyCode })}
        />
      </Card>
    </EditorShell>
  );
}

function CodeField({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={8}
        className="font-mono text-xs"
        placeholder="<!-- Google Tag Manager --> …"
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </Field>
  );
}
