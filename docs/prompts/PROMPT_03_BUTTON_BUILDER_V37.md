# Prompt — Hoàn thiện Button Builder V3.7

Tiếp tục hoàn thiện **VQEAF Theme Studio V3.7**, tập trung vào Button Builder.

Yêu cầu:
- Mỗi phím có style riêng trong `state.buttonStyles`: menu, up/down/left/right/ok, 0-9, *, #, softkey.
- Chỉnh shape, width/height, radius, gradient 2-3 màu, border, shadow, inner shadow, glow, glossy highlight, text color/outline/size/weight, decoration trái/phải, rotation/flip decoration.
- State: normal, pressed, disabled; pressed có scale/fill/glow/shadow riêng; disabled có opacity/saturation/text/border riêng.
- Có duplicate/copy/paste/reset; apply cho current/navigation/digits/all.
- Preview realtime: single key, D-pad, number row, full keypad.
- Preset: Candy, Fantasy, Pixel, Arcade, Cloud, Sakura, Slime, Treasure, Gem, RPG.
- Layer key: base -> gradient -> texture -> innerShadow -> gloss -> decoration -> border -> glow -> text/icon.
- Export/import `.vqeaf` phải khôi phục 100% `keyStyle_*`.
- Undo/Redo/Autosave cho mọi thao tác.
- Không phá frame background, keypad background, MENU/FPS style riêng, layer stack, random theme, `rub.bat`.
- Test đủ 19 phím qua round-trip export -> new -> import.
