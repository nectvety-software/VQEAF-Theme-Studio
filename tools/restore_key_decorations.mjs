#!/usr/bin/env node
/**
 * Khoi phuc `decoration { left/right }` trong themes/*.vqeaf.
 *
 * Vi sao can script nay:
 *   V3.7.12 chay `gen_keycap_themes.mjs` de sinh lai khoi `keyStyle_*`. Ham
 *   `keycapButtonStyle()` tra ve style KHONG co `decorLeft`/`decorRight`, nen
 *   `buttonStyleComponent()` ghi mac dinh `"none"` cho ca hai ben. Ket qua: 119
 *   trang tri tren phim (star/flower/leaf/cloud/gem/sparkle) bi xoa trang thanh
 *   `decoration { left: "none" right: "none" }` — mat du lieu that, khong phai
 *   chi la doi format.
 *
 * Cach lam:
 *   Voi moi file, tim tung khoi <component id="keyStyle_<key>" type="button-style">
 *   roi thay DUY NHAT dong `decoration { ... }` bang gia tri tuong ung trong ban
 *   backup (khop theo ten key). Moi thu khac trong file giu nguyen tung byte, ke
 *   ca kieu xuong dong (CRLF/LF).
 *
 *   node tools/restore_key_decorations.mjs --from <backupDir>
 *   node tools/restore_key_decorations.mjs --from <backupDir> --dry
 *
 * Khong co backup thi KHONG doan: script dung han va bao ro.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const fromIdx = args.indexOf('--from');
const THEME_DIR = 'themes';

/** Tim thu muc backup moi nhat dang vqeaf_themes_bak_* trong temp. */
function findBackup() {
  if (fromIdx >= 0) {
    const dir = args[fromIdx + 1];
    if (!dir || !existsSync(dir)) {
      throw new Error(`--from: khong ton tai thu muc "${dir}"`);
    }
    return dir;
  }
  const cands = readdirSync(tmpdir())
    .filter((n) => n.startsWith('vqeaf_themes_bak_'))
    .map((n) => join(tmpdir(), n))
    .filter((p) => statSync(p).isDirectory())
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (!cands.length) {
    throw new Error('khong tim thay backup vqeaf_themes_bak_* nao trong temp — hay truyen --from <dir>');
  }
  return cands[0];
}

const BLOCK_RE =
  /(<component id="keyStyle_([A-Za-z0-9_]+)" type="button-style">)([\s\S]*?)(<\/component>)/g;
const DECOR_RE = /decoration \{[^}]*\}/;

/** key -> dong `decoration { ... }` cua tung khoi keyStyle_* trong mot file. */
function decorationsByKey(src) {
  const map = new Map();
  BLOCK_RE.lastIndex = 0;
  let m;
  while ((m = BLOCK_RE.exec(src))) {
    const dec = m[3].match(DECOR_RE);
    if (dec) map.set(m[2], dec[0]);
  }
  return map;
}

/** Thay dong decoration trong `src` bang gia tri trong `bakDecor` (khop theo key). */
function restore(src, bakDecor) {
  let changed = 0;
  const out = src.replace(BLOCK_RE, (all, open, key, body, close) => {
    const want = bakDecor.get(key);
    if (!want) return all;
    const cur = body.match(DECOR_RE);
    if (!cur || cur[0] === want) return all;
    changed++;
    return open + body.replace(DECOR_RE, want) + close;
  });
  return { out, changed };
}

const isNone = (line) => /left:\s*"none"\s+right:\s*"none"/.test(line);

function main() {
  const backup = findBackup();
  console.log(`backup: ${backup}`);

  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.vqeaf'));
  let totalChanged = 0;
  let totalRestored = 0;
  let filesTouched = 0;
  const skipped = [];

  for (const f of files) {
    const curPath = join(THEME_DIR, f);
    const bakPath = join(backup, f);
    if (!existsSync(bakPath)) {
      skipped.push(f);
      continue;
    }
    const cur = readFileSync(curPath, 'utf8');
    const bak = readFileSync(bakPath, 'utf8');
    const bakDecor = decorationsByKey(bak);
    const { out, changed } = restore(cur, bakDecor);
    if (!changed) continue;

    // Dem so trang tri that su duoc khoi phuc (none -> khac none).
    const before = decorationsByKey(cur);
    const after = decorationsByKey(out);
    let restored = 0;
    for (const [key, line] of after) {
      const was = before.get(key);
      if (was && isNone(was) && !isNone(line)) restored++;
    }

    if (DRY) {
      console.log(`  [dry] ${f}: ${changed} khoi doi, ${restored} trang tri khoi phuc`);
    } else {
      writeFileSync(curPath, out, 'utf8');
      console.log(`  ${f}: ${changed} khoi doi, ${restored} trang tri khoi phuc`);
    }
    totalChanged += changed;
    totalRestored += restored;
    filesTouched++;
  }

  // Tu kiem: tong so trang tri khac "none" phai bang ban backup.
  const countNonNone = (dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.vqeaf'))
      .reduce((n, f) => {
        const src = readFileSync(join(dir, f), 'utf8');
        for (const line of decorationsByKey(src).values()) if (!isNone(line)) n++;
        return n;
      }, 0);

  const wantNonNone = countNonNone(backup);
  const gotNonNone = DRY ? null : countNonNone(THEME_DIR);

  console.log(
    `\n${DRY ? '[dry] ' : ''}${filesTouched} file, ${totalChanged} khoi, ${totalRestored} trang tri khoi phuc`
  );
  if (skipped.length) console.log(`bo qua (khong co trong backup): ${skipped.join(', ')}`);

  if (DRY) return;
  if (gotNonNone !== wantNonNone) {
    console.error(`\nTHAT BAI: trang tri khac "none" = ${gotNonNone}, mong doi ${wantNonNone}`);
    process.exit(1);
  }
  console.log(`kiem tra: ${gotNonNone} trang tri khac "none" — khop backup`);
}

main();
