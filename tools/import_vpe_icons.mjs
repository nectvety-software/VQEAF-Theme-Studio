#!/usr/bin/env node
/**
 * Sinh src/icons.js tu bo pixel art cua VPEPixel (VXP Pixel Editor).
 *
 * Vi sao can script nay:
 *   Studio truoc day ve moi bieu tuong bang **emoji** (🕸️ 🎃 📷 ↺ …) hoac glyph
 *   hinh hoc (▲ ◀ ☎ ▮). Emoji hien khac nhau tren tung OS/browser, khong doi duoc
 *   mau, va khong phai pixel art. Bo icon that duoc ve trong VPEPixel:
 *
 *     D:\desktop-webapps\VPEPixel\tools\make_vqeaf_studio_icons.py
 *       -> Documents/VPE Pixel/tile/vqeaf_studio/<ten>_12.vpe   (nguon, VPE565)
 *       -> Documents/VPE Pixel/exports/vqeaf_studio/<ten>.png   (RGBA, white keyed)
 *
 *   Script nay doc 46 file PNG do, nhung thang vao src/icons.js duoi dang
 *   data-URI de studio khong phai fetch them file nao (chay duoc ca khi mo
 *   index.html truc tiep qua file://).
 *
 * Vi sao khong tu ve lai trong JS: .vpe moi la nguon su that. Sua icon thi sua
 * trong VPEPixel roi chay lai 2 lenh — khong sua tay src/icons.js.
 *
 *   node tools/import_vpe_icons.mjs            # ghi that
 *   node tools/import_vpe_icons.mjs --dry      # chi kiem tra
 *   node tools/import_vpe_icons.mjs --from <dir>
 *
 * Script FAIL neu thieu PNG, PNG rong, hoac PNG khong dung 12x12 — de mot icon
 * bi thieu khong am tham tro thanh o trong trong giao dien.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const fromIdx = args.indexOf('--from');

export const ICON_SIZE = 12;
export const DEFAULT_SRC_DIR = join(homedir(), 'Documents', 'VPE Pixel', 'exports', 'vqeaf_studio');
const SRC_DIR = fromIdx >= 0 ? args[fromIdx + 1] : DEFAULT_SRC_DIR;
export const OUT = 'src/icons.js';

/**
 * Danh sach icon BAT BUOC phai co, nhom theo noi dung dung.
 * Them icon moi: ve trong make_vqeaf_studio_icons.py roi bo sung ten vao day —
 * thieu ten o day thi icon khong duoc nhung, thua ten thi script bao loi.
 */
export const GROUPS = {
  // Trang tri gan vao tung phim (keyStyle_*.decoration) + draggable components.
  decoration: [
    'leaf', 'flower', 'cloud', 'star', 'gem', 'sparkle', 'chest', 'slime',
    'pumpkin', 'bat', 'web', 'ghost', 'badge',
  ],
  // Ky hieu tren keypad dien thoai (thay ▲ ▼ ◀ ▶ ☎ ∞ ⇧ —).
  keypad: [
    'tri_up', 'tri_down', 'tri_left', 'tri_right',
    'call', 'menu_lines', 'camera', 'dash', 'infinity', 'shift',
  ],
  // Bieu tuong thanh cong cu / trinh chinh sua cua studio.
  ui: [
    'dice', 'undo', 'redo', 'trash', 'rotate_ccw', 'rotate_cw',
    'flip_h', 'flip_v', 'move_up', 'move_down', 'close',
    'arrow_left', 'arrow_right', 'plus', 'reset', 'battery',
  ],
  // Bieu tuong lop / thanh phan trong panel Layers.
  layer: [
    'keyboard', 'frame', 'screen', 'keypad', 'keypadbg', 'led', 'decoration',
  ],
};

export const ALL = Object.values(GROUPS).flat();

export function assertPng12(buf, name) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(sig)) {
    throw new Error(`${name}: khong phai PNG hop le (${buf.length} bytes)`);
  }
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w !== ICON_SIZE || h !== ICON_SIZE) {
    throw new Error(`${name}: ${w}x${h}, mong doi ${ICON_SIZE}x${ICON_SIZE}`);
  }
  return { w, h };
}

/**
 * Doc 46 PNG -> map ten -> data-URI. Nem loi neu thieu / rong / sai kich thuoc.
 * Tach rieng khoi render() de verify_pixel_icons.mjs co the so sanh NOI DUNG
 * sinh ra voi src/icons.js dang co — manh hon la chay lai script roi doc file.
 */
export function build(srcDir = DEFAULT_SRC_DIR) {
  if (!existsSync(srcDir)) {
    throw new Error(
      `khong thay thu muc icon "${srcDir}"\n` +
        `  -> chay: python tools/make_vqeaf_studio_icons.py  (trong D:\\desktop-webapps\\VPEPixel)`
    );
  }

  // Trung ten giua cac nhom la loi danh sach, khong phai loi du lieu.
  const dupes = ALL.filter((n, i) => ALL.indexOf(n) !== i);
  if (dupes.length) throw new Error(`ten icon bi lap trong GROUPS: ${[...new Set(dupes)].join(', ')}`);

  const map = new Map();
  let bytes = 0;
  const missing = [];

  for (const name of ALL) {
    const p = join(srcDir, `${name}.png`);
    if (!existsSync(p)) {
      missing.push(name);
      continue;
    }
    const buf = readFileSync(p);
    assertPng12(buf, name);
    bytes += buf.length;
    map.set(name, `data:image/png;base64,${buf.toString('base64')}`);
  }

  if (missing.length) {
    throw new Error(
      `thieu ${missing.length} PNG: ${missing.join(', ')}\n` +
        `  -> chay lai: python tools/make_vqeaf_studio_icons.py`
    );
  }

  // Khong data-URI nao duoc rong — mot o trong trong giao dien la loi im lang.
  for (const [name, uri] of map) {
    if (!uri.startsWith('data:image/png;base64,') || uri.length < 60) {
      throw new Error(`${name}: data-URI rong hoac hong`);
    }
  }

  return { map, bytes, sorted: [...map.keys()].sort() };
}

/** Sinh noi dung src/icons.js tu ket qua build(). */
export function render({ map, bytes, sorted }) {
  const lines = [];
  lines.push('// AUTO-GENERATED — dung sua tay file nay.');
  lines.push('//');
  lines.push('// Nguon: D:\\desktop-webapps\\VPEPixel\\tools\\make_vqeaf_studio_icons.py');
  lines.push(`// Sinh lai: python tools/make_vqeaf_studio_icons.py  &&  node tools/import_vpe_icons.mjs`);
  lines.push(`// ${sorted.length} icon ${ICON_SIZE}x${ICON_SIZE}, ${(bytes / 1024).toFixed(1)} KB PNG nhung thang duoi dang data-URI.`);
  lines.push('');
  lines.push(`export const ICON_SIZE = ${ICON_SIZE};`);
  lines.push('');
  lines.push('/** ten icon -> data-URI PNG (RGBA, nen trong da duoc key). */');
  lines.push('export const ICONS = {');
  for (const name of sorted) lines.push(`  ${name}: '${map.get(name)}',`);
  lines.push('};');
  lines.push('');
  for (const [group, names] of Object.entries(GROUPS)) {
    const key = `${group.toUpperCase()}_ICONS`;
    lines.push(`/** Nhom "${group}" — ${names.length} icon. */`);
    lines.push(`export const ${key} = [`);
    lines.push(`  ${names.map((n) => `'${n}'`).join(', ')},`);
    lines.push('];');
    lines.push('');
  }
  lines.push('/** Tra ve data-URI cua icon, hoac chuoi rong neu khong co. */');
  lines.push('export function iconUri(name) {');
  lines.push('  return (name && ICONS[name]) || \'\';');
  lines.push('}');
  lines.push('');
  lines.push('/** Tat ca ten icon, da sap xep. */');
  lines.push('export const ICON_NAMES = Object.keys(ICONS);');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const built = build(SRC_DIR);
  const out = render(built);
  const { sorted, bytes } = built;

  if (DRY) {
    // --dry: kiem tra src/icons.js co khop voi PNG hien tai khong, sai -> exit 1.
    const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
    if (cur === out) {
      console.log(`[dry] ${sorted.length} icon OK, ${(out.length / 1024).toFixed(1)} KB — ${OUT} da dong bo`);
      return;
    }
    console.error(`[dry] ${OUT} KHONG khop PNG hien tai — chay lai khong co --dry`);
    process.exit(1);
  }

  writeFileSync(OUT, out, 'utf8');
  console.log(
    `${sorted.length} icon -> ${OUT}  (${(bytes / 1024).toFixed(1)} KB PNG, ${(out.length / 1024).toFixed(1)} KB file)`
  );
}

// Chi chay khi duoc goi truc tiep — import() tu verify_* khong duoc ghi file.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
