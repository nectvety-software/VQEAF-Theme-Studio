import { readFileSync } from "fs";

const js = readFileSync("src/app.js", "utf8");
const vqeaf = readFileSync("src/vqeaf.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");
const log = readFileSync("docs/CHANGELOG.md", "utf8");

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
  "js v=3.7.11": js.includes("3.7.11"),
  "html v=3.7.11": html.includes("3.7.11"),
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
};

let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? "OK " : "FAIL") + "  " + k);
  if (!v) fail++;
}
process.exit(fail ? 1 : 0);
