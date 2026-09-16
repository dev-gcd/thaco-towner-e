"use client";

import { versions } from "@/lib/content";
import defaults from "@/content/defaults/versions.json";
import type { VersionsContent } from "@/lib/content";
import { useContentEditor, replaceAt, removeAt, move } from "./useContent";
import { Card, Field, TextInput, ResponsiveImageInput } from "./ui";
import { AddButton, EditorShell, ItemCard } from "./EditorShell";

export function VersionsEditor() {
  const { data, setData, dirty, saving, status, save, reset } = useContentEditor<VersionsContent>(
    "versions",
    versions,
    defaults as VersionsContent
  );

  return (
    <EditorShell
      title="Dòng xe"
      description="Các phiên bản xe, chuyển qua lại bằng 2 nút mũi tên trên trang."
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề — phần xanh đậm">
            <TextInput
              value={data.heading}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </Field>
          <Field label="Tiêu đề — phần xanh sáng">
            <TextInput
              value={data.headingAccent}
              onChange={(e) => setData({ ...data, headingAccent: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Chữ trước giá">
          <TextInput
            value={data.priceLabel}
            onChange={(e) => setData({ ...data, priceLabel: e.target.value })}
          />
        </Field>
        <ResponsiveImageInput
          label="Ảnh nền"
          recommended="2812×2112px, .webp"
          value={data.background}
          onChange={(background) => setData({ ...data, background })}
        />
      </Card>

      {data.items.map((item, i) => (
        <ItemCard
          key={i}
          title={item.displayName || `Phiên bản ${i + 1}`}
          onMoveUp={i > 0 ? () => setData({ ...data, items: move(data.items, i, -1) }) : undefined}
          onMoveDown={
            i < data.items.length - 1
              ? () => setData({ ...data, items: move(data.items, i, 1) })
              : undefined
          }
          onRemove={() => setData({ ...data, items: removeAt(data.items, i) })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên dòng xe">
              <TextInput
                value={item.name}
                onChange={(e) =>
                  setData({ ...data, items: replaceAt(data.items, i, { ...item, name: e.target.value }) })
                }
              />
            </Field>
            <Field label="Mã phiên bản" hint="Chữ khổng lồ trên ảnh.">
              <TextInput
                value={item.code}
                onChange={(e) =>
                  setData({ ...data, items: replaceAt(data.items, i, { ...item, code: e.target.value }) })
                }
              />
            </Field>
            <Field label="Tên hiển thị ở bộ đếm">
              <TextInput
                value={item.displayName}
                onChange={(e) =>
                  setData({
                    ...data,
                    items: replaceAt(data.items, i, { ...item, displayName: e.target.value }),
                  })
                }
              />
            </Field>
            <Field label="Giá bán">
              <TextInput
                value={item.price}
                onChange={(e) =>
                  setData({ ...data, items: replaceAt(data.items, i, { ...item, price: e.target.value }) })
                }
              />
            </Field>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thông số</p>
          {item.specs.map((spec, j) => (
            <div key={j} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Giá trị">
                <TextInput
                  value={spec.value}
                  onChange={(e) =>
                    setData({
                      ...data,
                      items: replaceAt(data.items, i, {
                        ...item,
                        specs: replaceAt(item.specs, j, { ...spec, value: e.target.value }),
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
                      items: replaceAt(data.items, i, {
                        ...item,
                        specs: replaceAt(item.specs, j, { ...spec, label: e.target.value }),
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
                    items: replaceAt(data.items, i, { ...item, specs: removeAt(item.specs, j) }),
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
                items: replaceAt(data.items, i, {
                  ...item,
                  specs: [...item.specs, { value: "", label: "" }],
                }),
              })
            }
          />
        </ItemCard>
      ))}
      <AddButton
        label="Thêm phiên bản"
        onClick={() =>
          setData({
            ...data,
            items: [
              ...data.items,
              { name: "Towner e", code: "", displayName: "", price: "", specs: [] },
            ],
          })
        }
      />
    </EditorShell>
  );
}
