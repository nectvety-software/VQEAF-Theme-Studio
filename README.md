# VQEAF Theme Studio V3

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
