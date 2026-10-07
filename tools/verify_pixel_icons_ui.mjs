/**
 * V3.7.13 — Kiem bo icon pixel art trong TRINH DUYET THAT (headless Chrome).
 *
 * Vi sao can: `verify_pixel_icons.mjs` chi doc file tinh. No khong the biet
 *   - data-URI co DECODE duoc trong browser khong (base64 sai van la chuoi hop le),
 *   - `mask-image` co resolve khong (mask hong = o TRONG, khong loi console),
 *   - va quan trong nhat: ban EXPORT PNG co thuc su VE icon khong.
 * Truong hop cuoi la bay nguy hiem nhat: `ctx.drawImage()` voi `Image` chua load
 * xong KHONG nem loi — no im lang bo qua. Neu thieu `await preloadIcons()` thi
 * PNG xuat ra thieu icon ma console sach tron.
 *
 * Cach chung minh (khong can hook vao app.js):
 *   Chay 2 phien Chrome:
 *     A. binh thuong            -> xuat PNG
 *     B. `new Image()` bi vohieu hoa (src khong bao gio load) -> xuat PNG
 *   `loadIcon()` dung `new Image()`, con `iconImg()` dung `document.createElement`
 *   -> va B chi lam hong duong CANVAS, khong dung tới duong DOM.
 *   => So pixel muc trong DAI BADGE (2 badge MENU/Shot, phia tren khung may,
 *      khong co chu nao khac) phai GIAM khi tat icon. Chenh lech > 0 la bang
 *      chung icon duoc ve vao PNG that.
 *
 *   node tools/verify_pixel_icons_ui.mjs
 * Yeu cau: server tinh o http://127.0.0.1:8099/
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { inflateSync } from 'node:zlib';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const STUDIO = 'http://127.0.0.1:8099/';
const PORT = 9229;
const outDir = resolve('tools/shots');
mkdirSync(outDir, { recursive: true });

let pass = 0, fail = 0;
const ok = (cond, label) => { if (cond) { pass++; console.log(`OK   ${label}`); } else { fail++; console.log(`FAIL ${label}`); } };
const head = (t) => console.log(`\n=== ${t} ===`);

// ------------------------------------------------------------------ PNG doc
// Bo giai ma PNG toi thieu (8-bit, RGB/RGBA, khong interlace). Node co san
// zlib.inflateSync nen khong can dependency nao.
function decodePng(buf) {
  const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(SIG)) throw new Error('khong phai PNG');
  let pos = 8, w = 0, h = 0, bd = 0, ct = 0;
  const idat = [];
  while (pos + 12 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bd = data[8]; ct = data[9];
      if (data[12] !== 0) throw new Error('PNG interlace chua ho tro');
    } else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error(`PNG bd=${bd} ct=${ct} chua ho tro`);
  const bpp = ct === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      } else if (f !== 0) throw new Error('filter ' + f);
      cur[x] = v;
    }
    prev = cur;
  }
  return { w, h, bpp, data: out };
}

/** Dem pixel "co muc" (alpha > 8) trong dai dong [y0, y1). */
function inkInRows(png, y0, y1) {
  let n = 0;
  const bpp = png.bpp;
  for (let y = y0; y < Math.min(y1, png.h); y++) {
    for (let x = 0; x < png.w; x++) {
      const o = (y * png.w + x) * bpp;
      if (bpp === 3 || png.data[o + 3] > 8) n++;
    }
  }
  return n;
}

/**
 * So 2 PNG tung pixel, tra ve so pixel KHAC nhau + hop bao cua vung khac.
 *
 * Vi sao KHONG dem "pixel co muc" (alpha > 8): badge la mot HINH CHU NHAT DUC
 * (ctx.fill() to kin nen). Ve icon len tren khong lam tang so pixel duc — ca 2
 * phien se ra y het nhau du icon co duoc ve hay khong. Phai so TUNG PIXEL.
 */
function diffPng(a, b) {
  if (a.w !== b.w || a.h !== b.h) throw new Error(`khac kich thuoc ${a.w}x${a.h} vs ${b.w}x${b.h}`);
  const bpp = a.bpp;
  let n = 0;
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  const byBand = { badge: 0, rest: 0 };
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      const o = (y * a.w + x) * bpp;
      if (a.data[o] === b.data[o] && a.data[o + 1] === b.data[o + 1] &&
          a.data[o + 2] === b.data[o + 2] && (bpp === 3 || a.data[o + 3] === b.data[o + 3])) continue;
      n++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (y < 68) byBand.badge++; else byBand.rest++;
    }
  }
  return { n, minX, minY, maxX, maxY, byBand };
}

// ------------------------------------------------------------------ 1 phien
/** Chay 1 phien Chrome, tra ve { ev, send, close, errors }. */
async function openSession({ disableIcons = false } = {}) {
  const profile = join(tmpdir(), `vqeaf-iconsui-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--no-proxy-server', '--proxy-bypass-list=*', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=1400,1700', 'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  const close = () => { try { ws?.close(); } catch {} try { chrome.kill(); } catch {} };
  try {
    let url;
    for (let i = 0; i < 100 && !url; i++) {
      try {
        url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json())
          .find((t) => t.type === 'page')?.webSocketDebuggerUrl;
      } catch {}
      if (!url) await sleep(250);
    }
    if (!url) throw new Error('khong ket noi duoc chromium');

    ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pend = new Map(); const errors = [];
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        errors.push(d.text + ' ' + (d.exception?.description || ''));
      }
    };
    const send = (method, params = {}) => new Promise((res, rej) => {
      const i = ++id;
      pend.set(i, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)));
      ws.send(JSON.stringify({ id: i, method, params }));
    });
    const ev = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) {
        const d = r.exceptionDetails.exception?.description || '';
        throw new Error(r.exceptionDetails.text + (d ? ': ' + d.split('\n').slice(0, 3).join(' | ') : ''));
      }
      return r.result?.value;
    };
    const waitFor = async (expr, label, tries = 140) => {
      for (let i = 0; i < tries; i++) { if (await ev(expr)) return; await sleep(250); }
      throw new Error('timeout: ' + label);
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    if (disableIcons) {
      // Vo hieu hoa `new Image()` -> `loadIcon()` khong bao gio load duoc.
      // `iconImg()` dung document.createElement('img') nen duong DOM KHONG bi anh
      // huong — nho vay ta co lap duoc duong canvas.
      await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(() => {
          const Real = window.Image;
          function Broken() {
            const i = document.createElement('img');
            Object.defineProperty(i, 'src', { get() { return ''; }, set() {}, configurable: true });
            return i;
          }
          Broken.prototype = Real.prototype;
          window.Image = Broken;
          window.alert = () => {};
        })()`,
      });
    }

    await send('Page.navigate', { url: STUDIO });
    await waitFor(`document.querySelectorAll('#presetGrid .preset-card').length > 60`, 'boot studio');

    return { ev, send, close, errors, waitFor };
  } catch (err) {
    close();
    throw err;
  }
}

/** Bam nut "Chup khung" va lay PNG qua blob (khong phu thuoc thu muc download). */
async function exportPngBase64(ev) {
  await ev(`(() => {
    window.__shot = null;
    window.alert = () => {};
    if (!window.__patched) {
      window.__patched = true;
      const orig = URL.createObjectURL.bind(URL);
      URL.createObjectURL = (b) => { window.__shot = b; return orig(b); };
      HTMLAnchorElement.prototype.click = function () {};
    }
  })()`);
  await ev(`document.querySelector('[data-action="screenshot"]').click()`);
  for (let i = 0; i < 120; i++) {
    if (await ev(`!!window.__shot`)) break;
    await sleep(150);
  }
  return await ev(`(async () => {
    if (!window.__shot) return null;
    const u = new Uint8Array(await window.__shot.arrayBuffer());
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  })()`);
}

// ================================================================== PHIEN A
head('A. Studio that: khong emoji, icon decode duoc, trang tri hien ra');

const A = await openSession();
let pngA = null, pngB = null;
try {
  const { ev, send, waitFor } = A;

  // --- 0. XUAT PNG TRUOC KHI DOI STATE.
  //     Phai lay ban export tu DUNG trang thai khoi dong, vi phien B cung vay.
  //     Neu doi theme trang tri roi moi xuat thi 2 PNG khac nhau o MOI pixel
  //     (do khac theme), khong con la phep so sanh "co icon vs khong icon".
  const b64a = await exportPngBase64(ev);
  ok(!!b64a, 'nut Chup khung xuat ra PNG');
  pngA = decodePng(Buffer.from(b64a, 'base64'));
  writeFileSync(join(outDir, 'pixel_icons_frame.png'), Buffer.from(b64a, 'base64'));
  console.log(`     -> tools/shots/pixel_icons_frame.png (${pngA.w}x${pngA.h})`);
  const badgeInk = inkInRows(pngA, 0, 68);
  ok(pngA.w > 500 && pngA.h > 1000, `PNG xuat ra ${pngA.w}x${pngA.h}`);
  ok(badgeInk > 0, `dai badge (2 badge MENU/Shot) co ${badgeInk} pixel duc`);

  // --- 1. khong con emoji/glyph trong DOM da render
  const emoji = await ev(`(() => {
    const RE = /[\\u2190-\\u21FF\\u2300-\\u23FF\\u25A0-\\u25FF\\u2600-\\u27BF\\u2B00-\\u2BFF\\uFE0F\\u{1F000}-\\u{1FAFF}]/gu;
    const hits = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentElement;
      if (!p || /^(SCRIPT|STYLE)$/.test(p.tagName)) continue;
      for (const m of n.textContent.matchAll(RE)) hits.add(m[0]);
    }
    return [...hits];
  })()`);
  ok(emoji.length === 0, `DOM khong con emoji/glyph${emoji.length ? ` (con: ${emoji.join(' ')})` : ''}`);

  // --- 2. moi <img class="icon"> da decode (naturalWidth = 12)
  const imgs = await ev(`[...document.querySelectorAll('img.icon')].map(i => ({
    cls: i.className, w: i.naturalWidth, h: i.naturalHeight, done: i.complete }))`);
  ok(imgs.length > 0, `co ${imgs.length} <img class="icon"> trong UI`);
  const broken = imgs.filter((i) => !i.done || i.w !== 12 || i.h !== 12);
  ok(broken.length === 0, `moi <img class="icon"> decode ra 12x12${broken.length ? ` (hong ${broken.length}: ${broken.slice(0, 4).map((b) => b.cls + ' ' + b.w + 'x' + b.h).join(', ')})` : ''}`);

  // --- 3. moi .icon-glyph co mask resolve + nen theo currentColor
  const glyphs = await ev(`[...document.querySelectorAll('.icon-glyph')].map(e => {
    const c = getComputedStyle(e);
    return { mask: c.maskImage || c.webkitMaskImage || '', bg: c.backgroundColor, w: c.width, h: c.height };
  })`);
  ok(glyphs.length > 0, `co ${glyphs.length} .icon-glyph (ky hieu theo mau chu)`);
  const badMask = glyphs.filter((g) => !/data:image\/png/.test(g.mask));
  ok(badMask.length === 0, `moi .icon-glyph co mask-image la PNG data-URI${badMask.length ? ` (hong ${badMask.length})` : ''}`);
  const badBg = glyphs.filter((g) => !g.bg || /rgba\(0, 0, 0, 0\)/.test(g.bg));
  ok(badBg.length === 0, `moi .icon-glyph co background-color khong trong suot${badBg.length ? ` (hong ${badBg.length})` : ''}`);

  // --- 4. CA 46 data-URI decode duoc trong browser
  const all = await ev(`(async () => {
    const m = await import('/src/icons.js');
    const names = m.ICON_NAMES;
    const bad = [];
    await Promise.all(names.map(async (nm) => {
      const img = new Image();
      img.src = m.ICONS[nm];
      try { await img.decode(); } catch { bad.push(nm + ':decode'); return; }
      if (img.naturalWidth !== 12 || img.naturalHeight !== 12) bad.push(nm + ':' + img.naturalWidth + 'x' + img.naturalHeight);
    }));
    return { total: names.length, bad };
  })()`);
  ok(all.total === 46, `icons.js co ${all.total} icon (ky vong 46)`);
  ok(all.bad.length === 0, `ca ${all.total} data-URI decode ra 12x12 trong Chrome${all.bad.length ? ` (hong: ${all.bad.join(', ')})` : ''}`);

  // --- 5. nhap theme co trang tri phim -> phim phai hien anh trang tri
  const doc = await send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#fileInput' });
  await send('DOM.setFileInputFiles', { nodeId, files: [resolve('themes/candy_adventure.vqeaf')] });
  await waitFor(`document.querySelectorAll('#keypad .key-decoration').length > 0`, 'trang tri phim hien ra');

  const decos = await ev(`[...document.querySelectorAll('#keypad .key-decoration')].map(i => ({
    cls: i.className, w: i.naturalWidth, h: i.naturalHeight, done: i.complete }))`);
  ok(decos.length > 0, `candy_adventure: ${decos.length} anh trang tri phim trong #keypad`);
  const badDeco = decos.filter((d) => !d.done || d.w !== 12 || d.h !== 12);
  ok(badDeco.length === 0, `moi anh trang tri phim decode ra 12x12${badDeco.length ? ` (hong ${badDeco.length})` : ''}`);

  // --- 6. bo chon trang tri (o tab "Tao nut"): 7 lua chon, 6 co icon
  //     LUU Y: decorationField() nam trong #buttonBuilder (tab trai), KHONG
  //     phai #inspector (panel phai).
  await ev(`document.querySelector('[data-left-tab="buttons"]').click()`);
  await waitFor(`document.querySelectorAll('#buttonBuilder .icon-picker').length >= 2`, 'bo chon trang tri');
  const picker = await ev(`(() => {
    const rows = [...document.querySelectorAll('#buttonBuilder .icon-picker')];
    return rows.map(r => ({
      count: r.querySelectorAll('.icon-pick').length,
      imgs: [...r.querySelectorAll('.icon-pick img')].map(i => ({ w: i.naturalWidth, h: i.naturalHeight, done: i.complete })),
      text: [...r.querySelectorAll('.icon-pick')].map(b => b.textContent.trim()),
    }));
  })()`);
  ok(picker.length >= 2, `tab Tao nut co ${picker.length} bo chon trang tri (trai/phai)`);
  ok(picker[0].count === 7, `bo chon co ${picker[0].count} lua chon (ky vong 7)`);
  ok(picker[0].imgs.length === 6, `co ${picker[0].imgs.length} lua chon kem icon (ky vong 6 — 'none' la chu)`);
  ok(picker[0].imgs.every((i) => i.done && i.w === 12 && i.h === 12), 'moi icon trong bo chon decode ra 12x12');
  ok(picker[0].text.includes('Không'), `lua chon 'none' hien chu: ${picker[0].text.filter(Boolean).join(' / ')}`);

  // --- 6b. bam chon 1 trang tri -> phim xem truoc phai doi anh that
  const gemUri = await ev(`(async () => (await import('/src/icons.js')).ICONS.gem)()`);
  await ev(`document.querySelector('#buttonBuilder .icon-picker .icon-pick[data-value="gem"]').click()`);
  await sleep(400);
  const applied = await ev(`(() => {
    const i = document.querySelector('#buttonBuilder .key-decoration-left');
    return i ? { w: i.naturalWidth, h: i.naturalHeight, src: i.src } : null;
  })()`);
  ok(!!applied, 'bam chon trang tri -> phim xem truoc co .key-decoration-left');
  ok(applied && applied.w === 12 && applied.h === 12, `anh trang tri ap vao phim decode ra ${applied?.w}x${applied?.h}`);
  ok(applied && applied.src === gemUri, 'anh trang tri dung dung icon vua chon (gem)');

  // --- 7. chup toan UI de xem bang mat
  await ev(`document.querySelector('#keypad').scrollIntoView()`);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(outDir, 'pixel_icons_ui.png'), Buffer.from(shot.data, 'base64'));
  console.log('     -> tools/shots/pixel_icons_ui.png');

  ok(A.errors.length === 0, `khong co loi JS trong trang${A.errors.length ? ` (${A.errors.slice(0, 3).join(' | ')})` : ''}`);
} catch (err) {
  ok(false, `phien A: ${err.message}`);
} finally {
  A.close();
}

// ================================================================== PHIEN B
head('B. Doi chieu: tat icon -> PNG export PHAI khac (chung minh icon duoc VE)');

const B = await openSession({ disableIcons: true });
try {
  const { ev } = B;
  const b64b = await exportPngBase64(ev);
  ok(!!b64b, 'phien B (icon bi vo hieu) van xuat duoc PNG');
  pngB = decodePng(Buffer.from(b64b, 'base64'));

  ok(pngA && pngB.w === pngA.w && pngB.h === pngA.h, `PNG phien B cung kich thuoc (${pngB.w}x${pngB.h})`);

  // Chien luoc so sanh nay chung minh: ban export PNG THAT SU di qua pipeline
  // icon. Phien B lam `new Image()` khong bao gio load duoc, nen `tintedIconCanvas`
  // tra ve null -> khong co icon nao duoc ve. Neu ai do bo icon khoi duong canvas
  // (quay lai `ctx.fillText('▮')`, hoac `drawTintedIcon` thanh no-op) thi 2 PNG
  // se GIONG HET nhau -> so pixel khac = 0 -> test do.
  // Da kiem chung: them `return false;` vao dau `drawTintedIcon` -> 0 pixel khac,
  // 3 check do.
  //
  // LUU Y trung thuc: phep so sanh nay KHONG kiem chung duoc rieng dong
  // `await preloadIcons()` trong renderNokiaFramePng(). Bo dong do ra thi test
  // VAN xanh, vi icon data-URI kip decode trong luc boot (cache da am). Dong await
  // la luoi an toan cho luot bam dau tien khi cache con lanh — `verify_pixel_icons.mjs`
  // (tinh) va `check_frame_update.mjs` moi la cho ghim no lai.
  const d = diffPng(pngA, pngB);
  ok(d.n > 0, `2 PNG KHAC nhau o ${d.n} pixel -> icon thuc su duoc ve vao ban export`);
  ok(d.byBand.badge > 0,
    `khac ${d.byBand.badge} pixel trong dai badge (icon MENU/Shot) — khong phai lech o cho khac`);
  ok(d.byBand.rest > 0,
    `khac ${d.byBand.rest} pixel phan con lai (icon pin + mui ten ten phim)`);
  console.log(`     hop bao vung khac: x[${d.minX}..${d.maxX}] y[${d.minY}..${d.maxY}]`);
  console.log(`     (badge = y < 68; ca khung ${pngA.w}x${pngA.h})`);
} catch (err) {
  ok(false, `phien B: ${err.message}`);
} finally {
  B.close();
}

console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : 'CO LOI'} — ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
