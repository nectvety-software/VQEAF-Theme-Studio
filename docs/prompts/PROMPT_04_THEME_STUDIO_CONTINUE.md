# Prompt — Tiếp tục VQEAF Theme Studio

Hãy tiếp tục phát triển VQEAF Theme Studio như một editor visual portable cho theme `.vqeaf`.

Đọc `PROMPT.md` (scope) và `SKILLS.md` (kỹ thuật + bẫy) ở gốc repo trước khi sửa code.

Ưu tiên:
1. Giữ source thuần HTML/CSS/JS, không dependency lớn.
2. Mọi editor action phải vào Undo/Redo + Autosave.
3. Frame background và keypad background hỗ trợ import image, opacity, blend, brightness, contrast, saturation, blur, scale, offset, rotation, flip và layer order.
4. Decoration kéo thả có delete/rotate/flip/layer/floating.
5. MENU và FPS có style riêng hoàn toàn.
6. Button Builder hỗ trợ style từng phím + preset candy/fantasy/pixel.
7. **Hình dạng nút**: nhóm "Hình dạng nút" ở panel phải + 10 kiểu dáng
   (`capsule`, `pill`, `square`, `circle`, `rhombus`, `hexagon`, `octagon`,
   `triangle`, `parallelogram`, `star`). Thêm kiểu mới = thêm 1 dòng vào
   `KEY_SHAPE_DEFS`. Đa giác dùng `clip-path` + `filter: drop-shadow()`.
8. Theme preset có thể tiếp tục mở rộng Matrix/Pixel/Arcade/Cyber/Fantasy.
9. Export `.vqeaf` là nguồn dữ liệu duy nhất; import phải round-trip lossless tối đa.
10. `rub.bat` phải tiếp tục chạy server portable trên Windows.
11. Sau mỗi thay đổi: syntax check JS, smoke-test webapp, export/import round-trip,
    và chạy đủ 3 tool verify trong `SKILLS.md` § Verify.
12. `themes/` phải luôn đủ **64** file (repo có auto-commit từng xoá nhầm).
