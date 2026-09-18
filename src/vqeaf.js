const q = v => `"${String(v ?? '').replaceAll('\\','\\\\').replaceAll('"','\\"').replaceAll('\n','\\n')}"`;
const color = v => q(String(v || '#000000').toUpperCase());
const bool = v => v ? 'true' : 'false';

export function serializeTheme(state) {
  const t = state.theme;
  const decorations = state.decorations || [];
  const effects = state.effects || {};
  const bg = state.keypadBackground || {};
  const frameBg = state.frameBackground || {};
  const menuStyle = state.menuStyle || {};
  const fpsStyle = state.fpsStyle || {};
  const layerOrder = state.layerOrder || [];
  const vectorIds = [...new Set(decorations.map(d => d.type))];
  const vectorBlock = vectorIds.map(id => vectorFor(id)).join('\n\n');
  const imageBlock = [bg.dataUrl ? imageResource(bg) : '', frameBg.dataUrl ? frameImageResource(frameBg) : ''].filter(Boolean).join('\n\n');
  const decorationAnimations = decorations.filter(d => d.floating).map(d => decorationFloatAnimation(d)).join('\n\n');
  const frameAnimation = effects.floatEnabled ? frameFloatAnimation(effects) : '';

  return `@vqeaf 1.0

<theme id=${q(state.themeId)} name=${q(state.themeName)}>

    metadata {
        author: "Qeafivels Software"
        version: "1.0.0"
        description: "Theme created with VQEAF Theme Studio"
    }

    studio {
        orientation: ${q(state.orientation || 'portrait')}
        autoId: ${bool(state.autoId !== false)}
        layerOrder: [ ${layerOrder.map(q).join(', ')} ]
        frameFxOpacity: ${Number(effects.frameFxOpacity ?? 0.12).toFixed(2)}
        frameFxBlend: ${q(effects.frameFxBlend || 'screen')}
    }

    palette {
        shellTop: ${color(t.shellTop)}
        shellBottom: ${color(t.shellBottom)}
        shellBorder: ${color(t.shellBorder)}
        screen: ${color(t.screen)}
        key: ${color(t.key)}
        keyPressed: ${color(t.keyPressed)}
        keyBorder: ${color(t.keyBorder)}
        keyText: ${color(t.keyText)}
        subText: ${color(t.sub)}
        accent: ${color(t.accent)}
        glow: ${color(t.glow)}
    }

    metrics {
        shellRadius: ${Number(t.radius ?? 20)}dp
        keyRadius: ${Number(t.keyRadius ?? 6)}dp
        keyBorder: 1dp
    }

    <component id="phoneShell" type="container">
        shape {
            type: rect
            radius: $metrics.shellRadius
            fill {
                type: linear
                angle: 180deg
                colors: [ $palette.shellTop, $palette.shellBottom ]
            }
            stroke { width: 1.5dp color: $palette.shellBorder }
        }
        background {
            source: ${frameBg.dataUrl ? '@frame_background' : 'null'}
            opacity: ${Number(frameBg.opacity ?? 0.45).toFixed(2)}
            fit: ${q(frameBg.fit || 'cover')}
            blend: ${q(frameBg.blend || 'overlay')}
            scale: ${Number(frameBg.scale ?? 1).toFixed(2)}
            offsetX: ${Number(frameBg.offsetX ?? 0)}dp
            offsetY: ${Number(frameBg.offsetY ?? 0)}dp
            blur: ${Number(frameBg.blur ?? 0)}dp
            brightness: ${Number(frameBg.brightness ?? 1).toFixed(2)}
            contrast: ${Number(frameBg.contrast ?? 1).toFixed(2)}
            saturation: ${Number(frameBg.saturation ?? 1).toFixed(2)}
            clipToFrameShape: ${bool(frameBg.clip !== false)}
            raised: ${bool(frameBg.raised)}
            rotation: ${Number(frameBg.rotation ?? 0)}deg
            scaleX: ${frameBg.flipX ? -1 : 1}
            scaleY: ${frameBg.flipY ? -1 : 1}
        }
        effect {
            frameFxOpacity: ${Number(effects.frameFxOpacity ?? 0.12).toFixed(2)}
            frameFxBlend: ${q(effects.frameFxBlend || 'screen')}
            floating: ${bool(effects.floatEnabled)}
            floatAmplitude: ${Number(effects.floatAmplitude ?? 6)}dp
            floatDuration: ${Number(effects.floatDuration ?? 3200)}ms
            floatShadow: ${Number(effects.floatShadow ?? 30)}dp
        }
        ${effects.floatEnabled ? 'animation: @frame_float' : ''}
    </component>

    <component id="screen" type="panel">
        shape { radius: 4dp fill: $palette.screen }
    </component>

    <component id="key" type="button">
        shape {
            radius: $metrics.keyRadius
            fill: $palette.key
            stroke { width: $metrics.keyBorder color: $palette.keyBorder }
        }
        text { color: $palette.keyText weight: 700 align: center }
        glow { color: $palette.glow radius: 12dp strength: 0.75 }
        <state name="pressed">
            shape { fill: $palette.keyPressed }
            transform { scale: 0.98 }
        </state>
    </component>

    <component id="keypad" type="container">
        background {
            source: ${bg.dataUrl ? '@keypad_background' : 'null'}
            opacity: ${Number(bg.opacity ?? 0.4).toFixed(2)}
            fit: ${q(bg.fit || 'cover')}
            blend: ${q(bg.blend || 'soft-light')}
            position: ${q(bg.position || 'below')}
            renderMode: ${q(bg.renderMode || 'per-key-texture')}
            textureMode: ${q(bg.textureMode || 'per-key')}
            brightness: ${Number(bg.brightness ?? 1).toFixed(2)}
            contrast: ${Number(bg.contrast ?? 1.08).toFixed(2)}
            saturation: ${Number(bg.saturation ?? 1).toFixed(2)}
            readabilityAssist: ${bool(bg.readabilityAssist !== false)}
            rotation: ${Number(bg.rotation ?? 0)}deg
            scaleX: ${bg.flipX ? -1 : 1}
            scaleY: ${bg.flipY ? -1 : 1}
            scale: ${Number(bg.scale ?? 1).toFixed(2)}
            offsetX: ${Number(bg.offsetX ?? 0)}dp
            offsetY: ${Number(bg.offsetY ?? 0)}dp
            blur: ${Number(bg.blur ?? 0)}dp
        }
    </component>

    <component id="networkLed" type="view">
        shape { fill: $palette.accent radius: 99dp }
    </component>

    <component id="menuButton" type="badge">
        appearance: ${q(menuStyle.appearance || 'solid')}
        shape {
            radius: ${Number(menuStyle.radius ?? 18)}dp
            fill: ${color(menuStyle.background || t.key)}
            stroke { width: ${Number(menuStyle.borderWidth ?? 1)}dp color: ${color(menuStyle.border || t.keyBorder)} }
        }
        text {
            color: ${color(menuStyle.text || t.keyText)}
            size: ${Number(menuStyle.fontSize ?? 11)}sp
            weight: ${Number(menuStyle.fontWeight ?? 800)}
            letterSpacing: ${Number(menuStyle.letterSpacing ?? .04).toFixed(2)}
            uppercase: ${bool(menuStyle.uppercase !== false)}
        }
        indicator {
            color: ${color(menuStyle.accent || t.accent)}
            size: ${Number(menuStyle.dotSize ?? 6)}dp
            glow: ${Number(menuStyle.dotGlow ?? 8)}dp
        }
        glow { color: ${color(menuStyle.glow || t.glow)} radius: ${Number(menuStyle.glowRadius ?? 8)}dp }
        shadow { blur: ${Number(menuStyle.shadow ?? 18)}dp }
        opacity: ${Number(menuStyle.opacity ?? 1).toFixed(2)}
        padding { horizontal: ${Number(menuStyle.paddingX ?? 13)}dp vertical: ${Number(menuStyle.paddingY ?? 11)}dp }
    </component>

    <component id="fpsBadge" type="badge">
        appearance: ${q(fpsStyle.appearance || 'glass')}
        shape {
            radius: ${Number(fpsStyle.radius ?? 18)}dp
            fill: ${color(fpsStyle.background || t.shellBottom)}
            stroke { width: ${Number(fpsStyle.borderWidth ?? 1)}dp color: ${color(fpsStyle.border || t.shellBorder)} }
        }
        text {
            color: ${color(fpsStyle.text || t.sub)}
            size: ${Number(fpsStyle.fontSize ?? 11)}sp
            weight: ${Number(fpsStyle.fontWeight ?? 800)}
            letterSpacing: ${Number(fpsStyle.letterSpacing ?? .04).toFixed(2)}
            uppercase: ${bool(fpsStyle.uppercase !== false)}
        }
        indicator {
            color: ${color(fpsStyle.accent || t.accent)}
            size: ${Number(fpsStyle.dotSize ?? 6)}dp
            glow: ${Number(fpsStyle.dotGlow ?? 8)}dp
        }
        glow { color: ${color(fpsStyle.glow || t.glow)} radius: ${Number(fpsStyle.glowRadius ?? 6)}dp }
        shadow { blur: ${Number(fpsStyle.shadow ?? 18)}dp }
        opacity: ${Number(fpsStyle.opacity ?? 1).toFixed(2)}
        padding { horizontal: ${Number(fpsStyle.paddingX ?? 13)}dp vertical: ${Number(fpsStyle.paddingY ?? 11)}dp }
    </component>

${decorations.map(d => decorationComponent(d)).join('\n\n')}

${imageBlock}

${vectorBlock}

${frameAnimation}

${decorationAnimations}

</theme>`;
}

function imageResource(bg) {
  const mime = String(bg.dataUrl).match(/^data:([^;]+);base64,/)?.[1] || 'image/webp';
  return `    <resource id="keypad_background" type="image">
        name: ${q(bg.name || 'keypad-background')}
        mime: ${q(mime)}
        encoding: "data-uri"
        data: ${q(bg.dataUrl)}
    </resource>`;
}

function frameImageResource(bg) {
  const mime = String(bg.dataUrl).match(/^data:([^;]+);base64,/)?.[1] || 'image/webp';
  return `    <resource id="frame_background" type="image">
        name: ${q(bg.name || 'frame-background')}
        mime: ${q(mime)}
        encoding: "data-uri"
        data: ${q(bg.dataUrl)}
    </resource>`;
}

function decorationComponent(d) {
  const x = Math.round(d.x || 0);
  const y = Math.round(d.y || 0);
  return `    <component id="decoration_${d.id}" type="image">
        icon { source: @${d.type} size: ${Number(d.size || 28)}dp tint: ${q(d.color || '#FFB13B')} }
        transform { translateX: ${x}dp translateY: ${y}dp rotation: ${Number(d.rotation || 0)}deg scaleX: ${d.flipX ? -1 : 1} scaleY: ${d.flipY ? -1 : 1} }
        opacity: ${Number(d.opacity ?? 1).toFixed(2)}
        layer { zIndex: ${Number(d.zIndex ?? 0)} }
        effect {
            floating: ${bool(d.floating)}
            floatAmplitude: ${Number(d.floatAmplitude ?? 5)}dp
            floatDuration: ${Number(d.floatDuration ?? 2600)}ms
        }
        ${d.floating ? `animation: @decoration_float_${d.id}` : ''}
    </component>`;
}

function frameFloatAnimation(effects) {
  const amp = Number(effects.floatAmplitude ?? 6);
  const duration = Number(effects.floatDuration ?? 3200);
  return `    <animation id="frame_float">
        duration: ${duration}ms
        loop: true
        easing: easeInOut
        frames: [
            { at: 0% transform { translateY: 0dp } },
            { at: 50% transform { translateY: -${amp}dp } },
            { at: 100% transform { translateY: 0dp } }
        ]
    </animation>`;
}

function decorationFloatAnimation(d) {
  const amp = Number(d.floatAmplitude ?? 5);
  const duration = Number(d.floatDuration ?? 2600);
  return `    <animation id="decoration_float_${d.id}">
        duration: ${duration}ms
        loop: true
        easing: easeInOut
        frames: [
            { at: 0% transform { translateY: 0dp } },
            { at: 50% transform { translateY: -${amp}dp } },
            { at: 100% transform { translateY: 0dp } }
        ]
    </animation>`;
}

function vectorFor(id) {
  const paths = {
    pumpkin: '<path fill="#FF7A18" data="M12,4 C7,4 4,8 4,13 C4,18 7,21 12,21 C17,21 20,18 20,13 C20,8 17,4 12,4 Z"></path>',
    bat: '<path fill="#151018" data="M2,9 L7,6 L10,9 L12,6 L14,9 L17,6 L22,9 L18,15 L14,13 L12,18 L10,13 L6,15 Z"></path>',
    web: '<path stroke="#DCC6FF" strokeWidth=1 fill="#00000000" data="M0,0 L24,24 M12,0 L12,24 M0,12 L24,12 M2,2 C9,8 15,8 22,2"></path>',
    ghost: '<path fill="#FFFFFF" data="M6,20 V10 C6,5 9,3 12,3 C16,3 18,6 18,10 V20 L15,18 L12,20 L9,18 Z"></path>',
    star: '<path fill="#FFD45A" data="M12,2 L15,9 L22,9 L16,13 L18,21 L12,16 L6,21 L8,13 L2,9 L9,9 Z"></path>',
    badge: '<path fill="#65DC96" data="M12,3 A9,9 0 1,0 12,21 A9,9 0 1,0 12,3"></path>'
  };
  return `    <vector id="${id}">
        width: 24dp
        height: 24dp
        viewportWidth: 24
        viewportHeight: 24
        ${paths[id] || paths.star}
    </vector>`;
}

export function parseVqeaf(source) {
  const getColor = (name, fallback) => {
    const m = source.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*"(#[0-9A-Fa-f]{3,8})"`));
    return m ? m[1] : fallback;
  };
  const attr = (name, fallback) => {
    const m = source.match(new RegExp(`<theme[^>]*${escapeRegExp(name)}="([^"]+)"`));
    return m ? unescapeString(m[1]) : fallback;
  };
  const unit = (name, fallback, unitName='dp') => {
    const m = source.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(-?[0-9.]+)${unitName}`));
    return m ? Number(m[1]) : fallback;
  };
  const number = (name, fallback) => {
    const m = source.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(-?[0-9.]+)`));
    return m ? Number(m[1]) : fallback;
  };
  const string = (name, fallback) => {
    const m = source.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*"((?:\\\\.|[^"])*)"`));
    return m ? unescapeString(m[1]) : fallback;
  };
  const boolean = (name, fallback) => {
    const m = source.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(true|false)`));
    return m ? m[1] === 'true' : fallback;
  };

  const imageMatch = source.match(/<resource\s+id="keypad_background"\s+type="image">([\s\S]*?)<\/resource>/);
  let keypadBackground = defaultBackground();
  if (imageMatch) {
    const block = imageMatch[1];
    const dataMatch = block.match(/data\s*:\s*"((?:\\.|[^"])*)"/);
    const nameMatch = block.match(/name\s*:\s*"((?:\\.|[^"])*)"/);
    keypadBackground.dataUrl = dataMatch ? unescapeString(dataMatch[1]) : null;
    keypadBackground.name = nameMatch ? unescapeString(nameMatch[1]) : 'imported-background';
    const keypadBlock = source.match(/<component\s+id="keypad"[\s\S]*?<\/component>/)?.[0] || '';
    keypadBackground.opacity = blockNumber(keypadBlock, 'opacity', .4);
    keypadBackground.fit = blockString(keypadBlock, 'fit', 'cover');
    keypadBackground.blend = blockString(keypadBlock, 'blend', 'normal');
    keypadBackground.position = blockString(keypadBlock, 'position', 'below');
    keypadBackground.renderMode = blockString(keypadBlock, 'renderMode', 'per-key-texture');
    keypadBackground.textureMode = blockString(keypadBlock, 'textureMode', 'per-key');
    keypadBackground.brightness = blockNumber(keypadBlock, 'brightness', 1);
    keypadBackground.contrast = blockNumber(keypadBlock, 'contrast', 1.08);
    keypadBackground.saturation = blockNumber(keypadBlock, 'saturation', 1);
    keypadBackground.readabilityAssist = blockBoolean(keypadBlock, 'readabilityAssist', true);
    keypadBackground.rotation = blockUnit(keypadBlock, 'rotation', 0, 'deg');
    keypadBackground.flipX = blockNumber(keypadBlock, 'scaleX', 1) < 0;
    keypadBackground.flipY = blockNumber(keypadBlock, 'scaleY', 1) < 0;
    keypadBackground.scale = blockNumber(keypadBlock, 'scale', 1);
    keypadBackground.offsetX = blockUnit(keypadBlock, 'offsetX', 0);
    keypadBackground.offsetY = blockUnit(keypadBlock, 'offsetY', 0);
    keypadBackground.blur = blockUnit(keypadBlock, 'blur', 0);
  }

  const frameImageMatch = source.match(/<resource\s+id="frame_background"\s+type="image">([\s\S]*?)<\/resource>/);
  let frameBackground = defaultFrameBackground();
  if (frameImageMatch) {
    const block = frameImageMatch[1];
    const dataMatch = block.match(/data\s*:\s*"((?:\\.|[^"])*)"/);
    const nameMatch = block.match(/name\s*:\s*"((?:\\.|[^"])*)"/);
    frameBackground.dataUrl = dataMatch ? unescapeString(dataMatch[1]) : null;
    frameBackground.name = nameMatch ? unescapeString(nameMatch[1]) : 'imported-frame-background';
    const shellBlock = source.match(/<component\s+id="phoneShell"[\s\S]*?<\/component>/)?.[0] || '';
    frameBackground.opacity = blockNumber(shellBlock, 'opacity', .45);
    frameBackground.fit = blockString(shellBlock, 'fit', 'cover');
    frameBackground.blend = blockString(shellBlock, 'blend', 'overlay');
    frameBackground.scale = blockNumber(shellBlock, 'scale', 1);
    frameBackground.offsetX = blockUnit(shellBlock, 'offsetX', 0);
    frameBackground.offsetY = blockUnit(shellBlock, 'offsetY', 0);
    frameBackground.blur = blockUnit(shellBlock, 'blur', 0);
    frameBackground.brightness = blockNumber(shellBlock, 'brightness', 1);
    frameBackground.contrast = blockNumber(shellBlock, 'contrast', 1);
    frameBackground.saturation = blockNumber(shellBlock, 'saturation', 1);
    frameBackground.clip = blockBoolean(shellBlock, 'clipToFrameShape', true);
    frameBackground.raised = blockBoolean(shellBlock, 'raised', false);
    frameBackground.rotation = blockUnit(shellBlock, 'rotation', 0, 'deg');
    frameBackground.flipX = blockNumber(shellBlock, 'scaleX', 1) < 0;
    frameBackground.flipY = blockNumber(shellBlock, 'scaleY', 1) < 0;
  }

  const layerMatch = source.match(/layerOrder\s*:\s*\[([^\]]*)\]/);
  const layerOrder = layerMatch
    ? [...layerMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
    : defaultLayerOrder();

  const decorations = [];
  const decRe = /<component\s+id="decoration_([^"]+)"\s+type="image">([\s\S]*?)<\/component>/g;
  for (const m of source.matchAll(decRe)) {
    const id = m[1], block = m[2];
    decorations.push({
      id,
      type: block.match(/source\s*:\s*@([A-Za-z0-9_-]+)/)?.[1] || 'star',
      x: blockUnit(block, 'translateX', 0),
      y: blockUnit(block, 'translateY', 0),
      size: blockUnit(block, 'size', 28),
      rotation: blockUnit(block, 'rotation', 0, 'deg'),
      flipX: blockNumber(block, 'scaleX', 1) < 0,
      flipY: blockNumber(block, 'scaleY', 1) < 0,
      opacity: blockNumber(block, 'opacity', 1),
      color: blockString(block, 'tint', '#FFB13B'),
      zIndex: blockNumber(block, 'zIndex', 0),
      floating: blockBoolean(block, 'floating', false),
      floatAmplitude: blockUnit(block, 'floatAmplitude', 5),
      floatDuration: blockUnit(block, 'floatDuration', 2600, 'ms')
    });
  }

  const menuStyle = parseBadgeComponent(source,'menuButton',{
    appearance:'solid', background:getColor('key','#34445D'), border:getColor('keyBorder','#506685'), text:getColor('keyText','#FFFFFF'), accent:getColor('accent','#65DC96'), glow:getColor('glow','#00000000')
  });
  const fpsStyle = parseBadgeComponent(source,'fpsBadge',{
    appearance:'glass', background:getColor('shellBottom','#151C27'), border:getColor('shellBorder','#435069'), text:getColor('subText','#9FB2CC'), accent:getColor('accent','#65DC96'), glow:getColor('glow','#00000000')
  });

  return {
    themeId: attr('id','imported_theme'),
    themeName: attr('name','Imported Theme'),
    autoId: boolean('autoId', false),
    orientation: string('orientation','portrait'),
    layerOrder,
    effects: {
      frameFxOpacity: number('frameFxOpacity', .12),
      frameFxBlend: string('frameFxBlend','screen'),
      floatEnabled: boolean('floating', false),
      floatAmplitude: unit('floatAmplitude',6),
      floatDuration: unit('floatDuration',3200,'ms'),
      floatShadow: unit('floatShadow',30)
    },
    keypadBackground,
    frameBackground,
    menuStyle,
    fpsStyle,
    decorations,
    theme: {
      shellTop:getColor('shellTop','#2B3444'), shellBottom:getColor('shellBottom','#151C27'), shellBorder:getColor('shellBorder','#435069'),
      screen:getColor('screen','#090D14'), key:getColor('key','#34445D'), keyPressed:getColor('keyPressed','#4E6C96'), keyBorder:getColor('keyBorder','#506685'),
      keyText:getColor('keyText','#FFFFFF'), sub:getColor('subText','#9FB2CC'), accent:getColor('accent','#65DC96'), glow:getColor('glow','#00000000'),
      radius:unit('shellRadius',20), keyRadius:unit('keyRadius',6)
    }
  };
}

function parseBadgeComponent(source,id,fallback={}) {
  const re=new RegExp(`<component\\s+id="${escapeRegExp(id)}"[^>]*>([\\s\\S]*?)<\\/component>`);
  const block=source.match(re)?.[1] || '';
  if(!block) return {
    appearance:fallback.appearance || 'solid', background:fallback.background || '#151F2E', border:fallback.border || '#40506C', text:fallback.text || '#FFFFFF', accent:fallback.accent || '#65DC96', glow:fallback.glow || '#00000000', radius:18, borderWidth:1, fontSize:11, fontWeight:800, letterSpacing:.04, opacity:1, glowRadius:8, shadow:18, paddingX:13, paddingY:11, dotSize:6, dotGlow:8, uppercase:true
  };
  const shape=block.match(/shape\s*\{([\s\S]*?)\n\s*\}/)?.[1] || block;
  const textBlock=block.match(/text\s*\{([\s\S]*?)\}/)?.[1] || block;
  const indicator=block.match(/indicator\s*\{([\s\S]*?)\}/)?.[1] || block;
  const glowBlock=block.match(/glow\s*\{([\s\S]*?)\}/)?.[1] || block;
  const shadowBlock=block.match(/shadow\s*\{([\s\S]*?)\}/)?.[1] || block;
  const padding=block.match(/padding\s*\{([\s\S]*?)\}/)?.[1] || block;
  const findColor=(b,n,fb)=>b.match(new RegExp(`${escapeRegExp(n)}\\s*:\\s*"(#[0-9A-Fa-f]{3,8})"`))?.[1] || fb;
  return {
    appearance:blockString(block,'appearance',fallback.appearance || 'solid'),
    background:findColor(shape,'fill',fallback.background || '#151F2E'),
    border:findColor(shape,'color',fallback.border || '#40506C'),
    text:findColor(textBlock,'color',fallback.text || '#FFFFFF'),
    accent:findColor(indicator,'color',fallback.accent || '#65DC96'),
    glow:findColor(glowBlock,'color',fallback.glow || '#00000000'),
    radius:blockUnit(shape,'radius',18), borderWidth:blockUnit(shape,'width',1), fontSize:blockUnit(textBlock,'size',11,'sp'), fontWeight:blockNumber(textBlock,'weight',800), letterSpacing:blockNumber(textBlock,'letterSpacing',.04), uppercase:blockBoolean(textBlock,'uppercase',true),
    dotSize:blockUnit(indicator,'size',6), dotGlow:blockUnit(indicator,'glow',8), glowRadius:blockUnit(glowBlock,'radius',8), shadow:blockUnit(shadowBlock,'blur',18), opacity:blockNumber(block,'opacity',1), paddingX:blockUnit(padding,'horizontal',13), paddingY:blockUnit(padding,'vertical',11)
  };
}

function defaultBackground() {
  return { dataUrl:null, name:'', opacity:.42, fit:'cover', blend:'soft-light', position:'below', renderMode:'per-key-texture', textureMode:'per-key', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1.08, saturation:1, readabilityAssist:true, rotation:0, flipX:false, flipY:false };
}
function defaultFrameBackground() {
  return { dataUrl:null, name:'', opacity:.45, fit:'cover', blend:'overlay', scale:1, offsetX:0, offsetY:0, blur:0, brightness:1, contrast:1, saturation:1, raised:false, clip:true, rotation:0, flipX:false, flipY:false };
}
function defaultLayerOrder() { return ['frameBackground','frameFx','screen','keypad','decorations','network','badges']; }
function blockString(block,name,fallback) { const m=block.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*"((?:\\\\.|[^"])*)"`)); return m?unescapeString(m[1]):fallback; }
function blockNumber(block,name,fallback) { const m=block.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(-?[0-9.]+)`)); return m?Number(m[1]):fallback; }
function blockBoolean(block,name,fallback) { const m=block.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(true|false)`)); return m?m[1]==='true':fallback; }
function blockUnit(block,name,fallback,unit='dp') { const m=block.match(new RegExp(`${escapeRegExp(name)}\\s*:\\s*(-?[0-9.]+)${unit}`)); return m?Number(m[1]):fallback; }
function unescapeString(v) { return v.replaceAll('\\n','\n').replaceAll('\\"','"').replaceAll('\\\\','\\'); }
function escapeRegExp(v) { return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
