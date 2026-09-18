# Changelog

## V3.4

- Nâng cấp giao diện riêng cho **MENU bubble** và **FPS badge** thay vì chỉ dùng chung màu keypad.
- Thêm 5 kiểu badge: **Solid, Glass, Outline, Neon, Pixel**.
- Cho phép chỉnh độc lập màu nền, viền, chữ, LED, glow, bo góc, độ dày viền, shadow, opacity, font, letter spacing, padding và kích thước/glow chấm LED.
- Preset và Random Theme tự tạo style Menu/FPS phù hợp với palette hiện tại.
- Export/import `.vqeaf` lưu và khôi phục đầy đủ component `menuButton` / `fpsBadge`.
- Undo/Redo và Autosave bao phủ toàn bộ thông số mới.

## V3.3

- Tăng thư viện preset theme từ **40 lên 52 mẫu**.
- Bổ sung thêm nhiều phong cách mới theo yêu cầu như: **Matrix Rain, Pixel Classic, Pixel Arcade, Pixel Sunset, CRT Green, Arcade Fire, Arcade Ocean, Hologram Grid, Glitch Neon, Digital Camo, Wireframe Cyan, Comic Pop**.
- Tăng độ đa dạng cho các chủ đề có cảm giác **matrix / pixel / 8-bit / arcade / cyber** để dùng nhanh mà không cần chỉnh tay từ đầu.

## V3.2

- Mở rộng thư viện từ 7 lên **40 preset theme** dựng sẵn.
- Bổ sung nhiều nhóm màu/phong cách: Ocean, Emerald, Galaxy, Sunset, Luxury Gold, Carbon, Matrix, Terminal Amber, Vaporwave, Synthwave, Candy, Lavender, Desert, Forest, Military, Steampunk, TRON, Magenta, Midnight, Pearl, Game Boy, Nokia Blue, Christmas, Lunar New Year, Pastel Sky, Aurora, Magma, Mint, Coffee, Steel, Royal Purple, Coral và Monochrome.
- Giữ nguyên cơ chế preset cũ: chọn preset vẫn cập nhật theme name/theme id và tham gia Undo/Redo + Autosave.

## V3.1

- Thêm `rub.bat` để khởi chạy VQEAF Theme Studio bằng một cú nhấp đúp trên Windows.
- Tự tìm cổng trống 8080–8099 và tự mở trình duyệt.
- Tự phát hiện `py -3`, `python`, `python3`.
- Thêm `server.ps1` làm static-server dự phòng khi máy không có Python.
- Thêm `run.bat` làm alias tiện dụng cho `rub.bat`.

## V3

- Background riêng cho PhoneShellFrame.
- Frame background có opacity, blend, brightness, contrast, saturation, blur, scale, offset, xoay và lật.
- Frame background tham gia Layer Stack để đưa lên/xuống.
- Keypad background ở chế độ “Trên phím” có `per-key-texture`, ảnh bị clip bên trong từng phím để chữ/nhãn/viền vẫn rõ.
- Keypad background có brightness/contrast/saturation/readability assist.
- Background keypad có xoay/lật/reset transform.
- Decoration có nút xoay trái/phải 90°, lật ngang/dọc, xóa và đổi thứ tự.
- Export/import `.vqeaf` giữ frame background, transforms và per-key texture options.
- Autosave, Undo/Redo tiếp tục bao phủ các thao tác mới.
