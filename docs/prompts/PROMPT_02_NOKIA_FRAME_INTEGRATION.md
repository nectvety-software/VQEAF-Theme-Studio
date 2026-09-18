# Prompt — Tích hợp VQEAF vào Nokia 225 Frame

Hãy tích hợp VQEAF vào UI Nokia 225 hiện tại mà **không thay logic emulator/key mapping**.

Component chuẩn:
- `phone.shell`
- `phone.screen.frame`
- `phone.networkLed`
- `phone.menuBubble`
- `phone.fpsBadge`
- `keypad.base`
- `keypad.softKey`
- `keypad.dpad`
- `keypad.ok`
- `keypad.number`

Giữ nguyên geometry: frame portrait khoảng 268x600, LCD 240x320, keypad width 234, `fontScale=1`, portrait wrap-height, landscape layout hiện tại.

Yêu cầu:
- VQEAF chỉ thay presentation: gradient, background, border, radius, glow, shadow, text, vector decoration, image texture.
- MENU/FPS dùng component và state riêng, không dùng style keypad.
- Background frame/keypad có layer trên/dưới, clip đúng shape, không che framebuffer.
- Keypad background `per-key-texture` phải giữ text/border rõ.
- Đổi theme runtime không restart emulator core hay reset game.
- Parse/compile background thread; publish compiled theme qua StateFlow.
- Theme lỗi phải fallback, không crash.
- Test portrait/landscape, * 0 # không bị cắt, key down/up/repeat không thay đổi.
