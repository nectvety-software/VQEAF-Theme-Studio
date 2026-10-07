/**
 * Chup preview Nokia that trong studio bang headless Chromium (CDP), sau khi
 * NHAP that file .vqeaf qua o "Nhap .vqeaf" (#fileInput) - dung luong nguoi dung.
 *
 *   node tools/shoot_theme_preview.mjs <themeId> [<themeId> ...]
 *
 * Yeu cau: server tinh dang chay o http://127.0.0.1:8099/
 * Ket qua: tools/shots/<themeId>.png
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

// Dung CHROME that, KHONG dung Chromium cua ms-playwright: ban chromium-901522
// la Chrome 93, thieu `structuredClone` -> app.js nem ReferenceError ngay trong
// freshState() va studio ra TRANG TRANG (khong co #presetGrid), nen tool timeout
// o "preset grid" chu khong bao loi ro rang. Xem SKILLS.md § Moi truong may.
const CHROME = process.env.CHROME ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const STUDIO = "http://127.0.0.1:8099/";
const PORT = 9222;
const ids = process.argv.slice(2);
if (!ids.length) { console.error("usage: node tools/shoot_theme_preview.mjs <themeId> [...]"); process.exit(2); }

const outDir = resolve("tools/shots");
mkdirSync(outDir, { recursive: true });
const profile = join(tmpdir(), `vqeaf-shot-${Date.now()}`);

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--no-proxy-server",
  "--proxy-bypass-list=*",
  "--hide-scrollbars",
  "--force-device-scale-factor=2",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1400,1600",
  STUDIO,
], { stdio: "ignore" });

async function targetUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page" && t.url.startsWith(STUDIO));
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* chua len */ }
    await sleep(250);
  }
  throw new Error("khong ket noi duoc chromium");
}

let msgId = 0;
const pending = new Map();
let ws;

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((res, rej) => {
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJs(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
  return r.result?.value;
}

async function waitFor(expression, label, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (await evalJs(expression)) return true;
    await sleep(250);
  }
  throw new Error(`timeout: ${label}`);
}

/**
 * Cho "mem": het luot ma chua dat thi di tiep, khong nem loi.
 * Dung cho thuoc tinh CHI co o mot so theme (vd texture tren phim chi co o
 * theme anh) — theme chi-palette se khong bao gio dat, khong the coi la loi.
 */
async function waitForSoft(expression, label, tries = 16) {
  for (let i = 0; i < tries; i++) {
    if (await evalJs(expression)) return true;
    await sleep(250);
  }
  console.log(`    (bo qua: ${label} — theme nay khong co)`);
  return false;
}

try {
  const url = await targetUrl();
  ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await waitFor("document.readyState === 'complete'", "page load");
  await waitFor("document.querySelectorAll('#presetGrid .preset-card').length > 60", "preset grid");

  const doc = await send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "#fileInput" });

  for (const id of ids) {
    const file = resolve(`themes/${id}.vqeaf`);
    await send("DOM.setFileInputFiles", { nodeId, files: [file] });
    await waitForSoft(
      `(() => { const k = document.querySelector('#keypad'); if (!k || !k.classList.contains('texture-on-keys')) return false; const t = k.style.getPropertyValue('--key-texture') || ''; return t.startsWith('url('); })()`,
      `${id} texture ap vao phim`,
    );
    await waitFor("document.querySelector('#phone').getBoundingClientRect().height > 200", "phone visible");
    await sleep(600);

    const rect = await evalJs(`(() => { const r = document.querySelector('#phone').getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 2 },
    });
    const out = join(outDir, `${id}.png`);
    writeFileSync(out, Buffer.from(shot.data, "base64"));

    const info = await evalJs(`(() => {
      const k = document.querySelector('#keypad');
      // Phai scope vao #keypad: #buttonBuilder dung TRUOC #keypad trong DOM va
      // nut xem truoc cua no cung mang data-key="ok" -> neu khong scope se doc
      // nham nut preview (bay da tung gap o verify_key_shape_ui.mjs).
      const ok = document.querySelector('#keypad .key[data-key="ok"]');
      const cards = [...document.querySelectorAll('#presetGrid .preset-card strong')].map(e => e.textContent);
      const cs = ok ? getComputedStyle(ok) : null;
      return {
        themeName: document.querySelector('#themeName')?.value || '',
        textureOnKeys: k.classList.contains('texture-on-keys'),
        textureOpacity: k.style.getPropertyValue('--key-texture-opacity'),
        textureBlend: k.style.getPropertyValue('--key-texture-blend'),
        frameBg: document.querySelector('#frameBackgroundLayer').style.backgroundImage || 'none',
        okKeyBg: cs ? cs.backgroundImage.slice(0, 60) : 'n/a',
        okKeyBorder: cs ? cs.borderTopWidth + ' ' + cs.borderTopColor : 'n/a',
        okKeyColor: cs ? cs.color : 'n/a',
        capBase: getComputedStyle(document.querySelector('#phone')).getPropertyValue('--capBase').trim(),
        keyCount: document.querySelectorAll('#keypad .key[data-key]').length,
        presetCount: cards.length,
        hasNewPresets: ['Spooky Vibes','Pika Arcade','Pika Honey'].every(n => cards.includes(n))
      }; })()`);
    console.log(`\n[${id}] -> ${out}`);
    console.log("   ", JSON.stringify(info, null, 0));
    if (!info.hasNewPresets) { console.error("   !! preset moi KHONG xuat hien trong #presetGrid"); process.exitCode = 1; }
  }
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
