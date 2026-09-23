import { presets, draggableComponents, buttonPresets, buttonDecorations } from './presets.js?v=3.7.7';
import { serializeTheme, parseVqeaf } from './vqeaf.js?v=3.7.7';

const defaultPreset = presets[1];
const DEFAULT_LAYER_ORDER = ['frameBackground','frameFx','screen','keypad','decorations','network','badges'];
const LAYER_META = {
  frameBackground: { label:'Nền khung máy', icon:'▧', component:'phoneShell' },
  frameFx: { label:'Khung / Frame FX', icon:'▣', component:'phoneShell' },
  screen: { label:'LCD Screen', icon:'▤', component:'screen' },
  keypad: { label:'Keypad', icon:'⌨', component:'keypad' },
  decorations: { label:'Decoration', icon:'✦', component:'decoration' },
  network: { label:'Network LED', icon:'●', component:'networkLed' },
  badges: { label:'menuButton / fpsBadge', icon:'◉', component:'menuButton' }
};

const ALL_KEY_IDS = ['menu','up','rsk','left','ok','right','down','1','2','3','4','5','6','7','8','9','*','0','#'];
const KEY_GROUPS = {
  navigation:['menu','up','rsk','left','ok','right','down'],
  digits:['1','2','3','4','5','6','7','8','9','*','0','#'],
  all:ALL_KEY_IDS
};
const DECOR_EMOJI = Object.fromEntries(buttonDecorations);
function cloneButtonPreset(id='candy_green') {
  const p=buttonPresets.find(x=>x.id===id) || buttonPresets[0];
  return { presetId:p.id, ...structuredClone(p.style) };
}
function normalizeButtonStyle(s={}) {
  return { ...cloneButtonPreset(s.presetId || 'candy_green'), ...s };
}
function freshButtonBuilder() { return { target:'selected', presetId:'candy_green', previewState:'normal' }; }

function freshBackground() {
  return { dataUrl:null, name:'', opacity:.42, fit:'cover', blend:'soft-light', position:'below', renderMode:'per-key-texture', textureMode:'per-key', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1.08, saturation:1, readabilityAssist:true, rotation:0, flipX:false, flipY:false };
}
function freshFrameBackground() {
  return { dataUrl:null, name:'', opacity:.45, fit:'cover', blend:'overlay', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1, saturation:1, raised:false, clip:true, rotation:0, flipX:false, flipY:false };
}

function freshEffects() {
  return { frameFxOpacity:.12, frameFxBlend:'screen', floatEnabled:false, floatAmplitude:6, floatDuration:3200, floatShadow:30 };
}
function freshBadgeStyle(kind='menu', theme=defaultPreset.theme) {
  return {
    appearance: kind==='fps' ? 'glass' : 'solid',
    background: theme.key,
    border: theme.keyBorder,
    text: theme.keyText,
    accent: theme.accent,
    glow: theme.glow,
    radius: 18,
    borderWidth: 1,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: .04,
    opacity: 1,
    glowRadius: kind==='fps' ? 6 : 8,
    shadow: 18,
    paddingX: 13,
    paddingY: 11,
    dotSize: 6,
    dotGlow: 8,
    uppercase: true
  };
}
function badgeStyleFromTheme(kind, theme) {
  const b=freshBadgeStyle(kind,theme);
  if(kind==='menu') { b.background=theme.key; b.border=theme.keyBorder; b.text=theme.keyText; }
  else { b.background=theme.shellBottom; b.border=theme.shellBorder; b.text=theme.sub || theme.keyText; }
  return b;
}
function freshState() {
  return {
    themeId: defaultPreset.id,
    themeName: defaultPreset.name,
    autoId:true,
    theme: structuredClone(defaultPreset.theme),
    orientation:'portrait',
    zoom:.9,
    grid:true,
    selected:'phoneShell',
    selectedDecoration:null,
    decorations:[],
    keypadBackground:freshBackground(),
    frameBackground:freshFrameBackground(),
    effects:freshEffects(),
    menuStyle:freshBadgeStyle('menu'),
    fpsStyle:freshBadgeStyle('fps'),
    buttonStyles:{},
    buttonBuilder:freshButtonBuilder(),
    selectedKey:'ok',
    layerOrder:[...DEFAULT_LAYER_ORDER],
    undo:[],
    redo:[]
  };
}
const state = freshState();

const els = {
  phone: document.querySelector('#phone'),
  stage: document.querySelector('#stage'),
  inspector: document.querySelector('#inspector'),
  title: document.querySelector('#selectedTitle'),
  selectedId: document.querySelector('#selectedId'),
  code: document.querySelector('#codePreview'),
  presetGrid: document.querySelector('#presetGrid'),
  componentPalette: document.querySelector('#componentPalette'),
  layerList: document.querySelector('#layerList'),
  decorationLayerList: document.querySelector('#decorationLayerList'),
  decorationLayer: document.querySelector('#decorationLayer'),
  frameFxLayer: document.querySelector('#frameFxLayer'),
  frameBgLayer: document.querySelector('#frameBackgroundLayer'),
  keypadBgLayer: document.querySelector('#keypadBackgroundLayer'),
  themeName: document.querySelector('#themeName'),
  themeId: document.querySelector('#themeId'),
  autoId: document.querySelector('#autoIdToggle'),
  file: document.querySelector('#fileInput'),
  bgFile: document.querySelector('#backgroundFileInput'),
  frameBgFile: document.querySelector('#frameBackgroundFileInput'),
  bgBadge: document.querySelector('#backgroundBadge'),
  bgQuick: document.querySelector('#backgroundQuickControls'),
  frameBgBadge: document.querySelector('#frameBackgroundBadge'),
  frameBgQuick: document.querySelector('#frameBackgroundQuickControls'),
  zoom: document.querySelector('#zoomRange'),
  zoomValue: document.querySelector('#zoomValue'),
  grid: document.querySelector('#gridToggle'),
  autosaveStatus: document.querySelector('#autosaveStatus'),
  buttonBuilder: document.querySelector('#buttonBuilder')
};

const labels = {
  phoneShell:'Phone Shell', screen:'LCD Screen', key:'Keypad Key', keypad:'Keypad', networkLed:'Network LED',
  menuButton:'Menu Bubble', fpsBadge:'Shot Badge', decoration:'Decoration'
};

// Nhãn T9 khớp sheet sản phẩm classic (1∞, 0 _, #⇧)
const numRows = [['1','∞'],['2','abc'],['3','def'],['4','ghi'],['5','jkl'],['6','mno'],['7','pqrs'],['8','tuv'],['9','wxyz'],['*','+'],['0','_'],['#','⇧']];
for (let r=0;r<4;r++) {
  const row = document.createElement('div');
  row.className='key-row';
  numRows.slice(r*3,r*3+3).forEach(([n,s])=>{
    const b=document.createElement('button');
    b.className='key num key-pill selectable';
    b.dataset.component='key';
    b.dataset.key=n;
    b.innerHTML=`<span>${n}</span><span class="sub">${s}</span>`;
    row.appendChild(b);
  });
  document.querySelector('#numberRows').appendChild(row);
}

function serializableState() {
  return {
    themeId:state.themeId,
    themeName:state.themeName,
    autoId:state.autoId,
    theme:state.theme,
    decorations:state.decorations,
    keypadBackground:state.keypadBackground,
    frameBackground:state.frameBackground,
    effects:state.effects,
    menuStyle:state.menuStyle,
    fpsStyle:state.fpsStyle,
    buttonStyles:state.buttonStyles,
    buttonBuilder:state.buttonBuilder,
    layerOrder:state.layerOrder,
    orientation:state.orientation,
    zoom:state.zoom,
    grid:state.grid
  };
}
function snapshot() { return JSON.stringify(serializableState()); }
function pushUndoSnapshot(before) {
  if (!before || before === snapshot()) return;
  state.undo.push(before);
  if (state.undo.length > 100) state.undo.shift();
  state.redo.length = 0;
}
function commit(mutator, full=true) {
  const before=snapshot();
  mutator();
  pushUndoSnapshot(before);
  renderAll(full);
}
function normalizeLoaded(x={}) {
  const base=freshState();
  return {
    ...base,
    ...x,
    theme:{...base.theme,...(x.theme||{})},
    keypadBackground:{...freshBackground(),...(x.keypadBackground||{})},
    frameBackground:{...freshFrameBackground(),...(x.frameBackground||{})},
    effects:{...freshEffects(),...(x.effects||{})},
    menuStyle:{...freshBadgeStyle('menu', {...base.theme,...(x.theme||{})}),...(x.menuStyle||{})},
    fpsStyle:{...freshBadgeStyle('fps', {...base.theme,...(x.theme||{})}),...(x.fpsStyle||{})},
    buttonStyles:Object.fromEntries(Object.entries(x.buttonStyles||{}).map(([k,v])=>[k,normalizeButtonStyle(v)])),
    buttonBuilder:{...freshButtonBuilder(),...(x.buttonBuilder||{})},
    selectedKey:x.selectedKey || 'ok',
    layerOrder:(()=>{ const a=Array.isArray(x.layerOrder)?x.layerOrder.filter(v=>DEFAULT_LAYER_ORDER.includes(v)):[]; for(const id of DEFAULT_LAYER_ORDER) if(!a.includes(id)) a.push(id); return a; })(),
    decorations:Array.isArray(x.decorations) ? x.decorations.map((d,i)=>({
      id:d.id || `${Date.now().toString(36)}${i}`,
      type:d.type || 'star', x:Number(d.x||0), y:Number(d.y||0), size:Number(d.size||28), rotation:Number(d.rotation||0),
      opacity:Number(d.opacity ?? 1), color:d.color || '#FFB13B', flipX:Boolean(d.flipX), flipY:Boolean(d.flipY), floating:Boolean(d.floating),
      floatAmplitude:Number(d.floatAmplitude ?? 5), floatDuration:Number(d.floatDuration ?? 2600), zIndex:Number(d.zIndex ?? i)
    })) : []
  };
}
function restoreSnapshot(s, preserveHistory=true) {
  const undo=state.undo, redo=state.redo;
  const x=normalizeLoaded(typeof s === 'string' ? JSON.parse(s) : s);
  Object.assign(state,x);
  if (preserveHistory) { state.undo=undo; state.redo=redo; }
  syncControls();
  renderAll();
}
function undo() {
  if (!state.undo.length) return;
  const current=snapshot();
  const previous=state.undo.pop();
  state.redo.push(current);
  restoreSnapshot(previous,true);
}
function redo() {
  if (!state.redo.length) return;
  const current=snapshot();
  const next=state.redo.pop();
  state.undo.push(current);
  restoreSnapshot(next,true);
}

function syncControls() {
  els.themeName.value=state.themeName;
  els.themeId.value=state.themeId;
  els.autoId.checked=state.autoId;
  els.zoom.value=Math.round(state.zoom*100);
  els.zoomValue.textContent=`${Math.round(state.zoom*100)}%`;
  els.grid.checked=state.grid;
  els.stage.classList.toggle('grid-on',state.grid);
  document.querySelectorAll('[data-orientation]').forEach(b=>b.classList.toggle('active',b.dataset.orientation===state.orientation));
}

function applyTheme() {
  const t=state.theme, st=els.phone.style;
  st.setProperty('--shell-top',t.shellTop); st.setProperty('--shell-bottom',t.shellBottom); st.setProperty('--shell-border',t.shellBorder); st.setProperty('--screen',t.screen);
  st.setProperty('--key',t.key); st.setProperty('--keyPressed',t.keyPressed); st.setProperty('--keyBorder',t.keyBorder); st.setProperty('--keyText',t.keyText);
  st.setProperty('--sub',t.sub); st.setProperty('--glow',t.glow); st.setProperty('--radius',`${t.radius}px`); st.setProperty('--keyRadius',`${t.keyRadius}px`);
  st.setProperty('--zoom',state.zoom); st.setProperty('--floatAmp',`${state.effects.floatAmplitude}px`); st.setProperty('--floatDuration',`${state.effects.floatDuration}ms`); st.setProperty('--floatShadow',`${state.effects.floatShadow}px`);
  els.phone.classList.toggle('landscape',state.orientation==='landscape');
  els.phone.classList.toggle('float-enabled',Boolean(state.effects.floatEnabled));

  const led=document.querySelector('.network-led');
  const ledRow=document.querySelector('.network-led-row');
  led.style.background=t.accent; led.style.boxShadow=`0 0 10px ${t.accent}`; ledRow.style.color=t.accent;
  const fpsStrip=document.querySelector('#fpsStrip');
  if (fpsStrip) {
    // FPS strip nằm dưới dải WiFi trong khung (giống PortraitPhone của VXPQeaf)
    fpsStrip.style.color = t.accent;
  }

  els.frameFxLayer.style.opacity=String(state.effects.frameFxOpacity);
  els.frameFxLayer.style.mixBlendMode=state.effects.frameFxBlend;

  const frameBg=state.frameBackground;
  els.frameBgLayer.style.backgroundImage=frameBg.dataUrl ? `url(${JSON.stringify(frameBg.dataUrl)})` : 'none';
  els.frameBgLayer.style.opacity=frameBg.dataUrl ? String(frameBg.opacity) : '0';
  els.frameBgLayer.style.backgroundSize=frameBg.fit==='stretch' ? '100% 100%' : frameBg.fit;
  els.frameBgLayer.style.backgroundPosition='center';
  els.frameBgLayer.style.mixBlendMode=frameBg.blend;
  els.frameBgLayer.style.borderRadius=frameBg.clip===false ? '0' : 'inherit';
  els.frameBgLayer.style.overflow=frameBg.clip===false ? 'visible' : 'hidden';
  els.frameBgLayer.style.filter=`brightness(${frameBg.brightness}) contrast(${frameBg.contrast}) saturate(${frameBg.saturation})${frameBg.blur ? ` blur(${frameBg.blur}px)` : ''}`;
  els.frameBgLayer.style.transform=`translate(${frameBg.offsetX}px,${frameBg.offsetY}px) rotate(${frameBg.rotation||0}deg) scale(${frameBg.scale}) scaleX(${frameBg.flipX?-1:1}) scaleY(${frameBg.flipY?-1:1})`;
  els.phone.classList.toggle('frame-bg-raised',Boolean(frameBg.raised));

  const bg=state.keypadBackground;
  const keypad=document.querySelector('.keypad');
  const perKey=Boolean(bg.dataUrl && bg.position==='above' && bg.renderMode!=='overlay-full');
  keypad.classList.toggle('texture-on-keys',perKey);
  keypad.classList.toggle('texture-readability',perKey && bg.readabilityAssist !== false);
  keypad.style.setProperty('--key-texture',bg.dataUrl ? `url(${JSON.stringify(bg.dataUrl)})` : 'none');
  keypad.style.setProperty('--key-texture-opacity',String(bg.opacity));
  keypad.style.setProperty('--key-texture-size',bg.fit==='stretch' ? '100% 100%' : bg.fit);
  keypad.style.setProperty('--key-texture-blend',bg.blend || 'soft-light');
  keypad.style.setProperty('--key-texture-filter',`brightness(${bg.brightness}) contrast(${bg.contrast}) saturate(${bg.saturation})${bg.blur ? ` blur(${bg.blur}px)` : ''}`);
  keypad.style.setProperty('--key-texture-scale',String(bg.scale));
  keypad.style.setProperty('--key-texture-rotation',`${bg.rotation||0}deg`);
  keypad.style.setProperty('--key-texture-flip-x',String(bg.flipX?-1:1));
  keypad.style.setProperty('--key-texture-flip-y',String(bg.flipY?-1:1));
  keypad.style.setProperty('--key-texture-x',`${bg.offsetX}px`);
  keypad.style.setProperty('--key-texture-y',`${bg.offsetY}px`);
  els.keypadBgLayer.style.backgroundImage=bg.dataUrl ? `url(${JSON.stringify(bg.dataUrl)})` : 'none';
  els.keypadBgLayer.style.opacity=(bg.dataUrl && !perKey) ? String(bg.opacity) : '0';
  els.keypadBgLayer.style.backgroundSize=bg.fit==='stretch' ? '100% 100%' : bg.fit;
  els.keypadBgLayer.style.backgroundPosition='center';
  els.keypadBgLayer.style.mixBlendMode=bg.blend;
  els.keypadBgLayer.style.filter=`brightness(${bg.brightness}) contrast(${bg.contrast}) saturate(${bg.saturation})${bg.blur ? ` blur(${bg.blur}px)` : ''}`;
  els.keypadBgLayer.style.transform=`translate(${bg.offsetX}px,${bg.offsetY}px) rotate(${bg.rotation||0}deg) scale(${bg.scale}) scaleX(${bg.flipX?-1:1}) scaleY(${bg.flipY?-1:1})`;
  els.keypadBgLayer.style.zIndex=bg.position==='above' ? '5' : '0';

  applyBadgeStyle(document.querySelector('.menu-badge'), state.menuStyle, 'menu');
  applyBadgeStyle(document.querySelector('.shot-badge'), state.fpsStyle, 'fps');
  applyKeyStyles();

  applyLayerOrder();
}

function applyBadgeStyle(el, style, kind) {
  if(!el || !style) return;
  const alphaHex=Math.round(Math.max(0,Math.min(1,style.opacity ?? 1))*255).toString(16).padStart(2,'0').toUpperCase();
  const bg=normalizeColor(style.background || '#151F2E');
  const border=normalizeColor(style.border || '#40506C');
  const text=normalizeColor(style.text || '#FFFFFF');
  const glow=normalizeColor(style.glow || '#000000');
  const accent=normalizeColor(style.accent || '#65DC96');
  const appearance=style.appearance || 'solid';
  el.style.borderRadius=`${Number(style.radius ?? 18)}px`;
  el.style.borderWidth=`${Number(style.borderWidth ?? 1)}px`;
  el.style.borderStyle='solid';
  el.style.borderColor=border;
  el.style.color=text;
  el.style.fontSize=`${Number(style.fontSize ?? 11)}px`;
  el.style.fontWeight=String(Number(style.fontWeight ?? 800));
  el.style.letterSpacing=`${Number(style.letterSpacing ?? .04)}em`;
  el.style.padding=`${Number(style.paddingY ?? 11)}px ${Number(style.paddingX ?? 13)}px`;
  el.style.opacity=String(Number(style.opacity ?? 1));
  el.style.textTransform=style.uppercase===false ? 'none' : 'uppercase';
  let background=bg;
  let shadow=`0 ${Math.max(3,Math.round(Number(style.shadow ?? 18)*.45))}px ${Number(style.shadow ?? 18)}px #0006`;
  if(appearance==='glass') {
    background=`linear-gradient(180deg, ${bg}${alphaHex}, ${bg}99)`;
    el.style.backdropFilter='blur(8px) saturate(1.15)';
    shadow+=`, inset 0 1px 0 #FFFFFF20`;
  } else if(appearance==='outline') {
    background='#00000022';
    el.style.backdropFilter='blur(3px)';
  } else if(appearance==='neon') {
    background=`linear-gradient(180deg, ${bg}F2, ${bg}CC)`;
    shadow+=`, 0 0 ${Number(style.glowRadius ?? 8)}px ${glow}, inset 0 0 ${Math.max(2,Number(style.glowRadius ?? 8)*.45)}px ${glow}66`;
  } else if(appearance==='pixel') {
    background=bg;
    el.style.borderRadius='3px';
    el.style.backdropFilter='none';
    shadow=`3px 3px 0 ${border}, 6px 6px 0 #0008`;
  } else {
    background=`linear-gradient(180deg, ${bg}, ${bg}E6)`;
    el.style.backdropFilter='none';
    if(Number(style.glowRadius ?? 0)>0) shadow+=`, 0 0 ${Number(style.glowRadius)}px ${glow}88`;
  }
  el.style.background=background;
  el.style.boxShadow=shadow;
  const dot=el.querySelector('i');
  if(dot) {
    dot.style.width=`${Number(style.dotSize ?? 6)}px`;
    dot.style.height=`${Number(style.dotSize ?? 6)}px`;
    dot.style.background=accent;
    dot.style.boxShadow=`0 0 ${Number(style.dotGlow ?? 8)}px ${accent}`;
  }
}


function keyLabelForId(id) {
  const map={menu:'MENU',up:'▲',rsk:'←',left:'◀',ok:'OK',right:'▶',down:'▼','*':'*','#':'#'};
  return map[id] || id;
}
function targetKeys(target=state.buttonBuilder?.target || 'selected') {
  if(target==='selected') return [state.selectedKey || 'ok'];
  return KEY_GROUPS[target] || [state.selectedKey || 'ok'];
}
function ensureButtonStyle(key=state.selectedKey || 'ok') {
  if(!state.buttonStyles[key]) state.buttonStyles[key]=cloneButtonPreset(state.buttonBuilder?.presetId || 'candy_green');
  return state.buttonStyles[key];
}
function decorationEmoji(name) {
  return (!name || name==='none') ? '' : (DECOR_EMOJI[name] || '✨');
}
function clearKeyCustomStyle(el) {
  el.classList.remove('custom-key','custom-disabled','custom-preview-pressed');
  for(const prop of ['background','borderColor','borderWidth','borderRadius','boxShadow','color','fontSize','fontWeight','textShadow']) el.style[prop]='';
  for(const prop of ['--custom-pressed-a','--custom-pressed-b','--custom-disabled-opacity','--custom-disabled-saturation','--custom-gloss-opacity','--custom-gloss-color']) el.style.removeProperty(prop);
  el.querySelectorAll('.key-decoration').forEach(x=>x.remove());
}
function applyStyleToKeyElement(el, style, keyId, previewState='normal') {
  clearKeyCustomStyle(el);
  if(!style) return;
  style=normalizeButtonStyle(style);
  el.classList.add('custom-key');
  const a=normalizeColor(style.colorA), b=normalizeColor(style.colorB), c=normalizeColor(style.colorC || style.colorB);
  el.style.background=`linear-gradient(180deg, ${a} 0%, ${b} 58%, ${c} 100%)`;
  el.style.borderColor=normalizeColor(style.border);
  el.style.borderWidth=`${Number(style.borderWidth ?? 2)}px`;
  el.style.borderRadius=`${Number(style.radius ?? 18)}px`;
  const shadow=normalizeColor(style.shadow || '#000000');
  const glow=normalizeColor(style.glow || '#000000');
  el.style.boxShadow=`0 ${Number(style.shadowY ?? 4)}px ${Number(style.shadowBlur ?? 10)}px ${shadow}, 0 0 ${Number(style.glowRadius ?? 0)}px ${glow}`;
  el.style.color=normalizeColor(style.text || '#FFFFFF');
  el.style.fontSize=`${Number(style.fontSize ?? 14)}px`;
  el.style.fontWeight=String(Number(style.fontWeight ?? 900));
  const outline=normalizeColor(style.textOutline || '#000000');
  const ow=Math.max(0,Number(style.textOutlineWidth ?? 1));
  el.style.textShadow=ow>0 ? `${ow}px 0 ${outline}, -${ow}px 0 ${outline}, 0 ${ow}px ${outline}, 0 -${ow}px ${outline}, 0 2px 3px #0005` : '0 2px 3px #0005';
  el.style.setProperty('--custom-pressed-a',normalizeColor(style.pressedA || style.colorB));
  el.style.setProperty('--custom-pressed-b',normalizeColor(style.pressedB || style.colorC));
  el.style.setProperty('--custom-disabled-opacity',String(Number(style.disabledOpacity ?? .45)));
  el.style.setProperty('--custom-disabled-saturation',String(Number(style.disabledSaturation ?? .25)));
  el.style.setProperty('--custom-gloss-opacity',style.gloss===false ? '0' : String(Number(style.glossOpacity ?? .45)));
  el.style.setProperty('--custom-gloss-color','#FFFFFF');
  const left=decorationEmoji(style.decorLeft), right=decorationEmoji(style.decorRight);
  if(left){ const s=document.createElement('span'); s.className='key-decoration key-decoration-left'; s.textContent=left; el.appendChild(s); }
  if(right){ const s=document.createElement('span'); s.className='key-decoration key-decoration-right'; s.textContent=right; el.appendChild(s); }
  if(previewState==='pressed') el.classList.add('custom-preview-pressed');
  if(previewState==='disabled') el.classList.add('custom-disabled');
}
function applyKeyStyles() {
  document.querySelectorAll('.key[data-key]').forEach(el=>{
    const id=el.dataset.key;
    applyStyleToKeyElement(el,state.buttonStyles[id],id,'normal');
  });
}
function applyPresetToTarget(presetId,target=state.buttonBuilder.target) {
  const style=cloneButtonPreset(presetId);
  const keys=targetKeys(target);
  keys.forEach(k=>state.buttonStyles[k]=structuredClone(style));
  state.buttonBuilder.presetId=presetId;
}
function copyCurrentStyleToTarget(target=state.buttonBuilder.target) {
  const source=normalizeButtonStyle(state.buttonStyles[state.selectedKey || 'ok'] || cloneButtonPreset(state.buttonBuilder.presetId));
  targetKeys(target).forEach(k=>state.buttonStyles[k]=structuredClone(source));
}
function removeButtonStyleTarget(target=state.buttonBuilder.target) {
  targetKeys(target).forEach(k=>delete state.buttonStyles[k]);
}
function renderButtonBuilderPreview() {
  const preview=document.querySelector('#buttonBuilderPreviewKey');
  if(!preview) return;
  const key=state.selectedKey || 'ok';
  preview.dataset.key=key;
  const main=preview.querySelector('.builder-preview-label');
  if(main) main.textContent=keyLabelForId(key);
  applyStyleToKeyElement(preview,state.buttonStyles[key] || cloneButtonPreset(state.buttonBuilder.presetId),key,state.buttonBuilder.previewState || 'normal');
  let label=preview.querySelector('.builder-preview-label');
  if(!label){ label=document.createElement('span'); label.className='builder-preview-label'; label.textContent=keyLabelForId(key); preview.appendChild(label); }
}
function renderButtonBuilder() {
  if(!els.buttonBuilder) return;
  els.buttonBuilder.innerHTML='';
  const selectedKey=state.selectedKey || 'ok';
  const head=document.createElement('div'); head.className='builder-head';
  head.innerHTML=`<div><span class="eyebrow">Đang chỉnh</span><strong>${keyLabelForId(selectedKey)}</strong></div><span class="badge subtle">${selectedKey}</span>`;
  els.buttonBuilder.appendChild(head);

  const keySelect=selectField('Chọn phím',selectedKey,ALL_KEY_IDS.map(k=>[k,keyLabelForId(k)]),v=>{
    state.selectedKey=v; state.selected='key'; renderSelection(); renderInspector(); renderButtonBuilder();
  });
  const target=selectField('Áp dụng cho',state.buttonBuilder.target,[['selected','Phím đang chọn'],['navigation','Nhóm điều hướng'],['digits','Bàn phím số'],['all','Toàn bộ phím']],v=>{state.buttonBuilder.target=v;renderButtonBuilderPreview();scheduleAutosave();});
  els.buttonBuilder.append(keySelect,target);

  const previewWrap=document.createElement('div'); previewWrap.className='button-builder-preview';
  previewWrap.innerHTML='<button id="buttonBuilderPreviewKey" class="key builder-preview-key"><span class="builder-preview-label"></span></button>';
  els.buttonBuilder.appendChild(previewWrap);

  const states=document.createElement('div'); states.className='transform-toolbar builder-state-toolbar';
  [['Bình thường','normal'],['Nhấn','pressed'],['Tắt','disabled']].forEach(([label,value])=>{ const b=document.createElement('button'); b.textContent=label; b.classList.toggle('active',state.buttonBuilder.previewState===value); b.onclick=()=>{state.buttonBuilder.previewState=value;renderButtonBuilder();scheduleAutosave();}; states.appendChild(b); });
  els.buttonBuilder.appendChild(states);

  const title=document.createElement('div'); title.className='section-title-row compact-title'; title.innerHTML=`<h2>Preset nút</h2><span class="badge">${buttonPresets.length} mẫu</span>`; els.buttonBuilder.appendChild(title);
  const grid=document.createElement('div'); grid.className='button-preset-grid';
  buttonPresets.forEach(p=>{ const b=document.createElement('button'); b.className='button-preset-card'; b.classList.toggle('active',state.buttonBuilder.presetId===p.id); b.style.setProperty('--swatch',p.swatch); b.innerHTML=`<span></span><small>${p.name}</small>`; b.onclick=()=>commit(()=>applyPresetToTarget(p.id)); grid.appendChild(b); });
  els.buttonBuilder.appendChild(grid);

  const actionRow=document.createElement('div'); actionRow.className='button-row builder-actions';
  const apply=document.createElement('button'); apply.className='primary-lite'; apply.textContent='Áp preset'; apply.onclick=()=>commit(()=>applyPresetToTarget(state.buttonBuilder.presetId));
  const copy=document.createElement('button'); copy.className='ghost'; copy.textContent='Sao chép → nhóm'; copy.onclick=()=>commit(()=>copyCurrentStyleToTarget());
  const clear=document.createElement('button'); clear.className='ghost danger'; clear.textContent='Xóa style'; clear.onclick=()=>commit(()=>removeButtonStyleTarget());
  actionRow.append(apply,copy,clear); els.buttonBuilder.appendChild(actionRow);

  const edit=inspectorGroup('Style nút đang chọn');
  const s=state.buttonStyles[selectedKey] || cloneButtonPreset(state.buttonBuilder.presetId);
  const set=(prop,cast=v=>v)=>v=>{ const x=ensureButtonStyle(selectedKey); x[prop]=cast(v); renderAll(false); };
  edit.append(
    field('Màu sáng','btnColorA','color',s.colorA,set('colorA')),
    field('Màu giữa','btnColorB','color',s.colorB,set('colorB')),
    field('Màu đáy','btnColorC','color',s.colorC,set('colorC')),
    field('Màu khi nhấn 1','btnPressedA','color',s.pressedA,set('pressedA')),
    field('Màu khi nhấn 2','btnPressedB','color',s.pressedB,set('pressedB')),
    field('Viền','btnBorder','color',s.border,set('border')),
    field('Chữ','btnText','color',s.text,set('text')),
    field('Outline chữ','btnTextOutline','color',s.textOutline,set('textOutline')),
    field('Bo góc','btnRadius','range',s.radius,set('radius',Number),0,24),
    field('Viền dày','btnBorderWidth','range',s.borderWidth,set('borderWidth',Number),0,4,.25),
    field('Shadow blur','btnShadowBlur','range',s.shadowBlur,set('shadowBlur',Number),0,24),
    field('Shadow Y','btnShadowY','range',s.shadowY,set('shadowY',Number),0,10),
    field('Glow','btnGlow','color',s.glow,set('glow')),
    field('Glow radius','btnGlowRadius','range',s.glowRadius,set('glowRadius',Number),0,18),
    toggleField('Gloss highlight',s.gloss!==false,set('gloss',Boolean)),
    field('Gloss opacity','btnGlossOpacity','range',s.glossOpacity,set('glossOpacity',Number),0,.8,.02),
    field('Cỡ chữ','btnFontSize','range',s.fontSize,set('fontSize',Number),9,20),
    field('Đậm chữ','btnFontWeight','range',s.fontWeight,set('fontWeight',Number),400,900,100),
    selectField('Trang trí trái',s.decorLeft,buttonDecorations,set('decorLeft')),
    selectField('Trang trí phải',s.decorRight,buttonDecorations,set('decorRight')),
    field('Opacity khi tắt','btnDisabledOpacity','range',s.disabledOpacity,set('disabledOpacity',Number),.1,1,.05)
  );
  els.buttonBuilder.appendChild(edit);
  renderButtonBuilderPreview();
}

function applyLayerOrder() {
  const z={};
  state.layerOrder.forEach((id,i)=>z[id]=(i+1)*10);
  els.frameBgLayer.style.zIndex=z.frameBackground ?? 5;
  els.frameFxLayer.style.zIndex=z.frameFx ?? 10;
  document.querySelector('.display-frame').style.zIndex=z.screen ?? 20;
  document.querySelector('.keypad').style.zIndex=z.keypad ?? 30;
  els.decorationLayer.style.zIndex=z.decorations ?? 40;
  const status=document.querySelector('.shell-status') || document.querySelector('.network-led-row');
  if (status) status.style.zIndex=z.network ?? 50;
  document.querySelectorAll('.floating-badge, .badge-dock').forEach(el=>el.style.zIndex=z.badges ?? 60);
}

function renderPresets() {
  els.presetGrid.innerHTML='';
  presets.forEach(p=>{
    const d=document.createElement('div');
    d.className='preset-card';
    d.style.setProperty('--p1',p.p1); d.style.setProperty('--p2',p.p2);
    d.innerHTML=`<strong>${p.name}</strong><small>${p.subtitle}</small>`;
    d.onclick=()=>commit(()=>{
      state.themeName=makeGeneratedThemeName(p.name); state.autoId=true; state.themeId=slugify(state.themeName); state.theme=structuredClone(p.theme);
      // Ưu tiên style badge riêng của preset (menuButton / fpsBadge); fallback đồng bộ theo palette
      state.menuStyle=p.menuStyle ? { ...badgeStyleFromTheme('menu',state.theme), ...structuredClone(p.menuStyle) } : badgeStyleFromTheme('menu',state.theme);
      state.fpsStyle=p.fpsStyle ? { ...badgeStyleFromTheme('fps',state.theme), ...structuredClone(p.fpsStyle) } : badgeStyleFromTheme('fps',state.theme);
      if(p.buttonMap) {
        const next={};
        for(const [keyId,presetId] of Object.entries(p.buttonMap)) {
          const found=buttonPresets.find(x=>x.id===presetId);
          if(found) next[keyId]=structuredClone(found.style);
        }
        if(p.decorMap) {
          for(const [keyId,pair] of Object.entries(p.decorMap)) {
            if(next[keyId] && Array.isArray(pair)) {
              const [left,right]=pair;
              if(left) next[keyId].decorLeft=left;
              if(right) next[keyId].decorRight=right;
            }
          }
        }
        state.buttonStyles=next;
        state.buttonBuilder.presetId='candy_green';
      } else {
        state.buttonStyles={};
      }
      if(Array.isArray(p.decorations)) {
        state.decorations=structuredClone(p.decorations);
        state.selectedDecoration=null;
        if(state.selected==='decoration') state.selected='phoneShell';
      }
    });
    els.presetGrid.appendChild(d);
  });
}
function renderPalette() {
  els.componentPalette.innerHTML='';
  draggableComponents.forEach(c=>{
    const d=document.createElement('div');
    d.className='palette-item'; d.draggable=true; d.dataset.type=c.type;
    d.innerHTML=`<span class="palette-icon">${c.icon}</span><div><strong>${c.label}</strong><div class="muted">Kéo vào khung máy</div></div>`;
    d.addEventListener('dragstart',e=>e.dataTransfer.setData('text/vqeaf-component',c.type));
    els.componentPalette.appendChild(d);
  });
}

function renderDecorations() {
  els.decorationLayer.innerHTML='';
  state.decorations.forEach((d,index)=>{
    d.zIndex=index;
    const el=document.createElement('div');
    el.className='decoration';
    if (d.floating) el.classList.add('is-floating');
    el.dataset.id=d.id;
    el.textContent=draggableComponents.find(x=>x.type===d.type)?.icon || '✦';
    el.style.left=`${d.x}px`; el.style.top=`${d.y}px`; el.style.fontSize=`${d.size}px`; el.style.opacity=d.opacity; el.style.color=d.color;
    el.style.transform=`rotate(${d.rotation}deg) scaleX(${d.flipX?-1:1}) scaleY(${d.flipY?-1:1})`; el.style.zIndex=String(index+1);
    el.style.setProperty('--decFloatAmp',`${d.floatAmplitude}px`); el.style.setProperty('--decFloatDuration',`${d.floatDuration}ms`);
    el.onclick=e=>{e.stopPropagation();selectDecoration(d.id);};
    makeDraggable(el,d);
    els.decorationLayer.appendChild(el);
  });
}

function renderLayerList() {
  els.layerList.innerHTML='';
  state.layerOrder.forEach((id,index)=>{
    const meta=LAYER_META[id] || {label:id,icon:'□'};
    const row=document.createElement('div'); row.className='layer-item';
    row.innerHTML=`<div class="layer-main"><span class="layer-dot"></span><span>${meta.icon}</span><span class="layer-label">${meta.label}</span></div><div class="layer-actions"><button title="Xuống dưới">↓</button><button title="Lên trên">↑</button></div>`;
    row.querySelector('.layer-main').onclick=()=>{
      if (meta.component==='decoration' && state.decorations.length) selectDecoration(state.decorations.at(-1).id);
      else { state.selected=meta.component || 'phoneShell'; state.selectedDecoration=null; renderSelection(); renderInspector(); }
    };
    const [down,up]=row.querySelectorAll('button');
    down.onclick=()=>moveLayer(index,-1); up.onclick=()=>moveLayer(index,1);
    els.layerList.appendChild(row);
  });

  const internal=document.createElement('div');
  internal.className='layer-item internal';
  internal.innerHTML=`<div class="layer-main"><span class="layer-dot"></span><span>▧</span><span class="layer-label">Nền keypad · ${state.keypadBackground.position==='above'?'Trên phím':'Dưới phím'}</span></div><div class="layer-actions"><button title="Dưới phím">↓</button><button title="Trên phím">↑</button></div>`;
  const [below,above]=internal.querySelectorAll('button');
  below.onclick=()=>commit(()=>state.keypadBackground.position='below');
  above.onclick=()=>commit(()=>state.keypadBackground.position='above');
  internal.querySelector('.layer-main').onclick=()=>{state.selected='keypad';state.selectedDecoration=null;renderSelection();renderInspector();};
  els.layerList.appendChild(internal);

  els.decorationLayerList.innerHTML='';
  state.decorations.forEach((d,index)=>{
    const row=document.createElement('div'); row.className='layer-item';
    const icon=draggableComponents.find(x=>x.type===d.type)?.icon || '✦';
    row.innerHTML=`<div class="layer-main"><span>${icon}</span><span class="layer-label">${d.type} #${d.id}${d.floating?' · float':''}</span></div><div class="layer-actions wide"><button title="Xuống">↓</button><button title="Lên">↑</button><button class="icon-action" title="Xoay trái 90°">↺</button><button class="icon-action" title="Xoay phải 90°">↻</button><button class="icon-action" title="Lật ngang">⇋</button><button class="icon-action" title="Lật dọc">⇅</button><button class="danger" title="Xóa">×</button></div>`;
    row.querySelector('.layer-main').onclick=()=>selectDecoration(d.id);
    const [down,up,rotL,rotR,flipX,flipY,del]=row.querySelectorAll('button');
    down.onclick=()=>moveDecoration(index,-1); up.onclick=()=>moveDecoration(index,1);
    rotL.onclick=()=>commit(()=>d.rotation=((d.rotation-90)%360+360)%360);
    rotR.onclick=()=>commit(()=>d.rotation=(d.rotation+90)%360);
    flipX.onclick=()=>commit(()=>d.flipX=!d.flipX);
    flipY.onclick=()=>commit(()=>d.flipY=!d.flipY);
    del.onclick=()=>commit(()=>{
      state.decorations=state.decorations.filter(x=>x.id!==d.id);
      if (state.selectedDecoration===d.id) { state.selectedDecoration=null; state.selected='phoneShell'; }
    });
    els.decorationLayerList.appendChild(row);
  });
}
function moveLayer(index,delta) {
  const target=index+delta;
  if (target<0 || target>=state.layerOrder.length) return;
  commit(()=>{ const a=[...state.layerOrder]; [a[index],a[target]]=[a[target],a[index]]; state.layerOrder=a; });
}
function moveDecoration(index,delta) {
  const target=index+delta;
  if (target<0 || target>=state.decorations.length) return;
  commit(()=>{ const a=[...state.decorations]; [a[index],a[target]]=[a[target],a[index]]; state.decorations=a; });
}

function makeDraggable(el,d) {
  let start=null, before=null;
  el.addEventListener('pointerdown',e=>{
    e.preventDefault(); e.stopPropagation();
    before=snapshot(); start={x:e.clientX,y:e.clientY,ox:d.x,oy:d.y};
    el.setPointerCapture(e.pointerId); selectDecoration(d.id);
  });
  el.addEventListener('pointermove',e=>{
    if(!start) return;
    d.x=Math.round(start.ox+(e.clientX-start.x)/state.zoom);
    d.y=Math.round(start.oy+(e.clientY-start.y)/state.zoom);
    el.style.left=`${d.x}px`; el.style.top=`${d.y}px`;
    updateCode(); scheduleAutosave();
  });
  const finish=()=>{ if (!start) return; start=null; pushUndoSnapshot(before); before=null; renderLayerList(); updateCode(); scheduleAutosave(); };
  el.addEventListener('pointerup',finish); el.addEventListener('pointercancel',finish);
}
function selectDecoration(id) { state.selected='decoration'; state.selectedDecoration=id; renderSelection(); renderInspector(); }
function addDecoration(type,x=110,y=100) {
  commit(()=>state.decorations.push({
    id:uniqueId(), type, x, y, size:28, rotation:0, opacity:1, color:'#FFB13B', flipX:false, flipY:false, floating:false, floatAmplitude:5, floatDuration:2600, zIndex:state.decorations.length
  }));
}
els.phone.addEventListener('dragover',e=>e.preventDefault());
els.phone.addEventListener('drop',e=>{
  e.preventDefault();
  const type=e.dataTransfer.getData('text/vqeaf-component'); if(!type) return;
  const r=els.phone.getBoundingClientRect();
  addDecoration(type,(e.clientX-r.left)/state.zoom-18,(e.clientY-r.top)/state.zoom-18);
});

document.addEventListener('click',e=>{
  const s=e.target.closest('.selectable'); if(!s || s.classList.contains('decoration')) return;
  state.selected=s.dataset.component || 'phoneShell';
  if(state.selected==='key' && s.dataset.key) state.selectedKey=s.dataset.key;
  state.selectedDecoration=null; renderSelection(); renderInspector(); renderButtonBuilder();
});
function safeKeyId(id) {
  return String(id ?? '').replace('*','star').replace('#','pound').replace(/[^A-Za-z0-9_-]/g,'_');
}

function componentIdForSelection() {
  if (state.selected==='decoration') return `decoration_${state.selectedDecoration || '...'}`;
  if (state.selected==='key') return `keyStyle_${safeKeyId(state.selectedKey || 'ok')}`;
  return state.selected || 'phoneShell';
}

function renderSelection() {
  document.querySelectorAll('.is-selected').forEach(x=>x.classList.remove('is-selected'));
  let title='';
  if(state.selected==='decoration') {
    document.querySelector(`.decoration[data-id="${CSS.escape(state.selectedDecoration || '')}"]`)?.classList.add('is-selected');
    title='Decoration';
  } else if (state.selected==='key' && state.selectedKey) {
    document.querySelector(`.key[data-key="${CSS.escape(state.selectedKey)}"]`)?.classList.add('is-selected');
    title=`Keypad Key · ${state.selectedKey}`;
  } else {
    document.querySelector(`[data-component="${state.selected}"]`)?.classList.add('is-selected');
    title=labels[state.selected] || state.selected;
  }
  els.title.textContent=title;
  if (els.selectedId) {
    const id=componentIdForSelection();
    els.selectedId.textContent=id;
    els.selectedId.title=`ID component trong .vqeaf — ${id}`;
  }
}

const fieldMap = {
  phoneShell:[['shellTop','Nền trên','color'],['shellBottom','Nền dưới','color'],['shellBorder','Viền','color'],['radius','Bo góc','range',0,40]],
  screen:[['screen','Nền LCD','color']],
  key:[['key','Màu phím','color'],['keyPressed','Khi nhấn','color'],['keyBorder','Viền phím','color'],['keyText','Chữ','color'],['sub','Nhãn phụ','color'],['glow','Glow','color'],['keyRadius','Bo góc','range',0,18]],
  keypad:[['key','Màu phím','color'],['keyBorder','Viền phím','color'],['keyText','Chữ','color'],['sub','Nhãn phụ','color']],
  networkLed:[['accent','LED / Accent','color']],
  menuButton:[],
  fpsBadge:[]
};

function renderInspector() {
  els.inspector.innerHTML='';
  if(state.selected==='decoration') {
    const d=state.decorations.find(x=>x.id===state.selectedDecoration); if(!d) return;
    const group=inspectorGroup('Decoration');
    const tools=document.createElement('div'); tools.className='transform-toolbar';
    const toolDefs=[['↺','Xoay trái 90°',()=>d.rotation=((d.rotation-90)%360+360)%360],['↻','Xoay phải 90°',()=>d.rotation=(d.rotation+90)%360],['⇋','Lật ngang',()=>d.flipX=!d.flipX],['⇅','Lật dọc',()=>d.flipY=!d.flipY],['🗑','Xóa',()=>{state.decorations=state.decorations.filter(x=>x.id!==d.id);state.selectedDecoration=null;state.selected='phoneShell';}]];
    toolDefs.forEach(([txt,title,fn])=>{const b=document.createElement('button');b.textContent=txt;b.title=title;b.onclick=()=>commit(fn);tools.appendChild(b);});
    group.append(tools);
    group.append(
      field('Màu','color','color',d.color,v=>{d.color=v;renderAll(false);}),
      field('Kích thước','size','range',d.size,v=>{d.size=+v;renderAll(false);},10,100),
      field('Xoay','rotation','range',d.rotation,v=>{d.rotation=+v;renderAll(false);},-180,180),
      field('Độ mờ','opacity','range',d.opacity,v=>{d.opacity=+v;renderAll(false);},0,1,.05),
      toggleField('Hiệu ứng nổi',d.floating,v=>{d.floating=v;renderAll(false);}),
      field('Biên độ nổi','floatAmplitude','range',d.floatAmplitude,v=>{d.floatAmplitude=+v;renderAll(false);},0,20),
      field('Chu kỳ nổi (ms)','floatDuration','range',d.floatDuration,v=>{d.floatDuration=+v;renderAll(false);},800,7000,100)
    );
    els.inspector.append(group); return;
  }

  // MENU/FPS are independent badge components. Never expose the generic theme palette
  // here: changing a badge must not mutate keypad colors underneath it.
  if(state.selected==='menuButton' || state.selected==='fpsBadge') {
    els.inspector.append(buildBadgeStyleGroup(state.selected==='menuButton' ? 'menu' : 'fps'));
    return;
  }


  const group=inspectorGroup('Style');
  (fieldMap[state.selected]||fieldMap.phoneShell).forEach(([key,label,type,min,max])=>{
    group.append(field(label,key,type,state.theme[key],v=>{state.theme[key]=type==='range'?+v:v;renderAll(false);},min,max));
  });
  els.inspector.append(group);

  if(state.selected==='phoneShell') {
    const fx=inspectorGroup('Frame FX & Floating');
    fx.append(
      field('Opacity lớp Frame FX','frameFxOpacity','range',state.effects.frameFxOpacity,v=>{state.effects.frameFxOpacity=+v;renderAll(false);},0,1,.01),
      selectField('Blend Frame FX',state.effects.frameFxBlend,[['normal','Normal'],['screen','Screen'],['overlay','Overlay'],['soft-light','Soft Light'],['multiply','Multiply']],v=>{state.effects.frameFxBlend=v;renderAll(false);}),
      toggleField('Hiệu ứng nổi toàn frame',state.effects.floatEnabled,v=>{state.effects.floatEnabled=v;renderAll(false);}),
      field('Biên độ nổi','floatAmplitude','range',state.effects.floatAmplitude,v=>{state.effects.floatAmplitude=+v;renderAll(false);},0,18),
      field('Chu kỳ nổi (ms)','floatDuration','range',state.effects.floatDuration,v=>{state.effects.floatDuration=+v;renderAll(false);},900,8000,100),
      field('Độ sâu bóng nổi','floatShadow','range',state.effects.floatShadow,v=>{state.effects.floatShadow=+v;renderAll(false);},10,70)
    );
    els.inspector.append(fx);
    els.inspector.append(buildFrameBackgroundGroup());
  }
  if(state.selected==='keypad' || state.selected==='key') {
    els.inspector.append(buildBackgroundGroup());
  }
}
function buildBadgeStyleGroup(kind) {
  const isMenu=kind==='menu';
  const style=isMenu ? state.menuStyle : state.fpsStyle;
  const g=inspectorGroup(isMenu ? 'Giao diện MENU' : 'Giao diện Shot');
  const help=document.createElement('div');
  help.className='mini-help badge-style-help';
  help.textContent=isMenu
    ? 'Style riêng cho MENU bubble — không thay đổi màu bàn phím hoặc Phone Shell.'
    : 'Style riêng cho Shot badge (component fpsBadge trong .vqeaf) — không thay đổi màu bàn phím hoặc Phone Shell.';
  g.append(help);
  const presetRow=document.createElement('div'); presetRow.className='transform-toolbar';
  const styles=[['Solid','solid'],['Glass','glass'],['Outline','outline'],['Neon','neon'],['Pixel','pixel']];
  styles.forEach(([label,value])=>{const b=document.createElement('button'); b.textContent=label; b.classList.toggle('active',style.appearance===value); b.onclick=()=>commit(()=>style.appearance=value); presetRow.appendChild(b);});
  g.append(presetRow);
  g.append(
    selectField('Kiểu hiển thị',style.appearance,[['solid','Solid'],['glass','Glass'],['outline','Outline'],['neon','Neon'],['pixel','Pixel']],v=>{style.appearance=v;renderAll(false);}),
    field('Màu nền','badgeBackground','color',style.background,v=>{style.background=v;renderAll(false);}),
    field('Màu viền','badgeBorder','color',style.border,v=>{style.border=v;renderAll(false);}),
    field('Màu chữ','badgeText','color',style.text,v=>{style.text=v;renderAll(false);}),
    field('Màu chấm LED','badgeAccent','color',style.accent,v=>{style.accent=v;renderAll(false);}),
    field('Màu glow','badgeGlow','color',style.glow,v=>{style.glow=v;renderAll(false);}),
    field('Bo góc','badgeRadius','range',style.radius,v=>{style.radius=+v;renderAll(false);},0,32),
    field('Độ dày viền','badgeBorderWidth','range',style.borderWidth,v=>{style.borderWidth=+v;renderAll(false);},0,4,.25),
    field('Glow radius','badgeGlowRadius','range',style.glowRadius,v=>{style.glowRadius=+v;renderAll(false);},0,24),
    field('Độ sâu bóng','badgeShadow','range',style.shadow,v=>{style.shadow=+v;renderAll(false);},0,40),
    field('Độ mờ','badgeOpacity','range',style.opacity,v=>{style.opacity=+v;renderAll(false);},.2,1,.05),
    field('Cỡ chữ','badgeFontSize','range',style.fontSize,v=>{style.fontSize=+v;renderAll(false);},8,18),
    field('Độ đậm chữ','badgeFontWeight','range',style.fontWeight,v=>{style.fontWeight=+v;renderAll(false);},400,900,100),
    field('Giãn chữ','badgeLetterSpacing','range',style.letterSpacing,v=>{style.letterSpacing=+v;renderAll(false);},0,.18,.01),
    field('Padding ngang','badgePaddingX','range',style.paddingX,v=>{style.paddingX=+v;renderAll(false);},4,24),
    field('Padding dọc','badgePaddingY','range',style.paddingY,v=>{style.paddingY=+v;renderAll(false);},4,18),
    field('Kích thước LED','badgeDotSize','range',style.dotSize,v=>{style.dotSize=+v;renderAll(false);},3,12),
    field('Glow LED','badgeDotGlow','range',style.dotGlow,v=>{style.dotGlow=+v;renderAll(false);},0,20),
    toggleField('Chữ in hoa',style.uppercase!==false,v=>{style.uppercase=v;renderAll(false);})
  );
  const reset=document.createElement('button'); reset.className='ghost'; reset.textContent='Đồng bộ màu theo theme'; reset.onclick=()=>commit(()=>{const next=badgeStyleFromTheme(kind,state.theme); if(isMenu) state.menuStyle=next; else state.fpsStyle=next;});
  g.append(reset);
  return g;
}

function inspectorGroup(title) { const g=document.createElement('div'); g.className='inspector-group'; g.innerHTML=`<h3>${title}</h3>`; return g; }

function field(label,key,type,value,onchange,min=0,max=100,step=1) {
  const wrap=document.createElement('label'); wrap.className='field'; wrap.innerHTML=`<span>${label}</span>`;
  let before=null;
  const begin=()=>{ if(before===null) before=snapshot(); };
  const end=()=>{ if(before!==null){pushUndoSnapshot(before);before=null;scheduleAutosave();} };
  if(type==='color') {
    const box=document.createElement('div'); box.className='color-control';
    const c=document.createElement('input'); c.type='color'; c.value=normalizeColor(value);
    const t=document.createElement('input'); t.value=value;
    [c,t].forEach(el=>{el.addEventListener('focus',begin);el.addEventListener('pointerdown',begin);el.addEventListener('blur',end);});
    c.oninput=()=>{t.value=c.value.toUpperCase();onchange(t.value);}; c.onchange=end;
    t.oninput=()=>{if(/^#[0-9a-f]{6,8}$/i.test(t.value)){c.value=normalizeColor(t.value);onchange(t.value.toUpperCase());}}; t.onchange=end;
    box.append(c,t); wrap.append(box);
  } else {
    const line=document.createElement('div'); line.className='inline-value';
    const i=document.createElement('input'); i.type='range'; i.min=min;i.max=max;i.step=step;i.value=value;
    const o=document.createElement('output');o.textContent=formatValue(value,step);
    i.addEventListener('pointerdown',begin); i.addEventListener('focus',begin);
    i.oninput=()=>{o.textContent=formatValue(i.value,step);onchange(i.value);}; i.onchange=end; i.onblur=end;
    line.append(i,o); wrap.append(line);
  }
  return wrap;
}
function selectField(label,value,options,onchange) {
  const wrap=document.createElement('label'); wrap.className='field'; wrap.innerHTML=`<span>${label}</span>`;
  const s=document.createElement('select'); options.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;s.appendChild(o);}); s.value=value;
  let before=null; s.onfocus=()=>before=snapshot(); s.onchange=()=>{onchange(s.value);pushUndoSnapshot(before);before=null;};
  wrap.append(s); return wrap;
}
function toggleField(label,value,onchange) {
  const wrap=document.createElement('label'); wrap.className='toggle field-toggle';
  const i=document.createElement('input'); i.type='checkbox'; i.checked=Boolean(value); const s=document.createElement('span');s.textContent=label;
  i.onchange=()=>{const before=snapshot();onchange(i.checked);pushUndoSnapshot(before);scheduleAutosave();}; wrap.append(i,s); return wrap;
}
function buildBackgroundGroup() {
  const bg=state.keypadBackground; const g=inspectorGroup('Background bàn phím');
  const status=document.createElement('div'); status.className='mini-help'; status.textContent=bg.dataUrl?`Đang dùng: ${bg.name || 'background'}`:'Chưa nhập background.'; g.append(status);
  const buttons=document.createElement('div'); buttons.className='button-row';
  const imp=document.createElement('button'); imp.className='primary-lite'; imp.textContent='＋ Nhập ảnh'; imp.onclick=()=>els.bgFile.click();
  const del=document.createElement('button'); del.className='ghost danger'; del.textContent='Xóa'; del.onclick=()=>removeBackground(); buttons.append(imp,del); g.append(buttons);
  g.append(backgroundTransformToolbar(bg));
  g.append(
    field('Độ mờ','bgOpacity','range',bg.opacity,v=>{bg.opacity=+v;renderAll(false);},0,1,.02),
    selectField('Fit',bg.fit,[['cover','Cover'],['contain','Contain'],['stretch','Stretch']],v=>{bg.fit=v;renderAll(false);}),
    selectField('Blend',bg.blend,[['normal','Normal'],['overlay','Overlay'],['screen','Screen'],['multiply','Multiply'],['soft-light','Soft Light']],v=>{bg.blend=v;renderAll(false);}),
    selectField('Vị trí lớp',bg.position,[['below','Dưới phím'],['above','Trên phím']],v=>{bg.position=v;renderAll(false);}),
    selectField('Render khi Trên phím',bg.renderMode,[['per-key-texture','Texture từng phím (rõ chữ)'],['overlay-full','Phủ toàn vùng']],v=>{bg.renderMode=v;renderAll(false);}),
    field('Brightness','bgBrightness','range',bg.brightness,v=>{bg.brightness=+v;renderAll(false);},.5,1.5,.05),
    field('Contrast','bgContrast','range',bg.contrast,v=>{bg.contrast=+v;renderAll(false);},.5,1.6,.05),
    field('Saturation','bgSaturation','range',bg.saturation,v=>{bg.saturation=+v;renderAll(false);},0,2,.05),
    toggleField('Hỗ trợ độ rõ chữ',bg.readabilityAssist,v=>{bg.readabilityAssist=v;renderAll(false);}),
    field('Scale ảnh','bgScale','range',bg.scale,v=>{bg.scale=+v;renderAll(false);},.5,2,.05),
    field('Offset X','bgX','range',bg.offsetX,v=>{bg.offsetX=+v;renderAll(false);},-80,80),
    field('Offset Y','bgY','range',bg.offsetY,v=>{bg.offsetY=+v;renderAll(false);},-80,80),
    field('Blur','bgBlur','range',bg.blur,v=>{bg.blur=+v;renderAll(false);},0,12,.5)
  );
  return g;
}
function backgroundTransformToolbar(bg) {
  const tools=document.createElement('div'); tools.className='transform-toolbar';
  const actions=[
    ['↺','Xoay trái 90°',()=>bg.rotation=((Number(bg.rotation||0)-90)%360+360)%360],
    ['↻','Xoay phải 90°',()=>bg.rotation=(Number(bg.rotation||0)+90)%360],
    ['⇋','Lật ngang',()=>bg.flipX=!bg.flipX],
    ['⇅','Lật dọc',()=>bg.flipY=!bg.flipY],
    ['⟳','Reset transform',()=>Object.assign(bg,{rotation:0,flipX:false,flipY:false,scale:1,offsetX:0,offsetY:0})]
  ];
  actions.forEach(([txt,title,fn])=>{const b=document.createElement('button');b.textContent=txt;b.title=title;b.onclick=()=>commit(fn);tools.appendChild(b);});
  return tools;
}

function buildFrameBackgroundGroup() {
  const bg=state.frameBackground; const g=inspectorGroup('Background khung máy');
  const status=document.createElement('div'); status.className='mini-help'; status.textContent=bg.dataUrl?`Đang dùng: ${bg.name || 'frame background'}`:'Chưa nhập background cho frame.'; g.append(status);
  const buttons=document.createElement('div'); buttons.className='button-row';
  const imp=document.createElement('button'); imp.className='primary-lite'; imp.textContent='＋ Nhập ảnh'; imp.onclick=()=>els.frameBgFile.click();
  const del=document.createElement('button'); del.className='ghost danger'; del.textContent='Xóa'; del.onclick=()=>removeFrameBackground(); buttons.append(imp,del); g.append(buttons);
  g.append(backgroundTransformToolbar(bg));
  g.append(
    field('Độ mờ','frameBgOpacity','range',bg.opacity,v=>{bg.opacity=+v;renderAll(false);},0,1,.02),
    selectField('Fit',bg.fit,[['cover','Cover'],['contain','Contain'],['stretch','Stretch'],['auto','Auto']],v=>{bg.fit=v;renderAll(false);}),
    selectField('Blend',bg.blend,[['normal','Normal'],['overlay','Overlay'],['screen','Screen'],['multiply','Multiply'],['soft-light','Soft Light']],v=>{bg.blend=v;renderAll(false);}),
    field('Brightness','frameBgBrightness','range',bg.brightness,v=>{bg.brightness=+v;renderAll(false);},.5,1.5,.05),
    field('Contrast','frameBgContrast','range',bg.contrast,v=>{bg.contrast=+v;renderAll(false);},.5,1.6,.05),
    field('Saturation','frameBgSaturation','range',bg.saturation,v=>{bg.saturation=+v;renderAll(false);},0,2,.05),
    field('Scale ảnh','frameBgScale','range',bg.scale,v=>{bg.scale=+v;renderAll(false);},.5,2,.05),
    field('Offset X','frameBgX','range',bg.offsetX,v=>{bg.offsetX=+v;renderAll(false);},-120,120),
    field('Offset Y','frameBgY','range',bg.offsetY,v=>{bg.offsetY=+v;renderAll(false);},-160,160),
    field('Blur','frameBgBlur','range',bg.blur,v=>{bg.blur=+v;renderAll(false);},0,12,.5),
    toggleField('Hiệu ứng nổi / emboss nhẹ',bg.raised,v=>{bg.raised=v;renderAll(false);})
  );
  const note=document.createElement('div'); note.className='mini-help'; note.textContent='Thứ tự trên/dưới của nền frame được điều khiển trong tab Lớp → “Nền khung máy”.'; g.append(note);
  return g;
}

function renderBackgroundQuickControls() {
  els.bgQuick.innerHTML='';
  const bg=state.keypadBackground;
  els.bgBadge.textContent=bg.dataUrl ? (bg.name || 'Đã nhập') : 'Chưa có';
  if (!bg.dataUrl) return;
  els.bgQuick.append(
    field('Opacity','quickBgOpacity','range',bg.opacity,v=>{bg.opacity=+v;renderAll(false);},0,1,.02),
    selectField('Lớp',bg.position,[['below','Dưới phím'],['above','Trên phím']],v=>{bg.position=v;renderAll(false);}),
    selectField('Trên phím',bg.renderMode,[['per-key-texture','Texture từng phím'],['overlay-full','Phủ toàn vùng']],v=>{bg.renderMode=v;renderAll(false);})
  );
}
function renderFrameBackgroundQuickControls() {
  els.frameBgQuick.innerHTML='';
  const bg=state.frameBackground;
  els.frameBgBadge.textContent=bg.dataUrl ? (bg.name || 'Đã nhập') : 'Chưa có';
  if (!bg.dataUrl) return;
  els.frameBgQuick.append(
    field('Opacity','quickFrameBgOpacity','range',bg.opacity,v=>{bg.opacity=+v;renderAll(false);},0,1,.02),
    selectField('Blend',bg.blend,[['normal','Normal'],['overlay','Overlay'],['soft-light','Soft Light'],['multiply','Multiply'],['screen','Screen']],v=>{bg.blend=v;renderAll(false);})
  );
}

function normalizeColor(v) { const x=(v||'#000000').slice(0,7); return /^#[0-9a-f]{6}$/i.test(x)?x:'#000000'; }
function formatValue(v,step) { const n=Number(v); return step<1?n.toFixed(step<=.01?2:1):String(Math.round(n)); }

function updateCode() {
  state.themeName=els.themeName.value.trim()||'Untitled Theme';
  state.themeId=els.themeId.value.trim()||'untitled_theme';
  els.code.textContent=serializeTheme(state);
}
function renderAll(full=true) {
  syncControls(); applyTheme(); renderDecorations(); renderLayerList(); renderSelection(); renderBackgroundQuickControls(); renderFrameBackgroundQuickControls(); if(full){ renderInspector(); renderButtonBuilder(); } else { renderButtonBuilderPreview(); } updateCode(); scheduleAutosave();
}

// Theme name / id with history and automatic slug.
bindTextHistory(els.themeName, value=>{
  state.themeName=value || 'Untitled Theme';
  if(state.autoId){ state.themeId=slugify(state.themeName) || 'untitled_theme'; els.themeId.value=state.themeId; }
  updateCode(); scheduleAutosave();
});
bindTextHistory(els.themeId, value=>{
  state.themeId=slugify(value) || 'untitled_theme'; state.autoId=false; els.autoId.checked=false; els.themeId.value=state.themeId;
  updateCode(); scheduleAutosave();
});
function bindTextHistory(el,onInput) {
  let before=null;
  el.addEventListener('focus',()=>before=snapshot());
  el.addEventListener('input',()=>onInput(el.value));
  el.addEventListener('blur',()=>{pushUndoSnapshot(before);before=null;});
  el.addEventListener('change',()=>{pushUndoSnapshot(before);before=null;});
}
els.autoId.onchange=()=>commit(()=>{
  state.autoId=els.autoId.checked;
  if(state.autoId) state.themeId=slugify(state.themeName)||'untitled_theme';
});

els.zoom.oninput=()=>{state.zoom=Number(els.zoom.value)/100;els.zoomValue.textContent=`${els.zoom.value}%`;applyTheme();scheduleAutosave();};
els.zoom.onchange=()=>scheduleAutosave();
els.grid.onchange=()=>{state.grid=els.grid.checked;els.stage.classList.toggle('grid-on',state.grid);scheduleAutosave();};
document.querySelectorAll('[data-orientation]').forEach(b=>b.onclick=()=>commit(()=>state.orientation=b.dataset.orientation));
document.querySelector('#previewPressed').onclick=e=>{els.phone.classList.toggle('force-pressed');e.currentTarget.classList.toggle('active');};
document.querySelector('#clearDecorations').onclick=()=>commit(()=>{state.decorations=[];state.selectedDecoration=null;if(state.selected==='decoration')state.selected='phoneShell';});
document.querySelector('#resetLayerOrder').onclick=()=>commit(()=>state.layerOrder=[...DEFAULT_LAYER_ORDER]);
document.querySelector('#resetSelected').onclick=resetSelected;
document.querySelector('#importBackground').onclick=()=>els.bgFile.click();
document.querySelector('#removeBackground').onclick=removeBackground;
document.querySelector('#importFrameBackground').onclick=()=>els.frameBgFile.click();
document.querySelector('#removeFrameBackground').onclick=removeFrameBackground;
document.querySelector('#randomName').onclick=()=>commit(()=>setRandomName());

document.querySelectorAll('[data-left-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-left-tab]').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('[data-left-view]').forEach(x=>x.classList.toggle('active',x.dataset.leftView===b.dataset.leftTab));
});

document.querySelector('[data-action="undo"]').onclick=undo;
document.querySelector('[data-action="redo"]').onclick=redo;
document.querySelector('[data-action="save"]').onclick=async()=>{await writeStore('manual',snapshot());toast('Đã lưu bản thủ công');};
document.querySelector('[data-action="new"]').onclick=()=>commit(()=>{
  const n=freshState(); const undo=state.undo,redo=state.redo; Object.assign(state,n);state.undo=undo;state.redo=redo;state.themeName=makeGeneratedThemeName('Custom');state.themeId=slugify(state.themeName);state.autoId=true;
});
document.querySelector('[data-action="random"]').onclick=()=>randomizeTheme();
document.querySelector('[data-action="export"]').onclick=()=>{updateCode();download(`${state.themeId}.vqeaf`,serializeTheme(state));};
document.querySelector('[data-action="import"]').onclick=()=>els.file.click();

els.file.onchange=async()=>{
  const f=els.file.files?.[0]; if(!f)return;
  try {
    const before=snapshot(); const parsed=parseVqeaf(await f.text()); const merged=normalizeLoaded(parsed);
    const undo=state.undo,redo=state.redo; Object.assign(state,merged);state.undo=undo;state.redo=redo; pushUndoSnapshot(before); renderAll(); toast('Đã nhập theme');
  } catch(err) { alert('Không đọc được VQEAF: '+err.message); }
  finally { els.file.value=''; }
};
els.bgFile.onchange=async()=>{
  const f=els.bgFile.files?.[0]; if(!f)return;
  await setBackgroundFromFile(f);
  els.bgFile.value='';
};
els.frameBgFile.onchange=async()=>{
  const f=els.frameBgFile.files?.[0]; if(!f)return;
  await setFrameBackgroundFromFile(f);
  els.frameBgFile.value='';
};
const keypadEl=document.querySelector('#keypad');
keypadEl.addEventListener('dragover',e=>{
  if([...e.dataTransfer.items].some(i=>i.kind==='file' && i.type.startsWith('image/'))){e.preventDefault();e.stopPropagation();}
});
keypadEl.addEventListener('drop',async e=>{
  const file=[...e.dataTransfer.files].find(f=>f.type.startsWith('image/'));
  if(!file)return;
  e.preventDefault();e.stopPropagation();
  await setBackgroundFromFile(file);
});
async function setBackgroundFromFile(f) {
  const before=snapshot();
  try {
    const dataUrl=await optimizeImage(f,640,640);
    state.keypadBackground={...state.keypadBackground,dataUrl,name:f.name,opacity:Math.max(.28,state.keypadBackground.opacity)};
    pushUndoSnapshot(before); state.selected='keypad';state.selectedDecoration=null; renderAll(); toast('Đã nhúng background vào bàn phím');
  } catch(err) { alert('Không thể đọc ảnh: '+err.message); }
}

function removeBackground() {
  if(!state.keypadBackground.dataUrl) return;
  commit(()=>state.keypadBackground=freshBackground());
}
async function setFrameBackgroundFromFile(f) {
  const before=snapshot();
  try {
    const dataUrl=await optimizeImage(f,900,1200);
    state.frameBackground={...state.frameBackground,dataUrl,name:f.name,opacity:Math.max(.25,state.frameBackground.opacity)};
    pushUndoSnapshot(before); state.selected='phoneShell';state.selectedDecoration=null; renderAll(); toast('Đã nhúng background vào khung máy');
  } catch(err) { alert('Không thể đọc ảnh frame: '+err.message); }
}
function removeFrameBackground() {
  if(!state.frameBackground.dataUrl) return;
  commit(()=>state.frameBackground=freshFrameBackground());
}
function resetSelected() {
  const base=defaultPreset.theme;
  commit(()=>{
    if(state.selected==='decoration') {
      const d=state.decorations.find(x=>x.id===state.selectedDecoration);
      if(d) Object.assign(d,{size:28,rotation:0,opacity:1,color:'#FFB13B',flipX:false,flipY:false,floating:false,floatAmplitude:5,floatDuration:2600});
    } else if(state.selected==='phoneShell') {
      Object.assign(state.theme,{shellTop:base.shellTop,shellBottom:base.shellBottom,shellBorder:base.shellBorder,radius:base.radius}); state.effects=freshEffects(); state.frameBackground=freshFrameBackground();
    } else if(state.selected==='screen') state.theme.screen=base.screen;
    else if(state.selected==='networkLed') state.theme.accent=base.accent;
    else if(state.selected==='key' || state.selected==='keypad') {
      Object.assign(state.theme,{key:base.key,keyPressed:base.keyPressed,keyBorder:base.keyBorder,keyText:base.keyText,sub:base.sub,glow:base.glow,keyRadius:base.keyRadius});
      if(state.selected==='key') delete state.buttonStyles[state.selectedKey || 'ok'];
      if(state.selected==='keypad') { state.keypadBackground=freshBackground(); state.buttonStyles={}; }
    }
  });
}

function randomizeTheme() {
  commit(()=>{
    const hue=Math.floor(Math.random()*360);
    const accentHue=(hue+80+Math.floor(Math.random()*160))%360;
    state.theme={
      shellTop:hslToHex(hue,28,15+rand(0,7)),
      shellBottom:hslToHex((hue+8)%360,25,5+rand(0,5)),
      shellBorder:hslToHex(hue,55,35+rand(0,15)),
      screen:hslToHex((hue+210)%360,28,3+rand(0,5)),
      key:hslToHex(hue,32,14+rand(0,10)),
      keyPressed:hslToHex((hue+8)%360,50,26+rand(0,12)),
      keyBorder:hslToHex(hue,80,48+rand(0,14)),
      keyText:'#FFFFFF',
      sub:hslToHex(hue,25,68+rand(0,15)),
      accent:hslToHex(accentHue,78,60+rand(0,10)),
      glow:hslToHex(hue,92,55+rand(0,10)),
      radius:rand(14,29), keyRadius:rand(4,12)
    };
    state.effects.frameFxOpacity=Number((.06+Math.random()*.18).toFixed(2));
    state.effects.frameFxBlend=['screen','overlay','soft-light'][rand(0,3)];
    state.effects.floatEnabled=Math.random()>.45;
    state.effects.floatAmplitude=rand(3,10); state.effects.floatDuration=rand(24,48)*100; state.effects.floatShadow=rand(22,48);
    state.menuStyle=badgeStyleFromTheme('menu',state.theme);
    state.fpsStyle=badgeStyleFromTheme('fps',state.theme);
    state.menuStyle.appearance=['solid','glass','outline','neon','pixel'][rand(0,5)];
    state.fpsStyle.appearance=['solid','glass','outline','neon','pixel'][rand(0,5)];
    setRandomName(randomStyleName());
    if(Math.random()>.45) {
      const count=rand(1,4); const types=[...draggableComponents]; state.decorations=[];
      for(let i=0;i<count;i++) {
        const c=types[rand(0,types.length)];
        state.decorations.push({id:uniqueId()+i,type:c.type,x:rand(6,220),y:rand(12,545),size:rand(18,40),rotation:rand(-25,26),opacity:Number((.55+Math.random()*.45).toFixed(2)),color:state.theme.keyBorder,flipX:false,flipY:false,floating:Math.random()>.5,floatAmplitude:rand(3,9),floatDuration:rand(18,38)*100,zIndex:i});
      }
    }
  });
  toast('Đã tạo theme ngẫu nhiên');
}
function randomStyleName() {
  const a=['Neon','Midnight','Solar','Lunar','Ghost','Aurora','Pixel','Velvet','Cyber','Nova','Crimson','Electric','Mystic','Retro','Dream'];
  const b=['Bloom','Ember','Night','Wave','Pulse','Sakura','Orbit','Phantom','Frost','Storm','Flame','Echo','Arcade','Glow','Shadow'];
  return `${a[rand(0,a.length)]} ${b[rand(0,b.length)]}`;
}

function setRandomName(styleName=null) {
  // Nút "🎲 Tên" giữ tên style hiện tại và chỉ sinh mã 8 số mới.
  let style=styleName || stripGeneratedThemeCode(state.themeName);
  if(!style || /^(new theme|untitled theme|custom)$/i.test(style)) {
    style=randomStyleName();
  }

  state.themeName=makeGeneratedThemeName(style);
  state.autoId=true;
  state.themeId=slugify(state.themeName);
}

const GENERATED_CODE_STORAGE_KEY='vqeaf_used_8digit_theme_codes_v1';

function makeGeneratedThemeName(styleName) {
  const style=stripGeneratedThemeCode(String(styleName||'').trim()) || 'Custom';
  return `${generateUnique8DigitCode()} ${style}`;
}

function stripGeneratedThemeCode(name) {
  return String(name||'')
    .replace(/^\d{8}(?:\s*[-–—_:]\s*|\s+)/,'')
    .trim();
}

function generateUnique8DigitCode() {
  const used=loadUsedThemeCodes();

  // Sinh đúng 8 chữ số. Không có chữ số nào lặp trong cùng mã.
  // Chữ số đầu luôn 1..9 để mã luôn có đủ 8 chữ số khi hiển thị.
  for(let attempt=0;attempt<256;attempt++) {
    const first=String(secureRandInt(1,10));
    const remaining=['0','1','2','3','4','5','6','7','8','9'].filter(x=>x!==first);
    shuffleInPlace(remaining);
    const code=first+remaining.slice(0,7).join('');
    if(!used.has(code)) {
      used.add(code);
      saveUsedThemeCodes(used);
      return code;
    }
  }

  // Fallback cực hiếm, vẫn bảo đảm không lặp chữ số và không trùng mã đã lưu.
  while(true) {
    const digits=['0','1','2','3','4','5','6','7','8','9'];
    shuffleInPlace(digits);
    if(digits[0]==='0') {
      const swap=1+secureRandInt(0,9);
      [digits[0],digits[swap]]=[digits[swap],digits[0]];
    }
    const code=digits.slice(0,8).join('');
    if(!used.has(code)) {
      used.add(code);
      saveUsedThemeCodes(used);
      return code;
    }
  }
}

function loadUsedThemeCodes() {
  try {
    const raw=JSON.parse(localStorage.getItem(GENERATED_CODE_STORAGE_KEY)||'[]');
    return new Set(Array.isArray(raw) ? raw.filter(x=>/^\d{8}$/.test(String(x))) : []);
  } catch {
    return new Set();
  }
}

function saveUsedThemeCodes(set) {
  try {
    const values=Array.from(set);
    localStorage.setItem(GENERATED_CODE_STORAGE_KEY,JSON.stringify(values.slice(-10000)));
  } catch {
    // Nếu localStorage bị khóa, việc tạo theme vẫn tiếp tục bình thường.
  }
}

function shuffleInPlace(array) {
  for(let i=array.length-1;i>0;i--) {
    const j=secureRandInt(0,i+1);
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

function secureRandInt(min,max) {
  const span=max-min;
  if(span<=0) return min;
  if(globalThis.crypto?.getRandomValues) {
    const buf=new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return min+(buf[0]%span);
  }
  return min+Math.floor(Math.random()*span);
}

function slugify(s) {
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,64);
}
function rand(min,max){ return Math.floor(Math.random()*(max-min))+min; }
function hslToHex(h,s,l) {
  s/=100;l/=100; const k=n=>(n+h/30)%12; const a=s*Math.min(l,1-l); const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return '#'+[f(0),f(8),f(4)].map(x=>Math.round(255*x).toString(16).padStart(2,'0')).join('').toUpperCase();
}
function uniqueId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

async function optimizeImage(file,maxW,maxH) {
  const url=URL.createObjectURL(file);
  try {
    const img=await loadImage(url); const scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight);
    const w=Math.max(1,Math.round(img.naturalWidth*scale)), h=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement('canvas'); canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:true}); ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);
    let out=canvas.toDataURL('image/webp',.82);
    if(!out.startsWith('data:image/webp')) out=canvas.toDataURL('image/png');
    if(out.length>2_500_000) out=canvas.toDataURL('image/jpeg',.78);
    return out;
  } finally { URL.revokeObjectURL(url); }
}
function loadImage(url) { return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Ảnh không hợp lệ'));img.src=url;}); }

function download(name,text) {
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function toast(msg) {
  const d=document.createElement('div'); d.textContent=msg;
  Object.assign(d.style,{position:'fixed',bottom:'18px',left:'50%',transform:'translateX(-50%)',background:'#172132',border:'1px solid #335075',padding:'9px 14px',borderRadius:'10px',zIndex:9999,boxShadow:'0 14px 50px #0008'});
  document.body.append(d); setTimeout(()=>d.remove(),1700);
}

// Autosave: IndexedDB handles embedded image data better than localStorage.
const DB_NAME='vqeaf-theme-studio'; const STORE='documents'; let autosaveTimer=null;
function setAutosaveStatus(text,kind='ok') {
  els.autosaveStatus.classList.toggle('saving',kind==='saving'); els.autosaveStatus.classList.toggle('error',kind==='error');
  els.autosaveStatus.querySelector('span').textContent=text;
}
function scheduleAutosave() {
  clearTimeout(autosaveTimer); setAutosaveStatus('Đang lưu…','saving');
  autosaveTimer=setTimeout(async()=>{
    try { await writeStore('autosave',snapshot()); localStorage.setItem('vqeafThemeStudio.autosaveLite',JSON.stringify({...serializableState(),keypadBackground:{...state.keypadBackground,dataUrl:null},frameBackground:{...state.frameBackground,dataUrl:null}})); setAutosaveStatus(`Đã lưu ${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`); }
    catch(err) { console.error(err); setAutosaveStatus('Lỗi tự động lưu','error'); }
  },450);
}
function openDb() {
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function writeStore(key,value) {
  try {
    const db=await openDb();
    await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);}); db.close();
  } catch(err) {
    if(key==='autosave') localStorage.setItem('vqeafThemeStudio.autosave',value); else localStorage.setItem(`vqeafThemeStudio.${key}`,value);
  }
}
async function readStore(key) {
  try {
    const db=await openDb();
    const value=await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}); db.close(); return value||null;
  } catch {
    return localStorage.getItem(key==='autosave'?'vqeafThemeStudio.autosave':`vqeafThemeStudio.${key}`);
  }
}

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey) && !e.altKey) {
    if(e.key.toLowerCase()==='z' && !e.shiftKey){e.preventDefault();undo();}
    else if((e.key.toLowerCase()==='y') || (e.key.toLowerCase()==='z'&&e.shiftKey)){e.preventDefault();redo();}
    else if(e.key.toLowerCase()==='s'){e.preventDefault();writeStore('manual',snapshot()).then(()=>toast('Đã lưu bản thủ công'));}
  }
});

async function init() {
  renderPresets(); renderPalette();
  const saved=await readStore('autosave');
  if(saved) {
    try { restoreSnapshot(saved,false); setAutosaveStatus('Đã khôi phục tự động'); }
    catch(err) { console.warn('Autosave restore failed',err); renderAll(); }
  } else {
    syncControls(); renderAll();
  }
}
init();
