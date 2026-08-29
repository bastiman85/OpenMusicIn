#!/usr/bin/env python3
"""
Renders PRIVACY.md into docs/privacy.html, the page that gets hosted and linked
from the Chrome Web Store listing.

Generated rather than hand-written so the hosted policy cannot drift from the
one in the repository — a mismatch between the published policy and the store's
data-use disclosure is a documented rejection reason.
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'PRIVACY.md'
DST = ROOT / 'docs' / 'privacy.html'

CSS = """
:root { color-scheme: light dark; --bg:#fff; --ink:#17171a; --muted:#5c5c66; --line:rgba(0,0,0,.12); --accent:#6d5cff; }
@media (prefers-color-scheme: dark){ :root{ --bg:#101014; --ink:#ececf1; --muted:#a0a0ad; --line:rgba(255,255,255,.14); --accent:#9b8cff; } }
*{box-sizing:border-box}
body{margin:0;padding:48px 20px 80px;background:var(--bg);color:var(--ink);
 font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
main{max-width:44rem;margin:0 auto}
h1{font-size:1.9rem;line-height:1.2;letter-spacing:-.02em;margin:0 0 .25em}
h2{font-size:1.15rem;margin:2.2em 0 .6em;padding-top:1.2em;border-top:1px solid var(--line)}
h2:first-of-type{border-top:0;padding-top:0}
p,li{color:var(--ink)}
ul{padding-left:1.25em}li{margin:.5em 0}
code{font:0.9em ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(125,125,140,.15);
 padding:.15em .4em;border-radius:4px}
a{color:var(--accent)}
.updated{color:var(--muted);font-size:.92rem;margin:0 0 2.5em}
"""


def inline(text):
    text = html.escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'&lt;(https?://[^&\s]+)&gt;', r'<a href="\1">\1</a>', text)
    # <name@host> is an email address, not stray angle brackets.
    text = re.sub(r'&lt;([^@&\s]+@[^@&\s]+\.[a-z]{2,})&gt;',
                  r'<a href="mailto:\1">\1</a>', text)
    return text


def render(md):
    out, para, in_list = [], [], False

    def flush():
        if para:
            out.append('<p>' + inline(' '.join(para)) + '</p>')
            para.clear()

    def close_list():
        nonlocal in_list
        if in_list:
            out.append('</ul>')
            in_list = False

    for raw in md.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if stripped.startswith('<!--'):
            continue
        if not stripped:
            flush(); close_list(); continue
        if stripped.startswith('# '):
            flush(); close_list(); out.append(f'<h1>{inline(stripped[2:])}</h1>'); continue
        if stripped.startswith('## '):
            flush(); close_list(); out.append(f'<h2>{inline(stripped[3:])}</h2>'); continue
        if stripped.startswith('- '):
            flush()
            if not in_list:
                out.append('<ul>'); in_list = True
            out.append(f'<li>{inline(stripped[2:])}</li>')
            continue
        if stripped.startswith('Last updated:'):
            flush(); close_list()
            out.append(f'<p class="updated">{inline(stripped)}</p>')
            continue
        close_list()
        para.append(stripped)
    flush(); close_list()
    return '\n'.join(out)


body = render(SRC.read_text(encoding='utf-8'))
DST.write_text(
    '<!doctype html>\n<html lang="en">\n<head>\n'
    '<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    '<title>Privacy Policy — OpenMusicIn</title>\n'
    '<meta name="robots" content="index,follow">\n'
    f'<style>{CSS}</style>\n'
    '</head>\n<body>\n<main>\n' + body + '\n</main>\n</body>\n</html>\n',
    encoding='utf-8')
print(f'{DST.relative_to(ROOT)}  {DST.stat().st_size} bytes')
