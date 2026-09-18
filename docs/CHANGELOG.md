# Changelog

## V3.7.2 — Trademark-safe naming + Credits

- Đổi tên preset sang generic cả tên hiển thị lẫn ID: Nokia Dark → Classic Dark (`classic_dark`), Nokia Blue → Classic Blue (`classic_blue`), Retro S40 → Retro Bar (`retro_bar`), TRON Blue → Volt Blue (`volt_blue`), Game Boy → Dot Matrix (`dot_matrix`); file `themes/` tương ứng được xuất lại tên mới.
- Chuỗi UI dùng tên generic: Classic 240×320, vỏ máy classic, CLASSIC DUAL SIM.
- Thêm Credits (DOXUANHOP, qeafivels.com) và Trademark Notice vào README + giao diện Studio.
- Metadata `.vqeaf` xuất ra ghi `author: DOXUANHOP` + `website: https://qeafivels.com/`.

## V3.7.1 — Documentation Pack

- Gom toàn bộ file Markdown vào `docs/`.
- Thêm `docs/prompts/` chứa prompt cho Android Engine, Nokia Frame Integration, Button Builder và tiếp tục phát triển Theme Studio.
- Thêm `docs/VQEAF_1_0_SPEC.md` làm đặc tả tóm tắt VQEAF 1.0.
- Cập nhật README lên V3.7.1.

## V3.7

- Thêm **Button Builder / Tạo nút** trực quan cho keypad Nokia.
- Bổ sung **12 preset nút glossy/cute/fantasy**: Candy Green, Candy Pink, Cloud Blue, Magic Purple, Star Orange, Aqua Slime, Treasure Gold, Pixel Cute, Sakura Gloss, RPG Gem, Arcade Red, Ice Glass.
- Có thể áp style cho **một phím, nhóm điều hướng, nhóm số hoặc toàn bộ keypad**.
- Cho phép chỉnh gradient 3 màu, màu nhấn, viền, glow, shadow, gloss, chữ/outline, bo góc và decoration hai bên.
- Hỗ trợ decoration mini: lá, hoa, mây, sao, gem, sparkle.
- Có preview **Bình thường / Nhấn / Tắt (Disabled)** ngay trong Button Builder.
- Mỗi phím có thể giữ style riêng; nền keypad texture vẫn render bên trong key và không che chữ.
- Export `.vqeaf` tạo component `keyStyle_*` riêng cho các phím đã tùy chỉnh; import phục hồi lại đầy đủ style nút.
- Undo/Redo và Autosave bao phủ các thay đổi Button Builder.

## V3.6

- Thêm cơ chế **tự đặt tên theme theo `8 số ngẫu nhiên không lặp + tên style`**.
- Ví dụ: `58310427 Matrix Rain`, `94627130 Pixel Arcade`, `73140528 Halloween`.
- 8 chữ số trong cùng một mã luôn khác nhau; chữ số đầu không phải `0` để luôn hiển thị đủ 8 chữ số.
- Lưu lịch sử tối đa 10.000 mã đã sinh trong `localStorage` để hạn chế sinh lại cùng mã ở các lần dùng sau.
- Khi chọn Preset: tự sinh mã mới + đúng tên preset/style.
- Khi bấm `🎲 Ngẫu nhiên`: sinh cả style ngẫu nhiên và mã 8 số mới.
- Khi bấm `🎲 Tên`: giữ tên style hiện tại và chỉ đổi sang mã 8 số mới.
- Khi bấm `Mới`: tự tạo tên dạng `######## Custom`.
- Theme ID và tên file `.vqeaf` tự đồng bộ theo tên mới khi Auto ID đang bật.

## V3.5

- Sửa lỗi chỉnh **MENU/FPS** nhưng màu/style lại áp xuống các phím bên dưới.
- Tách inspector MENU và FPS khỏi `theme.key`/palette dùng chung của keypad; thay đổi badge giờ chỉ sửa `menuStyle` hoặc `fpsStyle`.
- Khi chọn MENU/FPS, panel không còn hiển thị nhóm Style chung dễ gây chỉnh nhầm keypad.
- Thêm cache-busting cho JavaScript modules và meta no-cache để tránh trình duyệt chạy lại mã V3.3/V3.4 cũ sau khi giải nén bản mới.
- Thêm ghi chú trong inspector: style badge là độc lập với bàn phím/Phone Shell.

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
