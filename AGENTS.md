# Thaco Towner E — Landing page bán xe + CMS

Landing xe tải van điện **THACO TOWNER E**, dựng pixel-perfect từ Figma.
**Khung được clone từ `thaco-truck-sale-page`** (cùng workspace) — luồng giống hệt:
dựng giao diện từ Figma trước, sau đó thêm trang quản trị cho khách tự sửa nội dung.

> Trạng thái (2026-09-16): **9/9 khối giao diện đã dựng từ Figma**, trang quản trị sửa được
> cả 9 khối, hộp thoại đăng ký lái thử ghi vào kho khách đăng ký. **Chưa deploy, chưa tạo D1.**
> Xem mục "Việc còn lại" bên dưới.

## Nguồn thiết kế

- Figma: `Wh7QFGOJVuKPF6IIjmtKN0` — trang `Working File`, frame **`Thaco Towner E - Full`** (1440 × 9473).
- ⚠️ **KHÔNG đọc được qua Figma MCP** — ghế hiện tại không có Dev Mode (file thuộc tổ chức
  *Thaco E-Magazine*, chỉ admin bên đó nâng được). Đang chờ khách; **đường đang dùng là
  Figma REST API** với personal access token (`FIGMA_TOKEN` trong `.dev.vars`, chỉ đọc).
  Bản kết xuất để tra cứu: `_docs/figma/*.json` (local-only).

```sh
set -a && . ./.dev.vars && set +a
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE_KEY/nodes?ids=222:2151" -o _docs/figma/full-frame-deep.json
```

- Frame chính: **`222:2151` "Thaco Towner E - Full"** — 1440 × 9473. (`90:3978` là bản bấm thử,
  cùng kích thước; trang `Element` = kho component.)
- Phông thật của thiết kế: **Montserrat** (400/500/600/700/800). Cỡ tiêu đề lớn: 32px, 40px, 64px, 136px.
- Màu thật: `#1e7ed8` (xanh chủ đạo) · `#00529c` (xanh đậm) · `#2e2e2e` (chữ) · `#f9fcff` (nền nhạt)
  · `#e5e7eb` `#ededed` `#cccccc` `#ababab` (viền/phụ) · `#d7edff`.
- 9 khối nội dung + 2 khối `Spacing` (50px, 100px), thứ tự trên trang:

🔴 **Đọc `visible` trước khi dựng.** File có **107 nhánh đặt `visible: false`** — Figma vẫn trả
về trong JSON nhưng KHÔNG vẽ. Đã dựng nhầm 2 lần: chấm tròn 4px trước mỗi mục menu, và bộ đếm
"01 — Towner E V2.6-2S" ở khối Dòng xe. Lọc bằng `n.get("visible") is False` khi duyệt cây.

**Hiệu ứng** đọc từ hai nguồn, KHÔNG đoán:
1. `interactions` trong JSON — 43 tương tác: hover 200ms LINEAR · nút mũi tên 300ms · băng chuyền
   833ms SLOW · đổi phiên bản 1022ms GENTLE. SLOW/GENTLE là lò xo của Figma, CSS không có → xấp xỉ
   bằng `--ease-slow` / `--ease-gentle` trong `app/globals.css`.
2. **Bản quay màn hình bản dựng play**: `_docs/figma/figma_play.mov` (93 giây, local-only). Xem bằng
   `ffmpeg -ss <giây> -t <số giây> -i … -vf "fps=4,scale=600:-1" /tmp/x%02d.jpg` rồi ghép lưới.
   Ba thứ CHỈ có trong video, JSON không nói: xe chạy vào + bánh xoay ở khối Giải pháp · xe trôi lên
   ở khối Nội thất · băng chuyền ưu điểm hé 2 thẻ ở rìa.

⚠️ **So kích thước trong Figma với kích thước tệp ảnh.** Đã dính 2 lần: ảnh nền khối Dòng xe
(tệp 2040px, Figma vẽ 2812px) và cơ chế trượt nền của chính khối đó — ảnh gốc có SẴN 2 chiếc xe,
chiếc thứ hai là xe của bản V2.7, lộ ra sau khi nền trượt 684px. Đừng "sửa" cho mất nó.

⚠️ **Tailwind v4 đặt phóng to vào thuộc tính `scale`, không phải `transform`** → muốn chạy mượt
phải dùng `transition-[scale]`, `transition-transform` sẽ không có tác dụng.

| # | Khối | id | Cao | Ghi chú |
|---|---|---|---|---|
| 1 | Header | `222:2152` | 1064 | nav 6 mục + ảnh lớn đầu trang |
| 2 | GTSP | `222:2162` | 684 | giới thiệu + nút "Đăng ký lái thử ngay" |
| 3 | USP | `222:2165` | 900 | **5 thẻ**, mỗi thẻ **2 ảnh** (thường + chi tiết khi rê chuột, mã ảnh khác hẳn nhau). Khung nhìn tràn viền: 3 thẻ đầy + 2 thẻ hé |
| 4 | Dòng xe | `222:2166` | 951 | 2 phiên bản. **Đổi bản = nền trượt ngang 684px + bảng thông số đổi bên** (V2.6 x=735 phải, V2.7 x=176 trái). Hai góc dưới bo 80px |
| 5 | Ngoại thất | `222:2168` | 2000 | 2 khối con: ảnh lớn + danh sách 4 điểm đánh số |
| 6 | Nội thất | `222:2172` | 1200 | 5 điểm nóng trên ảnh xe (AVN, điều hoà, kính, ghế, cần số) |
| 7 | CTA 1 | `222:2173` | 718 | 2 nút: "Đăng ký lái thử" + "Tải Brochure" — **không có form nhập** |
| 8 | Trạm sạc | `222:2174` | 1276 | danh sách trạm + nút "Mở bản đồ". ⚠️ **Đứng SAU CTA**, không phải trước |
| 9 | Footer | `222:2294` | 530 | 3 cột + hotline + thông tin pháp nhân |

  Menu đầu trang: Giới thiệu · Ưu điểm · Dòng xe · Ngoại thất · Nội thất · Trạm sạc.
- **Không có bản điện thoại trong Figma.** Luật tự đặt, đã kiểm ở 6 cỡ màn 320 → 1024:
  · 6 mục menu thu vào nút ba gạch (theo `thaco-truck-sale-page`);
  · **ba dải cuộn ngang** — Ưu điểm, Nội thất, Trạm sạc — dùng `overflow-x-auto` + `snap-x`
    để vuốt được bằng ngón tay; luôn khai `scroll-pl-*` **bằng đúng** `pl-*`, nếu không thẻ
    dừng ở x=0 thay vì x=80 của khung 1440;
  · **bấm vào thẻ cũng chuyển thẻ** (`lib/slider.ts` → `bamDeChuyen`), trừ khi bấm trúng
    nút/liên kết bên trong thẻ (vd "Mở bản đồ");
  · khối Dòng xe trên điện thoại không trượt ảnh nền được → đổi phiên bản bằng cách **ngắm điểm
    cắt** sang chiếc xe kia (`16% 56%` ↔ `84% 56%`, tính từ tâm 2 xe trong ảnh gốc 2040px).
    Khai bằng `[object-position:var(--bg-pos)]` — viết `object-[var(...)]` thì Tailwind
    không sinh ra CSS vì không đoán được thuộc tính;
  · mọi vùng bấm ≥ 40px (chấm 10px bọc trong nút 44px; dòng liên hệ ở chân trang nới đệm dọc
    rồi thu `gap` lại cho cân);
  · khối Dòng xe phủ tối nửa dưới cho chữ trắng đọc được, và **chừa dải ảnh ~230px** giữa tiêu
    đề với bảng thông số — không chừa thì bảng che gần hết chiếc xe.
- 🔴 **`style` nội tuyến KHÔNG theo mốc màn hình.** Toạ độ chỉ dành cho khung 1440 phải đi qua
  biến CSS rồi dùng ở `lg:` (`style={{"--bg-x": …}}` + `lg:left-[var(--bg-x)]`). Đã trả giá:
  `left: -23.61%` của ảnh nền khối Dòng xe áp cả trên điện thoại, cắt mất chiếc xe.
- 🔴 **Đừng ghi cứng bước trượt băng chuyền.** Đo từ DOM (`thẻ[1].left - thẻ[0].left`) và đo lại
  khi đổi kích thước màn. Bản cũ ghi 440px (đúng cho khung 1440) nên ở màn hẹp — thẻ 280 + cách
  20 = 300 — thẻ đầu tiên nằm ngoài màn 84px và chữ bị cắt.
- Trang có **30 ảnh khác nhau** (đếm theo `imageRef` duy nhất) — xuất qua `/v1/images`.

## Stack

- **Next.js 16** (App Router, Turbopack, `output: 'export'` → tĩnh vào `out/`)
- **React 19**, **Tailwind v4** (khai báo `@theme` trong `app/globals.css`, KHÔNG có `tailwind.config.ts`)
- **motion 12**, `next/font/google`
- Host: **Cloudflare Workers Static Assets** + **D1** (khách đăng ký), wrangler **v3**
- Quản lý gói: **pnpm** (Node 20 — `.nvmrc`)
- **Chỉ tiếng Việt.** Mọi ô chữ là chuỗi thường, không có cặp `{vi, en}` như bản truck.
- **Bộ mốc màn hình chỉ còn `sm` 640 · `md` 768 · `lg` 1440** — khai lại toàn bộ trong
  `app/globals.css` bằng `--breakpoint-*: initial` rồi liệt kê tăng dần. **Không dùng
  `xl:`/`2xl:`** (đã xoá khỏi bộ). 🔴 Đừng đặt mốc tên riêng (vd `dsk`) và cũng đừng chỉ khai
  đè một mốc: Tailwind xuất khối `@media` đó SAI CHỖ, nên ở màn rộng `sm:` lại thắng `lg:`.
  Đã trả giá: dải ảnh 360° co còn 420px thay vì 960, 4 thẻ trạm sạc xếp 2×2 thay vì 1 hàng.
- **Luật bố cục màn rộng (chốt 16/09 — "trung sách"):** NỀN (ảnh, dải màu, thanh menu) tràn hết
  bề ngang; NỘI DUNG (chữ, thẻ, nút) neo trong khung 1440 căn giữa. Ảnh nền đặt bằng **phần trăm
  / vw theo đúng số đo Figma**, không bằng px cứng, để bố cục ảnh giữ nguyên ở mọi bề ngang.
  ⚠️ Kích thước trong Figma ≠ kích thước tệp ảnh: Figma thường phóng ảnh lên (ảnh nền khối Dòng
  xe: tệp 2040px nhưng Figma vẽ ở 2812px). Lấy nhầm cỡ tệp thì lọt **chiếc xe thứ hai** trong
  ảnh vào khung. Luôn đối chiếu `absoluteBoundingBox` trong `_docs/figma/*.json`.

## Lệnh

```sh
pnpm install
pnpm dev               # next dev :3002 (giao diện tĩnh; /api KHÔNG chạy ở chế độ này)
pnpm dev:cms           # 1 lệnh chạy cả hai: lưng CMS :8790 + trang :3002 (đừng chạy thêm `pnpm dev`)
pnpm build             # xuất tĩnh → out/
pnpm run deploy        # build + wrangler deploy
pnpm optimize:images   # chuyển ảnh sang .webp (tối đa 2400px, chất lượng 82)
pnpm test:screens      # chụp ảnh ở nhiều độ phân giải
pnpm audit:layout      # 🔴 CHẠY SAU MỖI LẦN SỬA GIAO DIỆN — 6 phép đo (50 mục): toạ độ so với
                       #    Figma · nội dung không lọt khung 1440 · tràn ngang 9 cỡ màn · hiệu ứng ·
                       #    bản điện thoại 320→1024 · thao tác trên điện thoại
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
