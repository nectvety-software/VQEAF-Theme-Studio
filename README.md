# VQEAF Theme Studio V3

Webapp nhẹ để thiết kế theme `.vqeaf` cho frame Nokia 225 / VXPQeaf.

## Chạy

Không cần build. Có thể mở `index.html` trực tiếp, hoặc nên chạy local server:

```bash
python -m http.server 8080
```

Sau đó mở `http://localhost:8080/VQEAF-Theme-Studio/` nếu server chạy ở thư mục cha, hoặc `http://localhost:8080/` nếu chạy trong thư mục dự án.

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
