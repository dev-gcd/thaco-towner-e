# Thaco Towner E — Landing page bán xe + CMS

Landing xe tải van điện **THACO TOWNER E**, dựng pixel-perfect từ Figma.
**Khung được clone từ `thaco-truck-sale-page`** (cùng workspace) — luồng giống hệt:
dựng giao diện từ Figma trước, sau đó thêm trang quản trị cho khách tự sửa nội dung.

> Trạng thái: **mới dựng khung** (2026-09-16). Chưa có khối nội dung nào, chưa deploy,
> chưa tạo kho dữ liệu D1. Xem mục "Việc còn lại" bên dưới.

## Nguồn thiết kế

- Figma: `Wh7QFGOJVuKPF6IIjmtKN0` — trang `Working File`, frame **`Thaco Towner E - Full`** (1440 × 9473).
- 🔴 **Chưa đọc được qua MCP**: ghế Figma hiện tại không có Dev Mode (file thuộc tổ chức
  *Thaco E-Magazine*, phải admin bên đó nâng ghế). Đang chờ khách nâng; nếu không được thì
  chuyển sang đọc qua **Figma REST API** bằng personal access token (`FIGMA_TOKEN` trong `.dev.vars`).
- 9 khối đọc được từ bảng Layers (thứ tự trên trang):
  `Header · GTSP (giới thiệu) · USP (ưu điểm) · Dòng xe (phiên bản) · Ngoại thất ·
  Nội thất · CTA 1 · Trạm sạc · Footer`.
  Menu đầu trang: Giới thiệu · Ưu điểm · Dòng xe · Ngoại thất · Nội thất · Trạm sạc.

## Stack

- **Next.js 16** (App Router, Turbopack, `output: 'export'` → tĩnh vào `out/`)
- **React 19**, **Tailwind v4** (khai báo `@theme` trong `app/globals.css`, KHÔNG có `tailwind.config.ts`)
- **motion 12**, `next/font/google`
- Host: **Cloudflare Workers Static Assets** + **D1** (khách đăng ký), wrangler **v3**
- Quản lý gói: **pnpm** (Node 20 — `.nvmrc`)
- **Chỉ tiếng Việt.** Mọi ô chữ là chuỗi thường, không có cặp `{vi, en}` như bản truck.

## Lệnh

```sh
pnpm install
pnpm dev               # next dev :3002 (giao diện tĩnh; /api KHÔNG chạy ở chế độ này)
pnpm dev:cms           # lưng CMS ở :8790 — chạy SONG SONG với `pnpm dev`, sửa nội dung thấy ngay
pnpm build             # xuất tĩnh → out/
pnpm run deploy        # build + wrangler deploy
pnpm optimize:images   # chuyển ảnh sang .webp (tối đa 2400px, chất lượng 82)
pnpm test:screens      # chụp + kiểm tràn ngang ở nhiều độ phân giải
```

Cổng của project này: **3002** (trang) và **8790** (lưng CMS) — khác truck/van (3000/8788)
để mở song song được. Đã ghi ở `PORT.md` gốc workspace.

## Kiến trúc CMS (giống van/truck)

- Nội dung mỗi khối = 1 file `content/<block>.json`, nạp lúc build qua `lib/content.ts`.
- Trang quản trị (`/admin`) sửa → `PUT /api/admin/content/:name` → Worker commit JSON
  lên GitHub → Workers Build chạy lại → nội dung nướng vào bản tĩnh (đó là "xuất bản").
- Tải ảnh: PNG/JPG tự chuyển WebP ngay trên trình duyệt (`components/admin/ui.tsx`)
  → commit vào `public/images/uploads/`.
- Khách đăng ký: form công khai POST `/api/leads` → D1; xem ở thẻ **Khách đăng ký**.
- Email báo có khách mới (tuỳ chọn): cấu hình `MAIL_*` (Resend) — xem `worker/index.ts`.

### Thêm 1 khối sửa được (công thức 5 bước)

1. Tách nội dung ra `content/<block>.json` + bản gốc `content/defaults/<block>.json`.
2. Thêm kiểu + `export const` trong `lib/content.ts`.
3. Component khối đọc từ loader (chỉ thay chữ, giữ nguyên layout/CSS).
4. `components/admin/<Block>Editor.tsx` dùng primitive trong `ui.tsx` + `useContent.ts`
   (`ResponsiveImageInput` cho ảnh desktop/mobile, `SaveBar` có nút khôi phục mặc định).
5. Đăng ký: thêm khoá vào `CONTENT_FILES` ở **`worker/index.ts` VÀ `scripts/cms-dev.mjs`**
   (hai chỗ phải khớp) + `CONTENT_ITEMS` trong `AdminApp.tsx`.

## Việc còn lại trước khi chạy thật

- [ ] Tạo kho D1 rồi dán id vào `wrangler.jsonc`: `pnpm exec wrangler d1 create thaco-towner-e-leads`
- [ ] Chạy migration 0001 + 0002 cho **cả local lẫn `--remote`** (hai môi trường tách biệt)
- [ ] Đặt khoá bí mật bản thật: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN` (+ `MAIL_*` nếu cần)
- [ ] Ở máy: copy `.dev.vars.example` → `.dev.vars` rồi điền
- [ ] Nối Cloudflare Workers Build với repo `dev-gcd/thaco-towner-e`
- [ ] Khách cấp mã Google Tag Manager → dán vào `GTM_ID` trong `app/(public)/layout.tsx`
- [ ] Khách cấp tên miền thật → sửa `metadataBase` cùng file

## Cạm bẫy (kế thừa từ van + truck, đã trả giá thật)

- 🔴 **Trang quản trị commit thẳng lên GitHub.** Khi khách bắt đầu dùng `/admin`,
  bản trên GitHub sẽ chạy trước bản ở máy. **Luôn `git pull --ff-only` trước khi sửa**,
  nếu không là ghi đè nội dung khách vừa nhập. (Ở truck đã có lần local lùi 16 commit.)
- 🔴 **Đừng đặt chiều cao theo `100vh`.** Màn laptop bật phóng to 150% làm chiều cao
  khả dụng co còn ~640px → khối con `absolute` trồi lên đè khối khác. Khách báo "bể layout,
  máy anh không bị" chính là cái này. Dùng px cố định theo thiết kế.
- **Next 16 + xuất tĩnh**: không có API route/SSR; mọi `/api/*` do Worker xử lý.
- **Cookie phiên dùng `SameSite=Lax`** (đặt `Strict` từng làm mất phiên khi tải lại trang).
- **Đổi cấu trúc D1 phải chạy migration `--remote`**, nếu không trang quản trị 500 khi đọc danh sách khách.
- **Tailwind v4 `@theme` ghi đè thang đo có tên** → dùng giá trị trực tiếp (`max-w-[40rem]`),
  đừng dùng `max-w-sm` (ở đây `max-w-sm` = 12px).
- **GTM không dùng `next/script strategy="beforeInteractive"`** — Next không xuất ra thẻ
  `<script>` thật. Phải dùng thẻ thô trong `<head>` (đã làm sẵn trong `app/(public)/layout.tsx`).

## Ghi chú kho mã

- Remote: `git@github-gcd:dev-gcd/thaco-towner-e.git` (bí danh SSH `github-gcd`, khoá `~/.ssh/id_git_gcd_dev`).
- ⚠️ **Repo nằm ở tài khoản cá nhân `dev-gcd`, không phải tổ chức `Syncore-Tech` như 2 project kia.**
  Ngày chuyển repo về tổ chức thì phải làm lại 3 việc, nếu không CMS của khách sẽ hỏng:
  1. sửa hằng `REPO` trong `worker/index.ts`
  2. **tạo lại PAT GitHub** (PAT cũ gắn với chủ cũ sẽ chết → khách bấm Lưu là lỗi)
  3. nối lại Cloudflare Workers Build với repo mới
- `_docs/` **không** đưa lên repo (đã chặn trong `.gitignore`) — để ảnh gốc, file khách gửi.
