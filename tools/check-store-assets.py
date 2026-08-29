#!/usr/bin/env python3
"""Checks that every Chrome Web Store asset exists at the exact size the store requires."""
from PIL import Image
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'store-assets'
EXPECTED = [
    ('store-icon-128x128.png', (128, 128), True),
    ('promo-small-440x280.png', (440, 280), False),
    ('promo-marquee-1400x560.png', (1400, 560), False),
    ('screenshot-1-album-bar.png', (1280, 800), True),
    ('screenshot-2-settings.png', (1280, 800), False),
    ('screenshot-3-artist-bar.png', (1280, 800), False),
]

failed = False
for name, size, required in EXPECTED:
    path = ROOT / name
    if not path.exists():
        print(f'  {"MISSING " if required else "absent  "} {name}  ({"required" if required else "optional"})')
        failed = failed or required
        continue
    actual = Image.open(path).size
    if actual == size:
        print(f'  ok       {name}  {actual[0]}x{actual[1]}')
    else:
        # The store rejects anything that is not exactly 1280x800 or 640x400.
        print(f'  WRONG    {name}  is {actual[0]}x{actual[1]}, expected {size[0]}x{size[1]}')
        failed = True

sys.exit(1 if failed else 0)
