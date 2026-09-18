# Prompt — Tiếp tục VQEAF Theme Studio

Hãy tiếp tục phát triển VQEAF Theme Studio như một editor visual portable cho theme `.vqeaf`.

Ưu tiên:
1. Giữ source thuần HTML/CSS/JS, không dependency lớn.
2. Mọi editor action phải vào Undo/Redo + Autosave.
3. Frame background và keypad background hỗ trợ import image, opacity, blend, brightness, contrast, saturation, blur, scale, offset, rotation, flip và layer order.
4. Decoration kéo thả có delete/rotate/flip/layer/floating.
5. MENU và FPS có style riêng hoàn toàn.
6. Button Builder hỗ trợ style từng phím + preset candy/fantasy/pixel.
7. Theme preset có thể tiếp tục mở rộng Matrix/Pixel/Arcade/Cyber/Fantasy.
8. Export `.vqeaf` là nguồn dữ liệu duy nhất; import phải round-trip lossless tối đa.
9. `rub.bat` phải tiếp tục chạy server portable trên Windows.
10. Sau mỗi thay đổi: syntax check JS, smoke-test webapp, export/import round-trip.
