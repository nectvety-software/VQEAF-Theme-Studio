#!/usr/bin/env node
/**
 * V3.7.13 — Kiem tra bo icon pixel art (VPEPixel) da thay het emoji/glyph chua.
 *
 * Vi sao can:
 *   Yeu cau la "khong dung emoji, ve bang VPEPixel". Mot khi da thay xong thi
 *   phai co cach CHUNG MINH no van con sach — neu khong, chi can them mot nut moi
 *   voi emoji la moi thu am tham quay lai. Script nay kiem 3 nhom:
 *
 *   1. Nguon icon: src/icons.js dong bo voi PNG trong Documents/VPE Pixel.
 *   2. Phu song: moi ten trang tri dung trong themes/*.vqeaf deu co icon.
 *   3. Het glyph: index.html / presets.js / styles.css khong con glyph nao;
 *      app.js chi con glyph o nhung cho la KHOA tra cuu cua GLYPH_ICON
 *      (glyph -> ten icon), tuc la khong con glyph nao duoc render thang.
 *
 *   node tools/verify_pixel_icons.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log(`OK   ${msg}`); } else { fail++; console.log(`FAIL ${msg}`); } };
const head = (t) => console.log(`\n=== ${t} ===`);

// Emoji + glyph hinh hoc tung duoc dung lam icon.
const GLYPH_RE = /[\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u{1F000}-\u{1FAFF}]/gu;

/** Bo comment de khong bat nham glyph trong ghi chu. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .filter((l) => !/^\s*\/\//.test(l))
    .join('\n');
}

const read = (p) => readFileSync(p, 'utf8');

// ---------------------------------------------------------------- 1. nguon icon
head('1. src/icons.js dong bo voi bo PNG cua VPEPixel');

const ICONS = await import('../src/icons.js');
const names = ICONS.ICON_NAMES;

ok(names.length === 46, `co ${names.length} icon (ky vong 46)`);
ok(ICONS.ICON_SIZE === 12, `ICON_SIZE = ${ICONS.ICON_SIZE} (ky vong 12)`);
ok(names.every((n) => ICONS.ICONS[n].startsWith('data:image/png;base64,')), 'moi icon la data-URI PNG base64');
ok(names.every((n) => ICONS.ICONS[n].length > 80), 'khong co data-URI rong');
ok(names.every((n) => /^[a-z0-9_]+$/.test(n)), 'ten icon chi gom [a-z0-9_]');

// Sinh lai roi so sanh NOI DUNG: file khac di nghia la ai do sua tay hoac PNG da doi.
// (Khong spawn node con: tren may nay spawn chinh node.exe bi EBUSY. Import thang
//  logic thuan cua import_vpe_icons.mjs vua khong dung subprocess vua manh hon —
//  no so sanh chuoi sinh ra, chu khong chi chay lai script roi doc file.)
const gen = await import('../tools/import_vpe_icons.mjs');
try {
  const regenerated = gen.render(gen.build());
  ok(read('src/icons.js') === regenerated, 'src/icons.js khop chinh xac voi PNG hien tai (khong bi sua tay)');
} catch (err) {
  ok(false, `import_vpe_icons.mjs build duoc tu PNG (${String(err.message).split('\n')[0]})`);
}

// ------------------------------------------------------------- 2. phu song ten
head('2. Moi ten trang tri dung trong themes/*.vqeaf deu co icon');

// Cat theo TUNG KHOI <component id="keyStyle_*"> truoc roi moi tim decoration.
// (Regex quet toan file se lan sang khoi ke tiep khi mot khoi KHONG co
//  decoration — dung loi nay da tung lam toi doc sai con so 119/165.)
const BLOCK_RE = /<component id="keyStyle_([A-Za-z0-9_]+)" type="button-style">([\s\S]*?)<\/component>/g;
const DECOR_RE = /decoration\s*\{\s*left:\s*"([^"]*)"\s+right:\s*"([^"]*)"\s*\}/;

const used = new Map();       // ten -> so slot dung
const themeFiles = readdirSync('themes').filter((f) => f.endsWith('.vqeaf'));
let blocks = 0, blocksWithDecor = 0, decorFiles = 0;

for (const f of themeFiles) {
  const src = read(`themes/${f}`);
  let local = 0;
  for (const m of src.matchAll(BLOCK_RE)) {
    blocks++;
    const d = m[2].match(DECOR_RE);
    if (!d) continue;
    const vals = [d[1], d[2]].filter((v) => v && v !== 'none');
    if (vals.length) blocksWithDecor++;
    for (const v of vals) { used.set(v, (used.get(v) || 0) + 1); local++; }
  }
  if (local) decorFiles++;
}

const totalDecor = [...used.values()].reduce((a, b) => a + b, 0);
const unknown = [...used.keys()].filter((n) => !ICONS.ICONS[n]);
ok(unknown.length === 0, `moi ten trang tri deu co icon (${used.size} ten, dung ${totalDecor} slot)`);
if (unknown.length) console.log(`     thieu icon: ${unknown.join(', ')}`);

// Trang tri phim phai thuoc nhom "decoration" cua bo icon — dung nham icon
// thanh cong cu (vd 'undo') lam trang tri phim la loi tham my, khong phai loi du lieu.
const notDecorationGroup = [...used.keys()].filter((n) => !ICONS.DECORATION_ICONS.includes(n));
ok(notDecorationGroup.length === 0, `moi trang tri phim thuoc nhom DECORATION_ICONS${notDecorationGroup.length ? ` (sai: ${notDecorationGroup.join(', ')})` : ''}`);

// Guard chong tai nan mat du lieu V3.7.12: gen_keycap_themes.mjs xoa sach
// decoration cua 266 khoi keyStyle_* vi keycapButtonStyle() khong tra ve
// decorLeft/decorRight. Cac so duoi day lay tu ban backup ngay truoc su co va
// da duoc doi chieu lai tung khoi mot. Sua theme co y do -> cap nhat bang nay.
const EXPECT_DECOR = { cloud: 7, flower: 26, gem: 3, leaf: 21, sparkle: 18, star: 90 };
const EXPECT_BLOCKS = 266, EXPECT_WITH_DECOR = 119, EXPECT_DECOR_FILES = 8;

const decorMismatch = Object.keys(EXPECT_DECOR).filter((k) => (used.get(k) || 0) !== EXPECT_DECOR[k])
  .concat([...used.keys()].filter((k) => !(k in EXPECT_DECOR)));
ok(decorMismatch.length === 0, `phan bo trang tri khop backup (${Object.entries(EXPECT_DECOR).map(([k, v]) => `${k}=${v}`).join(' ')})${decorMismatch.length ? ` — lech: ${decorMismatch.join(', ')}` : ''}`);
ok(totalDecor === 165, `tong slot trang tri khac "none" = ${totalDecor} (ky vong 165 — bang backup)`);
ok(blocksWithDecor === EXPECT_WITH_DECOR, `so khoi keyStyle_* co trang tri = ${blocksWithDecor} (ky vong ${EXPECT_WITH_DECOR})`);
ok(decorFiles === EXPECT_DECOR_FILES, `so theme co trang tri phim = ${decorFiles} (ky vong ${EXPECT_DECOR_FILES})`);
ok(blocks === EXPECT_BLOCKS, `tong so khoi keyStyle_* = ${blocks} (ky vong ${EXPECT_BLOCKS})`);
ok(themeFiles.length === 66, `co ${themeFiles.length} theme (ky vong 66)`);

// ------------------------------------------------------------- 3. het glyph
head('3. Khong con emoji/glyph duoc render');

for (const f of ['index.html', 'src/presets.js', 'styles.css']) {
  const hits = stripComments(read(f)).match(GLYPH_RE);
  ok(!hits, `${f}: khong con glyph nao${hits ? ` (con ${[...new Set(hits)].join(' ')})` : ''}`);
}

// app.js: glyph chi duoc phep la KHOA trong GLYPH_ICON.
const appCode = stripComments(read('src/app.js'));
const glyphKeys = new Set(
  [...(appCode.match(/const GLYPH_ICON = \{[\s\S]*?\};/)?.[0] || '').matchAll(/'([^']+)':\s*'/g)].map((m) => m[1])
);
ok(glyphKeys.size >= 10, `GLYPH_ICON co ${glyphKeys.size} khoa glyph -> ten icon`);
const appGlyphs = [...new Set(appCode.match(GLYPH_RE) || [])];
const stray = appGlyphs.filter((g) => !glyphKeys.has(g));
ok(stray.length === 0, `app.js: moi glyph con lai deu nam trong GLYPH_ICON${stray.length ? ` (la: ${stray.join(' ')})` : ''}`);
ok(appGlyphs.length > 0, `app.js con ${appGlyphs.length} glyph lam khoa tra cuu (dung y do)`);

// Cac bang du lieu phai di qua dung ham giai ma, khong tu render.
head('4. Moi cho render deu di qua ham giai ma icon');
ok(/function labelHtml\(/.test(appCode), 'co labelHtml() (glyph -> icon hoac chu)');
ok(/function keyLabelHtml\(/.test(appCode), 'co keyLabelHtml()');
ok(/function iconHtml\(/.test(appCode), 'co iconHtml()');
ok(/function glyphIconHtml\(/.test(appCode), 'co glyphIconHtml()');
ok(/function hydrateIcons\(/.test(appCode), 'co hydrateIcons() cho cho <i data-icon> trong index.html');
ok(/function drawTintedIcon\(/.test(appCode), 'co drawTintedIcon() cho canvas export');
ok(/function preloadIcons\(/.test(appCode), 'co preloadIcons() (khong thi PNG xuat ra thieu hinh)');
ok(/await preloadIcons\(\)/.test(appCode), 'renderNokiaFramePng() await preloadIcons() truoc khi ve');
ok(/hydrateIcons\(\);/.test(appCode), 'init() goi hydrateIcons()');
ok(/iconHtml\(meta\.icon\)|glyphIconHtml\(meta\.icon\)/.test(appCode), 'LAYER_META dung icon thay glyph');
ok(/drawKeyText\(/.test(appCode), 'canvas ve nhan phim qua drawKeyText()');

// LAYER_META / draggableComponents / buttonDecorations / GLYPH_ICON phai tro toi
// icon co that, neu khong se ra o trong.
const refs = new Set();
for (const m of read('src/app.js').matchAll(/icon:\s*'([a-z0-9_]+)'/g)) refs.add(m[1]);
for (const m of read('src/presets.js').matchAll(/icon:\s*'([a-z0-9_]+)'/g)) refs.add(m[1]);
for (const m of read('src/presets.js').matchAll(/\['([a-z]+)',\s*'[^']*'\]/g)) refs.add(m[1]);
for (const m of (read('src/app.js').match(/const GLYPH_ICON = \{[\s\S]*?\};/)?.[0] || '').matchAll(/:\s*'([a-z0-9_]+)'/g)) refs.add(m[1]);
const dangling = [...refs].filter((n) => n !== 'none' && !ICONS.ICONS[n]);
ok(dangling.length === 0, `moi tham chieu icon trong app.js/presets.js deu ton tai${dangling.length ? ` (thieu: ${dangling.join(', ')})` : ''}`);

// ------------------------------------------------- 5. export dung pixel art
head('5. serializeTheme xuat pixel art (khong con vector viet tay)');

const vqeafSrc = read('src/vqeaf.js');
ok(/from '\.\/icons\.js'/.test(vqeafSrc), 'vqeaf.js import tu icons.js');
ok(/function decorationResource\(/.test(vqeafSrc), 'co decorationResource()');
ok(!/function vectorFor\(/.test(vqeafSrc), 'da bo vectorFor() voi 13 path SVG viet tay');
ok(!/FF7A18|FFD45A|6EDB91|50DCC8/.test(vqeafSrc), 'khong con mau hardcode cua vector cu');

const { serializeTheme, parseVqeaf } = await import('../src/vqeaf.js');
const { presets } = await import('../src/presets.js');
const st = {
  themeId: 't', themeName: 'T', theme: presets[1],
  decorations: [{ id: 'a', type: 'pumpkin', x: 1, y: 2, size: 40, rotation: 0, opacity: 1,
    color: '#FF7A18', flipX: false, flipY: false, floating: false, zIndex: 0 }],
  keypadBackground: {}, frameBackground: {}, effects: {}, menuStyle: {}, fpsStyle: {},
  buttonStyles: {}, layerOrder: [],
};
const out = serializeTheme(st);
ok(/<resource id="pumpkin" type="image">[\s\S]*?data: "data:image\/png;base64,/.test(out), 'trang tri xuat ra <resource type="image"> + data-URI PNG');
ok(/icon \{ source: @pumpkin size: 40dp tint: "#FF7A18" \}/.test(out), 'giu nguyen dong icon { source size tint }');
const back = parseVqeaf(out);
ok(back.decorations.length === 1 && back.decorations[0].type === 'pumpkin', 'round-trip giu nguyen trang tri');

console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : 'CO LOI'} — ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
