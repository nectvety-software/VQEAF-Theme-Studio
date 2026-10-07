/**
 * UI test cho "Hình dạng nút" (V3.7.10) — chay studio that trong headless Chrome:
 *   1. nhap themes/pika_arcade.vqeaf qua o "Nhap .vqeaf"
 *   2. click 1 phim  -> panel PHAI phai hien nhom "Hình dạng nút"
 *   3. doi Kieu dang sang pill/square, doi Vien noi -> assert nut doi that
 *   4. chup preview + panel phai ra tools/shots/
 *
 *   node tools/verify_key_shape_ui.mjs
 * Yeu cau: server tinh o http://127.0.0.1:8099/
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = process.env.CHROME ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const STUDIO = "http://127.0.0.1:8099/";
const PORT = 9228;
const outDir = resolve("tools/shots");
mkdirSync(outDir, { recursive: true });
const profile = join(tmpdir(), `vqeaf-shapeui-${Date.now()}`);

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--no-proxy-server", "--proxy-bypass-list=*", "--hide-scrollbars",
  "--force-device-scale-factor=2", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--window-size=1400,1600", STUDIO,
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
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text + " " + (m.params.exceptionDetails.exception?.description || ""));
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
  const shot = async (selector, file) => {
    const r = await ev(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return null; const b=e.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; })()`);
    if (!r) throw new Error("khong thay " + selector);
    const png = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...r, scale: 2 } });
    writeFileSync(join(outDir, file), Buffer.from(png.data, "base64"));
    console.log(`     -> tools/shots/${file}`);
  };

  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable");
  await waitFor("document.querySelectorAll('#presetGrid .preset-card').length > 60", "preset grid");

  // 1. nhap theme that
  const doc = await send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "#fileInput" });
  await send("DOM.setFileInputFiles", { nodeId, files: [resolve("themes/pika_arcade.vqeaf")] });
  await waitFor("document.querySelector('#keypad').classList.contains('texture-on-keys')", "import theme");
  ok(true, "nhap pika_arcade.vqeaf thanh cong");

  // 2. chon 1 phim -> panel phai
  //    LUU Y: phai scope '#keypad' — nut xem truoc trong Button Builder cung
  //    mang '.key[data-key="ok"]' va dung TRUOC #keypad trong DOM.
  await ev(`document.querySelector('#keypad .key[data-key="ok"]').click()`);
  await waitFor(`[...document.querySelectorAll('#inspector h3')].some(h => h.textContent.includes('Hình dạng nút'))`, "nhom Hình dạng nút");
  ok(true, "panel phai co nhom 'Hình dạng nút' khi chon 1 phim");
  ok(await ev(`document.querySelector('#keypad .key[data-key="ok"]').classList.contains('is-selected')`),
    "phim THAT tren dien thoai duoc to sang (is-selected) — khong bi nut preview cuop");

  const ui = await ev(`(() => {
    const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
    const labels=[...g.querySelectorAll('.field > span')].map(s=>s.textContent.trim());
    const sel=g.querySelector('select');
    const btns=[...g.querySelectorAll('button')].map(b=>b.textContent.trim());
    return { labels, shapeValue:sel?.value, shapeOptions:[...sel.options].map(o=>o.value), btns };
  })()`);
  ok(ui.labels.includes("Kiểu dáng") && ui.labels.includes("Viền nổi"), `5 control: ${ui.labels.join(' | ')}`);
  ok(ui.shapeValue === "square", `kieu dang hien tai = ${ui.shapeValue} (tu .vqeaf)`);
  const SHAPES = ["capsule","pill","square","circle","rhombus","hexagon","octagon","triangle","parallelogram","star"];
  const POLY = ["rhombus","hexagon","octagon","triangle","parallelogram","star"];
  ok(JSON.stringify(ui.shapeOptions) === JSON.stringify(SHAPES), `${ui.shapeOptions.length} lua chon kieu: ${ui.shapeOptions.join(", ")}`);
  ok(ui.btns.length === 3, `3 nut ap nhanh: ${ui.btns.join(" / ")}`);

  const radius0 = await ev(`getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]')).borderRadius`);
  ok(radius0 === "6px", `nut 'ok' bo goc ${radius0} (keycap)`);
  const shadow0 = await ev(`getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]')).boxShadow`);
  ok(/inset/.test(shadow0), "nut 'ok' co vien noi (box-shadow inset)");

  // 3. doi kieu dang -> nut phai doi that
  const setShape = async (v) => {
    await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
      const s=g.querySelector('select'); s.value=${JSON.stringify(v)}; s.dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await sleep(300);
  };
  await setShape("pill");
  ok((await ev(`getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]')).borderRadius`)) === "999px", "doi sang pill -> bo goc 999px");
  await setShape("square");
  ok((await ev(`getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]')).borderRadius`)) === "6px", "doi lai square -> bo goc 6px");

  // 3b. ca 10 kieu dang -> kiem tra CSS THAT (border-radius / clip-path / filter)
  for (const sh of SHAPES) {
    await setShape(sh);
    const st = await ev(`(() => { const c=getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]'));
      return { r:c.borderRadius, clip:c.clipPath, filter:c.filter }; })()`);
    const wantPoly = POLY.includes(sh);
    const isPoly = !!st.clip && st.clip !== "none" && st.clip.startsWith("polygon");
    ok(isPoly === wantPoly, `${sh}: clip-path ${isPoly ? "CO" : "khong"} (${String(st.clip).slice(0,30)})`);
    if (wantPoly) {
      ok(st.r === "0px", `${sh}: bo goc 0px (da giac khong dung border-radius)`);
      ok(!!st.filter && st.filter.includes("drop-shadow"), `${sh}: shadow ngoai bang drop-shadow (khong bi clip-path cat)`);
    }
  }
  await setShape("square");

  // bevel = 0 -> khong con inset
  await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
    const r=[...g.querySelectorAll('input[type=range]')].find(i=>i.min==='0'&&i.max==='6'); r.value='0'; r.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await sleep(300);
  ok(!/inset/.test(await ev(`getComputedStyle(document.querySelector('#keypad .key[data-key="ok"]')).boxShadow`)), "Vien noi = 0 -> bo inset (tat keycap)");

  // 4. ap cho ca ban phim
  await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
    [...g.querySelectorAll('button')].find(b=>b.textContent.includes('cả bàn phím')).click(); })()`);
  await sleep(400);
  const allNoBevel = await ev(`[...document.querySelectorAll('#keypad .key[data-key]')].every(k=>!/inset/.test(getComputedStyle(k).boxShadow))`);
  ok(allNoBevel, "'Áp cho cả bàn phím' -> moi phim theo shape dang chon");

  // tra ve keycap 2dp de chup anh
  await ev(`(() => { const g=[...document.querySelectorAll('#inspector .inspector-group')].find(x=>x.querySelector('h3')?.textContent.includes('Hình dạng nút'));
    const r=[...g.querySelectorAll('input[type=range]')].find(i=>i.min==='0'&&i.max==='6'); r.value='2'; r.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await sleep(400);
  await ev(`document.querySelector('#phone').scrollIntoView()`);
  await sleep(300);
  await shot("#phone", "keycap_pika_arcade.png");
  await shot(".right-panel", "panel_phai_hinh_dang.png");

  // 5. Regression cho 2 theme con lai: viec scope '#keypad' vao applyKeyStyles
  //    KHONG duoc lam hong hinh dang nut, va nut xem truoc Button Builder
  //    (nay chi con duoc ve boi renderButtonBuilderPreview) van phai co style.
  for (const t of ["spooky_vibes", "pika_honey"]) {
    const d2 = await send("DOM.getDocument", { depth: -1 });
    const q2 = await send("DOM.querySelector", { nodeId: d2.root.nodeId, selector: "#fileInput" });
    await send("DOM.setFileInputFiles", { nodeId: q2.nodeId, files: [resolve(`themes/${t}.vqeaf`)] });
    await waitFor(`document.querySelector('#keypad').classList.contains('texture-on-keys')`, "import " + t);
    await sleep(400);
    const r = await ev(`(() => {
      const keys=[...document.querySelectorAll('#keypad .key[data-key]')];
      const prev=document.querySelector('#buttonBuilderPreviewKey');
      return {
        n: keys.length,
        keycap: keys.every(k=>getComputedStyle(k).borderRadius==='6px'),
        bevel:  keys.every(k=>/inset/.test(getComputedStyle(k).boxShadow)),
        prevStyled: getComputedStyle(prev).backgroundImage.startsWith('linear-gradient'),
        prevRadius: getComputedStyle(prev).borderRadius,
      };
    })()`);
    ok(r.n === 19, `${t}: ${r.n} phim trong #keypad`);
    ok(r.keycap, `${t}: ca 19 phim vuong keycap 6px`);
    ok(r.bevel, `${t}: ca 19 phim co vien noi`);
    ok(r.prevStyled && r.prevRadius === "6px", `${t}: nut xem truoc Button Builder van duoc to style (radius ${r.prevRadius})`);
  }

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

console.log(fail ? `\n${fail} CHECK FAILED` : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
