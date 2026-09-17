import { presets, draggableComponents } from './presets.js';
import { serializeTheme, parseVqeaf } from './vqeaf.js';

const defaultPreset = presets[1];
const DEFAULT_LAYER_ORDER = ['frameBackground','frameFx','screen','keypad','decorations','network','badges'];
const LAYER_META = {
  frameBackground: { label:'Nền khung máy', icon:'▧', component:'phoneShell' },
  frameFx: { label:'Khung / Frame FX', icon:'▣', component:'phoneShell' },
  screen: { label:'LCD Screen', icon:'▤', component:'screen' },
  keypad: { label:'Keypad', icon:'⌨', component:'keypad' },
  decorations: { label:'Decoration', icon:'✦', component:'decoration' },
  network: { label:'Network LED', icon:'●', component:'networkLed' },
  badges: { label:'Menu + FPS badges', icon:'◉', component:'menuButton' }
};

function freshBackground() {
  return { dataUrl:null, name:'', opacity:.42, fit:'cover', blend:'soft-light', position:'below', renderMode:'per-key-texture', textureMode:'per-key', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1.08, saturation:1, readabilityAssist:true, rotation:0, flipX:false, flipY:false };
}
function freshFrameBackground() {
  return { dataUrl:null, name:'', opacity:.45, fit:'cover', blend:'overlay', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1, saturation:1, raised:false, clip:true, rotation:0, flipX:false, flipY:false };
}

function freshEffects() {
  return { frameFxOpacity:.12, frameFxBlend:'screen', floatEnabled:false, floatAmplitude:6, floatDuration:3200, floatShadow:30 };
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
  autosaveStatus: document.querySelector('#autosaveStatus')
};

const labels = {
  phoneShell:'Phone Shell', screen:'LCD Screen', key:'Keypad Key', keypad:'Keypad', networkLed:'Network LED',
  menuButton:'Menu Bubble', fpsBadge:'FPS Badge', decoration:'Decoration'
};

const numRows = [['1','∞'],['2','abc'],['3','def'],['4','ghi'],['5','jkl'],['6','mno'],['7','pqrs'],['8','tuv'],['9','wxyz'],['*','+'],['0','␠'],['#','⇧']];
for (let r=0;r<4;r++) {
  const row = document.createElement('div');
  row.className='key-row';
  numRows.slice(r*3,r*3+3).forEach(([n,s])=>{
    const b=document.createElement('button');
    b.className='key num selectable';
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

  applyLayerOrder();
}

function applyLayerOrder() {
  const z={};
  state.layerOrder.forEach((id,i)=>z[id]=(i+1)*10);
  els.frameBgLayer.style.zIndex=z.frameBackground ?? 5;
  els.frameFxLayer.style.zIndex=z.frameFx ?? 10;
  document.querySelector('.display-frame').style.zIndex=z.screen ?? 20;
  document.querySelector('.keypad').style.zIndex=z.keypad ?? 30;
  els.decorationLayer.style.zIndex=z.decorations ?? 40;
  document.querySelector('.network-led-row').style.zIndex=z.network ?? 50;
  document.querySelectorAll('.floating-badge').forEach(el=>el.style.zIndex=z.badges ?? 60);
}

function renderPresets() {
  els.presetGrid.innerHTML='';
  presets.forEach(p=>{
    const d=document.createElement('div');
    d.className='preset-card';
    d.style.setProperty('--p1',p.p1); d.style.setProperty('--p2',p.p2);
    d.innerHTML=`<strong>${p.name}</strong><small>${p.subtitle}</small>`;
    d.onclick=()=>commit(()=>{
      state.themeId=p.id; state.themeName=p.name; state.autoId=true; state.theme=structuredClone(p.theme);
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
  state.selected=s.dataset.component || 'phoneShell'; state.selectedDecoration=null; renderSelection(); renderInspector();
});
function renderSelection() {
  document.querySelectorAll('.is-selected').forEach(x=>x.classList.remove('is-selected'));
  if(state.selected==='decoration') {
    document.querySelector(`.decoration[data-id="${CSS.escape(state.selectedDecoration || '')}"]`)?.classList.add('is-selected');
    els.title.textContent='Decoration';
  } else {
    document.querySelector(`[data-component="${state.selected}"]`)?.classList.add('is-selected');
    els.title.textContent=labels[state.selected] || state.selected;
  }
}

const fieldMap = {
  phoneShell:[['shellTop','Nền trên','color'],['shellBottom','Nền dưới','color'],['shellBorder','Viền','color'],['radius','Bo góc','range',0,40]],
  screen:[['screen','Nền LCD','color']],
  key:[['key','Màu phím','color'],['keyPressed','Khi nhấn','color'],['keyBorder','Viền phím','color'],['keyText','Chữ','color'],['sub','Nhãn phụ','color'],['glow','Glow','color'],['keyRadius','Bo góc','range',0,18]],
  keypad:[['key','Màu phím','color'],['keyBorder','Viền phím','color'],['keyText','Chữ','color'],['sub','Nhãn phụ','color']],
  networkLed:[['accent','LED / Accent','color']],
  menuButton:[['key','Nền','color'],['keyBorder','Viền','color'],['keyText','Chữ','color']],
  fpsBadge:[['key','Nền','color'],['keyBorder','Viền','color'],['keyText','Chữ','color']]
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
  syncControls(); applyTheme(); renderDecorations(); renderLayerList(); renderSelection(); renderBackgroundQuickControls(); renderFrameBackgroundQuickControls(); if(full) renderInspector(); updateCode(); scheduleAutosave();
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
  const n=freshState(); const undo=state.undo,redo=state.redo; Object.assign(state,n);state.undo=undo;state.redo=redo;state.themeName='New Theme';state.themeId='new_theme';state.autoId=true;
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
      if(state.selected==='keypad') state.keypadBackground=freshBackground();
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
    setRandomName();
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
function setRandomName() {
  const a=['Neon','Midnight','Solar','Lunar','Ghost','Aurora','Pixel','Velvet','Cyber','Nova','Crimson','Electric','Mystic','Retro','Dream'];
  const b=['Bloom','Ember','Night','Wave','Pulse','Sakura','Orbit','Phantom','Frost','Storm','Flame','Echo','Arcade','Glow','Shadow'];
  state.themeName=`${a[rand(0,a.length)]} ${b[rand(0,b.length)]}`;
  state.autoId=true; state.themeId=slugify(state.themeName);
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
