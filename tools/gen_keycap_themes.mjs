#!/usr/bin/env node
/**
 * V3.7.12 — Sinh lai toan bo khoi `keyStyle_*` trong themes/*.vqeaf theo vat lieu
 * "keycap bong" (glossy keycap) giong mockup Spooky Vibes.
 *
 * Vi sao can script nay:
 *   - 52/66 theme chi co `palette` -> da tu dong mang phong cach keycap nho CSS
 *     (.key + --cap* trong applyTheme). Khong can dung toi file.
 *   - 14 theme CON `keyStyle_*` -> cac khoi nay hardcode gradient/vien rieng nen
 *     se DE len CSS, phai sinh lai thi moi khop anh.
 *
 * Mau KHONG hardcode: lay tu `keycapButtonStyle()` (nguon su that duy nhat o
 * src/vqeaf.js) => nut an khop voi chinh palette cua tung theme.
 *
 * An toan: chi thay the dung khoi <component id="keyStyle_..." type="button-style">
 * ...</component>; phan con lai cua file giu nguyen tung byte.
 *
 *   node tools/gen_keycap_themes.mjs           # ghi that
 *   node tools/gen_keycap_themes.mjs --dry     # chi in ra thay doi
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { keycapButtonStyle, buttonStyleComponent, safeKeyId, isKeycapStyle } from '../src/vqeaf.js';

const DRY = process.argv.includes('--dry');
const THEME_DIR = 'themes';

/** Doc palette {shellBottom,key,accent,...} tu text .vqeaf (khong can parse ca file). */
function readPalette(src) {
  const block = src.match(/palette\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  const g = (name, fb) => block.match(new RegExp(`${name}\\s*:\\s*"(#[0-9A-Fa-f]{3,8})"`))?.[1] || fb;
  return {
    shellTop: g('shellTop', '#20202C'),
    shellBottom: g('shellBottom', '#101018'),
    shellBorder: g('shellBorder', '#404050'),
    screen: g('screen', '#000000'),
    key: g('key', '#20202C'),
    keyPressed: g('keyPressed', '#303040'),
    keyBorder: g('keyBorder', '#404050'),
    keyText: g('keyText', '#FFFFFF'),
    sub: g('subText', '#CCCCCC'),
    accent: g('accent', '#FFFFFF'),
    glow: g('glow', '#000000'),
  };
}

const KEY_STYLE_RE = /<component\s+id="keyStyle_[^"]+"\s+type="button-style">[\s\S]*?<\/component>/g;

const files = readdirSync(THEME_DIR).filter(f => f.endsWith('.vqeaf')).sort();
const decorBefore = files.reduce((n, file) => {
  const src = readFileSync(`${THEME_DIR}/${file}`, 'utf8');
  for (const m of src.matchAll(/decoration\s*\{\s*left:\s*"([^"]*)"\s+right:\s*"([^"]*)"\s*\}/g)) {
    if (m[1] !== 'none') n++;
    if (m[2] !== 'none') n++;
  }
  return n;
}, 0);
let touchedFiles = 0, touchedBlocks = 0, skipped = 0;

for (const file of files) {
  const path = `${THEME_DIR}/${file}`;
  const src = readFileSync(path, 'utf8');
  if (!src.includes('keyStyle_')) { skipped++; continue; }

  const palette = readPalette(src);
  const baseStyle = keycapButtonStyle(palette);
  // File trong repo dung LAN LON CRLF (spooky_vibes) va LF (pixel_tide).
  // buttonStyleComponent() sinh chuoi bang '\n', nen phai ep ve dung kieu cua
  // tung file, neu khong se tron 2 kieu xuong dong trong cung 1 file.
  const eol = src.includes('\r\n') ? '\r\n' : '\n';

  let n = 0;
  const out = src.replace(KEY_STYLE_RE, (block) => {
    const target = block.match(/target\s*:\s*"([^"]+)"/)?.[1] || 'ok';
    // Giu nguyen preset/shape dac thu cua theme? Khong — yeu cau la "nut nhu
    // hinh" cho TOAN BO theme, nen dong bo vat lieu keycap.
    const style = { ...baseStyle };
    // QUAN TRONG: `keycapButtonStyle()` khong tra ve decorLeft/decorRight, nen
    // `buttonStyleComponent()` se ghi mac dinh "none" cho ca hai ben. Lan chay
    // V3.7.12 dau tien da XOA 119 trang tri tren phim (star/flower/leaf/cloud/
    // gem/sparkle) vi ly do nay. Phai doc lai trang tri CU trong khoi roi truyen
    // vao style, neu khong moi lan chay lai la mot lan mat du lieu.
    const deco = block.match(/decoration\s*\{\s*left:\s*"([^"]*)"\s+right:\s*"([^"]*)"\s*\}/);
    if (deco) { style.decorLeft = deco[1]; style.decorRight = deco[2]; }
    // buttonStyleComponent() tra ve chuoi da thut le 4 space o dong dau (dung
    // khi ghep vao serializeTheme). O day dau dong da co san 4 space trong file
    // nen phai bo 4 space dau tien, neu khong se thanh 8.
    let next = buttonStyleComponent(target, style).replace(/^ {4}/, '');
    if (eol === '\r\n') next = next.replace(/\n/g, '\r\n');
    if (next !== block) n++;
    return next;
  });

  if (n === 0) { console.log(`  = ${file}: khong doi`); continue; }
  touchedFiles++; touchedBlocks += n;
  console.log(`  ${DRY ? '~' : '+'} ${file}: ${n} khoi keyStyle_* -> keycap`);
  if (!DRY) writeFileSync(path, out, 'utf8');
}

const DECOR_RE = /decoration\s*\{\s*left:\s*"([^"]*)"\s+right:\s*"([^"]*)"\s*\}/g;
const countDecorations = (dir) =>
  files.reduce((n, file) => {
    const src = readFileSync(`${dir}/${file}`, 'utf8');
    for (const m of src.matchAll(DECOR_RE)) {
      if (m[1] !== 'none') n++;
      if (m[2] !== 'none') n++;
    }
    return n;
  }, 0);

console.log(`\n${DRY ? '[DRY] ' : ''}${touchedFiles} file / ${touchedBlocks} khoi keyStyle_* da doi; ${skipped} theme palette-only bo qua.`);
if (!DRY) {
  // Tu kiem: moi khoi keyStyle_* con lai phai dung vat lieu keycap.
  let bad = 0, total = 0;
  for (const file of files) {
    const src = readFileSync(`${THEME_DIR}/${file}`, 'utf8');
    for (const m of src.matchAll(KEY_STYLE_RE)) {
      total++;
      const width = m[0].match(/stroke\s*\{[^}]*width\s*:\s*([0-9.]+)dp/)?.[1];
      const bevel = m[0].match(/bevel\s*\{/);
      if (width !== '0' || !bevel) bad++;
    }
  }
  console.log(`self-check: ${total} khoi keyStyle_*, sai chuan = ${bad}`);
  if (bad > 0) { console.error('FAIL: con khoi khong dung vat lieu keycap'); process.exit(1); }

  // Tu kiem 2: khong duoc mat trang tri phim. Day chinh la loi cua lan chay
  // V3.7.12 — script ghi de `decoration { left/right }` thanh "none" va xoa 119
  // trang tri ma khong he bao loi. Dem lai va doi chieu voi ban goc.
  const after = countDecorations(THEME_DIR);
  console.log(`self-check: trang tri phim khac "none" = ${after} (truoc khi chay: ${decorBefore})`);
  if (after < decorBefore) {
    console.error(`FAIL: mat ${decorBefore - after} trang tri phim — script phai giu nguyen decoration cua khoi cu`);
    process.exit(1);
  }
}
