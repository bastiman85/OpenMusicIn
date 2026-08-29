#!/usr/bin/env python3
"""
Checks that the Chrome Web Store assets in store-assets/ are at sizes the store
accepts. The store rejects anything off by a single pixel, so verify here rather
than at upload time.

Screenshots are matched by prefix, not by exact filename — name them after what
they show (screenshot-2-Spotify.png) rather than to a fixed list.
"""
from PIL import Image
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'store-assets'
SCREENSHOT_SIZES = {(1280, 800), (640, 400)}
FIXED = [
    ('store-icon-128x128.png', (128, 128), True),
    ('promo-small-440x280.png', (440, 280), False),
    ('promo-marquee-1400x560.png', (1400, 560), False),
]

failed = False

for name, size, required in FIXED:
    path = ROOT / name
    if not path.exists():
        print(f'  {"MISSING " if required else "absent  "} {name}')
        failed = failed or required
        continue
    actual = Image.open(path).size
    ok = actual == size
    print(f'  {"ok      " if ok else "WRONG   "} {name}  {actual[0]}x{actual[1]}'
          + ('' if ok else f'  expected {size[0]}x{size[1]}'))
    failed = failed or not ok

shots = sorted(p for p in ROOT.glob('screenshot-*') if p.suffix.lower() in {'.png', '.jpg', '.jpeg'})
if not shots:
    print('  MISSING  at least one screenshot-*.png is required')
    failed = True

for path in shots:
    actual = Image.open(path).size
    ok = actual in SCREENSHOT_SIZES
    print(f'  {"ok      " if ok else "WRONG   "} {path.name}  {actual[0]}x{actual[1]}'
          + ('' if ok else '  expected 1280x800 or 640x400'))
    failed = failed or not ok

if len(shots) > 5:
    print(f'  WARNING  {len(shots)} screenshots found; the store accepts at most 5')

print(f'\n  {len(shots)} screenshot(s), listed in filename order — the store shows the first one first.')
sys.exit(1 if failed else 0)
