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
| 7 | `themes/` phải luôn đủ **64** file (repo có auto-commit từng xoá nhầm). |

---

## 4. Tính năng — V3.7.11

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
- Layer Stack: Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED,
  `menuButton` / `fpsBadge`.

### Khác
- Panel phải hiển thị **ID component `.vqeaf`** khi chọn thành phần
  (`phoneShell`, `keyStyle_ok`, `menuButton`, `decoration_…`).
- Nút **📷 Chụp khung** trên topbar → xuất preview khung Nokia ra PNG.
- Ảnh raster tối ưu rồi nhúng Data URI vào chính file `.vqeaf`.

---

## 5. Non-goals

- Không build engine render Android trong repo này — chỉ có prompt/spec
  (`docs/prompts/PROMPT_01`, `PROMPT_02`).
- Không convert `.vqeaf` sang XML/JSON trung gian.
- Không phụ thuộc mạng/CDN lúc chạy.
- Không parse theme trong `onDraw`/mỗi frame (ràng buộc cho phía engine).

---

## 6. Acceptance checks

```bash
node tools/check_frame_update.mjs     # gate tĩnh: version + tính năng phải còn
node tools/verify_photo_themes.mjs    # parse bằng parseVqeaf THẬT + round-trip
node tools/verify_key_shape_ui.mjs    # UI thật, Chrome headless (~47 assert)
```

Hai tool UI cần server tĩnh ở `http://127.0.0.1:8099/`. Chi tiết + mẹo ở `SKILLS.md`
§ Verify.

---

## 7. Tên sản phẩm & phiên bản

**VQEAF Theme Studio** — phiên bản hiện tại **V3.7.11**.

Cache-buster `?v=3.7.11` đặt ở `index.html` và 2 dòng import đầu `src/app.js`.
Sửa `src/app.js` hoặc `src/presets.js` thì **phải bump** (xem `SKILLS.md`).
