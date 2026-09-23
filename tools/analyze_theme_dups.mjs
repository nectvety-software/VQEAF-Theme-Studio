import { readFileSync, readdirSync } from "fs";

const { presets } = await import("../src/presets.js");

const keyCols = [
  "shellTop",
  "shellBottom",
  "shellBorder",
  "screen",
  "key",
  "keyPressed",
  "keyBorder",
  "keyText",
  "sub",
  "accent",
  "glow",
];

console.log("=== exact / near palette dups ===");
for (let i = 0; i < presets.length; i++) {
  for (let j = i + 1; j < presets.length; j++) {
    const a = presets[i].theme;
    const b = presets[j].theme;
    const match = keyCols.filter((k) => a[k] === b[k]).length;
    const sameButtons = JSON.stringify(presets[i].buttonMap || null) === JSON.stringify(presets[j].buttonMap || null);
    if (match >= 7 || (match >= 5 && sameButtons) || sameButtons) {
      console.log(
        `${presets[i].id} <-> ${presets[j].id}  colorMatch=${match}/11  sameButtonMap=${sameButtons}`
      );
    }
  }
}

console.log("\n=== theme files vs presets ===");
const files = readdirSync("themes").filter((f) => f.endsWith(".vqeaf"));
const ids = new Set(presets.map((p) => p.id));
for (const f of files) {
  const stem = f.replace(/\.vqeaf$/, "");
  const src = readFileSync(`themes/${f}`, "utf8");
  const tid = (src.match(/<theme\s+id="([^"]+)"/) || [])[1];
  const name = (src.match(/<theme[^>]*\sname="([^"]+)"/) || [])[1];
  const hasBg = /frame_background|keypad_background/.test(src);
  const nKeys = (src.match(/type="button-style"/g) || []).length;
  const orphanFile = !ids.has(stem);
  const idMismatch = tid && tid !== stem;
  if (orphanFile || idMismatch || nKeys === 0) {
    console.log(
      `${f} | id=${tid} | name=${name} | preset=${ids.has(stem)} | keys=${nKeys} | bg=${hasBg}${orphanFile ? " | NO_PRESET" : ""}${idMismatch ? " | ID_MISMATCH" : ""}`
    );
  }
}

console.log("\n=== preset without theme file ===");
const stems = new Set(files.map((f) => f.replace(/\.vqeaf$/, "")));
for (const p of presets) {
  if (!stems.has(p.id)) console.log("missing file:", p.id);
}
