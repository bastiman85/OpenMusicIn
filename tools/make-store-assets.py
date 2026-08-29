#!/usr/bin/env python3
"""
Generates the Chrome Web Store promo tiles into store-assets/.

Screenshots are NOT generated here — they must show the extension running on a
real streaming service page, which only a browser with the extension installed
can produce. See CHROMEWEBSTORE.md for what each screenshot should contain.
"""
from PIL import Image, ImageDraw, ImageFont
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'store-assets'
OUT.mkdir(exist_ok=True)

BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
REG = '/System/Library/Fonts/Supplemental/Arial.ttf'
C0, C1 = (0x6D, 0x5C, 0xFF), (0xB1, 0x4C, 0xFF)   # brand gradient
WHITE = (255, 255, 255, 255)


def gradient(size):
    """Diagonal brand gradient, drawn as horizontal bands."""
    w, h = size
    img = Image.new('RGB', size)
    d = ImageDraw.Draw(img)
    for y in range(h):
        f = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(C0[i] + (C1[i] - C0[i]) * f) for i in range(3)))
    return img


def swap_mark(size, stroke, color=WHITE):
    """The two-arrow exchange mark, matching the extension icon."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    head = size * 0.26
    x0, x1 = size * 0.06, size * 0.94
    ya, yb = size * 0.32, size * 0.68
    d.line([(x0, ya), (x1 - head / 2, ya)], fill=color, width=stroke)
    d.polygon([(x1, ya), (x1 - head, ya - head * 0.6), (x1 - head, ya + head * 0.6)], fill=color)
    d.line([(x0 + head / 2, yb), (x1, yb)], fill=color, width=stroke)
    d.polygon([(x0, yb), (x0 + head, yb - head * 0.6), (x0 + head, yb + head * 0.6)], fill=color)
    return img


def tile(w, h, title_px, sub_px, mark_px, pad, gap, subtitle):
    ss = 3  # supersample for clean edges
    img = gradient((w * ss, h * ss)).convert('RGBA')
    d = ImageDraw.Draw(img)
    f_title = ImageFont.truetype(BOLD, title_px * ss)
    f_sub = ImageFont.truetype(REG, sub_px * ss)

    mark = swap_mark(mark_px * ss, max(2, int(mark_px * ss * 0.1)))
    x = pad * ss
    y = (h * ss - mark.size[1]) // 2
    img.alpha_composite(mark, (x, y))

    tx = x + mark.size[0] + gap * ss
    title = 'OpenMusicIn'
    t_h = d.textbbox((0, 0), title, font=f_title)[3]
    s_h = d.textbbox((0, 0), subtitle, font=f_sub)[3]
    block = t_h + int(sub_px * ss * 0.7) + s_h
    ty = (h * ss - block) // 2
    d.text((tx, ty), title, font=f_title, fill=WHITE)
    d.text((tx, ty + t_h + int(sub_px * ss * 0.7)), subtitle,
           font=f_sub, fill=(255, 255, 255, 225))

    return img.convert('RGB').resize((w, h), Image.LANCZOS)


SUB = 'Jump between streaming services'

tile(440, 280, 38, 16, 96, 30, 22, SUB).save(OUT / 'promo-small-440x280.png')
tile(1400, 560, 104, 42, 260, 90, 56, SUB).save(OUT / 'promo-marquee-1400x560.png')

# Store icon is the 128px extension icon; copy it so every store asset is in one place.
Image.open(ROOT / 'icons' / 'icon128.png').save(OUT / 'store-icon-128x128.png')

for p in sorted(OUT.glob('*.png')):
    print(f'  {p.name:34} {Image.open(p).size[0]}x{Image.open(p).size[1]}')
