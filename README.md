# VQEAF Theme Studio V3.2

Webapp nhẹ để thiết kế theme `.vqeaf` cho frame Nokia 225 / VXPQeaf.

Lightweight web app for designing `.vqeaf` themes for the Nokia 225 / VXPQeaf frame.

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
- **52 preset dựng sẵn**: Nokia Dark, Halloween, Cyber Neon, Sakura, Ice Glass, AMOLED Red, Retro S40, Ocean, Emerald, Galaxy, Sunset, Luxury Gold, Carbon, Matrix, Vaporwave, Synthwave, Game Boy, Nokia Blue, Aurora, Magma, Mint, Steel, Royal Purple và nhiều mẫu khác.
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
├── README.md
├── src/
│   ├── app.js
│   ├── presets.js
│   └── vqeaf.js
├── assets/
│   └── nokia225-reference.png
└── docs/
    └── Nokia225_Keypad_Shell.md
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

## Sở hữu & Liên hệ

Dự án thuộc sở hữu bởi [https://qeafivels.com/](https://qeafivels.com/).

- Website: https://qeafivels.com/
- Email: dohop96@gmail.com

---

## English

### Quick start on Windows

No build required. The easiest way is to **double-click `rub.bat`**. The launcher will:

- switch to the correct project directory;
- find a free port from `8080` to `8099`;
- prefer `py -3`, `python`, or `python3`;
- fall back to the bundled `server.ps1` if Python is not installed;
- automatically open the browser at the local server address;
- stop the server with `Ctrl+C`.

An extra `run.bat` is provided as an alias for `rub.bat` if you prefer a more common launcher name.

Manual run is also supported:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080/`.

### Features

- Set theme name + auto-generate ID.
- Random theme / random name.
- Autosave with IndexedDB, localStorage fallback.
- 100-step Undo/Redo (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`).
- Nokia 225 portrait/landscape preview with zoom.
- **52 built-in presets**: Nokia Dark, Halloween, Cyber Neon, Sakura, Ice Glass, AMOLED Red, Retro S40, Ocean, Emerald, Galaxy, Sunset, Luxury Gold, Carbon, Matrix, Vaporwave, Synthwave, Game Boy, Nokia Blue, Aurora, Magma, Mint, Steel, Royal Purple, and more.
- Single-file `.vqeaf` import/export.
- Separate background import for the keypad.
- **On-key → Per-key texture** mode keeps numbers/labels/borders sharp instead of covering the whole keypad with an image.
- Adjust opacity, blend, brightness, contrast, saturation, blur, scale, and offset.
- Separate background import for **PhoneShellFrame**, clipped to rounded corners and controlled via Layer Stack.
- Keypad/frame backgrounds support rotate left/right, flip horizontal/vertical, and transform reset.
- Drag-and-drop decorations with delete, rotate, flip horizontal/vertical, layer reorder, and floating animation.
- Layer Stack for Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED, Menu/FPS.
- Whole-frame floating effect plus per-decoration floating.
- Raster images are optimized and then embedded as Data URIs directly in the `.vqeaf` file.

### Structure

```text
VQEAF-Theme-Studio/
├── index.html
├── rub.bat              # Windows launcher
├── run.bat              # alias for rub.bat
├── server.ps1           # fallback server when Python is unavailable
├── styles.css
├── README.md
├── src/
│   ├── app.js
│   ├── presets.js
│   └── vqeaf.js
├── assets/
│   └── nokia225-reference.png
└── docs/
    └── Nokia225_Keypad_Shell.md
```

### VQEAF extensions used in V3

The Studio exports these additional settings:

- `frame_background` image resource
- `keypad_background` image resource
- `phoneShell.background { ... }`
- `keypad.background.renderMode = "per-key-texture"`
- `brightness`, `contrast`, `saturation`, `readabilityAssist`
- `rotation`, `scaleX`, `scaleY` for backgrounds and decorations
- `layerOrder` including `frameBackground`

The Android VQEAF Engine needs a matching renderer for Data URI image resources and these transforms.

### Ownership & Contact

This project is owned by [https://qeafivels.com/](https://qeafivels.com/).

- Website: https://qeafivels.com/
- Email: dohop96@gmail.com
