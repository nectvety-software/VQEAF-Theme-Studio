# Tài liệu thiết kế — Bàn phím & Vỏ máy Nokia 225 (VXPQeaf)

> App: **VXPQeaf** (`vn.com.doxuanhop.dxh.oxplay`)  
> Vai trò: giả lập MRE/VXP trên Android, mô phỏng **Nokia 225 Dual SIM** (màn 240×320 + bàn phím T9).  
> Tài liệu này mô tả **khung vỏ máy**, **bàn phím ảo**, **bảng mã phím**, và **luồng sự kiện** từ UI → native core.

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│  VxpEmuScreen (EmulatorScreen.kt)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PhoneShellFrame  (vỏ máy)                        │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ NetworkLed + EmulatorScreenCanvas 240×320   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ NokiaKeypad  (D-pad + T9)                   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│  EmuMenuBubble (nổi) · FpsBadge                         │
└─────────────────────────────────────────────────────────┘
         │ onKeyDown / onKeyUp
         ▼
VxpEmulatorController ──► MreKeys.toLegacy() ──► MreKeypad
         │                                              │
         │  idle shell                                  │  native VXP
         ▼                                              ▼
  MreIdleShellApp                                 MreNativeVxpApp
  (T9, menu, tin nhắn…)                          NativeVxpBridge.nativeKey
                                                        │
                                                        ▼
                                              vxp_runner.cpp map_key()
                                                        │
                                                        ▼
                                              VM_KEY_* + VM_KEY_EVENT_*
                                              → game key_handler
```

### File nguồn chính

| File | Vai trò |
|------|---------|
| `ui/screens/EmulatorScreen.kt` | Vỏ máy `PhoneShellFrame`, `PortraitPhone`, `LandscapePhone`, menu bong bóng, FPS badge, LED mạng |
| `ui/components/NokiaKeypad.kt` | Bàn phím ảo Nokia 225 (D-pad + số) |
| `ui/components/EmulatorScreenCanvas.kt` | Canvas framebuffer 240×320 / 320×240 |
| `engine/MreKeys.kt` | Mã phím **shell** (`0x100+`) + convert từ Android keycode |
| `engine/MreKeypad.kt` | Mã phím **legacy** (1–10, 48–57) + nhãn hiển thị |
| `engine/VxpEmulatorController.kt` | Điều phối key down/up/repeat → app đang chạy |
| `engine/apps/MreIdleShellApp.kt` | Shell màn hình chờ “Nokia 225 Dual SIM” |
| `engine/T9InputEngine.kt` | Soạn tin T9 / multi-tap kiểu Nokia |
| `engine/apps/MreNativeVxpApp.kt` | Gửi key vào native core (VXP thật) |
| `cpp/vxp_runner.cpp` | JNI + `map_key()` → `VM_KEY_*` |
| `mre-include/mre-sdk/vmio.h` | Định nghĩa `VM_KEY_*` / `VM_KEY_EVENT_*` chuẩn MRE |

---

## 2. Vỏ máy Nokia 225 (`PhoneShellFrame`)

### 2.1. Mục đích

Mô phỏng **thân máy feature phone** bên trong màn hình Android:

- Khung bo góc, gradient tối kiểu vỏ nhựa đen-xanh.
- Bên trong: **LED trạng thái mạng** → **màn LCD** (framebuffer VXP / shell chờ) → **bàn phím**.
- Chiều cao **wrap theo nội dung** để hàng `* 0 #` không bị cắt khi fontScale hệ thống lớn.

### 2.2. `PhoneShellFrame` — lớp vỏ

```kotlin
PhoneShellFrame(width, height, wrapHeight = true) { content }
```

| Thuộc tính | Giá trị / hành vi |
|------------|-------------------|
| Bo góc | `RoundedCornerShape(20.dp)` |
| Nền | Gradient dọc `#2B3444` → `#151C27` |
| Viền | `1.5.dp`, màu `#435069` |
| `wrapHeight=false` | `Modifier.size(w, h)` — cố định (landscape) |
| `wrapHeight=true` | `Modifier.width(w)` — cao theo column bên trong (portrait) |
| Căn | `Alignment.Center` |

### 2.3. `PortraitPhone` — dọc (mặc định)

**Thiết kế gốc (scale = 1):**

```
box design = 268 × 600
screen     = 240 × 320  (dp theo pixel framebuffer)
gap        = 12
keypad W   = 234
pad top    = 8
pad bottom = 10
phone H    = 8 + 320 + 12 + 210 + 10 ≈ 560+  (biên an toàn → 600)
```

**Công thức scale:**

```kotlin
scale = fitScale(stageW, stageH, 268f, 600f)
// scale = min(stageW/268, stageH/600) clamp [0.4, 3.0]
```

**Bố cục column (trên → dưới):**

| # | Thành phần | Chiều cao / ghi chú |
|---|------------|---------------------|
| 1 | `NetworkLed` | `padding(top = 8.dp * scale)` — LED + text WiFi/LTE/OFF |
| 2 | Màn LCD `EmulatorScreenCanvas` | `240.dp × 320.dp * scale`, bo `4.dp`, nền `#090D14` |
| 3 | `Spacer` | `12.dp * scale` |
| 4 | `NokiaKeypad` | rộng `234.dp * scale`, `padding(bottom = 10.dp * scale)` |

**`fontScale` bị ghim = 1** bên trong khung (`CompositionLocalProvider`) — text `sp` không phình theo cài đặt hệ thống (tránh cắt bàn phím trên MIUI font lớn).

### 2.4. `LandscapePhone` — ngang (nút Xoay)

```
design box ≈ 594 × 334
layout: [pad 14] [screen 320×240] [gap 12] [keypad 234] [pad 14]
```

- Màn bên **trái** (`CenterStart`).
- Bàn phím bên **phải** (`CenterEnd`).
- `screenW=320`, `screenH=240` (xoay framebuffer).
- `wrapHeight=false` — khung size cố định.

### 2.5. LED trạng thái mạng (`NetworkLed`)

| Trạng thái | Màu LED | Text |
|------------|---------|------|
| WiFi | `#65DC96` (nhấp nháy alpha 1→0.25, 900ms) | `WiFi · 1.0Gbps` |
| Mobile | `#8AB4F8` | `LTE · …` |
| Offline | `#E04545` | `OFF` |

Độ rộng LED: `(14 × scale)` dp, cao `(4 × scale)` dp.

### 2.6. Màn LCD — `EmulatorScreenCanvas`

| Trường hợp | Nội dung canvas |
|------------|-----------------|
| Đang chạy VXP | `controller.captureScreenshot()` (framebuffer game) |
| Chưa nạp VXP | `controller.captureShellScreenshot()` — shell idle Nokia 225 |
| Đang boot | Text `bootMessage` (vd “Đang khởi động…”) |

Chạm màn: map tọa độ pixel → `controller.onTouchEvent(1/2, x, y)` (pen down/up).

### 2.7. Lớp phủ ngoài khung (không thuộc vỏ máy)

| Thành phần | Vị trí | Chức năng |
|------------|--------|-----------|
| **EmuMenuBubble** | TopStart, kéo thả được | Menu: Xoay, Chạy lại, Dừng, Lưu/Tải nhanh, Tua, Log, Hex, Âm, Ngôn ngữ, **Nạp VXP**, Chính sách, Điều khoản |
| **FpsBadge** | TopEnd, cùng hàng | `59 FPS` · `2x`; chấm vàng nếu &lt; 30 FPS |
| **EngineStoppedOverlay** | Center | Lỗi ENGINE_ABORT → Thử lại |

Bong bóng menu: vị trí lưu trong `ui_prefs` (Room), mặc định `(10, 2)` dp.

---

## 3. Bàn phím ảo Nokia 225 (`NokiaKeypad`)

### 3.1. Bố cục bàn phím (portrait, thiết kế)

```
┌──────────┬──────────┬──────────┐
│  ☰ LSK   │    ▲     │  ← RSK   │   row soft + D-pad trên
├──────────┼──────────┼──────────┤
│    ◀     │   OK     │    ▶     │   D-pad giữa
├──────────┼──────────┼──────────┤
│  (trống) │    ▼     │  (trống) │   D-pad dưới
├──────────┼──────────┼──────────┤
│ 1 / ∞    │ 2 / abc  │ 3 / def  │
├──────────┼──────────┼──────────┤
│ 4 / ghi  │ 5 / jkl  │ 6 / mno  │
├──────────┼──────────┼──────────┤
│ 7 / pqrs │ 8 / tuv  │ 9 / wxyz │
├──────────┼──────────┼──────────┤
│ * / +    │ 0 / ␣    │ # / ⇧    │
└──────────┴──────────┴──────────┘
```

Nhãn phụ T9 (`abc`, `def`…) hiển thị **dưới** chữ số chính, cỡ ~7sp×scale.

### 3.2. Kích thước theo `scale`

| Biểu thức | Giá trị (scale=1) |
|-----------|-------------------|
| `softH` | 24 dp |
| `numH` | 27 dp |
| `softFont` | 11 sp (clamp 8–16) |
| `numFont` | 13 sp (clamp 9–18) |
| `subFont` | 7 sp (clamp 5–10) |
| gap / rowGap | 3 dp (min 2) |
| iconSize | ≈ 0.55 × softH |

### 3.3. Màu phím

| Token | Hex |
|-------|-----|
| `KeyFace` | `#34445D` |
| `KeyFacePressed` | `#4E6C96` |
| `KeyBorder` | `#506685` |
| `KeyText` | `#FFFFFF` |
| Sub-label | `#9FB2CC` |
| Corner | 4 dp |

### 3.4. Gestures

Mỗi phím: `awaitEachGesture` →  
`awaitFirstDown` → `pressed=true` + `onDown(code)` →  
`waitForUpOrCancellation` → `pressed=false` + `onUp(code)`.

Không có auto-repeat trong UI — giữ phím do **controller** / **system repeat** gửi `onKeyRepeat`.

### 3.5. Sự kiện ra ngoài

```kotlin
NokiaKeypad(
  onKeyPressed = controller::onKeyDown,   // key down
  onKeyReleased = controller::onKeyUp,    // key up
  scale = scale,
  modifier = Modifier.width(234.dp * scale)
)
```

---

## 4. Bảng mã phím (3 lớp)

### 4.1. Lớp 1 — Shell (`MreKeys`) — UI emit

| Nút trên màn hình | Constant | Hex | Decimal |
|-------------------|----------|-----|---------|
| ▲ | `UP` | `0x100` | 256 |
| ▼ | `DOWN` | `0x101` | 257 |
| ◀ | `LEFT` | `0x102` | 258 |
| ▶ | `RIGHT` | `0x103` | 259 |
| OK | `OK` | `0x104` | 260 |
| ☰ Mềm trái | `LEFT_SOFT` | `0x105` | 261 |
| ← Mềm phải | `RIGHT_SOFT` | `0x106` | 262 |
| (chưa gán nút UI) | `BACK` | `0x107` | 263 |
| (chưa gán nút UI) | `CLEAR` | `0x108` | 264 |
| 0–9 | ASCII | `0x30–0x39` | 48–57 |
| \* | ASCII | `0x2A` | 42 |
| # | ASCII | `0x23` | 35 |

### 4.2. Lớp 2 — Legacy (`MreKeypad`) — app / JNI bridge

| Nút | Constant | Mã | Ghi chú |
|-----|----------|----|---------|
| ▲ | `KEY_UP` | **1** | |
| ▼ | `KEY_DOWN` | **2** | |
| ◀ | `KEY_LEFT` | **3** | |
| ▶ | `KEY_RIGHT` | **4** | |
| OK | `KEY_OK` | **5** | |
| ☰ | `KEY_LSK` | **6** | Left softkey |
| ← | `KEY_RSK` | **7** | Right softkey |
| Xoá | `KEY_CLEAR` | **10** | |
| 0 | `KEY_NUM0` | **48** | ASCII `0` |
| 1–9 | `KEY_NUM1`… | **49–57** | ASCII |
| \* | `KEY_STAR` | **42** | |
| # | `KEY_POUND` | **35** | |

### 4.3. Lớp 3 — MRE SDK (`vmio.h`) — game nhận

**Mã phím:**

| MRE | Giá trị | Map từ legacy |
|-----|---------|---------------|
| `VM_KEY_UP` | -1 | 1 |
| `VM_KEY_DOWN` | -2 | 2 |
| `VM_KEY_LEFT` | -3 | 3 |
| `VM_KEY_RIGHT` | -4 | 4 |
| `VM_KEY_OK` | -5 | 5 |
| `VM_KEY_LEFT_SOFTKEY` | -6 | 6 |
| `VM_KEY_RIGHT_SOFTKEY` | -7 | 7 |
| `VM_KEY_CLEAR` | -8 | 10 |
| `VM_KEY_BACK` | -9 | *(chưa map từ UI)* |
| `VM_KEY_NUM0`…`9` | 48–57 | pass-through |
| `VM_KEY_STAR` | 42 | 42 |
| `VM_KEY_POUND` | 35 | 35 |

**Sự kiện:**

| Macro | Giá trị | Nguồn |
|-------|---------|-------|
| `VM_KEY_EVENT_UP` | 1 | key up |
| `VM_KEY_EVENT_DOWN` | 2 | key down |
| `VM_KEY_EVENT_LONG_PRESS` | 3 | *(chưa đẩy từ UI)* |
| `VM_KEY_EVENT_REPEAT` | 4 | hold / system repeat |

### 4.4. Bảng đối chiếu 1 dòng / nút

| Nút Nokia 225 | Shell | Legacy | VM_KEY_* |
|---------------|-------|--------|----------|
| ☰ | `0x105` | 6 | `LEFT_SOFTKEY` (-6) |
| ▲ | `0x100` | 1 | `UP` (-1) |
| ← | `0x106` | 7 | `RIGHT_SOFTKEY` (-7) |
| ◀ | `0x102` | 3 | `LEFT` (-3) |
| **OK** | `0x104` | 5 | `OK` (-5) |
| ▶ | `0x103` | 4 | `RIGHT` (-4) |
| ▼ | `0x101` | 2 | `DOWN` (-2) |
| 1…9 | ASCII | same | same |
| \* 0 # | 42 / 48 / 35 | same | same |

### 4.5. Convert: shell → legacy

```kotlin
// MreKeys.toLegacy
UP       → KEY_UP     (1)
DOWN     → KEY_DOWN   (2)
LEFT     → KEY_LEFT   (3)
RIGHT    → KEY_RIGHT  (4)
OK       → KEY_OK     (5)
LEFT_SOFT→ KEY_LSK    (6)
RIGHT_SOFT→ KEY_RSK   (7)
CLEAR    → KEY_CLEAR  (10)
else     → pass-through (digits, *, #)
```

### 4.6. Convert: Android keycode → shell

| Android `KeyEvent` | → Shell |
|--------------------|---------|
| `KEYCODE_DPAD_UP` | `UP` |
| `KEYCODE_DPAD_DOWN` | `DOWN` |
| `KEYCODE_DPAD_LEFT` | `LEFT` |
| `KEYCODE_DPAD_RIGHT` | `RIGHT` |
| `KEYCODE_DPAD_CENTER` / `ENTER` | `OK` |
| `KEYCODE_MENU` | `LEFT_SOFT` |
| `KEYCODE_BACK` | `RIGHT_SOFT` |
| `KEYCODE_DEL` | `CLEAR` |
| `KEYCODE_0`…`9` | 48–57 |
| `KEYCODE_STAR` | 0x2A |
| `KEYCODE_POUND` | 0x23 |
| Khác | `null` (bỏ qua) |

Hardware key vào app qua `MainActivity` → `viewModel.onHardwareKey` → `controller.onKeyDown`.

### 4.7. Convert native: legacy → VM_KEY

```cpp
// vxp_runner.cpp map_key()
1 → VM_KEY_UP
2 → VM_KEY_DOWN
3 → VM_KEY_LEFT
4 → VM_KEY_RIGHT
5 → VM_KEY_OK
6 → VM_KEY_LEFT_SOFTKEY
7 → VM_KEY_RIGHT_SOFTKEY
10 → VM_KEY_CLEAR
0x30–0x39 → digit (pass)
42 → VM_KEY_STAR
35 → VM_KEY_POUND
else → bỏ (0x7FFFFFFF)
```

---

## 5. Luồng sự kiện key (end-to-end)

```
NokiaKeypad.onDown(0x100)          // ▲
    → VxpEmulatorController.onKeyDown(0x100)
        → legacy = MreKeys.toLegacy(0x100)  // = 1
        → log "KEY DOWN: Lên (0x01)"
        → activeApp?.onKeyDown(1)
              │
              ├─ MreIdleShellApp  → điều hướng menu shell
              │
              └─ MreNativeVxpApp  → NativeVxpBridge.nativeKey(1, true)
                    → JNI map_key(1) = VM_KEY_UP
                    → input_queue: (VM_KEY_EVENT_DOWN, VM_KEY_UP)
                    → worker: add_keyboard_event → game key_handler

NokiaKeypad.onUp(0x100)
    → controller.onKeyUp(0x100) → nativeKey(1, false)
    → (VM_KEY_EVENT_UP, VM_KEY_UP)

Giữ phím (repeatCount ≥ 1)
    → controller → onKeyRepeat → nativeKeyRepeat
    → (VM_KEY_EVENT_REPEAT, VM_KEY_*)
```

**Thread model (native):**  
UI thread chỉ đẩy vào `input_queue` (mutex).  
Worker thread (Unicorn / AppManager) drain queue mỗi frame → `add_keyboard_event`.

---

## 6. Shell màn hình chờ — `MreIdleShellApp`

Khi **chưa nạp VXP**, canvas hiển thị shell “Nokia 225 Dual SIM”.

| Thuộc tính | Giá trị |
|------------|---------|
| `title` | Nokia 225 Shell |
| `internalId` | `builtin_idle_shell` |
| Màn hình mặc định | `225 DUAL SIM` + `Đang chờ VXPEmu…` |

### Màn hình shell (`Screen` enum)

`IDLE`, `MENU`, `CONTACTS`, `MESSAGES`, `INBOX_VIEW`, `COMPOSE`, `DIAL`, `SETTINGS`

### Menu chính (8 mục)

Danh bạ · Tin nhắn · Nhật ký cuộc gọi · Cài đặt · Đồng hồ · Máy nghe nhạc · Radio FM · Game & Ứng dụng

### Vai trò phím (idle)

| Phím | Hành vi |
|------|---------|
| D-pad | Điều hướng menu / danh sách |
| OK | Xác nhận / vào mục |
| ☰ LSK | Menu / tùy chọn |
| ← RSK | Thoát / trở về |
| 2–9 | T9 soạn tin (khi soạn) |
| 0 | Space |
| \* | Lật gợi ý / ký tự đặc biệt |
| # | Đổi chế độ nhập T9→ABC→abc→123 |

### T9 — `T9InputEngine`

| Mode | Hành vi |
|------|---------|
| `T9` | 1 lần/phím, từ điển + gợi ý; `*` lật gợi ý |
| `ABC` / `abc` | Multi-tap 800ms |
| `123` | Số thẳng |

Cycle mode bằng `#`. Trạng thái draft T9 expose qua `t9Draft` / `t9Suggestions` cho UI.

### Âm thanh key

`MreAudioEngine`: click D-pad, click số, chuông SMS giả lập khi có tin mới trong inbox shell.

---

## 7. Mã nhãn hiển thị (`MreKeypad.getKeyLabel`)

| Code | Nhãn |
|------|------|
| 1 | Lên |
| 2 | Xuống |
| 3 | Trái |
| 4 | Phải |
| 5 | OK / Chọn |
| 6 | Menu / LSK |
| 7 | Trở về / RSK |
| 48–57 | 0…9 (kèm abc/def…) |
| 42 | \* |
| 35 | # |
| khác | `Key_$code` |

Dùng cho log console (`KEY DOWN: …`).

---

## 8. Ghi chú kỹ thuật / anti-regression

1. **`fontScale = 1` trong khung máy** — không gỡ bỏ nếu không muốn cắt hàng `* 0 #` trên thiết bị font hệ thống lớn.
2. **Portrait `wrapHeight = true`** — chiều cao theo nội dung; landscape `false`.
3. **NokiaKeypad dùng `MreKeys.*`** (shell), **không** dùng thẳng `MreKeypad` — luôn qua `toLegacy`.
4. **Native VXP chỉ nhận** digit / `*` / `#` / nav / softkey / clear map hợp lệ; mã lạ bị drop (`0x7FFFFFFF`).
5. **`VM_KEY_EVENT_REPEAT`** phải đi `nativeKeyRepeat` / `onKeyRepeat`, **không** gửi thêm `DOWN` lặp (tránh double-fire).
6. **Bubble menu** đè lên khung máy — `Nạp VXP` nằm ở cuối lưới 2 cột khi compact (đang chạy app).
7. **Không cài release lên máy test** — chỉ `installDebug` (AdMob test ads).

---

## 9. Cheat-sheet in nhanh

```
Nokia 225 shell key map (UI → MRE)

  ☰ = LSK = 0x105 → 6 → LEFT_SOFTKEY(-6)
  ← = RSK = 0x106 → 7 → RIGHT_SOFTKEY(-7)
  ▲ = 0x100 → 1 → UP(-1)
  ◀ = 0x102 → 3 → LEFT(-3)
  OK= 0x104 → 5 → OK(-5)
  ▶ = 0x103 → 4 → RIGHT(-4)
  ▼ = 0x101 → 2 → DOWN(-2)
  0–9, *, # → ASCII pass-through
  Event: DOWN=2  UP=1  REPEAT=4
```

---

## 10. Tham chiếu nguồn code

| Đường dẫn (tương đối `app/src/main/…`) | Dòng chú ý |
|----------------------------------------|------------|
| `java/…/ui/screens/EmulatorScreen.kt` | `PhoneShellFrame` ~L1229, `PortraitPhone` ~L1381, `LandscapePhone` ~L1454 |
| `java/…/ui/components/NokiaKeypad.kt` | Toàn file layout + code phím |
| `java/…/ui/components/EmulatorScreenCanvas.kt` | Canvas 240×320 |
| `java/…/engine/MreKeys.kt` | Shell codes + `toLegacy` / `fromAndroid` |
| `java/…/engine/MreKeypad.kt` | Legacy constants + labels |
| `java/…/engine/VxpEmulatorController.kt` | `onKeyDown` / `onKeyUp` / repeat |
| `java/…/engine/apps/MreIdleShellApp.kt` | Shell chờ + key routing |
| `java/…/engine/T9InputEngine.kt` | Soạn tin T9 |
| `cpp/vxp_runner.cpp` | `map_key`, `nativeKey`, `nativeKeyRepeat` |
| `cpp/mre-include/mre-sdk/vmio.h` | `VM_KEY_*`, `VM_KEY_EVENT_*` |

---

*Tài liệu sinh từ source VXPQeaf (debug build trên MI 8 SE, versionName 1.2 / versionCode 15082030).*
