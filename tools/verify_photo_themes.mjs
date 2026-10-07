/**
 * Verify 3 theme "anh vao nut nhan" bang chinh parseVqeaf cua studio.
 *
 *   node tools/verify_photo_themes.mjs
 *
 * Kiem tra:
 *  - parseVqeaf khong nem loi, doc dung id/name/palette
 *  - keypad_background: co data-uri webp that (magic RIFF....WEBP), position=above,
 *    renderMode=per-key-texture
 *  - frame_background: KHONG co  -> chung minh "giu frame cu"
 *  - block <component id="phoneShell"> giong y nguyen theme khong co anh (tet.vqeaf)
 *  - du 19 keyStyle_* voi target dung
 */
import { readFileSync } from "fs";

const { parseVqeaf } = await import("../src/vqeaf.js");

const TARGETS = [
  "menu", "up", "rsk", "left", "ok", "right", "down",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#",
];

const THEMES = [
  { id: "spooky_vibes", name: "Spooky Vibes", keys: 19 },
  { id: "pika_arcade", name: "Pika Arcade", keys: 19 },
  { id: "pika_honey", name: "Pika Honey", keys: 19 },
];

const ref = readFileSync("themes/tet.vqeaf", "utf8");
const refShell = (ref.match(/<component\s+id="phoneShell"[\s\S]*?<\/component>/) || [])[0];

let fail = 0;
const ok = (cond, label) => {
  console.log((cond ? "OK   " : "FAIL ") + label);
  if (!cond) fail++;
};

/** Do sang tuong doi (0..1) cua mau #RRGGBB. */
function hexLuminance(hex) {
  const h = String(hex).replace("#", "");
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function webpInfo(dataUrl) {  const m = /^data:image\/webp;base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  const buf = Buffer.from(m[1], "base64");
  const riff = buf.subarray(0, 4).toString("ascii");
  const webp = buf.subarray(8, 12).toString("ascii");
  return { bytes: buf.length, riff, webp, valid: riff === "RIFF" && webp === "WEBP" };
}

for (const t of THEMES) {
  console.log(`\n=== ${t.id} ===`);
  const src = readFileSync(`themes/${t.id}.vqeaf`, "utf8");
  let s;
  try {
    s = parseVqeaf(src);
    ok(true, "parseVqeaf khong nem loi");
  } catch (err) {
    ok(false, `parseVqeaf nem loi: ${err.message}`);
    continue;
  }

  ok(s.themeId === t.id, `themeId = ${s.themeId}`);
  ok(s.themeName === t.name, `themeName = ${s.themeName}`);

  // --- anh di vao NUT ---
  const kb = webpInfo(s.keypadBackground?.dataUrl);
  ok(Boolean(kb && kb.valid), `keypad_background la webp that (${kb ? kb.bytes + " bytes" : "khong doc duoc"})`);
  ok(s.keypadBackground.position === "above", `keypad position = ${s.keypadBackground.position} (texture tren phim)`);
  ok(s.keypadBackground.renderMode === "per-key-texture", `renderMode = ${s.keypadBackground.renderMode}`);
  ok(s.keypadBackground.textureMode === "per-key", `textureMode = ${s.keypadBackground.textureMode}`);
  // V3.7.12: ha tu 0.50 -> 0.32 de keycap la VAT LIEU CHINH, anh chi la lop phu
  // MO (dung chu "faint texture" trong yeu cau). Qua cao la nut mat chat keycap;
  // qua thap la mat anh. Khoang 0.28-0.38 moi can bang duoc.
  ok(s.keypadBackground.opacity >= 0.28 && s.keypadBackground.opacity <= 0.38, `do dam texture (mo, de keycap noi) = ${s.keypadBackground.opacity}`);
  ok(s.keypadBackground.readabilityAssist !== false, `readabilityAssist = ${s.keypadBackground.readabilityAssist} (chu trang tren anh)`);
  ok(["normal", "overlay"].includes(s.keypadBackground.blend), `blend = ${s.keypadBackground.blend}`);
  // LCD cua studio luon ve chu sang (#c8d0d8 / #e8eef4) -> nen man hinh phai du toi
  const lum = hexLuminance(s.theme.screen);
  ok(lum < 0.35, `screen ${s.theme.screen} du toi cho chu LCD sang (luminance ${lum.toFixed(3)})`);

  // --- frame cu ---
  ok(s.frameBackground.dataUrl === null, "frame_background = null (khong dep anh len khung)");
  const shell = (src.match(/<component\s+id="phoneShell"[\s\S]*?<\/component>/) || [])[0];
  ok(Boolean(shell) && shell === refShell, "block phoneShell giong y nguyen theme khac (frame cu)");

  // --- nut ---
  const gotTargets = Object.keys(s.buttonStyles).sort();
  ok(gotTargets.length === t.keys, `so keyStyle = ${gotTargets.length}/${t.keys}`);
  const missing = TARGETS.filter((x) => !gotTargets.includes(x));
  ok(missing.length === 0, missing.length ? `thieu target: ${missing.join(",")}` : "du 19 target key");
  const badPreset = Object.values(s.buttonStyles).filter((v) => v.presetId === "custom");
  ok(badPreset.length === 0, `moi keyStyle co preset rieng (custom=${badPreset.length})`);

  // --- hinh dang nut (V3.7.9) ---
  const styles = Object.values(s.buttonStyles);
  const badShape = styles.filter((v) => v.shape !== "square");
  ok(badShape.length === 0, `moi nut dung kieu keycap vuong (sai=${badShape.length})`);
  const badBevel = styles.filter((v) => Number(v.bevel) !== 2);
  ok(badBevel.length === 0, `moi nut co vien noi 2dp (sai=${badBevel.length})`);
  ok(styles.every((v) => v.radius <= 6), `bo goc keycap <= 6dp (max=${Math.max(...styles.map((v) => v.radius))})`);
  ok(styles.every((v) => /^#[0-9A-Fa-f]{6}$/.test(v.bevelColor)), `co mau vien noi (vd ${styles[0].bevelColor})`);

  ok(s.menuStyle?.appearance === "solid", `menuButton.appearance = ${s.menuStyle?.appearance}`);
  ok(s.fpsStyle?.appearance === "glass", `fpsBadge.appearance = ${s.fpsStyle?.appearance}`);
  ok(s.layerOrder.includes("keypad") && s.layerOrder.includes("frameBackground"),
    `layerOrder = [${s.layerOrder.join(", ")}]`);
  ok(s.theme.keyText.startsWith("#"), `palette.keyText = ${s.theme.keyText}`);
}

// doi chieu voi duong import that: parseVqeaf -> serializeTheme -> parseVqeaf
console.log("\n=== round-trip serializeTheme ===");
const { serializeTheme } = await import("../src/vqeaf.js");
const parsed = parseVqeaf(readFileSync("themes/pika_arcade.vqeaf", "utf8"));
const round = parseVqeaf(serializeTheme(parsed));
ok(round.themeId === parsed.themeId, `round-trip giu themeId (${round.themeId})`);
ok(round.keypadBackground.dataUrl === parsed.keypadBackground.dataUrl, "round-trip giu nguyen data-uri texture");
ok(Object.keys(round.buttonStyles).length === 19, `round-trip giu 19 keyStyle (${Object.keys(round.buttonStyles).length})`);
const rOk = round.buttonStyles.ok;
ok(rOk.shape === "square" && Number(rOk.bevel) === 2, `round-trip giu hinh dang nut (shape=${rOk.shape} bevel=${rOk.bevel})`);

// --- presets.js: buttonPreset moi phai mang hinh dang keycap ---
console.log("\n=== buttonPresets keycap ===");
{
  const { buttonPresets } = await import("../src/presets.js");
  const mine = buttonPresets.filter((b) => /^(spooky|pika|honey)_/.test(b.id));
  ok(mine.length === 15, `co 15 buttonPreset moi (${mine.length})`);
  const noShape = mine.filter((b) => b.style.shape !== "square" || !(Number(b.style.bevel) > 0));
  ok(noShape.length === 0, noShape.length ? `thieu shape/bevel: ${noShape.map((b) => b.id).join(",")}` : "moi preset moi deu co shape + bevel");
}

// --- presets.js: preset moi phai tro toi buttonPreset co that ---
console.log("\n=== presets.js ===");
const { presets, buttonPresets } = await import("../src/presets.js");
const bpIds = new Set(buttonPresets.map((b) => b.id));
for (const t of THEMES) {
  const p = presets.find((x) => x.id === t.id);
  ok(Boolean(p), `co preset '${t.id}'`);
  if (!p) continue;
  ok(p.theme && typeof p.theme.key === "string", `preset ${t.id} co palette day du`);
  const refs = Object.values(p.buttonMap || {});
  const unknown = [...new Set(refs)].filter((r) => !bpIds.has(r));
  ok(unknown.length === 0, unknown.length ? `buttonMap tro sai: ${unknown.join(",")}` : `buttonMap ${refs.length} phim -> buttonPreset co that`);
  ok(Object.keys(p.buttonMap || {}).length === 19, `buttonMap du 19 phim`);
  ok(Boolean(p.menuStyle && p.fpsStyle), `co menuStyle + fpsStyle rieng`);
}

console.log(fail ? `\n${fail} CHECK FAILED` : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
