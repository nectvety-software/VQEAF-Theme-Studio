# SKILLS.md — Làm việc trên VQEAF Theme Studio

Quy ước cho **người và AI agent** khi sửa repo này.
**Đọc file này trước khi sửa code.** Scope sản phẩm ở `PROMPT.md`.

---

## Project at a glance

| | |
|--|--|
| Stack | HTML + CSS + ES modules thuần (**không build, không dependency**) |
| Entry | `index.html` → `src/app.js` |
| Module | `src/app.js`, `src/presets.js`, `src/vqeaf.js` |
| Format | VQEAF 1.0 (`.vqeaf`) — `docs/VQEAF_1_0_SPEC.md` |
| Theme mẫu | `themes/*.vqeaf` — **phải luôn đủ 64 file** |
| Chạy | nhấp đúp `rub.bat` |
| Cache-buster | `?v=<version>` ở `index.html` + 2 import đầu `src/app.js` |
| Version hiện tại | **3.7.11** |

---

## Skill: Quy ước format `.vqeaf`

**When:** đọc/ghi `.vqeaf`, sửa `src/vqeaf.js` hoặc `src/presets.js`.

- Ảnh nhúng: `<resource id="frame_background|keypad_background" type="image">` +
  data-uri; mime lấy từ chính data-uri. Ảnh nằm **trong file** dạng data-uri.
- Ảnh phủ **cả khung**: `phoneShell.background.source: @frame_background`.
- Ảnh vào **từng phím**: `keypad.background` → `position: "above"`,
  `renderMode: "per-key-texture"`, `textureMode: "per-key"`.
  (`perKey` trong `app.js` chỉ bật khi `position === 'above'`.)
- Nút riêng từng phím: `<component id="keyStyle_<id>" type="button-style">` + `target`.
- **19 key ID**: `menu`, `up`, `rsk`, `left`, `ok`, `right`, `down`, `1`–`9`, `*`, `0`, `#`.
  Riêng `*` → `keyStyle_star`, `#` → `keyStyle_pound` (xem `safeKeyId()`).
- Sửa `src/presets.js` hoặc `src/app.js` → **phải bump `?v=`** ở `index.html` và
  2 dòng import đầu `src/app.js`. Quên là trình duyệt phục vụ bản cache cũ.

---

## Skill: Hình dạng nút (shape + bevel)

**When:** thêm/sửa kiểu dáng nút — `KEY_SHAPE_DEFS`, `shapeRadius()`,
`keyBoxShadow()`, `keyClipPath()`, `keyFilter()`.

Bảng khai báo duy nhất là **`KEY_SHAPE_DEFS`** trong `src/app.js`; dropdown `<select>`
tự sinh từ bảng đó → **thêm kiểu mới chỉ cần thêm 1 dòng**.

10 kiểu hiện có:

| `shape.type` | Tên | Cách vẽ |
|---|---|---|
| `capsule` | Capsule | `border-radius` = thanh trượt (mặc định, giữ theme cũ) |
| `pill` | Tròn hết | `999px` |
| `square` | Vuông keycap | kẹp `≤ 6px` |
| `circle` | Tròn / bầu dục | `50%` |
| `rhombus` | Hình thoi | `clip-path` |
| `hexagon` `octagon` `triangle` `parallelogram` `star` | đa giác | `clip-path` |

**Đa giác phải dùng `clip-path: polygon(...)`** vì `border-radius` không làm được
hình thoi/lục giác. Ba hệ quả **BẮT BUỘC nhớ**:

1. `shapeRadius()` trả `'0px'` cho đa giác → thanh **"Bo góc" vô tác dụng**
   (đã ghi rõ trong dòng trợ giúp của panel).
2. Shadow/glow **ngoài** để trong `box-shadow` sẽ bị `clip-path` **cắt mất** →
   phải dùng `filter: drop-shadow()` (`keyFilter()`).
   👉 Cách này **an toàn** vì nền nút là **màu ĐẶC** (gradient hex 6 số): alpha = 1
   khắp hình, nên `drop-shadow` chỉ bám theo **silhouette** của hình đã cắt —
   **chữ và texture KHÔNG sinh bóng đôi**. Nếu nền nút mà trong suốt thì phải tránh.
3. `inset 0 0 0 1px` (viền trong mỏng) phải **bỏ** với đa giác — giữ lại sẽ bị cắt
   thành những đoạn gạch thừa ở mép hộp. Vẫn giữ 2 lớp bevel trên/dưới để có khối nổi.

- `clearKeyCustomStyle()` phải reset **cả `clipPath` và `filter`** — không thì style
  cũ dính lại khi đổi sang kiểu khác.
- Format `.vqeaf` **không đổi** khi thêm kiểu: `shape.type` là chuỗi tự do
  (serialize `q(...)`, parse `blockString(..., 'capsule')`), **không có whitelist**.

---

## Skill: Bẫy DOM — nút preview Button Builder trùng `data-key`

**When:** viết selector `.key[data-key=...]`, sửa `renderSelection()`,
`applyKeyStyles()`, hoặc viết test UI.

`renderButtonBuilderPreview()` đặt `preview.dataset.key = <keyId>`, và `#buttonBuilder`
(`index.html` ~dòng 111) đứng **TRƯỚC** `#keypad` (~dòng 181) trong DOM. Hệ quả:
`document.querySelector('.key[data-key="ok"]')` bắt trúng **nút preview**, không phải
phím thật (nút preview không có `.selectable` / `data-component`).

Bẫy này đã gây **2 bug thật**:

- `renderSelection()` tô `is-selected` vào nút preview → **bấm phím trên điện thoại
  không thấy phím nào sáng**.
- `applyKeyStyles()` style nút preview với `previewState='normal'`.

→ **Luôn scope `#keypad .key[data-key=...]`** cho phím thật. Nút preview do
`renderButtonBuilderPreview()` vẽ riêng (nó chạy cuối `renderButtonBuilder()` nên là
nguồn duy nhất, giữ đúng normal/pressed/disabled).

---

## Skill: Giới hạn của studio (đừng thiết kế theme vi phạm)

**When:** tạo theme mới, chọn `palette.screen`, đặt texture lên phím.

- **LCD idle luôn vẽ chữ SÁNG**, hardcode trong `styles.css`
  (`.screen-content #c8d0d8`, `.screen-clock #e8eef4`) → `palette.screen` **phải TỐI**.
  Đã có assert `luminance < 0.35` trong `tools/verify_photo_themes.mjs`.
  (Đã từng dính: `pika_honey` dùng kem `#FFF8E4` → LCD không đọc được, phải đổi sang
  `#241505`.)
- `.key::before` (texture): `background-size: cover`, `background-position: center`
  **theo từng phím** → mỗi phím hiện cùng một miếng giữa ảnh; `offsetX/offsetY` tính
  bằng **px của phím** (không phải px ảnh), quá ~±40px là hở nền.
- `.key::before` dùng `border-radius: calc(var(--keyRadius) - 1px)` chứ không theo
  `border-radius` inline — nhưng `.key` có `overflow:hidden` nên vẫn bị cắt đúng.

---

## Skill: Verify — không đoán

**When:** trước khi nói "xong".

```bash
node tools/check_frame_update.mjs     # gate tĩnh: version + tính năng phải còn
node tools/verify_photo_themes.mjs    # parse bằng parseVqeaf THẬT + round-trip
node tools/verify_key_shape_ui.mjs    # UI thật, Chrome headless (~47 assert)
```

- Cả 3 phải **PASS**. Hai tool UI cần server tĩnh ở `http://127.0.0.1:8099/`.
- Chụp ảnh để chứng minh (đừng mô tả suông):

```bash
node tools/shoot_theme_preview.mjs <themeId>   # → tools/shots/<id>.png (~80s/theme)
node tools/shoot_shape_gallery.mjs             # → crop từng nút, clip.scale=3
python tools/make_shape_sheet.py               # → bảng có nhãn shape_gallery.png
```

- Sinh lại 3 theme "ảnh vào nút": `python tools/gen_photo_bg_themes.py`
  (đọc `assets/*.jpg`, ghi `themes/*.vqeaf`).

### Mẹo khi viết test UI
- Phải scope `#keypad` (xem skill "Bẫy DOM" ở trên).
- Muốn nút màu đặc dễ nhìn hình: dùng **state mặc định của studio, KHÔNG import theme**.
- `capsule` với preset mặc định (`radius = 6`) trông **y hệt `square`** — muốn thấy
  khác phải kéo "Bo góc" lên ~14.
- Chụp crop một nút: padding ~12px, không thì `drop-shadow` bị cắt mất.
- Assert bằng CSS thật (`getComputedStyle().borderRadius / clipPath / filter`),
  đừng assert theo biến trong JS — biến đúng mà render sai vẫn là bug.

---

## Skill: Môi trường máy này (Windows)

**When:** chạy Chrome headless, gọi localhost, chạy server.

- Chrome: dùng `C:/Program Files/Google/Chrome/Application/chrome.exe`.
  **Chromium trong `ms-playwright/chromium-901522` là Chrome 93 → thiếu
  `structuredClone`, studio trắng trang.**
- Máy có `http_proxy=127.0.0.1:60018` → `curl`/Chrome gọi localhost phải
  `--noproxy '*'` / `--no-proxy-server --proxy-bypass-list=*`.
- Server phải chạy **`run_in_background`**, không thì bị kill khi hết lệnh bash.
- Node/Python: dùng bản managed
  (`C:/Users/doxuanhop/.workbuddy-ai/binaries/node/...`,
  `.../python/envs/default/Scripts/python.exe` — có Pillow).

---

## ⚠️ Skill: Repo này CÓ AUTO-COMMIT và nó từng XOÁ theme

**When:** luôn — trước và sau mỗi lần làm việc.

Commit tự động từng xuất hiện (`"themes"`, `"Create _dbg.mjs"`) và **xoá 20 file
`themes/*.vqeaf`** khỏi cả worktree lẫn HEAD (trước đó còn 1 đợt 12 file).

- Sau mỗi lần làm việc: `ls themes | wc -l` → **phải = 64**.
- Khôi phục: `git checkout <commit-tốt> -- themes/<file>.vqeaf`.
  Commit gốc tốt gần nhất trước sự cố: `e71d5dc`.
- **Đừng để file rác trong repo** — auto-commit sẽ đẩy thẳng lên `origin/main`.
  File nháp phải đặt tên `tools/_*` (đã có trong `.gitignore`).

---

## Skill: Git & push (repo PUBLIC)

**When:** commit, push, hoặc thêm file mới.

Repo `nectvety-software/VQEAF-Theme-Studio` là **PUBLIC** (`"private": false`).

- **Stage theo path cụ thể, KHÔNG `git add -A`** — `.workbuddy-ai/` là ghi chú làm
  việc của agent, không được lên public. Xác nhận bằng `git diff --cached --name-only`.
- `.gitignore` hiện có: `.workbuddy-ai/`, `tools/_*.mjs`, `tools/_*.py`, `tools/shots/_*`.
  Kiểm tra rule bằng `git check-ignore -v <path>`, đừng đoán.
- **Bẫy**: rule `.gitignore` **không áp dụng cho file đã tracked** — file đã lỡ commit
  phải `git rm --cached` mới bỏ được khỏi repo.
- Audit trước khi push (skill `repo-data-leak-guard`): secret value, `.env`, dump DB.
  Lưu ý **false positive**: base64 ảnh nhúng chứa chuỗi `eyJ…` — regex JWT thật phải
  có dấu chấm phân tách (`eyJ…\.eyJ…\.`).
- Verify push đã lên **thật**:
  ```bash
  git rev-parse HEAD origin/main     # phải in ra cùng 1 sha
  curl -s -o /dev/null -w "%{http_code}" \
    https://raw.githubusercontent.com/nectvety-software/VQEAF-Theme-Studio/main/<path>
  ```
  (`git ls-remote` / `fetch` hay bị treo — đừng phụ thuộc.)

---

## Skill: Thêm một kiểu dáng / preset / theme mới

**When:** mở rộng thư viện.

- **Kiểu dáng**: thêm 1 dòng vào `KEY_SHAPE_DEFS` (`src/app.js`). Đa giác thì cho
  `clip: 'polygon(...)'`; bo góc thì cho `radius` hoặc `cap`.
  Dropdown tự có; `keyClipPath` / `keyBoxShadow` / `keyFilter` tự xử lý.
  Nhớ bump `?v=` và thêm gate vào `tools/check_frame_update.mjs`.
- **Preset theme**: sửa `src/presets.js` (preset + buttonPreset + `buttonMap` 19 phím
  + `decorMap` + `menuStyle`/`fpsStyle`), thêm `themes/<id>.vqeaf`, bump `?v=`,
  thêm assert vào `tools/verify_photo_themes.mjs`.
- **Theme từ ảnh**: thêm spec vào `SPECS` trong `tools/gen_photo_bg_themes.py`
  (kèm file trong `assets/`), rồi chạy lại script.

---

## Skill: Claude / agent prompts (reusable)

### Feature work
```
Đọc PROMPT.md (scope) và SKILLS.md (kỹ thuật + bẫy) ở gốc repo trước.
Giữ source thuần HTML/CSS/JS, không thêm dependency.
Sửa xong: bump ?v= nếu đổi app.js/presets.js, rồi chạy 3 tool verify.
```

### Bugfix
```
Tái hiện trước bằng test UI thật (Chrome headless), không đoán.
Đọc mục "Bẫy DOM" — selector .key[data-key] rất dễ bắt nhầm nút preview.
```

### Theme / hình dạng nút
```
Sửa KEY_SHAPE_DEFS. Đa giác phải dùng clip-path + filter:drop-shadow().
Đừng để shadow ngoài trong box-shadow (bị clip-path cắt mất).
Chứng minh bằng tools/shoot_shape_gallery.mjs + tools/make_shape_sheet.py.
```

### Trước khi push
```
git status → stage theo path cụ thể, KHÔNG git add -A.
ls themes | wc -l phải = 64. Audit secret. Push.
Verify bằng git rev-parse HEAD origin/main.
```

---

## File map (quick)

```
index.html            # entry, cache-buster ?v=3.7.11
styles.css            # toàn bộ CSS (LCD chữ sáng hardcode ở đây)
rub.bat / run.bat     # launcher portable (tự tìm cổng 8080-8099)
server.ps1            # fallback khi máy không có Python
src/
  app.js              # editor chính: state, render, inspector, KEY_SHAPE_DEFS
  presets.js          # 64 preset theme + buttonPreset
  vqeaf.js            # serializeTheme / parseVqeaf
themes/               # 64 file .vqeaf   ← PHẢI LUÔN ĐỦ 64
assets/               # ảnh nguồn (input của gen_photo_bg_themes.py)
tools/
  gen_photo_bg_themes.py     # sinh 3 theme "ảnh vào nút"
  check_frame_update.mjs     # gate tĩnh: version + tính năng
  verify_photo_themes.mjs    # parse thật + round-trip
  verify_key_shape_ui.mjs    # test UI hình dạng nút
  shoot_theme_preview.mjs    # chụp preview theme
  shoot_shape_gallery.mjs    # chụp 10 hình dạng
  make_shape_sheet.py        # ghép bảng hình dạng có nhãn
  shots/                     # ảnh preview đã chụp
docs/
  README.md  CHANGELOG.md  VQEAF_1_0_SPEC.md  Nokia225_Keypad_Shell.md
  prompts/PROMPT_01..04      # prompt cho engine Android / tích hợp / button builder
PROMPT.md             # scope sản phẩm
SKILLS.md             # ← file này
```

---

## Definition of done

- [ ] `ls themes | wc -l` = **64** (auto-commit không xoá mất file nào)
- [ ] `node tools/check_frame_update.mjs` xanh
- [ ] `node tools/verify_photo_themes.mjs` PASS
- [ ] `node tools/verify_key_shape_ui.mjs` PASS (cần server `:8099`)
- [ ] Theme cũ vẫn render y như trước (tương thích ngược `shape`/`bevel`)
- [ ] `.vqeaf` export → new → import round-trip đủ 19 phím
- [ ] `?v=` đã bump nếu sửa `app.js` / `presets.js`
- [ ] Docs cập nhật nếu hành vi người dùng thay đổi
- [ ] Không có `tools/_*` hay `.workbuddy-ai/` bị stage
