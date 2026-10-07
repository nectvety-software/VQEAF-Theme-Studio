"""
Ghep anh crop tung nut (do tools/shoot_shape_gallery.mjs sinh ra) thanh 1 bang
tham chieu co nhan: tools/shots/shape_gallery.png

    python tools/make_shape_sheet.py

Doc: tools/shots/_shape_manifest.json + tools/shots/_shape_<ten>.png
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
MANIFEST = os.path.join(SHOTS, "_shape_manifest.json")
OUT = os.path.join(SHOTS, "shape_gallery.png")

COLS, ROWS = 5, 2
CELL_W, CELL_H = 330, 250
PAD = 26
TITLE_H = 96

BG = (10, 16, 27)
CARD = (18, 27, 44)
CARD_EDGE = (38, 55, 84)
TITLE = (232, 238, 246)
SUB = (140, 160, 186)
NAME = (255, 214, 102)
CODE = (124, 148, 178)

FONTS = [
    r"C:\Windows\Fonts\segoeui.ttf",
    r"C:\Windows\Fonts\arial.ttf",
    r"C:\Windows\Fonts\calibri.ttf",
]


def font(size, bold=False):
    cands = []
    for f in FONTS:
        if bold:
            cands.append(f.replace("segoeui.ttf", "segoeuib.ttf").replace("arial.ttf", "arialbd.ttf"))
        cands.append(f)
    for path in cands:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def main():
    with open(MANIFEST, encoding="utf-8") as fh:
        items = json.load(fh)

    W = PAD + COLS * (CELL_W + PAD)
    H = TITLE_H + PAD + ROWS * (CELL_H + PAD)
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)

    d.text((PAD + 4, 26), "10 hình dạng nút", font=font(40, True), fill=TITLE)
    d.text((PAD + 4, 70), "VQEAF Theme Studio V3.7.11  ·  nhóm “Hình dạng nút” ở panel phải  ·  ảnh chụp thật từ studio",
           font=font(18), fill=SUB)

    for i, it in enumerate(items):
        r, c = divmod(i, COLS)
        x = PAD + c * (CELL_W + PAD)
        y = TITLE_H + PAD + r * (CELL_H + PAD)
        d.rounded_rectangle([x, y, x + CELL_W, y + CELL_H], radius=18, fill=CARD, outline=CARD_EDGE, width=2)

        img_path = os.path.join(SHOTS, it["file"])
        if os.path.exists(img_path):
            im = Image.open(img_path).convert("RGB")
            box_w, box_h = CELL_W - 24, CELL_H - 84
            im.thumbnail((box_w, box_h), Image.LANCZOS)
            sheet.paste(im, (x + (CELL_W - im.width) // 2, y + 12 + (box_h - im.height) // 2))

        name = it["label"]
        nf = font(20, True)
        while d.textlength(name, font=nf) > CELL_W - 24 and nf.size > 11:
            nf = font(nf.size - 1, True)
        d.text((x + CELL_W // 2 - d.textlength(name, font=nf) / 2, y + CELL_H - 62), name, font=nf, fill=NAME)

        code = f'shape.type: "{it["shape"]}"  ·  phím {it["key"]}'
        cf = font(14)
        d.text((x + CELL_W // 2 - d.textlength(code, font=cf) / 2, y + CELL_H - 32), code, font=cf, fill=CODE)

    sheet.save(OUT)
    print(f"OK  {OUT}  ({sheet.width}x{sheet.height})  {len(items)} kieu")


if __name__ == "__main__":
    main()
