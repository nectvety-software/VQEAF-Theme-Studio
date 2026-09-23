from pathlib import Path

THEMES = Path(r"D:\Program\webs\VQEAF-Theme-Studio\themes")

def theme(tid, name, palette, metrics, desc):
    shell_top, shell_bot, shell_brd, screen, key, key_p, key_brd, key_txt, sub, accent, glow = palette
    sr, kr, kb = metrics
    return f'''@vqeaf 1.0

<theme id="{tid}" name="{name}">

    metadata {{
        author: "DOXUANHOP"
        website: "https://qeafivels.com/"
        version: "1.0.0"
        description: "{desc}"
    }}

    studio {{
        orientation: "portrait"
        autoId: false
        layerOrder: [ "frameBackground", "frameFx", "screen", "keypad", "decorations", "network", "badges" ]
        frameFxOpacity: 0.12
        frameFxBlend: "screen"
    }}

    palette {{
        shellTop: "{shell_top}"
        shellBottom: "{shell_bot}"
        shellBorder: "{shell_brd}"
        screen: "{screen}"
        key: "{key}"
        keyPressed: "{key_p}"
        keyBorder: "{key_brd}"
        keyText: "{key_txt}"
        subText: "{sub}"
        accent: "{accent}"
        glow: "{glow}"
    }}

    metrics {{
        shellRadius: {sr}dp
        keyRadius: {kr}dp
        keyBorder: {kb}dp
    }}

    <component id="phoneShell" type="container">
        shape {{
            type: rect
            radius: $metrics.shellRadius
            fill {{
                type: linear
                angle: 180deg
                colors: [ $palette.shellTop, $palette.shellBottom ]
            }}
            stroke {{ width: 1.5dp color: $palette.shellBorder }}
        }}
        background {{
            source: null
            opacity: 0.45
            fit: "cover"
            blend: "overlay"
            scale: 1.00
            offsetX: 0dp
            offsetY: 0dp
            blur: 0dp
            brightness: 1.00
            contrast: 1.00
            saturation: 1.00
            clipToFrameShape: true
            raised: false
            rotation: 0deg
            scaleX: 1
            scaleY: 1
        }}
        effect {{
            frameFxOpacity: 0.12
            frameFxBlend: "screen"
            floating: false
            floatAmplitude: 6dp
            floatDuration: 3200ms
            floatShadow: 30dp
        }}
    </component>

    <component id="screen" type="panel">
        shape {{ radius: 4dp fill: $palette.screen }}
    </component>

    <component id="key" type="button">
        shape {{
            radius: $metrics.keyRadius
            fill: $palette.key
            stroke {{ width: $metrics.keyBorder color: $palette.keyBorder }}
        }}
        text {{ color: $palette.keyText weight: 700 align: center }}
        glow {{ color: $palette.glow radius: 12dp strength: 0.75 }}
        <state name="pressed">
            shape {{ fill: $palette.keyPressed }}
            transform {{ scale: 0.98 }}
        </state>
    </component>

    <component id="keypad" type="container">
        background {{
            source: null
            opacity: 0.42
            fit: "cover"
            blend: "soft-light"
            position: "below"
            renderMode: "per-key-texture"
            textureMode: "per-key"
            brightness: 1.00
            contrast: 1.08
            saturation: 1.00
            readabilityAssist: true
            rotation: 0deg
            scaleX: 1
            scaleY: 1
            scale: 1.00
            offsetX: 0dp
            offsetY: 0dp
            blur: 0dp
        }}
    </component>

    <component id="networkLed" type="view">
        shape {{ fill: $palette.accent radius: 99dp }}
    </component>

    <component id="menuButton" type="badge">
        appearance: "solid"
        shape {{
            radius: 18dp
            fill: "{key}"
            stroke {{ width: 1dp color: "{key_brd}" }}
        }}
        text {{
            color: "{key_txt}"
            size: 11sp
            weight: 800
            letterSpacing: 0.04
            uppercase: true
        }}
        indicator {{
            color: "{accent}"
            size: 6dp
            glow: 8dp
        }}
        glow {{ color: "{glow}" radius: 8dp }}
        shadow {{ blur: 18dp }}
        opacity: 1.00
        padding {{ horizontal: 13dp vertical: 11dp }}
    </component>

    <component id="fpsBadge" type="badge">
        appearance: "glass"
        shape {{
            radius: 18dp
            fill: "{shell_bot}"
            stroke {{ width: 1dp color: "{shell_brd}" }}
        }}
        text {{
            color: "{sub}"
            size: 11sp
            weight: 800
            letterSpacing: 0.04
            uppercase: true
        }}
        indicator {{
            color: "{accent}"
            size: 6dp
            glow: 8dp
        }}
        glow {{ color: "{glow}" radius: 6dp }}
        shadow {{ blur: 18dp }}
        opacity: 1.00
        padding {{ horizontal: 13dp vertical: 11dp }}
    </component>

</theme>
'''

specs = [
    (
        "tet",
        "Tết",
        ("#8B1217", "#2A0A0C", "#E2352F", "#140406", "#A82C2F", "#D4503B", "#FFD166", "#FFF3C4", "#FFB4A2", "#FFD166", "#FF6B4A"),
        (24, 10, 2),
        "Theme Tet - do dao + vang mai",
    ),
    (
        "trung_thu",
        "Trung Thu",
        ("#1B2A5B", "#0B1028", "#FFD93D", "#080C1C", "#2A3F7A", "#3F5496", "#FFB703", "#FFF6C8", "#F4A261", "#FF6B35", "#FFD93D"),
        (22, 10, 2),
        "Theme Trung Thu - trang ram + den ong sao",
    ),
    (
        "hanoi_night",
        "Hà Nội Night",
        ("#1A2A3A", "#0B1C2E", "#C4A35A", "#061018", "#2A3D4F", "#3E5568", "#FFC857", "#F5E6C8", "#A8C0D0", "#FF4D4D", "#FFC857"),
        (20, 8, 2),
        "Theme Ha Noi dem - pho dem + den vang",
    ),
]

for tid, name, palette, metrics, desc in specs:
    path = THEMES / f"{tid}.vqeaf"
    path.write_text(theme(tid, name, palette, metrics, desc), encoding="utf-8")
    print("wrote", path.name, path.stat().st_size)
print("ok")
