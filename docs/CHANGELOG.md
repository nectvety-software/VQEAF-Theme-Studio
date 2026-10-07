# Changelog

## Docs — PROMPT.md + SKILLS.md ở gốc repo

- Thêm **`PROMPT.md`** — scope sản phẩm (nguồn sự thật): sản phẩm, yêu cầu gốc,
  7 ràng buộc cứng, tính năng V3.7.11, non-goals, acceptance checks.
- Thêm **`SKILLS.md`** — quy ước cho người và AI agent, gồm 10 mục `## Skill:`:
  format `.vqeaf` · hình dạng nút (shape + bevel) · **bẫy DOM `data-key`** ·
  giới hạn studio · verify không đoán · môi trường máy · **cảnh báo auto-commit xoá theme** ·
  git & push (repo public) · cách thêm kiểu dáng/preset mới · prompt tái sử dụng.
  Kèm file map và Definition of done.
- Cập nhật `docs/prompts/PROMPT_03` (thêm hệ hình dạng 10 kiểu) và `PROMPT_04`
  (ưu tiên mới + đọc PROMPT.md/SKILLS.md trước).
- `tools/check_frame_update.mjs` thêm 7 gate cho `PROMPT.md`/`SKILLS.md`.

## V3.7.11 — Thư viện hình dạng nút (10 kiểu, gồm đa giác)

- `Kiểu dáng` trong nhóm **Hình dạng nút** giờ có **10 lựa chọn** thay vì 3:
  `capsule` · `pill` · `square` (vuông keycap) · `circle` (tròn/bầu dục) ·
  `rhombus` (**hình thoi**) · `hexagon` (lục giác) · `octagon` (bát giác) ·
  `triangle` (tam giác) · `parallelogram` (bình hành) · `star` (ngôi sao).
- Gom về một bảng khai báo duy nhất `KEY_SHAPE_DEFS` trong `app.js`; dropdown tự
  sinh từ bảng này nên thêm kiểu mới chỉ cần thêm 1 dòng.
- Hình **đa giác** không thể làm bằng `border-radius` → dùng `clip-path: polygon(...)`.
  Hệ quả kỹ thuật đã xử lý:
  - `border-radius` trả về `0px` cho đa giác; thanh **Bo góc** không có tác dụng
    (đã ghi rõ trong dòng trợ giúp của panel).
  - Shadow/glow **ngoài** bị `clip-path` cắt mất nếu để trong `box-shadow` →
    chuyển sang `filter: drop-shadow()` (`keyFilter()`). Vì nền nút là màu **đặc**
    (gradient hex 6 số) nên `drop-shadow` chỉ bám theo **silhouette** của hình đã
    cắt — chữ và texture không sinh bóng riêng.
  - Viền trong mỏng `inset 0 0 0 1px` bị bỏ với đa giác (nếu giữ sẽ thành những
    đoạn gạch thừa ở mép hộp); vẫn giữ 2 lớp bevel trên/dưới để có khối nổi.
- Không đổi format `.vqeaf`: `shape.type` vốn là chuỗi tự do, theme cũ đọc lên
  vẫn là `capsule`/`square` như trước (tương thích ngược hoàn toàn).

## V3.7.10 — Tùy chỉnh hình dạng nút (keycap) ở panel phải

- Panel phải có nhóm **Hình dạng nút** khi chọn một phím (`state.selected === 'key'`):
  **Kiểu dáng** / **Bo góc** / **Viền nổi** / **Màu viền nổi** / **Độ mềm viền nổi**
  + 3 nút áp nhanh: *Áp cho cả bàn phím*, *Áp nhóm điều hướng*, *Áp nhóm số*.
- `keyStyle_*` có thêm `shape.type` (`capsule` mặc định · `pill` · `square` keycap)
  và block mới `bevel { size blur color }` → `box-shadow` inset tạo viền nổi kiểu keycap.
- Cùng bộ control này cũng nằm trong tab **Tạo nút** (panel trái), dùng chung helper
  `keyShapeFields()` — hai chỗ sửa cùng một state, không lệch nhau.
- `serializeTheme` ghi `shape.type` + `bevel`, `parseVqeaf` đọc lại (round-trip giữ nguyên).
- 3 theme `spooky_vibes` / `pika_arcade` / `pika_honey` + 15 buttonPreset mới chuyển sang
  dạng keycap: `shape: "square"`, `radius: 6dp`, `bevel: 2dp`.
- Tương thích ngược: theme cũ không có `shape`/`bevel` → mặc định `capsule`, `bevel 0`,
  render y như trước.
- **Fix:** `applyKeyStyles()` và `renderSelection()` trước đây query `.key[data-key=...]`
  không giới hạn scope. Nút **xem trước** trong tab Tạo nút cũng mang `data-key`
  (đặt ở `renderButtonBuilderPreview()`) và đứng **trước** `#keypad` trong DOM, nên
  `querySelector` luôn bắt trúng nó: bấm một phím trên điện thoại thì phím đó **không
  được tô sáng** (`is-selected` rơi vào nút preview). Nay cả hai đã scope vào `#keypad`;
  nút preview do `renderButtonBuilderPreview()` vẽ riêng nên vẫn giữ đúng
  `previewState` (normal/pressed/disabled).
- Test: `tools/verify_key_shape_ui.mjs` (15 assert, Chrome headless) — import `.vqeaf`
  thật, bấm phím, đổi kiểu dáng, áp cho cả bàn phím, và kiểm tra regression cho cả 3 theme.

## V3.7.9 — 3 theme "ảnh vào nút nhấn" (giữ frame cũ)

- Thêm **Spooky Vibes**, **Pika Arcade**, **Pika Honey** (`themes/*.vqeaf` + preset + buttonPreset).
- Ảnh đi vào **từng phím**: `keypad.background` với `position: "above"` +
  `renderMode: "per-key-texture"`, `opacity 0.50`, `blend normal`.
- **Giữ nguyên frame cũ**: block `phoneShell` giống hệt theme khác, `frame_background = null`
  — ảnh không đắp lên khung máy.
- 15 buttonPreset mới: `spooky_*` (purple/gold/pink/ghost/black), `pika_*` (yellow/red/navy/teal/orange),
  `honey_*` (yellow/cream/amber/brown/red).
- `pika_honey` dùng `screen: "#241505"` (không phải màu kem) vì LCD studio luôn vẽ chữ sáng.
- Tool mới: `tools/gen_photo_bg_themes.py`, `tools/verify_photo_themes.mjs`,
  `tools/shoot_theme_preview.mjs` (chụp preview bằng headless Chrome + `DOM.setFileInputFiles`).
- Ảnh nguồn: `assets/spooky_vibes_bg.jpg`, `assets/pika_arcade_bg.jpg`, `assets/pika_honey_bg.jpg`
  (nhúng WebP data-uri, ≤ 720×900).

## V3.7.8 — Nút chụp khung Nokia ở topbar

- Thêm nút **📷 Chụp khung** trên toolbar: render preview khung Nokia (LCD + keypad + badge MENU/Shot + background) ra **PNG** và tải về.
- Hỗ trợ cả portrait / landscape, gradient shell, ảnh nền frame, style nút `keyStyle_*`.

## V3.7.7 — Dọn theme trùng + Tết / Trung Thu / Hà Nội

- Xóa preset/theme trùng lặp: **Candy Cloud Full**, **Matrix Rain**, **Comic Pop**, **Pixel Midnight** (giữ bản đặc trưng hơn).
- Xóa file rác: `full_candy_adventure`, `92687154_dream_pulse`, `indigo_tide`.
- Gộp **Lunar New Year** → **Tết** (đỏ đào + vàng mai, có `menuButton`/`fpsBadge` + buttonMap).
- Thêm **Trung Thu** (trăng rằm + đèn ông sao) và **Hà Nội Night** (phố đêm + đèn vàng).
- Thêm 8 button preset: Tết Red/Gold, Peach Blossom, Mai Yellow, Moon Gold, Lantern Red, Hanoi Steel/Lamp/Night.

## V3.7.6 — menuButton / fpsBadge cho 2 mẫu mới

- Comic Bang & Classic Sheet mang style riêng cho **`menuButton`** và **`fpsBadge`** (khớp component trong `.vqeaf`).
- Chọn preset áp dụng luôn badge style; import `.vqeaf` vẫn restore đủ.
- Layer list ghi rõ `menuButton / fpsBadge`.

## V3.7.5 — Hiện ID component khi chọn

- Panel phải hiển thị **ID `.vqeaf`** của thành phần đang chọn (`phoneShell`, `screen`, `keyStyle_ok`, `menuButton`, `decoration_…`).
- Click phím trên keypad sẽ highlight đúng phím đó.

## V3.7.4 — Fix badge chồng + khung theo sheet Nokia

- Sửa lỗi **MENU / SHOT chồng nhau và đè FPS** ở đỉnh khung (badge-dock tách trái/phải, FPS strip nằm trong khung dưới dải WiFi).
- Cập nhật preview theo sheet sản phẩm classic: phím pill, D-pad OK lớn hơn, softkey `—`, Call/End kiểu ☎.
- Idle screen: status 4G VoLTE, đồng hồ, softkey `Menu` / `Contacts`.
- Nhãn T9: `1∞`, `0 _`, `#⇧` khớp sheet.

## V3.7.3 — Frame Nokia khớp VXPQeaf

- Cập nhật preview khung máy Classic theo `PortraitPhone` / `NokiaKeypad` / `ShotBadge` trong `D:\Program\android\VXPQeaf`.
- FPS chuyển từ badge nổi góc phải xuống **dải text dưới Network LED** bên trong khung (giống app).
- Badge góc phải đổi thành **Shot** (component `fpsBadge` trong `.vqeaf`, style vẫn chỉnh độc lập).
- Softkey dùng icon Menu / Back; nhãn T9 khớp `NokiaKeypad.kt` (`∞ abc def…`, `␣`, `⇧`).
- Scale khi nhấn phím `0.94` (trước `0.98`) cho khớp Compose `pressScale`.
- Bo góc badge Menu/Shot kiểu feature-phone (`16 4 16 16`).

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
