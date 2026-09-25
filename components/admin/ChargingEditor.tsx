"use client";

import { charging } from "@/lib/content";
import defaults from "@/content/defaults/charging.json";
import type { ChargingContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, TextArea, Select, ImageInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

const ICONS = [
  { value: "power", label: "Tia sét (công suất)" },
  { value: "plug", label: "Phích cắm (số trụ)" },
  { value: "standard", label: "Ổ cắm (chuẩn sạc)" },
];

export function ChargingEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<ChargingContent>(
    "charging",
    charging,
    defaults as ChargingContent
  );

  return (
    <EditorShell
      title="Trạm sạc"
      description="Danh sách trạm sạc và điểm nhấn về tốc độ sạc."
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
        <Field label="Tiêu đề">
          <TextInput
            value={data.heading}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </Field>
        <Field label="Mô tả">
          <TextArea
            rows={3}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </Field>
        <Field label="Chữ trên nút mở bản đồ">
          <TextInput
            value={data.mapLabel}
            onChange={(e) => setData({ ...data, mapLabel: e.target.value })}
          />
        </Field>
        <ResponsiveImageInput
          label="Ảnh nền"
          recommended="1440×1315px, .webp"
          value={data.background}
          onChange={(background) => setData({ ...data, background })}
        />
        <ImageInput
          label="Ảnh xe đang sạc"
          hint="Khuyến nghị: 1440×610px (dải đáy khối, xe đặt sẵn đúng chỗ), nền trong suốt."
          value={data.car.src}
          onChange={(src) => setData({ ...data, car: { ...data.car, src } })}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-800">Điểm nhấn tốc độ sạc</p>
        <Field label="Dòng trên">
          <TextInput
            value={data.highlight.title}
            onChange={(e) =>
              setData({ ...data, highlight: { ...data.highlight, title: e.target.value } })
            }
          />
        </Field>
        <Field label="Dòng dưới">
          <TextInput
            value={data.highlight.description}
            onChange={(e) =>
              setData({ ...data, highlight: { ...data.highlight, description: e.target.value } })
            }
          />
        </Field>
      </Card>

      {data.stations.map((station, i) => (
        <ItemCard
          key={i}
          title={station.name || `Trạm ${i + 1}`}
          onMoveUp={
            i > 0 ? () => setData({ ...data, stations: move(data.stations, i, -1) }) : undefined
          }
          onMoveDown={
            i < data.stations.length - 1
              ? () => setData({ ...data, stations: move(data.stations, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, stations: removeAt(data.stations, i) })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên trạm">
              <TextInput
                value={station.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    stations: replaceAt(data.stations, i, { ...station, name: e.target.value }),
                  })
                }
              />
            </Field>
            <Field label="Khu vực">
              <TextInput
                value={station.area}
                onChange={(e) =>
                  setData({
                    ...data,
                    stations: replaceAt(data.stations, i, { ...station, area: e.target.value }),
                  })
                }
              />
            </Field>
          </div>
          <Field
            label="Link bản đồ"
            hint="Dán link Google Maps. Nút “Mở bản đồ” LUÔN hiện; để trống thì khách bấm vào sẽ thấy hộp thoại “Đang cập nhật” (sửa chữ ở mục Đăng ký & Brochure)."
          >
            <TextInput
              value={station.mapUrl}
              placeholder="https://maps.app.goo.gl/…"
              onChange={(e) =>
                setData({
                  ...data,
                  stations: replaceAt(data.stations, i, { ...station, mapUrl: e.target.value }),
                })
              }
            />
          </Field>

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thông số</p>
          {station.specs.map((spec, j) => (
            <div key={j} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <Field label="Biểu tượng">
                <Select
                  value={spec.icon}
                  onChange={(e) =>
                    setData({
                      ...data,
                      stations: replaceAt(data.stations, i, {
                        ...station,
                        specs: replaceAt(station.specs, j, { ...spec, icon: e.target.value }),
                      }),
                    })
                  }
                >
                  {ICONS.map((ic) => (
                    <option key={ic.value} value={ic.value}>
                      {ic.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Giá trị">
                <TextInput
                  value={spec.value}
                  onChange={(e) =>
                    setData({
                      ...data,
                      stations: replaceAt(data.stations, i, {
                        ...station,
                        specs: replaceAt(station.specs, j, { ...spec, value: e.target.value }),
                      }),
                    })
                  }
                />
              </Field>
              <Field label="Nhãn">
                <TextInput
                  value={spec.label}
                  onChange={(e) =>
                    setData({
                      ...data,
                      stations: replaceAt(data.stations, i, {
                        ...station,
                        specs: replaceAt(station.specs, j, { ...spec, label: e.target.value }),
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
                    stations: replaceAt(data.stations, i, {
                      ...station,
                      specs: removeAt(station.specs, j),
                    }),
                  })
                }
                className="mb-1 rounded-md border border-red-200 px-2 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                Xoá
              </button>
            </div>
          ))}
          <AddButton
            label="Thêm thông số"
            onClick={() =>
              setData({
                ...data,
                stations: replaceAt(data.stations, i, {
                  ...station,
                  specs: [...station.specs, { icon: "power", value: "", label: "" }],
                }),
              })
            }
          />
        </ItemCard>
      ))}
      <AddButton
        label="Thêm trạm sạc"
        onClick={() =>
          setData({
            ...data,
            stations: [...data.stations, { name: "", area: "", mapUrl: "", specs: [] }],
          })
        }
      />
    </EditorShell>
  );
}
