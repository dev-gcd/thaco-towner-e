# Thaco Towner E — Landing page bán xe + CMS

Landing xe tải van điện **THACO TOWNER E**, dựng pixel-perfect từ Figma.
**Khung được clone từ `thaco-truck-sale-page`** (cùng workspace) — luồng giống hệt:
dựng giao diện từ Figma trước, sau đó thêm trang quản trị cho khách tự sửa nội dung.

> Trạng thái (2026-09-16): **ĐÃ DEPLOY** — https://thaco-towner-e.yellow-mouse-f324.workers.dev
> (tài khoản Cloudflare `dev@gcd.vn`). 9/9 khối dựng từ Figma, CMS sửa được cả 9 khối, form
> đăng ký lái thử ghi vào D1 `thaco-towner-e-leads`. Xem "Việc còn lại" bên dưới.

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

🔴 **Đọc `scaleMode` + `imageTransform` của mỗi ảnh trong Figma, đừng mặc định cắt chính giữa.**
Đã dính 2 lần: bánh xe khối Giới thiệu (ảnh nằm trong khung 1869×842) và logo chân trang (21/09 —
STRETCH, chỉ lấy dải 18,8%–70% chiều cao; `object-cover` cắt giữa làm mất đỉnh vòng elip, còn ảnh
1460px thu về 139px thì mờ). Cách chữa: cắt sẵn tệp đúng dải Figma, thu về gấp 3 cỡ hiển thị
(`logo-main.webp` 417×183), hiển thị bằng `object-contain`.

⚠️ **Tailwind v4 đặt phóng to vào thuộc tính `scale`, không phải `transform`** → muốn chạy mượt
phải dùng `transition-[scale]`, `transition-transform` sẽ không có tác dụng.

| # | Khối | id | Cao | Ghi chú |
|---|---|---|---|---|
| 1 | Header | `222:2152` | 1064 | nav 6 mục + ảnh lớn đầu trang. ⚠️ Thanh menu đã tách thành `SiteNav` (xem dưới) — `<header>` giờ chỉ còn phần ảnh, cao 1024 |
| 2 | GTSP | `222:2162` | 684 | giới thiệu + nút "Đăng ký lái thử ngay" |
| 3 | USP | `222:2165` | 900 | **5 thẻ**, mỗi thẻ **2 ảnh** (thường + chi tiết khi rê chuột, mã ảnh khác hẳn nhau). Khung nhìn tràn viền: 3 thẻ đầy + 2 thẻ hé |
| 4 | Dòng xe | `222:2166` | 951 | 2 phiên bản. **Đổi bản = nền trượt ngang 684px + bảng thông số đổi bên** (V2.6 x=735 phải, V2.7 x=176 trái). Hai góc dưới bo 80px |
| 5 | Ngoại thất | `222:2168` | 2000 | 2 khối con: băng ảnh các góc xe (xem mục "Bộ ảnh các góc xe") + danh sách 4 điểm đánh số |
| 6 | Nội thất | `222:2172` | 1200 | 5 điểm nóng trên ảnh xe (AVN, điều hoà, kính, ghế, cần số) |
| 7 | CTA 1 | `222:2173` | 718 | 2 nút: "Đăng ký lái thử" + "Tải Brochure" — **không có form nhập** |
| 8 | Trạm sạc | `222:2174` | 1276 | danh sách trạm + nút "Mở bản đồ". ⚠️ **Đứng SAU CTA**, không phải trước |
| 9 | Footer | `222:2294` | 530 | 3 cột + hotline + thông tin pháp nhân |

  Menu đầu trang: Giới thiệu · Ưu điểm · Dòng xe · Ngoại thất · Nội thất · Trạm sạc.
- 🔴 **Thanh menu CỐ ĐỊNH + Hotline (khách yêu cầu 21/09, lệch Figma có chủ ý).** `SiteNav` trong
  `components/sections/Header.tsx`, đặt NGOÀI `<header>` và `<main>` (ngang hàng) trong
  `LandingPage.tsx` — `sticky` chỉ bám trong khối cha, để trong `<header>` là trôi mất khi hết ảnh
  đầu trang. Thanh cao 48px (điện thoại 44px), chữ 16px (co còn 15px ở 800), 6 mục chia đều, mỗi
  mục tối đa 117px như Figma. Hotline bên phải = ô `hotline` trong `content/header.json` (sửa ở
  `/admin` → Đầu trang; để trống thì ẩn). Bấm menu không bị thanh che nhờ `scroll-padding-top` ở
  `html` (44 / 48px trong `globals.css`) — đổi chiều cao thanh thì phải đổi cả số này.
- **Chân trang ở laptop (21/09):** 2 phần luôn đứng cạnh nhau từ 800px — cột công ty tối thiểu
  190px, 3 cột liên kết rộng theo nội dung, chỉ cột Liên hệ được xuống dòng (số điện thoại không bị
  tách, email ngắt sau "." / "@" — hàm `ngatDongLienHe`). Đừng dùng dấu cách không ngắt cho số: trong
  Montserrat nó rộng khác dấu cách thường, làm chữ xê dịch cả ở bản 1440.
- **Không có bản điện thoại trong Figma.** Luật tự đặt, đã kiểm ở 6 cỡ màn 320 → 1024 (từ 19/09
  bản điện thoại/máy tính bảng chỉ còn áp dưới 800px — từ 800 là bản laptop):
  · 6 mục menu thu vào nút ba gạch (theo `thaco-truck-sale-page`);
  · **hai dải cuộn ngang** — Ưu điểm, Nội thất — dùng `overflow-x-auto` + `snap-x`
    để vuốt được bằng ngón tay; luôn khai `scroll-pl-*` **bằng đúng** `pl-*`, nếu không thẻ
    dừng ở x=0 thay vì x=80 của khung 1440;
  · **bấm vào thẻ cũng chuyển thẻ** (`lib/slider.ts` → `bamDeChuyen`), trừ khi bấm trúng
    nút/liên kết bên trong thẻ;
  · **Trạm sạc KHÔNG cuộn ngang** mà là lưới 2 cột thu gọn (chốt 16/09): dải ngang chỉ lộ 1 thẻ,
    khách cuộn dọc lướt qua sẽ tưởng chỉ có 1 trạm;
  · **Thiết kế mạnh mẽ trên điện thoại hiện đủ mọi mục xếp dọc**, mục nào cũng sáng, không có
    bấm-để-đổi (chốt 16/09) — kiểu đổi thẻ 900 ↔ 340 chỉ giữ từ `md` trở lên;
  · khối Dòng xe trên điện thoại không trượt ảnh nền được → đổi phiên bản bằng cách **ngắm điểm
    cắt** sang chiếc xe kia (`16% 56%` ↔ `84% 56%`, tính từ tâm 2 xe trong ảnh gốc 2040px).
    Khai bằng `[object-position:var(--bg-pos)]` — dạng rút gọn (tiền tố object- với ngoặc
    vuông chứa biến) thì Tailwind không sinh ra CSS vì không đoán được thuộc tính;
  · 🔴 **Tailwind v4 quét CẢ tệp `.md`** (mọi tệp không bị `.gitignore` chặn). Đừng viết tên
    class mẫu có ngoặc vuông trong tài liệu — nó sinh ra CSS hỏng và làm vỡ build (đã dính:
    lỗi "Parsing CSS source code failed" ở `globals.css`);
  · mọi vùng bấm ≥ 40px (chấm 10px bọc trong nút 44px; dòng liên hệ ở chân trang nới đệm dọc
    rồi thu `gap` lại cho cân);
  · khối Dòng xe phủ tối nửa dưới cho chữ trắng đọc được, và **chừa dải ảnh ~230px** giữa tiêu
    đề với bảng thông số — không chừa thì bảng che gần hết chiếc xe.
- 🔴 **`style` nội tuyến KHÔNG theo mốc màn hình.** Toạ độ chỉ dành cho khung 1440 phải đi qua
  biến CSS rồi dùng ở `xl:`/`lg:` (`style={{"--bg-x": …}}` rồi đọc lại bằng var(--bg-x) trong class). Đã trả giá:
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
- **Bộ mốc màn hình: `sm` 640 · `md` 768 · `lg` 800 (laptop) · `xl` 1440 (khung Figma)** —
  khai lại ĐỦ BỘ trong `app/globals.css` bằng `--breakpoint-*: initial` rồi liệt kê tăng dần.
  Không có `2xl:`. 🔴 Đừng đặt mốc tên riêng (vd `dsk`) và cũng đừng chỉ khai đè một mốc:
  Tailwind xuất khối `@media` đó SAI CHỖ, nên ở màn rộng `sm:` lại thắng mốc lớn hơn.
  Đã trả giá: dải ảnh 360° co còn 420px thay vì 960, 4 thẻ trạm sạc xếp 2×2 thay vì 1 hàng.
  Sau khi đổi mốc: `pnpm build` rồi kiểm thứ tự `min-width` trong CSS xuất ra (640→768→800→1440).
- 🔴 **Laptop 800–1439 (chốt 18/09).** Trước đó mốc máy tính là 1440 nên **mọi laptop hẹp hơn
  1440 nhận bản điện thoại**: 1366×768, 1920 bật phóng to 150% (trình duyệt chỉ còn 1280),
  1280×800 phóng 150% (chỉ còn 853 — khách test lại vẫn lỗi khi mốc là 1024, nên hạ xuống 800).
  Khách báo lỗi ở khối Nội thất chính là cái này, KHÔNG phải do chiều cao màn. Cách làm cho
  từng khối: khung nội dung gắn class `canvas-1440` → có biến `--u` = 1px Figma quy theo bề
  rộng thật của khung (1 ở 1440, 0,889 ở 1280, 0,592 ở 853). Toạ độ ở `lg:` viết dạng
  calc(N * var(--u)), nên ở 1440 ra đúng N px. Không co: chữ nhỏ (nhãn, mô tả), vùng bấm
  40px (neo theo TÂM), thẻ có cỡ tối thiểu. Chiều cao khung dùng tỉ lệ khung hình, không
  dùng `--u` (chính khung không đọc được `--u` của mình).
  **Tiến độ: cả 9 khối đã có bản laptop (19/09).** Khối nào chữ dài (Ngoại thất, Trạm sạc,
  Chân trang) thì ở dải này xếp theo DÒNG CHẢY thay vì ghim toạ độ — ghim cứng thì chữ tràn
  khỏi thẻ; từ `xl` mới ghim đúng toạ độ Figma. Chi tiết ghi ở đầu mỗi tệp khối.
- 🔴 **5 bẫy đã trả giá khi dựng bản laptop (19/09)** — đọc trước khi sửa tiếp:
  1. **Cỡ chữ phải có SÀN, nhưng chiều cao dòng thì theo bản gốc.** `sm:leading-…` thắng chiều
     cao dòng của token cỡ chữ ở `xl`, nên tiêu đề CTA (40px) và Trạm sạc (48px) thật ra chỉ
     cao dòng 40px. Lấy theo token là giãn dòng, lệch bản 1440. Luôn ĐO bản cũ, đừng suy từ token.
  2. **Lề âm ở phần tử cuối bị gộp xuyên khung cha** (Trạm sạc: ảnh xe `-mb`). Khung cha phải
     `flow-root`, không thì lề âm mất tác dụng và ô tốc độ sạc tụt 60·u.
  3. **Độ lệch của hiệu ứng phải theo %, không theo px.** Khối Giới thiệu cho xe chạy vào từ
     `x: 900px`; ở laptop thẻ hẹp hơn 900px nên cả cụm nằm ngoài vùng cắt, "hiện khi cuộn tới"
     không bao giờ kích hoạt → mất hẳn xe. Đổi thành `70.3125%` (= 900/1280).
  4. **Đừng dùng `h-auto` cho ảnh cần cao đúng số đo Figma.** Tệp ảnh nội thất thật là
     1438×1914 (không đúng 1440×1917) nên `h-auto` cho 1916,66px, đủ làm ảnh lấy mẫu khác và
     lệch điểm ảnh ở 1600. Khai `h-[calc(1917*var(--u))]`.
  5. **Thẻ cùng hàng lệch nhau** khi tên dài ngắn khác nhau (Trạm sạc). Dùng `grid-rows-subgrid`
     trong `lg:max-xl:` để 4 thẻ dùng chung chiều cao từng hàng; `xl` vẫn thẻ cao cố định 372.
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
pnpm audit:layout      # 🔴 CHẠY SAU MỖI LẦN SỬA GIAO DIỆN — 10 phép đo: toạ độ so với Figma ·
                       #    bản laptop co đúng tỉ lệ (853/1024/1280/1366) · nội dung không lọt
                       #    khung 1440 · tràn ngang 12 cỡ màn · hiệu ứng · bản điện thoại ·
                       #    thao tác trên điện thoại · dải laptop 800–1439 (chữ không bị cắt,
                       #    không đè nhau, không nhỏ hơn 12px) · thanh menu cố định + hotline ·
                       #    băng ảnh các góc xe
pnpm test:smoke        # chức năng chính ở máy (ảnh, form, 2 hộp thoại, 10 mục CMS) — tự dọn dữ liệu thử
pnpm test:worker       # luồng lưu bộ ảnh 360° của Worker với GitHub GIẢ LẬP (không tạo commit thật)
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

### Bộ ảnh các góc xe — băng ảnh khối Ngoại thất (trước 21/09 gọi là "bộ ảnh 360°")

🔴 **Khối 1 của Ngoại thất là BĂNG ẢNH, không phải trình xem xoay 360°.** Figma chỉ có 1 ảnh xe +
2 mũi tên + thanh vị trí 260×4 (đoạn xanh 54px); video dựng play `_docs/slider_ngoai_that.mp4` cho
thấy 8 góc chụp rời, đổi bằng mũi tên. Bản 360° kéo xoay trước đây là hiểu sai — đã xoá (`Car360.tsx`).
Trang khách: `components/ExteriorSlider.tsx` — xe cũ trượt ra + nhạt dần, xe mới trượt vào CÙNG LÚC
(0,7s); hướng theo chiều SỐ THỨ TỰ (sang ảnh sau vào từ phải; lùi hoặc quay vòng về ảnh đầu vào từ
trái — đúng video); vuốt ngang trên điện thoại, phím ←/→; chưa có bộ ảnh thì hiện 1 ảnh xe, ẩn mũi
tên. **Ảnh phải cùng khổ 1536×1024, xe cùng chiều cao và cùng đường chân bánh** (đo từ video: xe
chính diện cao ~464px, đáy xe y≈821 tính từ đầu khối ở khung 1440) — không thì xe nhảy khi đổi ảnh.
Ảnh gốc 8 góc (chụp ngoài trời, CÒN NỀN): `_docs/V2.6-2S/NGOẠI THẤT/` — cần bản tách nền.
Dữ liệu, API và thư mục ảnh vẫn mang tên `360` (`view360.frames`, `/api/admin/360/*`,
`public/images/360/`) — giữ nguyên cho khỏi đổi Worker và dữ liệu đã lưu.

Khách tải **cả bộ ảnh** từ máy trong CMS (chọn nhiều ảnh / cả thư mục / kéo thả), không cần có
sẵn đường dẫn. Tải từng ảnh qua `/api/admin/upload` thì N ảnh = N commit = N lần Cloudflare build,
nên bộ ảnh đi đường riêng để ra **đúng 1 commit**:

1. Trình duyệt xếp ảnh theo tên tệp (so số: `2.png` trước `10.png`), nén WebP ≤1600px.
2. `POST /api/admin/360/blobs` — **lô tối đa 20 ảnh** (mỗi ảnh = 1 lần Worker gọi GitHub; gói
   Cloudflare miễn phí giới hạn 50 lần/lượt). Tạo blob, chưa đụng tới nhánh.
3. `POST /api/admin/360/commit` — 1 lần: dựng cây gồm ảnh mới + `content/exterior.json` + **xoá
   bộ ảnh cũ** trong `public/images/360/`, tạo commit, dời nhánh với `force:false` (nhánh vừa bị
   người khác đổi thì thử lại 1 lần, vẫn đổi thì báo lỗi — không bao giờ ghi đè).

Ảnh nằm ở `public/images/360/<mã-lô>/01.webp…`. Giới hạn 2–72 ảnh (nên 6–12). Trang khách tải trước
cả bộ khi khối còn cách màn ~800px.
`scripts/cms-dev.mjs` mô phỏng đúng 2 đường này bằng cách ghi thẳng ra đĩa.

### Thêm 1 khối sửa được (công thức 5 bước)

1. Tách nội dung ra `content/<block>.json` + bản gốc `content/defaults/<block>.json`.
2. Thêm kiểu + `export const` trong `lib/content.ts`.
3. Component khối đọc từ loader (chỉ thay chữ, giữ nguyên layout/CSS).
4. `components/admin/<Block>Editor.tsx` dùng primitive trong `ui.tsx` + `useContent.ts`
   (`ResponsiveImageInput` cho ảnh desktop/mobile, `SaveBar` có nút khôi phục mặc định).
5. Đăng ký: thêm khoá vào `CONTENT_FILES` ở **`worker/index.ts` VÀ `scripts/cms-dev.mjs`**
   (hai chỗ phải khớp) + `CONTENT_ITEMS` trong `AdminApp.tsx`.

## Việc còn lại trước khi chạy thật

- [x] Kho D1 `thaco-towner-e-leads` (APAC) — id `a9ac2b0d-4bd7-4bc0-984a-e3d82d51fbdd`
- [x] Migration 0001 + 0002 đã chạy cả local lẫn `--remote` (11 cột, 3 chỉ mục)
- [x] Khoá bí mật bản thật: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`
      (chưa đặt `MAIL_*` — form vẫn lưu khách, chỉ không gửi thư)
- [x] Deploy tay lần đầu bằng `pnpm run deploy`
- [x] **Đã nối Cloudflare Workers Build** với repo `dev-gcd/thaco-towner-e` (nhánh `main`) —
      xác nhận 21/09: commit `1c1795d` tự lên bản thật sau khi push. 🔴 **Push `main` = đưa lên
      bản thật ngay** — không push khi chưa được duyệt; khách bấm Lưu trong `/admin` cũng tự lên.
- [ ] Khách cấp mã Google Tag Manager → dán vào `GTM_ID` trong `app/(public)/layout.tsx`
- [ ] Khách cấp tên miền riêng → sửa `metadataBase` cùng tệp
- [ ] Ghi lại ngày hết hạn của `GITHUB_TOKEN` — hết hạn là nút Lưu trong `/admin` báo lỗi
- 🔴 `GITHUB_TOKEN` phải tạo **khi đăng nhập GitHub bằng `dev-gcd`** (chủ repo), fine-grained,
  chỉ chọn repo `thaco-towner-e`, quyền **Contents: Read and write**. 17/09 bản thật báo
  "GitHub 404" khi lưu: mã hợp lệ (mã sai thì là 401) nhưng không có quyền ghi — GitHub trả 404
  thay cho 403 với thao tác ghi. Tài khoản `phatnadev` trên máy chỉ có quyền đọc repo này.

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
- Cloudflare: tài khoản **`dev@gcd.vn`**, account id `93caca5c9d8aa51437c62fefd95ee791` — KHÁC
  tài khoản của truck/van (`ed367bb9…`). Worker `thaco-towner-e`, miền con `yellow-mouse-f324`.
- ⚠️ **Repo nằm ở tài khoản cá nhân `dev-gcd`, không phải tổ chức `Syncore-Tech` như 2 project kia.**
  Ngày chuyển repo về tổ chức thì phải làm lại 3 việc, nếu không CMS của khách sẽ hỏng:
  1. sửa hằng `REPO` trong `worker/index.ts`
  2. **tạo lại PAT GitHub** (PAT cũ gắn với chủ cũ sẽ chết → khách bấm Lưu là lỗi)
  3. nối lại Cloudflare Workers Build với repo mới
- `_docs/` **không** đưa lên repo (đã chặn trong `.gitignore`) — để ảnh gốc, file khách gửi.
