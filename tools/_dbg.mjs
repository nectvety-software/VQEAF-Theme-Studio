import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = join(process.env.USERPROFILE, "AppData/Local/ms-playwright/chromium-901522/chrome-win/chrome.exe");
const STUDIO = "http://127.0.0.1:8099/";
const PORT = 9223;
const profile = join(tmpdir(), `vqeaf-dbg-${Date.now()}`);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--window-size=1400,1600", STUDIO], { stdio: "ignore" });

let url;
for (let i = 0; i < 60 && !url; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    url = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!url) await sleep(250);
}
const ws = new WebSocket(url);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === "Runtime.consoleAPICalled") console.log("CONSOLE", m.params.type, m.params.args.map(a => a.value ?? a.description).join(" "));
  else if (m.method === "Runtime.exceptionThrown") console.log("EXCEPTION", m.params.exceptionDetails.text, m.params.exceptionDetails.exception?.description);
  else if (m.method === "Log.entryAdded") console.log("LOG", m.params.entry.level, m.params.entry.text);
};
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Page.reload", { ignoreCache: true });
await sleep(5000);
const r = await send("Runtime.evaluate", {
  expression: `JSON.stringify({
    ready: document.readyState,
    cards: document.querySelectorAll('#presetGrid .preset-card').length,
    gridExists: !!document.querySelector('#presetGrid'),
    phoneExists: !!document.querySelector('#phone'),
    keys: document.querySelectorAll('.key[data-key]').length,
    scripts: [...document.querySelectorAll('script')].map(s=>s.type+':'+(s.src||'inline'))
  })`, returnByValue: true,
});
console.log("STATE", r.result?.result?.value, r.result?.exceptionDetails?.text || "");
ws.close(); chrome.kill();
await sleep(300);
