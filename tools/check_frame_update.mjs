import { readFileSync, existsSync } from "fs";

const js = readFileSync("src/app.js", "utf8");
const vqeaf = readFileSync("src/vqeaf.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");
const log = readFileSync("docs/CHANGELOG.md", "utf8");
const prompt = readFileSync("PROMPT.md", "utf8");
const skills = readFileSync("SKILLS.md", "utf8");
const presets = readFileSync("src/presets.js", "utf8");
const exists = (p) => existsSync(p);

/** Tool nao mo studio trong trinh duyet that. */
const UI_TOOLS = [
  "tools/shoot_theme_preview.mjs",
  "tools/shoot_shape_gallery.mjs",
  "tools/verify_key_shape_ui.mjs",
  "tools/verify_pixel_icons_ui.mjs",
];
/** Noi dung file da bo comment — de ghi chu giai thich khong tu lam do gate. */
const codeOnly = (p) => readFileSync(p, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split(/\r?\n/).filter((l) => !/^\s*\/\//.test(l)).join("\n");

const checks = {
  "html badge-dock": html.includes("badge-dock"),
  "html menu-badge": html.includes("menu-badge"),
  "html shot-badge": html.includes("shot-badge"),
  "html fps-strip": html.includes("fps-strip"),
  "html screen-softkeys": html.includes("screen-softkeys"),
  "html icon-call/icon-end": html.includes("icon-call") && html.includes("icon-end"),
  "html key-pill": html.includes("key-pill"),
  "css badge-dock flex space-between": css.includes(".badge-dock") && css.includes("justify-content:space-between"),
  "css no absolute left/right on floating-badge alone": !css.includes(".menu-badge { left:-12px"),
  "css key-pill": css.includes(".key-pill"),
  "css icon-end": css.includes(".icon-end"),
  "js 0 underscore": js.includes("['0','_']"),
  "js v=3.7.13": js.includes("3.7.13"),
  "html v=3.7.13": html.includes("3.7.13"),
  "changelog 3.7.4": log.includes("V3.7.4"),
  // V3.7.10 — tùy chỉnh hình dạng nút (keycap) ở panel phải
  "js nhom 'Hình dạng nút'": js.includes("Hình dạng nút"),
  "js 3 kieu nut capsule/pill/square": js.includes("capsule") && js.includes("pill") && js.includes("square"),
  "js vien noi bevel": js.includes("bevelBlur") && js.includes("bevelColor"),
  "js scope '#keypad' khi chon phim": js.includes("#keypad .key[data-key="),
  "vqeaf serialize shape+bevel": vqeaf.includes("bevel") && vqeaf.includes("shape"),
  "changelog 3.7.10": log.includes("V3.7.10"),
  // V3.7.11 — thư viện hình dạng nút (đa giác bằng clip-path)
  "js KEY_SHAPE_DEFS": js.includes("KEY_SHAPE_DEFS"),
  "js 10 hinh dang": ["rhombus","hexagon","octagon","triangle","parallelogram","star","circle"].every(k=>js.includes(k)),
  "js clip-path cho da giac": js.includes("keyClipPath") && js.includes("polygon("),
  "js drop-shadow cho hinh bi clip": js.includes("keyFilter") && js.includes("drop-shadow("),
  "changelog 3.7.11": log.includes("V3.7.11"),
  // V3.7.12 — vật liệu "keycap bóng" (glossy keycap) theo mockup
  "css .key dung --capTop/--capMid/--capBot": css.includes("--capTop") && css.includes("--capMid") && css.includes("--capBot"),
  "css .key khong con vien keyBorder": /\.key \{[\s\S]*?border:1px solid transparent/.test(css),
  "css .key bevel inset": /\.key \{[\s\S]*?inset 0 2px 2px var\(--capHi/.test(css),
  "js keycapPalette + keycapButtonStyle": vqeaf.includes("keycapPalette") && vqeaf.includes("keycapButtonStyle"),
  "js KEYCAP_MAX_LUM (chu trang doc duoc)": vqeaf.includes("KEYCAP_MAX_LUM"),
  "js applyTheme set --cap*": js.includes("--capTop") && js.includes("--capSub"),
  "js nut 'Vật liệu keycap (theo theme)'": js.includes("Vật liệu keycap (theo theme)"),
  "js PNG export dung keycapPalette": js.includes("const cap = keycapPalette(t)") && js.includes("const capL = keycapPalette(t)"),
  "presets co entry keycap": presets.includes("id:'keycap'"),
  "tool gen_keycap_themes": exists("tools/gen_keycap_themes.mjs"),
  "tool verify_keycap_style": exists("tools/verify_keycap_style.mjs"),
  "changelog 3.7.12": log.includes("V3.7.12"),
  // V3.7.13 — bỏ hẳn emoji, toàn bộ icon là pixel art vẽ bằng VPEPixel
  "tool import_vpe_icons": exists("tools/import_vpe_icons.mjs"),
  "tool verify_pixel_icons": exists("tools/verify_pixel_icons.mjs"),
  "tool restore_key_decorations": exists("tools/restore_key_decorations.mjs"),
  "src/icons.js la data-URI PNG": exists("src/icons.js") && readFileSync("src/icons.js", "utf8").includes("data:image/png;base64,"),
  "js import icons.js": js.includes("from './icons.js?"),
  "js GLYPH_ICON (glyph -> ten icon)": js.includes("const GLYPH_ICON = {"),
  "js hydrateIcons + preloadIcons": js.includes("function hydrateIcons(") && js.includes("function preloadIcons("),
  "js drawTintedIcon cho canvas": js.includes("function drawTintedIcon("),
  "js await preloadIcons truoc khi ve PNG": js.includes("await preloadIcons()"),
  "vqeaf decorationResource (bo vectorFor)": vqeaf.includes("function decorationResource(") && !vqeaf.includes("function vectorFor("),
  "vqeaf import icons.js": vqeaf.includes("from './icons.js'"),
  "css image-rendering pixelated": css.includes("image-rendering: pixelated"),
  "css .icon-glyph + .icon-tinted": css.includes(".icon-glyph") && css.includes(".icon-tinted"),
  "css .icon-picker cho chon trang tri": css.includes(".icon-picker"),
  "presets icon la ten icon (khong emoji)": presets.includes("icon:'pumpkin'") && presets.includes("['none','Không']"),
  "html data-icon placeholder": html.includes('data-icon="dice"'),
  "html data-glyph placeholder": html.includes('data-glyph="tri_up"'),
  "changelog 3.7.13": log.includes("V3.7.13"),
  // Tool UI phai dung Chrome THAT. Chromium trong ms-playwright (chromium-901522)
  // la Chrome 93 -> thieu structuredClone -> app.js nem ReferenceError trong
  // freshState() va studio ra TRANG TRANG; tool timeout o "preset grid" chu khong
  // bao loi ro rang (rat kho doan nguyen nhan).
  // Bo comment truoc khi kiem: chinh ghi chu giai thich loi lai nhac ten ban
  // chromium hong, khong duoc de no tu lam do gate.
  "tool UI khong dung chromium-901522": UI_TOOLS.every((f) => !codeOnly(f).includes("chromium-901522")),
  "tool UI tro toi Chrome that": UI_TOOLS.every((f) => codeOnly(f).includes("Google/Chrome/Application/chrome.exe")),
  "tool verify_pixel_icons_ui": exists("tools/verify_pixel_icons_ui.mjs"),
  // PROMPT.md + SKILLS.md ở gốc repo (quy ước mọi project)
  "PROMPT.md ton tai + co version": prompt.includes("V3.7.12") && prompt.includes("Ràng buộc cứng"),
  "PROMPT.md co keycap": prompt.includes("keycap"),
  "SKILLS.md ton tai": skills.includes("Definition of done"),
  "SKILLS.md co bay DOM data-key": skills.includes("#keypad .key[data-key="),
  "SKILLS.md co canh bao auto-commit": skills.includes("AUTO-COMMIT"),
  "SKILLS.md co luat clip-path + drop-shadow": skills.includes("clip-path") && skills.includes("drop-shadow"),
  "SKILLS.md co luat keycap + CRLF": skills.includes("keycap") && skills.includes("CRLF"),
  "SKILLS.md co luat git add -A": skills.includes("KHÔNG `git add -A`"),
};

let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? "OK " : "FAIL") + "  " + k);
  if (!v) fail++;
}
process.exit(fail ? 1 : 0);
