# PROMPT.md — VQEAF Theme Studio (web / HTML-CSS-JS)

Product prompt và yêu cầu dùng để thiết kế & triển khai webapp này.
Giữ file này là **nguồn sự thật về scope** — đổi sản phẩm thì cập nhật ở đây.
Đọc kèm `SKILLS.md` (kỹ thuật tái sử dụng + bẫy) trước khi sửa code.

---

## 1. Sản phẩm

Webapp **tĩnh, thuần HTML/CSS/JS** — không framework, không build step, không
dependency lớn — để thiết kế theme `.vqeaf` cho frame điện thoại phím bấm
**Classic 240×320 / VXPQeaf** (Nokia 225).

`.vqeaf` là **nguồn dữ liệu duy nhất**. Engine Android/Kotlin đọc trực tiếp file
này và render native — **không WebView, không convert runtime sang XML/JSON**.

Chạy: nhấp đúp `rub.bat` (tự tìm cổng trống 8080–8099, tự mở trình duyệt, `Ctrl+C`
để dừng). `run.bat` là alias. Không có Python thì launcher tự dùng `server.ps1`.

---

## 2. Yêu cầu gốc (user)

> Tạo webapp thiết kế theme `.vqeaf` cho frame Classic 240×320, export ra file
> `.vqeaf` để engine Android đọc và render.

Các yêu cầu nối tiếp:

> tạo các mẫu có background vào nút nhấn như hình, lưu ý vẫn giữ frame cũ

→ Ảnh đi vào **từng phím** (`per-key-texture`), `phoneShell` giữ nguyên.

> nâng cấp hình dạng nút như hình

> menu bên phải thêm tùy chỉnh hình dạng nút

→ Nhóm **Hình dạng nút** nằm ở **panel phải**.

> thêm nhiều hình dạng nút như hình thoi, tròn, vuông vân vân

→ Thư viện **10 kiểu dáng**.

> không dùng emoji mà vẽ bằng `D:\desktop-webapps\VPEPixel`

→ **Mọi** icon (trang trí phím, ký hiệu keypad, biểu tượng toolbar/panel) là
pixel art **12×12** vẽ trong VPEPixel rồi nhúng vào studio; không còn emoji/glyph.

---

## 3. Ràng buộc cứng

| # | Ràng buộc |
|---|-----------|
| 1 | Source thuần HTML/CSS/JS. Không thêm bundler/framework/dependency lớn. |
| 2 | `.vqeaf` là nguồn dữ liệu duy nhất; import round-trip lossless tối đa. |
| 3 | Mọi thao tác editor phải vào Undo/Redo (100 bước) + Autosave. |
| 4 | **Tương thích ngược**: theme cũ không có field mới phải render y như trước. |
| 5 | Không phá: frame background, keypad background, MENU/FPS style riêng, layer stack, random theme, `rub.bat`. |
| 6 | 19 phím phải round-trip export → new → import đủ. |
| 7 | `themes/` phải luôn đủ **66** file (repo có auto-commit từng xoá nhầm). |
| 8 | **Chữ trắng trên nút phải đạt WCAG AA** (≥ 4.5:1) — `KEYCAP_MAX_LUM` lo việc này. |
| 9 | **Không dùng emoji/glyph làm icon.** Icon là pixel art sinh từ `.vpe` của VPEPixel — sửa icon thì sửa trong VPEPixel rồi chạy lại 2 lệnh, **không sửa tay** `src/icons.js`. |
| 10 | **Không để mất dữ liệu theme.** Mọi tool ghi lại `themes/*.vqeaf` phải **giữ nguyên** những gì nó không hiểu (đặc biệt `decoration` trong `keyStyle_*`) + có self-check fail cứng nếu số lượng giảm. |

---

## 4. Tính năng — V3.7.13

### Icon pixel art thay emoji (V3.7.13)

Yêu cầu gốc: *"không dùng emoji mà vẽ bằng `D:\desktop-webapps\VPEPixel`"* — áp
cho **cả 3 nhóm**: trang trí phím · ký hiệu keypad điện thoại · UI studio.

- **46 icon 12×12**, nguồn sự thật là `.vpe` (VPE565) do
  `D:\desktop-webapps\VPEPixel\tools\make_vqeaf_studio_icons.py` sinh ra.
  Quy trình: `python tools/make_vqeaf_studio_icons.py` → `node tools/import_vpe_icons.mjs`.
- `src/icons.js` **auto-generated**, nhúng data-URI PNG (chạy được cả qua `file://`).
- Ba chế độ render: `img.icon` (đủ màu) · `.icon-glyph` (`mask-image` +
  `currentColor`) · `.icon-tinted` (`mask-image` + màu chỉ định).
- Trang trí phím **tô phẳng theo `tint`** (SRC_IN) → control **Màu** mới có tác dụng.
- Export `.vqeaf` phát `<resource type="image">` + data-URI **của chính bộ icon**
  (bỏ `vectorFor()` 13 path SVG viết tay) → preview và export **không còn lệch**.
- Export PNG: `await preloadIcons()` trước khi vẽ (nếu không, `drawImage` bỏ qua
  icon chưa nạp và ảnh ra thiếu hình).

### Vật liệu nút — "keycap bóng" (V3.7.12)

Yêu cầu gốc: *"các nút như hình"* (mockup Spooky Vibes) → nút là **nhựa tối
bóng**, **không viền ngoài**, **chữ trắng**, **bevel mềm**, ảnh texture hiện
**mờ** bên trong. Áp cho **toàn bộ 66 theme**.

- Màu nút **suy ra từ palette từng theme** (`keycapPalette()`), KHÔNG hardcode
  tím mận — nếu hardcode thì 66 theme mất bản sắc. Mockup cũng vậy: keycap dùng
  chính vật liệu tối của khung.
- Thân nút bị kéo tối về `KEYCAP_MAX_LUM = 0.14` để **chữ trắng luôn đọc được**
  (66/66 theme đạt WCAG AA, thấp nhất 5.53:1).
- 52 theme chỉ có `palette` → ăn keycap qua `styles.css` `.key` + biến `--cap*`.
  14 theme còn `keyStyle_*` → sinh lại 266 khối bằng `gen_keycap_themes.mjs`.
- Studio có 2 nút áp nhanh: *Vật liệu keycap (theo theme)* / *Keycap cho phím này*.
- Export PNG dùng **cùng** `keycapPalette()` nên không lệch với bản xem trước.

### Theme & file
- Đặt tên theme + tự sinh ID; random theme / random name.
- Autosave IndexedDB (fallback localStorage).
- Undo/Redo 100 bước (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`).
- Import/export một file `.vqeaf`.

### Preset — 64 mẫu (đã gộp trùng)
- Nhóm Việt: **Tết**, **Trung Thu**, **Hà Nội Night**.
- **Comic Bang / Classic Sheet** — ảnh phủ **cả frame**.
- **Spooky Vibes / Pika Arcade / Pika Honey** — ảnh đi vào **từng phím**, giữ frame cũ.

### Background
- Import ảnh riêng cho **keypad** và **phoneShell frame** (clip theo bo góc).
- Chế độ **Trên phím → Texture từng phím** (`per-key-texture`), giữ số/nhãn/viền rõ.
- Chỉnh opacity, blend, brightness, contrast, saturation, blur, scale, offset,
  rotate/flip, layer order.

### Nút — V3.7.10 / V3.7.11
- `keyStyle_*` cho từng phím; state normal / pressed / disabled.
- **Nhóm "Hình dạng nút" ở panel phải** khi chọn một phím:
  `Kiểu dáng` · `Bo góc` · `Viền nổi` · `Màu viền nổi` · `Độ mềm viền nổi`
  + 3 nút áp nhanh: *cả bàn phím* / *nhóm điều hướng* / *nhóm số*.
- **10 kiểu dáng**: `capsule`, `pill`, `square`, `circle`, `rhombus` (hình thoi),
  `hexagon`, `octagon`, `triangle`, `parallelogram`, `star`.
- Gradient 2–3 màu, border, shadow, glow, glossy highlight, text
  color/outline/size/weight, decoration trái/phải, rotation/flip.
- Cùng bộ control cũng có trong tab **Tạo nút** (panel trái) — dùng chung helper
  `keyShapeFields()` nên hai chỗ không lệch nhau.

### Trang trí & layer
- Decoration kéo thả: xóa, xoay, lật ngang/dọc, floating animation.
- **13 loại trang trí**, mỗi loại là pixel art: `leaf` `flower` `cloud` `star`
  `gem` `sparkle` `chest` `slime` `pumpkin` `bat` `web` `ghost` `badge`.
- Layer Stack: Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED,
  `menuButton` / `fpsBadge`.

### Khác
- Panel phải hiển thị **ID component `.vqeaf`** khi chọn thành phần
  (`phoneShell`, `keyStyle_ok`, `menuButton`, `decoration_…`).
- Nút **Chụp khung** trên topbar (icon `camera`) → xuất preview khung Nokia ra PNG.
- Ảnh raster tối ưu rồi nhúng Data URI vào chính file `.vqeaf`.

---

## 5. Non-goals

- Không build engine render Android trong repo này — chỉ có prompt/spec
  (`docs/prompts/PROMPT_01`, `PROMPT_02`).
- Không convert `.vqeaf` sang XML/JSON trung gian.
- Không phụ thuộc mạng/CDN lúc chạy.
- Không parse theme trong `onDraw`/mỗi frame (ràng buộc cho phía engine).
- Không tự vẽ icon bằng code JS/Canvas — icon phải đến từ `.vpe` của VPEPixel.

---

## 6. Acceptance checks

```bash
node tools/check_frame_update.mjs     # gate tĩnh: version + tính năng phải còn
node tools/verify_pixel_icons.mjs     # 39 check: hết emoji + icon pixel art + export
node tools/verify_photo_themes.mjs    # parse bằng parseVqeaf THẬT + round-trip
node tools/verify_keycap_style.mjs    # 44 check: keycap + WCAG cho 66 theme
node tools/verify_key_shape_ui.mjs    # UI thật, Chrome headless (~47 assert)
node tools/verify_pixel_icons_ui.mjs  # 27 check: icon trong Chrome thật + PNG export
```

Ba tool UI cần server tĩnh ở `http://127.0.0.1:8099/`. Chi tiết + mẹo ở `SKILLS.md`
§ Verify và § Môi trường máy (Chrome phải là bản thật, **không** dùng
`ms-playwright/chromium-901522` — Chrome 93 thiếu `structuredClone`).

---

## 7. Tên sản phẩm & phiên bản

**VQEAF Theme Studio** — phiên bản hiện tại **V3.7.13**.

Cache-buster `?v=3.7.13` đặt ở `index.html` (stylesheet + script) và **3 dòng
import đầu** `src/app.js`. Sửa `src/app.js` hoặc `src/presets.js` thì **phải bump**
(xem `SKILLS.md`). Sửa icon thì bump **và** chạy lại pipeline VPEPixel.
