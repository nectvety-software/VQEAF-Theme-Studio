# VQEAF Theme Studio V3.7.13

Webapp nhẹ để thiết kế theme `.vqeaf` cho frame Classic 240×320 / VXPQeaf.

## Chạy nhanh trên Windows

Không cần build. Cách dễ nhất là **nhấp đúp `rub.bat`**. Launcher sẽ:

- tự chuyển vào đúng thư mục dự án;
- tự tìm cổng trống từ `8080` đến `8099`;
- ưu tiên `py -3`, `python` hoặc `python3`;
- nếu máy không có Python, tự dùng `server.ps1` đi kèm;
- tự mở trình duyệt tại địa chỉ local server;
- dừng server bằng `Ctrl+C`.

Có thêm `run.bat` làm alias cho `rub.bat` nếu muốn dùng tên launcher thông dụng hơn.

Chạy thủ công vẫn được:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Sau đó mở `http://127.0.0.1:8080/`.

## Tính năng

- Đặt tên theme + tự sinh ID.
- Random theme / random name.
- Autosave bằng IndexedDB, fallback localStorage.
- Undo/Redo 100 bước (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`).
- Preview Classic 240×320 dọc/ngang và zoom — khớp frame VXPQeaf / sheet Nokia classic.
- **64 preset** (đã gộp trùng), trong đó có nhóm Việt:
  - **Tết** — đỏ đào + vàng mai (thay Lunar New Year)
  - **Trung Thu** — trăng rằm + đèn ông sao
  - **Hà Nội Night** — phố đêm + đèn vàng
  - **Comic Bang** / **Classic Sheet** — dùng ảnh làm background + bộ nút pop/classic
  - **Spooky Vibes** / **Pika Arcade** / **Pika Honey** — ảnh đi vào **từng phím** (giữ frame cũ)
- Import/export `.vqeaf` một file.
- Import background riêng cho **keypad** và **PhoneShellFrame** (clip theo bo góc, Layer Stack).
- Chế độ **Trên phím → Texture từng phím** (`per-key-texture`), giữ số/nhãn/viền rõ nét.
- Chỉnh opacity, blend, brightness, contrast, saturation, blur, scale, offset, rotate/flip.
- Decoration kéo thả có xóa, xoay, lật ngang/dọc và floating animation.
- Layer Stack: Frame Background, Frame FX, LCD, Keypad, Decoration, Network LED, `menuButton / fpsBadge`.
- **Icon pixel art thay emoji (V3.7.13)** — **không còn emoji/glyph** ở bất kỳ đâu.
  46 icon **12×12** vẽ trong **VPEPixel** (`D:\desktop-webapps\VPEPixel`), nhúng
  thẳng vào `src/icons.js` dạng data-URI. Ba chế độ render: đủ màu (`img.icon`),
  theo màu chữ (`.icon-glyph`), và tô theo `tint` (`.icon-tinted`). Nhờ đó control
  **Màu** của trang trí mới thật sự có tác dụng — emoji thì không đổi màu được.
  Export `.vqeaf` phát ra `<resource type="image">` + **chính** bộ icon đó nên bản
  xem trước và bản export **không còn lệch nhau**.
- **Vật liệu nút "keycap bóng" (V3.7.12)** — mặc định cho **cả 66 theme**: nhựa tối
  bóng, **không viền ngoài**, chữ trắng, bevel mềm, ảnh texture hiện **mờ** bên trong.
  Màu **suy ra từ palette từng theme** (`keycapPalette()`), thân nút bị kéo tối để
  chữ trắng luôn đạt **WCAG AA** (66/66 theme, thấp nhất 5.53:1). 2 nút áp nhanh ở
  nhóm *Hình dạng nút*: *Vật liệu keycap (theo theme)* / *Keycap cho phím này*.
- **Button Builder (Tạo nút)**: keycap glossy/candy/fantasy + 50+ preset nút (candy, pop, classic, Tết, Trung Thu, Hà Nội…).
- Panel phải hiển thị **ID component `.vqeaf`** khi chọn thành phần (`phoneShell`, `keyStyle_ok`, `menuButton`, `decoration_…`).
- Nút **Chụp khung** trên topbar (icon `camera`): xuất preview khung Nokia ra PNG.
- Ảnh raster được tối ưu rồi nhúng Data URI vào chính file `.vqeaf`.

## Khung preview (khớp VXPQeaf)

| Vùng | Ghi chú |
|------|---------|
| Badge dock | MENU (trái) / Shot (phải) — component `menuButton` / `fpsBadge` |
| Network LED + FPS strip | Bên trong khung, dưới đỉnh máy |
| LCD | 240×320 portrait / 320×240 landscape; idle UI + softkey `Menu` / `Contacts` |
| Keypad | 234px; softkey `dash`, D-pad OK, Call/End dùng icon `call`; T9 `1`+`infinity`, `0`+`dash`, `#`+`shift` |
| Nhấn phím | scale `0.94` (khớp Compose `pressScale`) |

Geometry chuẩn: portrait ~`268×600`, landscape ~`594×334`, `fontScale=1`.

## Cấu trúc

```text
VQEAF-Theme-Studio/
├── PROMPT.md            # scope sản phẩm (nguồn sự thật)
├── SKILLS.md            # quy ước + kỹ thuật + bẫy cho người & AI agent
├── index.html
├── rub.bat              # launcher Windows
├── run.bat              # alias gọi rub.bat
├── server.ps1           # server dự phòng khi không có Python
├── styles.css
├── src/
│   ├── app.js
│   ├── presets.js
│   ├── icons.js         # AUTO-GENERATED — 46 icon 12×12 data-URI (đừng sửa tay)
│   └── vqeaf.js
├── assets/              # ảnh nền / tham chiếu (comic_bang_bg, classic_sheet_bg, spooky_vibes_bg, pika_arcade_bg, pika_honey_bg, …)
├── themes/              # file .vqeaf mẫu (trùng với preset id) — phải luôn đủ 66
├── tools/               # script sinh theme / kiểm tra / chụp preview
│   ├── gen_photo_bg_themes.py      # sinh 3 theme "ảnh vào nút nhấn"
│   ├── gen_keycap_themes.mjs       # đồng bộ keyStyle_* sang vật liệu keycap
│   ├── import_vpe_icons.mjs        # PNG của VPEPixel -> src/icons.js
│   ├── restore_key_decorations.mjs # khôi phục decoration từ backup %TEMP%
│   ├── verify_pixel_icons.mjs      # 39 check: hết emoji + icon pixel art + export
│   ├── verify_pixel_icons_ui.mjs   # 27 check trong Chrome thật (2 phiên, so từng pixel)
│   ├── verify_photo_themes.mjs     # assert bằng parseVqeaf thật
│   ├── verify_key_shape_ui.mjs     # test UI hình dạng nút (Chrome headless)
│   ├── check_frame_update.mjs      # gate tĩnh: version + tính năng phải còn
│   ├── shoot_theme_preview.mjs     # chụp preview qua headless Chrome
│   ├── shoot_shape_gallery.mjs     # chụp 10 hình dạng nút
│   ├── make_shape_sheet.py         # ghép bảng hình dạng có nhãn
│   └── shots/                      # ảnh preview đã chụp
└── docs/
    ├── README.md
    ├── CHANGELOG.md
    ├── Nokia225_Keypad_Shell.md
    ├── VQEAF_1_0_SPEC.md
    └── prompts/
        ├── PROMPT_01_VQEAF_ANDROID_ENGINE.md
        ├── PROMPT_02_NOKIA_FRAME_INTEGRATION.md
        ├── PROMPT_03_BUTTON_BUILDER_V37.md
        └── PROMPT_04_THEME_STUDIO_CONTINUE.md
```

## VQEAF extensions dùng trong V3

Studio xuất thêm các cấu hình:

- `frame_background` / `keypad_background` image resource (data-uri)
- `phoneShell.background { ... }` (opacity, fit, blend, filter, transform)
- `keypad.background.renderMode = "per-key-texture"`
- `keyStyle_<keyId>` type `button-style` (gradient, gloss, shadow, decoration…)
- `menuButton` / `fpsBadge` type `badge` (appearance solid|glass|outline|neon|pixel)
- `brightness`, `contrast`, `saturation`, `readabilityAssist`
- `rotation`, `scaleX`, `scaleY` cho background và decoration
- `layerOrder` gồm `frameBackground`

Android VQEAF Engine cần renderer tương ứng cho image resource Data URI và các transform này.

## Component IDs

| Thành phần | ID `.vqeaf` |
|------------|-------------|
| Vỏ máy | `phoneShell` |
| LCD | `screen` |
| Bàn phím | `keypad` |
| Phím | `key` + `keyStyle_<id>` (vd `keyStyle_ok`, `keyStyle_star`, `keyStyle_pound`) |
| LED mạng | `networkLed` |
| MENU bubble | `menuButton` |
| Shot badge (góc phải) | `fpsBadge` |
| Decoration | `decoration_<id>` |

19 key ID: `menu`, `up`, `rsk`, `left`, `ok`, `right`, `down`, `1`–`9`, `*`, `0`, `#`  
(`*` → `keyStyle_star`, `#` → `keyStyle_pound`).

## Menu & Shot custom style (V3.4+)

Chọn trực tiếp **MENU** hoặc **Shot** trên preview để mở inspector riêng. Solid / Glass / Outline / Neon / Pixel + màu, viền, glow, font, opacity, padding, LED. Lưu trong `.vqeaf` (`menuButton` / `fpsBadge`).

Từ V3.7.3–3.7.4: FPS nằm dưới dải Network LED trong khung; badge góc phải là **Shot** (vẫn dùng component `fpsBadge`); MENU/Shot không còn chồng nhau.

## Template ảnh nền + nút

- **Comic Bang** (`themes/comic_bang.vqeaf`): ảnh comic làm frame/keypad background + nút pop (viền đen dày).
- **Classic Sheet** (`themes/classic_sheet.vqeaf`): ảnh sheet classic làm background mềm + nút classic pill.
- Regenerate: `tools/gen_image_button_templates.py`.

## Ảnh vào nút nhấn (V3.7.9)

Khác nhóm trên: ảnh **không** đắp lên frame — frame Nokia giữ nguyên (block
`<component id="phoneShell">` giống hệt các theme khác, `frame_background = null`).
Ảnh chỉ đi vào **từng phím** qua `keypad` background:

```vqeaf
<component id="keypad" type="container">
    background {
        source: @keypad_background
        position: "above"              // texture nằm TRÊN phím
        renderMode: "per-key-texture"  // mỗi phím một miếng ảnh
        textureMode: "per-key"
        opacity: 0.50
        blend: "normal"
        readabilityAssist: true        // thêm bóng chữ cho dễ đọc
    }
</component>
```

| ID | Tên | Ảnh (assets/) | Bảng màu |
|----|-----|---------------|----------|
| `spooky_vibes` | Spooky Vibes | `spooky_vibes_bg.jpg` | Tím `#4B2B58` + vàng đồng `#C9A227` + hồng `#F2A0B8` |
| `pika_arcade` | Pika Arcade | `pika_arcade_bg.jpg` | Đỏ `#E23A50` + vàng `#FFD23F` + teal `#3BB273` |
| `pika_honey` | Pika Honey | `pika_honey_bg.jpg` | Vàng mật `#FFC93C` + nâu `#6B4226` + đỏ pokéball `#E8443C` |

Lưu ý: LCD của studio luôn vẽ chữ sáng (`#c8d0d8` / `#e8eef4`) nên `palette.screen`
phải là màu tối — `pika_honey` dùng nâu mật `#241505` thay vì màu kem của ảnh gốc.

⚠️ `pika_arcade` / `pika_honey` dùng ảnh do người dùng cung cấp có yếu tố thương hiệu
bên thứ ba. Xem mục **Trademark Notice** — chỉ phát hành khi bạn có quyền với ảnh.

- Regenerate: `tools/gen_photo_bg_themes.py`
- Kiểm tra: `tools/verify_photo_themes.mjs` (parse bằng chính `parseVqeaf`, assert
  texture webp thật, `frame_background = null`, 19 `keyStyle_*`, preset trỏ đúng buttonPreset)
- Chụp preview thật: `tools/shoot_theme_preview.mjs <themeId>` → `tools/shots/<themeId>.png`
  (mở studio bằng headless Chrome, **nhập** file `.vqeaf` qua ô "Nhập .vqeaf" rồi chụp `#phone`)


## Theme Việt (V3.7.7)

| ID | Tên | Bảng màu |
|----|-----|----------|
| `tet` | Tết | Đỏ đào `#8B1217` + vàng mai `#FFD166` |
| `trung_thu` | Trung Thu | Đêm indigo `#1B2A5B` + trăng `#FFD93D` + đèn `#FF6B35` |
| `hanoi_night` | Hà Nội Night | Xanh đêm `#0B1C2E` + đèn phố `#FFC857` + đỏ `#FF4D4D` |

File: `tools/gen_vn_themes.py`. Button presets: Tết Red/Gold, Peach Blossom, Mai Yellow, Moon Gold, Lantern Red, Hanoi Steel/Lamp/Night.

## Hình dạng nút (V3.7.11)

Chọn một phím trên preview → panel **phải** hiện nhóm **Hình dạng nút**:

| Control | Field `.vqeaf` | Ghi chú |
|---------|----------------|---------|
| Kiểu dáng | `shape.type` | 10 kiểu — xem bảng dưới |
| Bo góc | `shape.radius` | 0–24dp; `square` tự kẹp ≤ 6dp; **đa giác bỏ qua** |
| Viền nổi | `bevel.size` | 0–6dp — inset highlight trên + inset bóng dưới |
| Màu viền nổi | `bevel.color` | màu highlight của keycap |
| Độ mềm viền nổi | `bevel.blur` | 0–8dp |

### 10 kiểu dáng

| `shape.type` | Tên | Cách vẽ |
|--------------|-----|---------|
| `capsule` | Capsule | `border-radius` = thanh trượt (mặc định, theme cũ) |
| `pill` | Tròn hết | `border-radius: 999px` |
| `square` | Vuông keycap | `border-radius` kẹp ≤ 6px |
| `circle` | Tròn / bầu dục | `border-radius: 50%` |
| `rhombus` | **Hình thoi** | `clip-path: polygon(50% 0,100% 50%,50% 100%,0 50%)` |
| `hexagon` | Lục giác | `clip-path` 6 điểm |
| `octagon` | Bát giác | `clip-path` 8 điểm |
| `triangle` | Tam giác | `clip-path` 3 điểm |
| `parallelogram` | Bình hành | `clip-path` 4 điểm (lệch) |
| `star` | Ngôi sao | `clip-path` 10 điểm |

Ba nút áp nhanh: **Áp cho cả bàn phím** / **Áp nhóm điều hướng** / **Áp nhóm số**.
Cùng bộ control cũng có trong tab **Tạo nút** (panel trái) — hai chỗ sửa cùng một state.

> **Vì sao đa giác phải dùng `clip-path`?** `border-radius` chỉ bo được góc, không tạo
> được hình thoi/lục giác. Hệ quả: (1) shadow/glow **ngoài** bị `clip-path` cắt nên phải
> chuyển sang `filter: drop-shadow()` — vì nền nút là màu đặc nên bóng chỉ bám theo
> silhouette của hình, chữ không bị bóng đôi; (2) thanh **Bo góc** không có tác dụng.
> Thêm kiểu mới chỉ cần thêm 1 dòng vào `KEY_SHAPE_DEFS` trong `src/app.js` — dropdown
> tự sinh từ bảng đó.

```vqeaf
<component id="keyStyle_ok" type="button-style">
    target: "ok"
    shape {
        type: "square"
        radius: 6dp
        fill { type: linear angle: 180deg colors: [ "#FFF0A8", "#FFD23F", "#E0A800" ] }
        stroke { width: 2dp color: "#2A1A00" }
    }
    bevel { size: 2dp blur: 2dp color: "#FFFFFF" }
    ...
</component>
```

Theme cũ không có `shape` / `bevel` → mặc định `capsule` + `bevel 0`, render y như trước.

## Icon pixel art (V3.7.13)

**Không còn emoji/glyph** trong studio. 46 icon **12×12** được vẽ trong
**VPEPixel** (`D:\desktop-webapps\VPEPixel`) rồi nhúng vào repo:

```bash
# 1) trong D:\desktop-webapps\VPEPixel
python tools/make_vqeaf_studio_icons.py   # -> Documents/VPE Pixel/{tile,exports}/vqeaf_studio/
# 2) trong repo này
node tools/import_vpe_icons.mjs           # -> src/icons.js  (data-URI, auto-generated)
node tools/import_vpe_icons.mjs --dry     # chỉ kiểm tra, exit 1 nếu lệch
```

`src/icons.js` là **file sinh tự động** — đừng sửa tay (`verify_pixel_icons.mjs`
so *nội dung sinh ra* với file nên sẽ bắt được).

| Nhóm | Số icon | Ví dụ |
|---|---|---|
| `decoration` | 13 | `leaf` `flower` `cloud` `star` `gem` `sparkle` `chest` `slime` `pumpkin` `bat` `web` `ghost` `badge` |
| `keypad` | 10 | `tri_up` `tri_down` `tri_left` `tri_right` `call` `menu_lines` `camera` `dash` `infinity` `shift` |
| `ui` | 16 | `dice` `undo` `redo` `trash` `rotate_ccw` `rotate_cw` `flip_h` `flip_v` `move_up` `move_down` `close` `arrow_left` `arrow_right` `plus` `reset` `battery` |
| `layer` | 7 | `keyboard` `frame` `screen` `keypad` `keypadbg` `led` `decoration` |

**Ba chế độ render** — chọn đúng cái:

| Class | Cách vẽ | Dùng cho |
|---|---|---|
| `img.icon` | `<img>` đủ màu | biểu tượng toolbar / Layers |
| `.icon-glyph` | `mask-image` + `background-color: currentColor` | ký hiệu keypad theo màu chữ |
| `.icon-tinted` | `mask-image` + màu chỉ định | trang trí phím theo `tint` |

- Trang trí phím **tô phẳng theo `tint`** (SRC_IN): icon bị *thay* bằng màu trong
  `icon { tint: … }` — đúng ngữ nghĩa format đã khai báo, nên control **Màu** mới
  có tác dụng thật.
- Mọi icon có `image-rendering: pixelated`; thiếu dòng này art 12×12 bị nội suy
  thành khối nhòe khi phóng lên 16–24px.
- Export `.vqeaf` phát `<resource id="…" type="image">` + data-URI của chính bộ
  icon (thay `vectorFor()` 13 path SVG viết tay) → preview và export khớp nhau.
- Export PNG `await preloadIcons()` trước khi vẽ — nếu không, `drawImage` **im lặng
  bỏ qua** icon chưa nạp và ảnh ra thiếu hình.

Kiểm tra: `node tools/verify_pixel_icons.mjs` — **39 check** (nguồn icon · phủ sóng
tên trang trí · hết glyph · mọi đường render đi qua hàm giải mã · export ra pixel art).
Và `node tools/verify_pixel_icons_ui.mjs` — **27 check trong Chrome thật**: chạy 2
phiên, phiên thứ hai vô hiệu hoá `new Image()`, rồi **so từng pixel** 2 file PNG
xuất ra để chứng minh bản export **thật sự vẽ icon** (chứ không phải "trông có vẻ
đúng").

## Chụp khung Nokia (V3.7.8)

Nút **Chụp khung** (icon `camera`) trên topbar render preview (shell gradient, ảnh nền, LCD, keypad `keyStyle_*`, badge MENU/Shot) ra PNG và tải về `<themeId>-frame.png`. Hỗ trợ portrait/landscape.

## V3.7 — Button Builder

Tab **Tạo nút** cho phép dựng keycap kiểu glossy/candy/fantasy: gradient nhiều lớp, gloss, shadow/glow, outline chữ, decoration hai mép. Áp cho một phím hoặc nhóm điều hướng / số / toàn bộ keypad. Style lưu trong `.vqeaf` bằng `keyStyle_*`.

## V3.6 — Tên theme tự động 8 số + style

```text
58310427 Trung Thu
94627130 Pixel Arcade
73140528 Tết
```

- Mỗi mã gồm đúng **8 chữ số không lặp trong cùng mã**.
- Chọn preset sinh mã mới nhưng giữ tên style/preset.
- **Tên** (icon `dice`) chỉ đổi mã; **Ngẫu nhiên** sinh cả style lẫn mã.

## Credits

Maintained by **DOXUANHOP**.

Website: https://qeafivels.com/

## Trademark Notice

VQEAF Theme Studio không liên kết, chứng thực hay được bảo trợ bởi Nokia, MediaTek, Nintendo, Disney hay bất kỳ chủ sở hữu thương hiệu nào. Tên kiểu máy/định dạng trong tài liệu chỉ dùng để mô tả tính tương thích. Không dùng logo, tên thương hiệu hay tài sản có bản quyền của bên thứ ba làm icon, banner, splash hoặc feature graphic nếu không có quyền.
