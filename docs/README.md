# VQEAF Theme Studio V3.7.1

Webapp nhẹ để thiết kế theme `.vqeaf` cho frame Nokia 225 / VXPQeaf.

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
- Preview Nokia 225 dọc/ngang và zoom.
- **61 preset dựng sẵn**: Nokia Dark, Halloween, Cyber Neon, Sakura, Ice Glass, AMOLED Red, Retro S40, Ocean, Emerald, Galaxy, Sunset, Luxury Gold, Carbon, Matrix, Vaporwave, Synthwave, Game Boy, Nokia Blue, Aurora, Magma, Mint, Steel, Royal Purple, Candy Adventure, Split Gaze, Pixel Midnight, Pixel Dungeon, Pixel Tide, Pixel Blossom, Pop Thunder, Pop Bubble, Candy Cloud Full và nhiều mẫu khác.
- Import/export `.vqeaf` một file.
- Import background riêng cho keypad.
- Chế độ **Trên phím → Texture từng phím**, giữ số/nhãn/viền rõ nét thay vì phủ nguyên ảnh lên bàn phím.
- Chỉnh opacity, blend, brightness, contrast, saturation, blur, scale, offset.
- Import background riêng cho **PhoneShellFrame**, clip theo bo góc và điều khiển bằng Layer Stack.
- Background keypad/frame có xoay trái/phải, lật ngang/dọc và reset transform.
- Decoration kéo thả có xóa, xoay, lật ngang/dọc, đổi layer và floating animation.
- Layer Stack cho Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED, Menu/FPS.
- Hiệu ứng nổi toàn frame và nổi riêng từng decoration.
- Ảnh raster được tối ưu rồi nhúng Data URI vào chính file `.vqeaf`.

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
├── assets/
│   └── nokia225-reference.png
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

- `frame_background` image resource
- `keypad_background` image resource
- `phoneShell.background { ... }`
- `keypad.background.renderMode = "per-key-texture"`
- `brightness`, `contrast`, `saturation`, `readabilityAssist`
- `rotation`, `scaleX`, `scaleY` cho background và decoration
- `layerOrder` gồm `frameBackground`

Android VQEAF Engine cần renderer tương ứng cho image resource Data URI và các transform này.

## Menu & FPS custom style (V3.4)

Chọn trực tiếp **MENU** hoặc **FPS** trên preview để mở inspector riêng. Có thể chọn Solid / Glass / Outline / Neon / Pixel và tinh chỉnh màu, viền, glow, font, opacity, padding, LED indicator. Các thông số được lưu trong `.vqeaf`.


## V3.5 — MENU/FPS isolated style fix

MENU Bubble và FPS Badge dùng style độc lập; chỉnh màu, border, glow, bo góc hoặc typography không còn làm đổi keypad. Bản này cũng thêm cache-busting để trình duyệt luôn tải đúng JavaScript mới sau khi nâng phiên bản.


## V3.7 — Button Builder

Tab **Tạo nút** cho phép dựng keycap kiểu glossy/candy/fantasy tương tự UI game mobile: gradient nhiều lớp, gloss highlight, shadow/glow, outline chữ và decoration ở hai mép. Có thể áp cho một phím hoặc hàng loạt nhóm điều hướng / bàn phím số / toàn bộ keypad. Style riêng được lưu trực tiếp trong `.vqeaf` bằng các component `keyStyle_*`.

## V3.6 — Tên theme tự động 8 số + style

Tên theme có thể được tạo tự động theo dạng:

```text
58310427 Matrix Rain
94627130 Pixel Arcade
73140528 Halloween
```

- Mỗi mã gồm đúng **8 chữ số không lặp trong cùng mã**.
- Studio ghi nhớ các mã đã sinh trong trình duyệt để hạn chế trùng lại.
- Chọn preset sẽ sinh mã mới nhưng giữ đúng tên style/preset.
- Nút **🎲 Tên** chỉ đổi mã và giữ phần tên style hiện tại.
- Nút **🎲 Ngẫu nhiên** sinh cả style lẫn mã mới.

## Credits

Maintained by **DOXUANHOP**.

Website: https://qeafivels.com/
