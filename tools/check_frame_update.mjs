import { readFileSync } from "fs";

const js = readFileSync("src/app.js", "utf8");
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
  "js v=3.7.4": js.includes("3.7.4"),
  "html v=3.7.4": html.includes("3.7.4"),
  "changelog 3.7.4": log.includes("V3.7.4"),
};

let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? "OK " : "FAIL") + "  " + k);
  if (!v) fail++;
}
process.exit(fail ? 1 : 0);
