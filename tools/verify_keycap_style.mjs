#!/usr/bin/env node
/**
 * V3.7.12 — Kiem chung vat lieu "keycap bong" tren TOAN BO themes/*.vqeaf.
 *
 * Khong doan: dung parseVqeaf THAT de doc tung theme, va dung chinh
 * keycapButtonStyle()/keycapPalette() de tinh gia tri ky vong. Neu 2 ben lech
 * nhau => fail.
 *
 *   node tools/verify_keycap_style.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import {
  parseVqeaf, serializeTheme, keycapPalette, keycapButtonStyle, relLum, isKeycapStyle,
} from '../src/vqeaf.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('OK   ' + msg); } else { fail++; console.log('FAIL ' + msg); } };
const head = (s) => console.log(`\n=== ${s} ===`);

const files = readdirSync('themes').filter(f => f.endsWith('.vqeaf')).sort();
const CSS = readFileSync('styles.css', 'utf8');
const PRESETS = readFileSync('src/presets.js', 'utf8');
const VQEAF_SRC = readFileSync('src/vqeaf.js', 'utf8');
const APP_SRC = readFileSync('src/app.js', 'utf8');

head('1. CSS: .key dung vat lieu keycap');
{
  const keyBlock = CSS.match(/\n\.key \{([\s\S]*?)\n\}/)?.[1] || '';
  ok(keyBlock.length > 0, 'tim thay khoi .key trong styles.css');
  ok(/var\(--capTop/.test(keyBlock), '.key dung gradient --capTop/--capMid/--capBot');
  ok(/var\(--capMid/.test(keyBlock) && /var\(--capBot/.test(keyBlock), '.key co du 3 diem dung gradient');
  ok(!/border:1px solid var\(--keyBorder\)/.test(keyBlock), '.key KHONG con vien mau keyBorder (mockup khong vien)');
  ok(/border:1px solid transparent/.test(keyBlock), '.key giu 1px trong suot de khong lech layout');
  ok(/color:#FFFFFF/.test(keyBlock), '.key chu trang');
  ok(/inset 0 2px 2px var\(--capHi/.test(keyBlock), '.key co bevel highlight mat tren');
  ok(/inset 0 -2px 3px #0000008A/.test(keyBlock), '.key co bevel bong mat day');
  ok(!/var\(--glow\)/.test(keyBlock), '.key khong con glow ngoai (giong mockup)');
  const sub = CSS.match(/\.key \.sub \{[^}]*\}/)?.[0] || '';
  ok(/var\(--capSub/.test(sub), 'nhan phu .key .sub dung mau sang --capSub');
  const pressed = CSS.match(/\.phone-shell\.force-pressed \.key,\.key:active \{([\s\S]*?)\n\}/)?.[1] || '';
  ok(/--capBot/.test(pressed) && /--capMid/.test(pressed), 'trang thai nhan cung dung gradient keycap');
  ok(/inset 0 2px 5px/.test(pressed), 'trang thai nhan lun xuong (inset shadow)');
}

head('2. app.js: dat bien --cap* tu palette');
{
  ok(/keycapPalette\(t\)/.test(APP_SRC), 'applyTheme() goi keycapPalette(theme)');
  for (const v of ['--capTop', '--capMid', '--capBot', '--capHi', '--capEdge', '--capSub']) {
    ok(APP_SRC.includes(`'${v}'`), `applyTheme() set ${v}`);
  }
  // Khong ghim so version: cache-buster doi moi lan bump, ghim vao day chi lam
  // test do oan. Chi can dung module + co tham so ?v= la du.
  ok(/import \{[^}]*keycapPalette[^}]*\} from '\.\/vqeaf\.js\?v=[\d.]+'/.test(APP_SRC), 'app.js import keycapPalette tu vqeaf.js (co cache-buster)');
  ok(/function applyKeycapMaterial/.test(APP_SRC), 'co applyKeycapMaterial() de ap vat lieu keycap');
  ok(/id='applyKeycapAll'/.test(APP_SRC), 'panel phai co nut "Vat lieu keycap (theo theme)"');
}

head('3. PNG export dung cung vat lieu (khong lech voi studio)');
{
  ok(/const cap = keycapPalette\(t\)/.test(APP_SRC), 'drawPortraitContent dung keycapPalette');
  ok(/const capL = keycapPalette\(t\)/.test(APP_SRC), 'drawLandscapeContent dung keycapPalette');
  ok(/s\.colorA \|\| cap\.top/.test(APP_SRC), 'fallback gradient lay tu keycap (khong phai t.key)');
  ok(/s\.text \|\| '#FFFFFF'/.test(APP_SRC), 'chu nut mac dinh trang trong export');
  ok(!/ctx\.strokeStyle = s\.border \|\| t\.keyBorder/.test(APP_SRC), 'export khong con ve vien keyBorder');
}

head('4. presets.js: co preset keycap');
{
  ok(/id:'keycap'/.test(PRESETS), "buttonPresets co entry id 'keycap'");
  ok(/shape:'square'/.test(PRESETS.match(/id:'keycap'[\s\S]{0,700}/)?.[0] || ''), 'preset keycap dung hinh vuong');
  ok(/borderWidth:0/.test(PRESETS.match(/id:'keycap'[\s\S]{0,700}/)?.[0] || ''), 'preset keycap khong vien');
}

head('5. vqeaf.js: nguon su that duy nhat');
{
  for (const fn of ['keycapPalette', 'keycapButtonStyle', 'mixHex', 'relLum']) {
    ok(new RegExp(`export function ${fn}\\b`).test(VQEAF_SRC), `export ${fn}()`);
  }
  ok(/export function buttonStyleComponent/.test(VQEAF_SRC), 'export buttonStyleComponent() cho bo sinh theme');
  ok(/KEYCAP_MAX_LUM = 0\.14/.test(VQEAF_SRC), 'co nguong do sang KEYCAP_MAX_LUM = 0.14');
}

head('6. Toan bo theme: chu trang doc duoc tren than keycap');
{
  let worst = { c: Infinity, f: '' };
  const bad = [];
  for (const f of files) {
    const src = readFileSync('themes/' + f, 'utf8');
    const pal = src.match(/palette\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
    const g = (n, fb) => pal.match(new RegExp(`${n}\\s*:\\s*"(#[0-9A-Fa-f]{3,8})"`))?.[1] || fb;
    const cap = keycapPalette({ shellBottom: g('shellBottom', '#101018'), key: g('key', '#20202C') });
    const contrast = 1.05 / (relLum(cap.base) + 0.05);
    if (contrast < worst.c) worst = { c: contrast, f };
    if (contrast < 4.5) bad.push(`${f}=${contrast.toFixed(2)}`);
  }
  ok(bad.length === 0, `ca ${files.length} theme dat WCAG AA cho chu trang (thap nhat ${worst.c.toFixed(2)}:1 @ ${worst.f})`);
  ok(relLum(keycapPalette({ shellBottom: '#FFFFFF', key: '#FFFFFF' }).base) <= 0.14,
    'palette trang tuyet doi van bi keo toi (clamp hoat dong)');
  ok(relLum(keycapPalette({ shellBottom: '#000000', key: '#000000' }).base) <= 0.14,
    'palette den tuyet doi van giu nguyen (khong bi lam sang)');
}

head('7. 14 theme co keyStyle_*: dung CHINH XAC vat lieu keycap');
{
  let themed = 0, blocks = 0, mismatch = [];
  for (const f of files) {
    const src = readFileSync('themes/' + f, 'utf8');
    if (!src.includes('keyStyle_')) continue;
    themed++;
    const s = parseVqeaf(src);
    const pal = src.match(/palette\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
    const g = (n, fb) => pal.match(new RegExp(`${n}\\s*:\\s*"(#[0-9A-Fa-f]{3,8})"`))?.[1] || fb;
    const want = keycapButtonStyle({
      shellBottom: g('shellBottom', '#101018'), key: g('key', '#20202C'),
    });
    const entries = Object.entries(s.buttonStyles);
    if (entries.length !== 19) mismatch.push(`${f}: ${entries.length} keyStyle (can 19)`);
    for (const [target, st] of entries) {
      blocks++;
      const checks = [
        [isKeycapStyle(st), 'presetId=keycap & borderWidth=0'],
        [st.shape === 'square', 'shape=square'],
        [Number(st.bevel) >= 2, 'bevel >= 2'],
        [st.colorA === want.colorA && st.colorB === want.colorB && st.colorC === want.colorC, 'gradient == keycapButtonStyle'],
        [st.text === '#FFFFFF', 'chu trang'],
        [Number(st.glowRadius) === 0, 'khong glow ngoai'],
        [Number(st.textOutlineWidth) === 0, 'khong vien chu'],
      ];
      for (const [c, m] of checks) if (!c) mismatch.push(`${f}/${target}: ${m}`);
    }
  }
  ok(themed === 14, `co 14 theme mang keyStyle_* (thuc te ${themed})`);
  ok(blocks === 266, `tong ${blocks} khoi keyStyle_* duoc kiem (ky vong 266)`);
  ok(mismatch.length === 0, mismatch.length ? `lech chuan:\n     ${mismatch.slice(0, 12).join('\n     ')}` : 'moi khoi khop 100% voi keycapButtonStyle()');
}

head('8. Round-trip: serializeTheme -> parseVqeaf giu nguyen keycap');
{
  const f = 'themes/spooky_vibes.vqeaf';
  const s1 = parseVqeaf(readFileSync(f, 'utf8'));
  const again = parseVqeaf(serializeTheme(s1));
  let diff = [];
  for (const k of Object.keys(s1.buttonStyles)) {
    const a = s1.buttonStyles[k], b = again.buttonStyles[k];
    for (const p of ['presetId', 'shape', 'bevel', 'bevelBlur', 'borderWidth', 'colorA', 'colorB', 'colorC', 'text', 'glowRadius', 'textOutlineWidth']) {
      if (String(a[p]) !== String(b[p])) diff.push(`${k}.${p}: ${a[p]} != ${b[p]}`);
    }
  }
  ok(diff.length === 0, diff.length ? `round-trip lech: ${diff.slice(0, 6).join(', ')}` : 'round-trip giu nguyen 19 keycap (preset/shape/bevel/border/mau/chu)');
}

head('9. 52 theme palette-only: khong bi dung toi file');
{
  const themed = files.filter(f => readFileSync('themes/' + f, 'utf8').includes('keyStyle_')).length;
  ok(files.length - themed === 52, `${files.length - themed} theme chi co palette (khong keyStyle) -> an keycap qua CSS, khong can sua file`);
}

console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : 'CO LOI'} — ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
