from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
THEMES = ROOT / "themes"


def data_uri(path: Path) -> str:
    raw = path.read_bytes()
    mime = "image/jpeg" if path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
    return f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")


comic_uri = data_uri(ASSETS / "comic_bang_bg.jpg")
sheet_uri = data_uri(ASSETS / "classic_sheet_bg.jpg")

KEYS = [
    ("menu", "menu"),
    ("up", "up"),
    ("rsk", "rsk"),
    ("left", "left"),
    ("ok", "ok"),
    ("right", "right"),
    ("down", "down"),
    ("1", "1"),
    ("2", "2"),
    ("3", "3"),
    ("4", "4"),
    ("5", "5"),
    ("6", "6"),
    ("7", "7"),
    ("8", "8"),
    ("9", "9"),
    ("star", "*"),
    ("0", "0"),
    ("pound", "#"),
]


def key_style(
    safe,
    target,
    preset,
    a,
    b,
    c,
    pa,
    pb,
    border,
    text,
    outline,
    radius=10,
    bw=3,
    shadow="#00000077",
    sy=4,
    sb=6,
    glow="#FFD93D",
    gr=4,
    gloss=True,
    go=0.30,
    size=14,
    weight=900,
    dl="star",
    dr="none",
    disabled_o=0.40,
    disabled_s=0.20,
):
    gloss_s = "true" if gloss else "false"
    return f'''    <component id="keyStyle_{safe}" type="button-style">
        target: "{target}"
        preset: "{preset}"
        shape {{
            type: "capsule"
            radius: {radius}dp
            fill {{
                type: linear
                angle: 180deg
                colors: [ "{a}", "{b}", "{c}" ]
            }}
            stroke {{ width: {bw}dp color: "{border}" }}
        }}
        shadow {{ color: "{shadow}" y: {sy}dp blur: {sb}dp }}
        glow {{ color: "{glow}" radius: {gr}dp }}
        gloss {{ enabled: {gloss_s} opacity: {go:.2f} style: "top-arc" }}
        text {{
            color: "{text}"
            outline: "{outline}"
            outlineWidth: 1dp
            size: {size}sp
            weight: {weight}
        }}
        decoration {{ left: "{dl}" right: "{dr}" }}
        <state name="pressed">
            fill {{ type: linear angle: 180deg colors: [ "{pa}", "{pb}" ] }}
            transform {{ scale: 0.96 }}
        </state>
        <state name="disabled">
            opacity: {disabled_o:.2f}
            saturation: {disabled_s:.2f}
        </state>
    </component>'''


COMIC_STYLES = {
    "pop_yellow": dict(
        a="#FFE45E",
        b="#FFB800",
        c="#E07B00",
        pa="#F2C230",
        pb="#B45309",
        border="#141414",
        text="#231400",
        outline="#FFFFFF",
        glow="#FFF3B0",
        gr=4,
    ),
    "pop_red": dict(
        a="#FF8A80",
        b="#F5382C",
        c="#A31212",
        pa="#E86055",
        pb="#7F1D1D",
        border="#141414",
        text="#FFFFFF",
        outline="#141414",
        glow="#FFD93D",
        gr=4,
    ),
    "pop_blue": dict(
        a="#6EC6FF",
        b="#1D6FF2",
        c="#0B2E9E",
        pa="#4A9BE8",
        pb="#0A2470",
        border="#141414",
        text="#FFFFFF",
        outline="#0A0A0A",
        glow="#7DD3FC",
        gr=4,
    ),
    "pop_purple": dict(
        a="#D8A0FF",
        b="#93296F",
        c="#4A1240",
        pa="#B0528F",
        pb="#3A0E32",
        border="#141414",
        text="#FFFFFF",
        outline="#2A0A22",
        glow="#FF8FC4",
        gr=5,
    ),
    "comic_orange": dict(
        a="#FFB07A",
        b="#B05229",
        c="#6E2E12",
        pa="#D87848",
        pb="#5A260E",
        border="#141414",
        text="#FFFFFF",
        outline="#2A1208",
        glow="#FFD93D",
        gr=4,
    ),
    "comic_cream": dict(
        a="#FFF8E8",
        b="#FBF0D4",
        c="#D89618",
        pa="#F2E4B8",
        pb="#B87A10",
        border="#141414",
        text="#281226",
        outline="#FBF0D4",
        glow="#FFE45E",
        gr=3,
    ),
}

comic_map = {
    "menu": "comic_cream",
    "up": "pop_yellow",
    "rsk": "comic_cream",
    "left": "pop_red",
    "ok": "pop_yellow",
    "right": "pop_blue",
    "down": "pop_purple",
    "1": "pop_red",
    "2": "pop_yellow",
    "3": "pop_blue",
    "4": "pop_purple",
    "5": "comic_orange",
    "6": "comic_cream",
    "7": "pop_blue",
    "8": "pop_red",
    "9": "pop_yellow",
    "*": "comic_orange",
    "0": "comic_cream",
    "#": "pop_purple",
}

comic_decor = {
    "menu": ("none", "none"),
    "up": ("star", "star"),
    "rsk": ("none", "none"),
    "left": ("star", "none"),
    "ok": ("star", "star"),
    "right": ("none", "star"),
    "down": ("sparkle", "none"),
    "1": ("none", "star"),
    "2": ("star", "none"),
    "3": ("none", "none"),
    "4": ("sparkle", "none"),
    "5": ("star", "star"),
    "6": ("none", "sparkle"),
    "7": ("none", "none"),
    "8": ("star", "none"),
    "9": ("none", "star"),
    "*": ("sparkle", "star"),
    "0": ("none", "none"),
    "#": ("star", "sparkle"),
}

comic_keys = []
for safe, target in KEYS:
    p = comic_map[target]
    st = COMIC_STYLES[p]
    dl, dr = comic_decor[target]
    comic_keys.append(key_style(safe, target, p, **st, radius=10, bw=3, dl=dl, dr=dr))


CLASSIC = {
    "classic_soft": dict(
        a="#F5F0EB",
        b="#E0D8D0",
        c="#C4BDB6",
        pa="#D8D0C8",
        pb="#AEA79F",
        border="#9D968E",
        text="#2A2622",
        outline="#F5F0EB",
        radius=8,
        bw=1,
        shadow="#00000033",
        sy=2,
        sb=4,
        glow="#00000000",
        gr=0,
        gloss=True,
        go=0.18,
        size=13,
        weight=800,
        dl="none",
        dr="none",
        disabled_o=0.5,
        disabled_s=0.15,
    ),
    "classic_pearl": dict(
        a="#FFFFFF",
        b="#F0EBE6",
        c="#D3CCC6",
        pa="#E8E2DC",
        pb="#BFB7B0",
        border="#AEA79F",
        text="#1A1816",
        outline="#FFFFFF",
        radius=10,
        bw=1,
        shadow="#00000022",
        sy=2,
        sb=5,
        glow="#00000000",
        gr=0,
        gloss=True,
        go=0.22,
        size=13,
        weight=800,
        dl="none",
        dr="none",
        disabled_o=0.5,
        disabled_s=0.15,
    ),
    "classic_warm": dict(
        a="#EDE6DF",
        b="#C8BFB6",
        c="#9D968E",
        pa="#D5CCC4",
        pb="#8A837C",
        border="#645F59",
        text="#FFFFFF",
        outline="#4A453F",
        radius=8,
        bw=1,
        shadow="#00000044",
        sy=3,
        sb=5,
        glow="#00000000",
        gr=0,
        gloss=False,
        go=0,
        size=13,
        weight=800,
        dl="none",
        dr="none",
        disabled_o=0.45,
        disabled_s=0.2,
    ),
    "classic_slate": dict(
        a="#8A837C",
        b="#645F59",
        c="#3E3A36",
        pa="#6E6860",
        pb="#2E2A26",
        border="#4A453F",
        text="#F5F0EB",
        outline="#2A2622",
        radius=8,
        bw=1,
        shadow="#00000055",
        sy=3,
        sb=6,
        glow="#00000000",
        gr=0,
        gloss=True,
        go=0.12,
        size=13,
        weight=800,
        dl="none",
        dr="none",
        disabled_o=0.45,
        disabled_s=0.2,
    ),
}

classic_map = {
    "menu": "classic_warm",
    "up": "classic_soft",
    "rsk": "classic_warm",
    "left": "classic_soft",
    "ok": "classic_slate",
    "right": "classic_soft",
    "down": "classic_soft",
    "1": "classic_soft",
    "2": "classic_pearl",
    "3": "classic_soft",
    "4": "classic_pearl",
    "5": "classic_warm",
    "6": "classic_pearl",
    "7": "classic_soft",
    "8": "classic_pearl",
    "9": "classic_soft",
    "*": "classic_soft",
    "0": "classic_pearl",
    "#": "classic_soft",
}

classic_keys = []
for safe, target in KEYS:
    p = classic_map[target]
    st = CLASSIC[p]
    classic_keys.append(key_style(safe, target, p, **st))


def vectors_used(names):
    paths = {
        "star": '<path fill="#FFD45A" data="M12,2 L15,9 L22,9 L16,13 L18,21 L12,16 L6,21 L8,13 L2,9 L9,9 Z"></path>',
        "sparkle": '<path fill="#FFF3B0" data="M12,2 L13.5,10.5 L22,12 L13.5,13.5 L12,22 L10.5,13.5 L2,12 L10.5,10.5 Z"></path>',
        "flower": '<path fill="#FF9BC5" data="M12,4 C10,4 9,6 9,8 C7,8 5,9 5,11 C5,13 7,14 9,14 C9,16 10,18 12,18 C14,18 15,16 15,14 C17,14 19,13 19,11 C19,9 17,8 15,8 C15,6 14,4 12,4 Z"></path>',
        "leaf": '<path fill="#6EDB91" data="M5,19 C5,11 11,5 19,5 C19,13 13,19 5,19 Z"></path>',
        "cloud": '<path fill="#D8F5FF" data="M7,18 C4,18 3,16 3,14 C3,12 5,11 6,11 C7,8 9,7 12,7 C15,7 17,9 17,11 C19,11 21,12 21,14 C21,16 20,18 17,18 Z"></path>',
        "gem": '<path fill="#B04BFF" data="M8,4 L16,4 L20,9 L12,20 L4,9 Z"></path>',
    }
    out = []
    for n in names:
        if n in paths:
            out.append(
                f'''    <vector id="{n}">
        width: 24dp
        height: 24dp
        viewportWidth: 24
        viewportHeight: 24
        {paths[n]}
    </vector>'''
            )
    return "\n\n".join(out)


def make_theme(
    tid,
    name,
    palette,
    metrics,
    frame_bg,
    key_bg,
    keys_block,
    vector_block,
    bg_name,
):
    (
        shell_top,
        shell_bot,
        shell_brd,
        screen,
        key,
        key_p,
        key_brd,
        key_txt,
        sub,
        accent,
        glow,
    ) = palette
    sr, kr, kb = metrics
    return f'''@vqeaf 1.0

<theme id="{tid}" name="{name}">

    metadata {{
        author: "DOXUANHOP"
        website: "https://qeafivels.com/"
        version: "1.0.0"
        description: "Theme created with VQEAF Theme Studio"
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
            source: @frame_background
            opacity: {frame_bg["opacity"]:.2f}
            fit: "cover"
            blend: "{frame_bg["blend"]}"
            scale: 1.00
            offsetX: 0dp
            offsetY: 0dp
            blur: 0dp
            brightness: {frame_bg["brightness"]:.2f}
            contrast: {frame_bg["contrast"]:.2f}
            saturation: {frame_bg["saturation"]:.2f}
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

{keys_block}

    <component id="keypad" type="container">
        background {{
            source: @keypad_background
            opacity: {key_bg["opacity"]:.2f}
            fit: "cover"
            blend: "{key_bg["blend"]}"
            position: "below"
            renderMode: "per-key-texture"
            textureMode: "per-key"
            brightness: {key_bg["brightness"]:.2f}
            contrast: {key_bg["contrast"]:.2f}
            saturation: {key_bg["saturation"]:.2f}
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

    <resource id="keypad_background" type="image">
        name: "{bg_name}"
        mime: "image/jpeg"
        encoding: "data-uri"
        data: "{key_bg["uri"]}"
    </resource>

    <resource id="frame_background" type="image">
        name: "{bg_name}"
        mime: "image/jpeg"
        encoding: "data-uri"
        data: "{frame_bg["uri"]}"
    </resource>

{vector_block}

</theme>
'''


comic_frame = dict(
    uri=comic_uri, opacity=0.92, blend="normal", brightness=1.02, contrast=1.05, saturation=1.08
)
comic_keybg = dict(
    uri=comic_uri, opacity=0.38, blend="soft-light", brightness=1.00, contrast=1.08, saturation=1.05
)
comic_palette = (
    "#93296F",
    "#281226",
    "#F2C732",
    "#1A0A18",
    "#B05229",
    "#D89618",
    "#141414",
    "#FBF0D4",
    "#FFE45E",
    "#F5382C",
    "#1D6FF2",
)
comic_metrics = (18, 10, 2)
comic_vecs = vectors_used(["star", "sparkle"])
comic_theme = make_theme(
    "comic_bang",
    "Comic Bang",
    comic_palette,
    comic_metrics,
    comic_frame,
    comic_keybg,
    "\n\n".join(comic_keys),
    comic_vecs,
    "comic_bang_bg.jpg",
)

classic_frame = dict(
    uri=sheet_uri, opacity=0.55, blend="soft-light", brightness=1.05, contrast=0.95, saturation=0.70
)
classic_keybg = dict(
    uri=sheet_uri, opacity=0.22, blend="soft-light", brightness=1.02, contrast=0.98, saturation=0.75
)
classic_palette = (
    "#D3CCC6",
    "#645F59",
    "#AEA79F",
    "#1A1816",
    "#E0D8D0",
    "#C4BDB6",
    "#9D968E",
    "#2A2622",
    "#645F59",
    "#3E3A36",
    "#00000000",
)
classic_metrics = (22, 8, 1)
classic_theme = make_theme(
    "classic_sheet",
    "Classic Sheet",
    classic_palette,
    classic_metrics,
    classic_frame,
    classic_keybg,
    "\n\n".join(classic_keys),
    "",
    "classic_sheet_bg.jpg",
)

(THEMES / "comic_bang.vqeaf").write_text(comic_theme, encoding="utf-8")
(THEMES / "classic_sheet.vqeaf").write_text(classic_theme, encoding="utf-8")
print("comic_bang.vqeaf", (THEMES / "comic_bang.vqeaf").stat().st_size)
print("classic_sheet.vqeaf", (THEMES / "classic_sheet.vqeaf").stat().st_size)
print("ok")
