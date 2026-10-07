/**
 * Chup "gallery" 10 hinh dang nut (V3.7.11) tu STUDIO THAT (khong ve lai bang tay).
 *   node tools/shoot_shape_gallery.mjs
 *
 * -> tools/shots/_shape_<ten>.png      anh rieng tung nut (clip.scale=3, co padding)
 * -> tools/shots/shape_keypad.png      ca ban phim: 10 phim so, moi phim 1 kieu
 * -> tools/shots/_shape_manifest.json  [{shape,label,file}] cho tools/make_shape_sheet.py
 *
 * Yeu cau: server tinh o http://127.0.0.1:8099/
 * Dung state MAC DINH cua studio (khong import theme) de nut mau dac, de nhin hinh.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = process.env.CHROME ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const STUDIO = "http://127.0.0.1:8099/";
const PORT = 9233;
const outDir = resolve("tools/shots");
mkdirSync(outDir, { recursive: true });
const profile = join(tmpdir(), `vqeaf-shapegal-${Date.now()}`);

// 10 kieu, thu tu khop KEY_SHAPE_DEFS trong src/app.js
const SHAPES = ["capsule","pill","square","circle","rhombus","hexagon","octagon","triangle","parallelogram","star"];
// 10 phim SO (cung co 30px) -> so sanh hinh cho cong bang
const KEYS = ["1","2","3","4","5","6","7","8","9","*"];

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--no-proxy-server", "--proxy-bypass-list=*", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--window-size=1500,1700", STUDIO,
], { stdio: "ignore" });

let fail = 0;
const ok = (cond, label) => { console.log((cond ? "OK   " : "FAIL ") + label); if (!cond) fail++; };

let ws;
try {
  let url;
  for (let i = 0; i < 80 && !url; i++) {
    try {
      url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json())
        .find((t) => t.type === "page" && t.url.startsWith(STUDIO))?.webSocketDebuggerUrl;
    } catch {}
    if (!url) await sleep(250);
  }
  if (!url) throw new Error("khong ket noi duoc chromium");

  ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map(); const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pend.set(i, (m) => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result?.value;
  };
  const waitFor = async (expr, label, tries = 120) => {
    for (let i = 0; i < tries; i++) { if (await ev(expr)) return; await sleep(250); }
    throw new Error("timeout: " + label);
  };
  const shot = async (selector, file, pad = 0, scale = 3) => {
    const r = await ev(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return null;
      const b=e.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; })()`);
    if (!r) throw new Error("khong thay " + selector);
    const clip = { x: r.x - pad, y: r.y - pad, width: r.width + pad * 2, height: r.height + pad * 2, scale };
    const png = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
    writeFileSync(join(outDir, file), Buffer.from(png.data, "base64"));
    return file;
  };
  /** Dat 1 range trong nhom "Hình dạng nút" theo min/max cua chinh no. */
  const setRange = async (min, max, value) => {
    await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
      const r=[...g.querySelectorAll('input[type=range]')].find(i=>i.min===${JSON.stringify(String(min))} && i.max===${JSON.stringify(String(max))});
      r.value=${JSON.stringify(String(value))}; r.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  };
  const setShape = async (v) => {
    await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
      const s=g.querySelector('select'); s.value=${JSON.stringify(v)}; s.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  };

  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable");
  await waitFor("document.querySelectorAll('#presetGrid .preset-card').length > 60", "preset grid");

  // Phong to het co de nut to, ro hinh
  await ev(`(() => { const z=document.querySelector('#zoomRange'); z.value='130'; z.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await sleep(400);

  // Nhan tieng Viet cua tung kieu lay tu chinh <select> cua studio
  await ev(`document.querySelector('#keypad .key[data-key="1"]').click()`);
  await waitFor(`[...document.querySelectorAll('#inspector h3')].some(h=>h.textContent.includes('Hình dạng nút'))`, "nhom hinh dang");
  const labels = await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
    return Object.fromEntries([...g.querySelector('select').options].map(o=>[o.value,o.textContent])); })()`);
  ok(Object.keys(labels).length === 10, `doc duoc ${Object.keys(labels).length} nhan kieu dang tu studio`);

  // Gan moi kieu cho 1 phim so
  for (let i = 0; i < SHAPES.length; i++) {
    const sh = SHAPES[i], key = KEYS[i];
    await ev(`document.querySelector('#keypad .key[data-key="${key}"]').click()`);
    await sleep(120);
    await setShape(sh);
    await setRange(0, 6, 2);                 // Vien noi 2 -> thay khoi noi tren da giac
    if (sh === "capsule") await setRange(0, 24, 14);  // capsule can bo goc lon moi khac 'square'
    await sleep(260);
  }

  const manifest = [];
  for (let i = 0; i < SHAPES.length; i++) {
    const sh = SHAPES[i], key = KEYS[i];
    const file = `_shape_${sh}.png`;
    await shot(`#keypad .key[data-key="${key}"]`, file, 12);
    manifest.push({ shape: sh, label: labels[sh] || sh, key, file });
    console.log(`     -> tools/shots/${file}`);
  }
  await shot("#keypad", "shape_keypad.png", 10, 2);
  console.log("     -> tools/shots/shape_keypad.png");

  writeFileSync(join(outDir, "_shape_manifest.json"), JSON.stringify(manifest, null, 2));
  ok(manifest.length === 10, "ghi manifest 10 kieu");
  ok(errors.length === 0, errors.length ? `co loi JS: ${errors.join(" | ")}` : "khong co loi JS trong trang");
} catch (err) {
  console.error("FAIL " + err.message);
  fail++;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

console.log(fail ? `\n${fail} CHECK FAILED` : "\nDONE");
process.exit(fail ? 1 : 0);
