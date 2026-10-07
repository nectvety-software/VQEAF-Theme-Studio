"""Sinh theme .vqeaf lay anh lam background cho NUT NHAN (per-key texture).

Khac voi gen_image_button_templates.py (comic_bang / classic_sheet: anh phu ca
frame lan keypad), nhom theme nay:

  * GIU NGUYEN frame cu  -> <component id="phoneShell"> dung dung cau truc
    Nokia nhu cac theme khac, KHONG gan frame_background.
  * Anh chi di vao NUT  -> <component id="keypad"> background voi
    position: "above" + renderMode: "per-key-texture", nen tung phim hien anh.

Chay:  python tools/gen_photo_bg_themes.py
"""

from pathlib import Path
import base64
import io

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
THEMES = ROOT / "themes"

# Studio tu toi uu background bang optimizeImage(): keypad <= 640x640,
# frame <= 900x1200, webp q.82. Giu cung thong so de file .vqeaf nhe.
KEYPAD_MAX = (720, 900)
WEBP_QUALITY = 82

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


def keypad_texture_uri(path: Path) -> tuple[str, tuple[int, int]]:
    """Resize + encode WebP, tra ve (data-uri, kich thuoc sau resize)."""
    im = Image.open(path).convert("RGB")
    im.thumbnail(KEYPAD_MAX, Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="WEBP", quality=WEBP_QUALITY, method=6)
    raw = buf.getvalue()
    return "data:image/webp;base64," + base64.b64encode(raw).decode("ascii"), im.size


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
    radius=6,
    bw=2,
    shadow="#00000066",
    sy=4,
    sb=8,
    glow="#FFD93D",
    gr=5,
    gloss=True,
    go=0.32,
    size=14,
    weight=900,
    dl="none",
    dr="none",
    # shape: "capsule" (bo theo radius) | "pill" | "square" (keycap, radius<=6)
    #        | "circle" (50%) | "rhombus" (hình thoi) | "hexagon" | "octagon"
    #        | "triangle" | "parallelogram" | "star"
    #   -> 6 kieu cuoi la DA GIAC: studio cat bang clip-path, bo qua `radius`.
    #      Xem KEY_SHAPE_DEFS trong src/app.js.
    shape="square",
    bevel=2,
    bevel_blur=2,
    bevel_color="#FFFFFF",
):
    return f'''    <component id="keyStyle_{safe}" type="button-style">
        target: "{target}"
        preset: "{preset}"
        shape {{
            type: "{shape}"
            radius: {radius}dp
            fill {{
                type: linear
                angle: 180deg
                colors: [ "{a}", "{b}", "{c}" ]
            }}
            stroke {{ width: {bw}dp color: "{border}" }}
        }}
        bevel {{ size: {bevel}dp blur: {bevel_blur}dp color: "{bevel_color}" }}
        shadow {{ color: "{shadow}" y: {sy}dp blur: {sb}dp }}
        glow {{ color: "{glow}" radius: {gr}dp }}
        gloss {{ enabled: {"true" if gloss else "false"} opacity: {go:.2f} style: "top-arc" }}
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
            opacity: 0.42
            saturation: 0.20
        </state>
    </component>'''


VECTOR_PATHS = {
    "star": '<path fill="#FFD45A" data="M12,2 L15,9 L22,9 L16,13 L18,21 L12,16 L6,21 L8,13 L2,9 L9,9 Z"></path>',
    "sparkle": '<path fill="#FFF3B0" data="M12,2 L13.5,10.5 L22,12 L13.5,13.5 L12,22 L10.5,13.5 L2,12 L10.5,10.5 Z"></path>',
    "flower": '<path fill="#FF9BC5" data="M12,4 C10,4 9,6 9,8 C7,8 5,9 5,11 C5,13 7,14 9,14 C9,16 10,18 12,18 C14,18 15,16 15,14 C17,14 19,13 19,11 C19,9 17,8 15,8 C15,6 14,4 12,4 Z"></path>',
    "leaf": '<path fill="#6EDB91" data="M5,19 C5,11 11,5 19,5 C19,13 13,19 5,19 Z"></path>',
    "cloud": '<path fill="#D8F5FF" data="M7,18 C4,18 3,16 3,14 C3,12 5,11 6,11 C7,8 9,7 12,7 C15,7 17,9 17,11 C19,11 21,12 21,14 C21,16 20,18 17,18 Z"></path>',
    "gem": '<path fill="#B04BFF" data="M8,4 L16,4 L20,9 L12,20 L4,9 Z"></path>',
    "web": '<path stroke="#DCC6FF" strokeWidth=1 fill="#00000000" data="M0,0 L24,24 M12,0 L12,24 M0,12 L24,12 M2,2 C9,8 15,8 22,2"></path>',
    "ghost": '<path fill="#FFFFFF" data="M6,20 V10 C6,5 9,3 12,3 C16,3 18,6 18,10 V20 L15,18 L12,20 L9,18 Z"></path>',
}


def vectors_used(names):
    out = []
    for n in names:
        if n in VECTOR_PATHS:
            out.append(
                f'''    <vector id="{n}">
        width: 24dp
        height: 24dp
        viewportWidth: 24
        viewportHeight: 24
        {VECTOR_PATHS[n]}
    </vector>'''
            )
    return "\n\n".join(out)


def make_theme(tid, name, desc, palette, metrics, keypad_bg, keys_block, vector_block, bg_meta):
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
    sr, kr = metrics
    kb = keypad_bg

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
        keyBorder: 1dp
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

{keys_block}

    <component id="keypad" type="container">
        background {{
            source: @keypad_background
            opacity: {kb["opacity"]:.2f}
            fit: "cover"
            blend: "{kb["blend"]}"
            position: "above"
            renderMode: "per-key-texture"
            textureMode: "per-key"
            brightness: {kb["brightness"]:.2f}
            contrast: {kb["contrast"]:.2f}
            saturation: {kb["saturation"]:.2f}
            readabilityAssist: {"true" if kb["readabilityAssist"] else "false"}
            rotation: 0deg
            scaleX: 1
            scaleY: 1
            scale: {kb["scale"]:.2f}
            offsetX: 0dp
            offsetY: {kb["offsetY"]}dp
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
            fill: "{kb["menu_bg"]}"
            stroke {{ width: 1dp color: "{kb["menu_brd"]}" }}
        }}
        text {{
            color: "{kb["menu_txt"]}"
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
        name: "{bg_meta["name"]}"
        mime: "image/webp"
        encoding: "data-uri"
        data: "{kb["uri"]}"
    </resource>

{vector_block}

</theme>
'''


# ---------------------------------------------------------------- Spooky Vibes

SPOOKY_STYLES = {
    "spooky_purple": dict(a="#7A4E92", b="#4B2B58", c="#2A1330", pa="#5E3A6E", pb="#1E0C24",
                          border="#C9A227", text="#EDE3F7", outline="#2A1330", glow="#8A4FBF", gr=5),
    "spooky_gold": dict(a="#F5DE9A", b="#D9B440", c="#96701A", pa="#C9A227", pb="#7A5A10",
                        border="#2A1A08", text="#2A1A08", outline="#F5DE9A", glow="#FFE9A8", gr=5),
    "spooky_pink": dict(a="#FFD0DE", b="#F2A0B8", c="#B85C7E", pa="#E089A4", pb="#9A4568",
                        border="#4A1024", text="#4A0F22", outline="#FFD0DE", glow="#FFB3CC", gr=5),
    "spooky_ghost": dict(a="#FFFFFF", b="#EDE9E4", c="#B9B3AC", pa="#DAD5CE", pb="#948E88",
                         border="#141414", text="#141414", outline="#FFFFFF", glow="#CFE6CF", gr=3),
    "spooky_black": dict(a="#5A4462", b="#2C1834", c="#100714", pa="#402650", pb="#0A040E",
                         border="#C9A227", text="#C9A227", outline="#100714", glow="#8A4FBF", gr=4),
}
SPOOKY_MAP = {
    "menu": "spooky_ghost", "up": "spooky_gold", "rsk": "spooky_ghost",
    "left": "spooky_pink", "ok": "spooky_gold", "right": "spooky_purple", "down": "spooky_black",
    "1": "spooky_purple", "2": "spooky_gold", "3": "spooky_pink",
    "4": "spooky_black", "5": "spooky_ghost", "6": "spooky_purple",
    "7": "spooky_gold", "8": "spooky_black", "9": "spooky_pink",
    "*": "spooky_purple", "0": "spooky_ghost", "#": "spooky_black",
}
SPOOKY_DECOR = {
    "menu": ("none", "none"), "up": ("star", "star"), "rsk": ("none", "none"),
    "left": ("sparkle", "none"), "ok": ("star", "star"), "right": ("none", "sparkle"),
    "down": ("gem", "none"),
    "1": ("none", "gem"), "2": ("star", "none"), "3": ("none", "none"),
    "4": ("sparkle", "none"), "5": ("none", "sparkle"), "6": ("none", "none"),
    "7": ("star", "none"), "8": ("none", "star"), "9": ("none", "none"),
    "*": ("sparkle", "star"), "0": ("none", "none"), "#": ("star", "sparkle"),
}

# ----------------------------------------------------------------- Pika Arcade

PIKA_STYLES = {
    "pika_yellow": dict(a="#FFF0A8", b="#FFD23F", c="#E0A800", pa="#F5C21E", pb="#B8860B",
                        border="#2A1A00", text="#2A1A00", outline="#FFF6D8", glow="#FFE97A", gr=6),
    "pika_red": dict(a="#FF93A2", b="#E23A50", c="#8E0F24", pa="#C92C42", pb="#6E0A1B",
                     border="#2A0A12", text="#FFF6D8", outline="#6E0A1B", glow="#FF6B80", gr=5),
    "pika_navy": dict(a="#55558C", b="#2C2C4A", c="#14142A", pa="#3E3E68", pb="#0C0C1E",
                      border="#FFD23F", text="#FFD23F", outline="#14142A", glow="#FFD23F", gr=5),
    "pika_teal": dict(a="#8CE8B8", b="#3BB273", c="#1E7A4C", pa="#2E9C60", pb="#14603A",
                      border="#0A2A1A", text="#062A18", outline="#8CE8B8", glow="#6BE8B0", gr=5),
    "pika_orange": dict(a="#FFC99A", b="#FF8A3D", c="#C4551A", pa="#E8762C", pb="#9E4112",
                        border="#2A1408", text="#2A1408", outline="#FFE0C4", glow="#FFB067", gr=5),
}
PIKA_MAP = {
    "menu": "pika_navy", "up": "pika_yellow", "rsk": "pika_navy",
    "left": "pika_red", "ok": "pika_yellow", "right": "pika_teal", "down": "pika_orange",
    "1": "pika_red", "2": "pika_yellow", "3": "pika_teal",
    "4": "pika_navy", "5": "pika_orange", "6": "pika_yellow",
    "7": "pika_teal", "8": "pika_red", "9": "pika_yellow",
    "*": "pika_orange", "0": "pika_navy", "#": "pika_red",
}
PIKA_DECOR = {
    "menu": ("none", "none"), "up": ("star", "star"), "rsk": ("none", "none"),
    "left": ("star", "none"), "ok": ("star", "star"), "right": ("none", "star"),
    "down": ("sparkle", "none"),
    "1": ("none", "star"), "2": ("star", "none"), "3": ("none", "none"),
    "4": ("sparkle", "none"), "5": ("star", "star"), "6": ("none", "sparkle"),
    "7": ("none", "none"), "8": ("star", "none"), "9": ("none", "star"),
    "*": ("sparkle", "star"), "0": ("none", "none"), "#": ("star", "sparkle"),
}

# ------------------------------------------------------------------ Pika Honey

HONEY_STYLES = {
    "honey_yellow": dict(a="#FFEDA8", b="#FFC93C", c="#E0A800", pa="#F0B824", pb="#B8860B",
                         border="#6B4226", text="#4A2E10", outline="#FFF8E4", glow="#FFE07A", gr=5),
    "honey_cream": dict(a="#FFFDF4", b="#FFF1CC", c="#E8D8A0", pa="#F5E4B4", pb="#C9B478",
                        border="#6B4226", text="#4A2E10", outline="#FFFDF4", glow="#FFF3C4", gr=4),
    "honey_amber": dict(a="#FFD79A", b="#F5A623", c="#C47712", pa="#E0951E", pb="#A05E0C",
                        border="#6B4226", text="#4A2E10", outline="#FFF0D4", glow="#FFC46A", gr=5),
    "honey_brown": dict(a="#B98A5C", b="#7A4E2C", c="#4A2C14", pa="#603C20", pb="#331D0C",
                        border="#FFC93C", text="#FFF0C8", outline="#4A2C14", glow="#FFC93C", gr=5),
    "honey_red": dict(a="#FF9A90", b="#E8443C", c="#A01810", pa="#C93028", pb="#7A0E08",
                      border="#3A0A08", text="#FFF6DE", outline="#A01810", glow="#FF6B60", gr=5),
}
HONEY_MAP = {
    "menu": "honey_cream", "up": "honey_yellow", "rsk": "honey_cream",
    "left": "honey_red", "ok": "honey_yellow", "right": "honey_amber", "down": "honey_brown",
    "1": "honey_red", "2": "honey_yellow", "3": "honey_amber",
    "4": "honey_cream", "5": "honey_amber", "6": "honey_yellow",
    "7": "honey_brown", "8": "honey_red", "9": "honey_cream",
    "*": "honey_amber", "0": "honey_cream", "#": "honey_brown",
}
HONEY_DECOR = {
    "menu": ("none", "none"), "up": ("star", "star"), "rsk": ("none", "none"),
    "left": ("flower", "none"), "ok": ("star", "star"), "right": ("none", "star"),
    "down": ("leaf", "none"),
    "1": ("none", "star"), "2": ("star", "none"), "3": ("none", "flower"),
    "4": ("gem", "none"), "5": ("star", "star"), "6": ("none", "leaf"),
    "7": ("none", "none"), "8": ("flower", "none"), "9": ("none", "star"),
    "*": ("sparkle", "star"), "0": ("none", "none"), "#": ("star", "sparkle"),
}


def build_keys(style_map, styles, decor_map):
    blocks = []
    for safe, target in KEYS:
        p = style_map[target]
        dl, dr = decor_map[target]
        blocks.append(key_style(safe, target, p, dl=dl, dr=dr, **styles[p]))
    return "\n\n".join(blocks)


SPECS = [
    dict(
        tid="spooky_vibes",
        name="Spooky Vibes",
        desc="Theme Spooky Vibes - khung tim + vang dong, anh vao tung phim",
        asset="spooky_vibes_bg.jpg",
        palette=("#4B2B58", "#1B0D22", "#C9A227", "#14110F", "#43284F", "#5E3A6E",
                 "#C9A227", "#EDE3F7", "#C9A227", "#C9A227", "#8A4FBF"),
        metrics=(20, 9),
        keypad=dict(opacity=0.50, blend="normal", scale=1.10, offsetY=0,
                    brightness=1.05, contrast=1.14, saturation=1.25,
                    readabilityAssist=True, menu_bg="#4B2B58", menu_brd="#C9A227", menu_txt="#EDE3F7"),
        style_map=SPOOKY_MAP, styles=SPOOKY_STYLES, decor_map=SPOOKY_DECOR,
        vectors=["star", "sparkle", "gem", "ghost"],
    ),
    dict(
        tid="pika_arcade",
        name="Pika Arcade",
        desc="Theme Pika Arcade - do gameboy + vang pikachu, anh vao tung phim",
        asset="pika_arcade_bg.jpg",
        palette=("#E23A50", "#8E0F24", "#FFD23F", "#141428", "#2C2C4A", "#45456E",
                 "#FFD23F", "#FFF6D8", "#FFE07A", "#3BB273", "#FFD23F"),
        metrics=(22, 10),
        keypad=dict(opacity=0.50, blend="normal", scale=1.10, offsetY=0,
                    brightness=1.04, contrast=1.12, saturation=1.15,
                    readabilityAssist=True, menu_bg="#2C2C4A", menu_brd="#FFD23F", menu_txt="#FFD23F"),
        style_map=PIKA_MAP, styles=PIKA_STYLES, decor_map=PIKA_DECOR,
        vectors=["star", "sparkle", "gem"],
    ),
    dict(
        tid="pika_honey",
        name="Pika Honey",
        desc="Theme Pika Honey - vang mat ong + nau, anh vao tung phim",
        asset="pika_honey_bg.jpg",
        # screen toi (nau mat ong) vi LCD cua studio luon ve chu sang -> nen sang se mat chu
        palette=("#FFD24A", "#E0901E", "#6B4226", "#241505", "#F7B733", "#E09A18",
                 "#6B4226", "#3A2410", "#6B4226", "#E8443C", "#FFD966"),
        metrics=(24, 12),
        keypad=dict(opacity=0.50, blend="normal", scale=1.10, offsetY=0,
                    brightness=1.04, contrast=1.10, saturation=1.12,
                    readabilityAssist=False, menu_bg="#FFF1CC", menu_brd="#6B4226", menu_txt="#4A2E10"),
        style_map=HONEY_MAP, styles=HONEY_STYLES, decor_map=HONEY_DECOR,
        vectors=["star", "sparkle", "flower", "leaf", "gem"],
    ),
]


def main():
    for spec in SPECS:
        uri, size = keypad_texture_uri(ASSETS / spec["asset"])
        keypad = dict(spec["keypad"])
        keypad["uri"] = uri
        text = make_theme(
            spec["tid"],
            spec["name"],
            spec["desc"],
            spec["palette"],
            spec["metrics"],
            keypad,
            build_keys(spec["style_map"], spec["styles"], spec["decor_map"]),
            vectors_used(spec["vectors"]),
            {"name": spec["asset"]},
        )
        path = THEMES / f'{spec["tid"]}.vqeaf'
        path.write_text(text, encoding="utf-8")
        print(f'wrote {path.name}  {path.stat().st_size:>8} bytes  texture={size[0]}x{size[1]}')
    print("ok")


if __name__ == "__main__":
    main()
