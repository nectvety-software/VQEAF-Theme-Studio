# Changelog

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
