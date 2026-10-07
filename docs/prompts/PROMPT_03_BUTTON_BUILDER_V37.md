# Prompt — Hoàn thiện Button Builder V3.7

Tiếp tục hoàn thiện **VQEAF Theme Studio V3.7**, tập trung vào Button Builder.

Yêu cầu:
- Mỗi phím có style riêng trong `state.buttonStyles`: menu, up/down/left/right/ok, 0-9, *, #, softkey.
- Chỉnh shape, width/height, radius, gradient 2-3 màu, border, shadow, inner shadow, glow, glossy highlight, text color/outline/size/weight, decoration trái/phải, rotation/flip decoration.
- **Hình dạng nút (V3.7.10 / V3.7.11)** — nhóm "Hình dạng nút" ở **panel phải** khi chọn một phím,
  và cùng bộ control trong tab Tạo nút:
  - 5 control: `Kiểu dáng` · `Bo góc` · `Viền nổi` · `Màu viền nổi` · `Độ mềm viền nổi`
    → `shape.type`, `shape.radius`, `bevel.size`, `bevel.color`, `bevel.blur`.
  - 3 nút áp nhanh: cả bàn phím / nhóm điều hướng / nhóm số.
  - **10 kiểu dáng**: `capsule`, `pill`, `square`, `circle`, `rhombus` (hình thoi),
    `hexagon`, `octagon`, `triangle`, `parallelogram`, `star`.
  - 6 kiểu cuối là **đa giác** → cắt bằng `clip-path: polygon(...)`; shadow ngoài
    phải dùng `filter: drop-shadow()` vì `box-shadow` bị `clip-path` cắt mất.
  - Bảng khai báo duy nhất `KEY_SHAPE_DEFS` trong `src/app.js` — thêm kiểu mới = thêm 1 dòng.
- State: normal, pressed, disabled; pressed có scale/fill/glow/shadow riêng; disabled có opacity/saturation/text/border riêng.
- Có duplicate/copy/paste/reset; apply cho current/navigation/digits/all.
- Preview realtime: single key, D-pad, number row, full keypad.
- Preset: Candy, Fantasy, Pixel, Arcade, Cloud, Sakura, Slime, Treasure, Gem, RPG, Classic Soft/Pearl/Warm/Slate, Pop Red/Blue/Yellow/Purple, Comic Orange/Cream, Tết Red/Gold, Peach Blossom, Mai Yellow, Moon Gold, Lantern Red, Hanoi Steel/Lamp/Night.
- Layer key: base -> gradient -> texture -> innerShadow -> gloss -> decoration -> border -> glow -> text/icon.
- Export/import `.vqeaf` phải khôi phục 100% `keyStyle_*` (kể cả `shape.type` + `bevel`).
- Undo/Redo/Autosave cho mọi thao tác.
- Không phá frame background, keypad background, MENU/FPS style riêng, layer stack, random theme, `rub.bat`.
- Test đủ 19 phím qua round-trip export -> new -> import.
- Chọn phím **phải** scope `#keypad .key[data-key=...]` — nút preview của Button Builder
  cũng mang `data-key` và đứng trước `#keypad` trong DOM (xem `SKILLS.md`).
