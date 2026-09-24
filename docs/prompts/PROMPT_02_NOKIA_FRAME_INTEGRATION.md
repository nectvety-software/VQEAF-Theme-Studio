# Prompt — Tích hợp VQEAF vào Classic 240×320 Frame

Hãy tích hợp VQEAF vào UI Classic 240×320 hiện tại mà **không thay logic emulator/key mapping**.

Component chuẩn (đúng ID mà Theme Studio xuất ra trong `.vqeaf`):

- `phoneShell` (container: shape, background, effect, animation `frame_float`)
- `screen` (panel LCD)
- `key` (button base + state `pressed`)
- `keyStyle_<keyId>` (button-style override từng phím; `target` là 1 trong 19 key ID dưới đây)
- `keypad` (container + background `per-key-texture`)
- `networkLed` (view)
- `menuButton` (badge MENU bubble — style độc lập)
- `fpsBadge` (badge **Shot** góc trên phải trong preview/app — style độc lập; **không** phải dải FPS text)
- FPS strip (text `NN FPS`) nằm **bên trong khung** dưới Network LED — chỉ là UI preview/app, **không** map sang component `fpsBadge`
- `decoration_<id>` (image + transform + effect floating + animation `decoration_float_<id>`)
- resource `keypad_background`, `frame_background` (type image, data-uri)
- vector: `pumpkin`, `bat`, `web`, `ghost`, `star`, `badge`, `flower`, `leaf`, `cloud`, `gem`, `sparkle`, `chest`, `slime`
- animation `frame_float`, `decoration_float_<id>`

19 key ID cho `keyStyle_*` / `target`: `menu`, `up`, `rsk`, `left`, `ok`, `right`, `down`, `1`–`9`, `*`, `0`, `#` (riêng `*` → `keyStyle_star`, `#` → `keyStyle_pound`).

Layer order (`studio.layerOrder`): `frameBackground`, `frameFx`, `screen`, `keypad`, `decorations`, `network`, `badges`.

Giữ nguyên geometry: frame portrait khoảng 268x600 (design box), LCD 240x320, keypad width 234, `fontScale=1`, portrait wrap-height, landscape ~594x334.

Preview Theme Studio (V3.7.3+) bám `PortraitPhone` / `NokiaKeypad` / `ShotBadge` trong VXPQeaf:
- Column: Network LED + FPS text → LCD → gap 12 → keypad
- Softkey icon Menu / Back; nhãn T9 `∞ abc def…`
- Shot badge TopEnd (style `fpsBadge`); Menu bubble TopStart
- pressScale 0.94

Yêu cầu:
- VQEAF chỉ thay presentation: gradient, background, border, radius, glow, shadow, text, vector decoration, image texture.
- MENU/FPS dùng component và state riêng, không dùng style keypad.
- Background frame/keypad có layer trên/dưới, clip đúng shape, không che framebuffer.
- Keypad background `per-key-texture` phải giữ text/border rõ.
- Đổi theme runtime không restart emulator core hay reset game.
- Parse/compile background thread; publish compiled theme qua StateFlow.
- Theme lỗi phải fallback, không crash.
- Test portrait/landscape, * 0 # không bị cắt, key down/up/repeat không thay đổi.
