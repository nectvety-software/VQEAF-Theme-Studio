# VQEAF Theme Studio V3.7.8

Webapp nhẹ để thiết kế theme `.vqeaf` cho frame Classic 240×320 / VXPQeaf.

## Chạy nhanh trên Windows

Không cần build. Cách dễ nhất là **nhấp đúp `rub.bat`**. Launcher sẽ:

- tự chuyển vào đúng thư mục dự án;
- tự tìm cổng trống từ `8080` đến `8099`;
- ưu tiên `py -3`, `python` hoặc `python3`;
- nếu máy không có Python, tự dùng `server.ps1` đi kèm;
- tự mở trình duyệt tại địa chỉ local server;
- dừng server bằng `Ctrl+C`.

Có thêm `run.bat` làm alias cho `rub.bat` nếu muốn dùng tên launcher thông dụng hơn.

Chạy thủ công vẫn được:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Sau đó mở `http://127.0.0.1:8080/`.

## Tính năng

- Đặt tên theme + tự sinh ID.
- Random theme / random name.
- Autosave bằng IndexedDB, fallback localStorage.
- Undo/Redo 100 bước (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`).
- Preview Classic 240×320 dọc/ngang và zoom — khớp frame VXPQeaf / sheet Nokia classic.
- **61 preset** (đã gộp trùng), trong đó có nhóm Việt:
  - **Tết** — đỏ đào + vàng mai (thay Lunar New Year)
  - **Trung Thu** — trăng rằm + đèn ông sao
  - **Hà Nội Night** — phố đêm + đèn vàng
  - **Comic Bang** / **Classic Sheet** — dùng ảnh làm background + bộ nút pop/classic
- Import/export `.vqeaf` một file.
- Import background riêng cho **keypad** và **PhoneShellFrame** (clip theo bo góc, Layer Stack).
- Chế độ **Trên phím → Texture từng phím** (`per-key-texture`), giữ số/nhãn/viền rõ nét.
- Chỉnh opacity, blend, brightness, contrast, saturation, blur, scale, offset, rotate/flip.
- Decoration kéo thả có xóa, xoay, lật ngang/dọc và floating animation.
- Layer Stack: Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED, `menuButton / fpsBadge`.
- **Button Builder (Tạo nút)**: keycap glossy/candy/fantasy + 20+ preset nút (candy, pop, classic, Tết, Trung Thu, Hà Nội…).
- Panel phải hiển thị **ID component `.vqeaf`** khi chọn thành phần (`phoneShell`, `keyStyle_ok`, `menuButton`, `decoration_…`).
- Nút **📷 Chụp khung** trên topbar: xuất preview khung Nokia ra PNG.
- Ảnh raster được tối ưu rồi nhúng Data URI vào chính file `.vqeaf`.

## Khung preview (khớp VXPQeaf)

| Vùng | Ghi chú |
|------|---------|
| Badge dock | MENU (trái) / Shot (phải) — component `menuButton` / `fpsBadge` |
| Network LED + FPS strip | Bên trong khung, dưới đỉnh máy |
| LCD | 240×320 portrait / 320×240 landscape; idle UI + softkey `Menu` / `Contacts` |
| Keypad | 234px; softkey `—`, D-pad OK, Call/End kiểu ☎; T9 `1∞`, `0 _`, `#⇧` |
| Nhấn phím | scale `0.94` (khớp Compose `pressScale`) |

Geometry chuẩn: portrait ~`268×600`, landscape ~`594×334`, `fontScale=1`.

## Cấu trúc

```text
VQEAF-Theme-Studio/
├── index.html
├── rub.bat              # launcher Windows
├── run.bat              # alias gọi rub.bat
├── server.ps1           # server dự phòng khi không có Python
├── styles.css
├── src/
│   ├── app.js
│   ├── presets.js
│   └── vqeaf.js
├── assets/              # ảnh nền / tham chiếu (comic_bang_bg, classic_sheet_bg, …)
├── themes/              # file .vqeaf mẫu (trùng với preset id)
├── tools/               # script sinh theme / kiểm tra
└── docs/
    ├── README.md
    ├── CHANGELOG.md
    ├── Nokia225_Keypad_Shell.md
    ├── VQEAF_1_0_SPEC.md
    └── prompts/
        ├── PROMPT_01_VQEAF_ANDROID_ENGINE.md
        ├── PROMPT_02_NOKIA_FRAME_INTEGRATION.md
        ├── PROMPT_03_BUTTON_BUILDER_V37.md
        └── PROMPT_04_THEME_STUDIO_CONTINUE.md
```

## VQEAF extensions dùng trong V3

Studio xuất thêm các cấu hình:

- `frame_background` / `keypad_background` image resource (data-uri)
- `phoneShell.background { ... }` (opacity, fit, blend, filter, transform)
- `keypad.background.renderMode = "per-key-texture"`
- `keyStyle_<keyId>` type `button-style` (gradient, gloss, shadow, decoration…)
- `menuButton` / `fpsBadge` type `badge` (appearance solid|glass|outline|neon|pixel)
- `brightness`, `contrast`, `saturation`, `readabilityAssist`
- `rotation`, `scaleX`, `scaleY` cho background và decoration
- `layerOrder` gồm `frameBackground`

Android VQEAF Engine cần renderer tương ứng cho image resource Data URI và các transform này.

## Component IDs

| Thành phần | ID `.vqeaf` |
|------------|-------------|
| Vỏ máy | `phoneShell` |
| LCD | `screen` |
| Bàn phím | `keypad` |
| Phím | `key` + `keyStyle_<id>` (vd `keyStyle_ok`, `keyStyle_star`, `keyStyle_pound`) |
| LED mạng | `networkLed` |
| MENU bubble | `menuButton` |
| Shot badge (góc phải) | `fpsBadge` |
| Decoration | `decoration_<id>` |

19 key ID: `menu`, `up`, `rsk`, `left`, `ok`, `right`, `down`, `1`–`9`, `*`, `0`, `#`  
(`*` → `keyStyle_star`, `#` → `keyStyle_pound`).

## Menu & Shot custom style (V3.4+)

Chọn trực tiếp **MENU** hoặc **Shot** trên preview để mở inspector riêng. Solid / Glass / Outline / Neon / Pixel + màu, viền, glow, font, opacity, padding, LED. Lưu trong `.vqeaf` (`menuButton` / `fpsBadge`).

Từ V3.7.3–3.7.4: FPS nằm dưới dải Network LED trong khung; badge góc phải là **Shot** (vẫn dùng component `fpsBadge`); MENU/Shot không còn chồng nhau.

## Template ảnh nền + nút

- **Comic Bang** (`themes/comic_bang.vqeaf`): ảnh comic làm frame/keypad background + nút pop (viền đen dày).
- **Classic Sheet** (`themes/classic_sheet.vqeaf`): ảnh sheet classic làm background mềm + nút classic pill.
- Regenerate: `tools/gen_image_button_templates.py`.

## Theme Việt (V3.7.7)

| ID | Tên | Bảng màu |
|----|-----|----------|
| `tet` | Tết | Đỏ đào `#8B1217` + vàng mai `#FFD166` |
| `trung_thu` | Trung Thu | Đêm indigo `#1B2A5B` + trăng `#FFD93D` + đèn `#FF6B35` |
| `hanoi_night` | Hà Nội Night | Xanh đêm `#0B1C2E` + đèn phố `#FFC857` + đỏ `#FF4D4D` |

File: `tools/gen_vn_themes.py`. Button presets: Tết Red/Gold, Peach Blossom, Mai Yellow, Moon Gold, Lantern Red, Hanoi Steel/Lamp/Night.

## Chụp khung Nokia (V3.7.8)

Nút **📷 Chụp khung** trên topbar render preview (shell gradient, ảnh nền, LCD, keypad `keyStyle_*`, badge MENU/Shot) ra PNG và tải về `<themeId>-frame.png`. Hỗ trợ portrait/landscape.

## V3.7 — Button Builder

Tab **Tạo nút** cho phép dựng keycap kiểu glossy/candy/fantasy: gradient nhiều lớp, gloss, shadow/glow, outline chữ, decoration hai mép. Áp cho một phím hoặc nhóm điều hướng / số / toàn bộ keypad. Style lưu trong `.vqeaf` bằng `keyStyle_*`.

## V3.6 — Tên theme tự động 8 số + style

```text
58310427 Trung Thu
94627130 Pixel Arcade
73140528 Tết
```

- Mỗi mã gồm đúng **8 chữ số không lặp trong cùng mã**.
- Chọn preset sinh mã mới nhưng giữ tên style/preset.
- **🎲 Tên** chỉ đổi mã; **🎲 Ngẫu nhiên** sinh cả style lẫn mã.

## Credits

Maintained by **DOXUANHOP**.

Website: https://qeafivels.com/

## Trademark Notice

VQEAF Theme Studio không liên kết, chứng thực hay được bảo trợ bởi Nokia, MediaTek, Nintendo, Disney hay bất kỳ chủ sở hữu thương hiệu nào. Tên kiểu máy/định dạng trong tài liệu chỉ dùng để mô tả tính tương thích. Không dùng logo, tên thương hiệu hay tài sản có bản quyền của bên thứ ba làm icon, banner, splash hoặc feature graphic nếu không có quyền.
