"""Rebuilds ../index.html from index.template.html.
Usage (from this folder): python3 build_page.py
- {{TREE}}  -> the skills tree (tree.py; edit skills in its SKILLS list)
- {{VINE}}  -> the hero branch with hanging figs (VINE_FIGS below)
- {{D:name extra-classes}} -> a hand-drawn doodle (DOODLES below); it draws itself
  when it scrolls into view.
Edit copy in index.template.html."""
import os, re, random
import tree, compose
from art import f

here = os.path.dirname(os.path.abspath(__file__))

# name: (viewBox, [path d, ...])
DOODLES = {
    "arrow": ("0 0 140 70", ["M6 52 C 34 18, 84 10, 128 34", "M110 19 L129 35 L106 45"]),
    "arrow-down": ("0 0 70 120", ["M34 4 C 16 34, 52 60, 32 106", "M16 88 L32 108 L50 92"]),
    "arrow-loop": ("0 0 170 110", ["M8 90 C 40 96, 70 70, 64 44 C 58 18, 26 30, 40 52 C 58 80, 120 76, 156 34", "M138 30 L157 33 L152 52"]),
    "circle": ("0 0 320 140", ["M170 10 C 74 4, 10 34, 14 72 C 18 116, 128 132, 222 122 C 296 112, 318 72, 288 42 C 256 12, 170 2, 104 18"]),
    "swash": ("0 0 300 30", ["M4 20 C 70 6, 170 4, 296 14", "M36 26 C 110 16, 200 16, 266 22"]),
    "burst": ("0 0 80 80", ["M40 6 L40 24", "M40 56 L40 74", "M6 40 L24 40", "M56 40 L74 40", "M16 16 L28 28", "M52 52 L64 64", "M64 16 L52 28", "M16 64 L28 52"]),
    "star": ("0 0 60 60", ["M30 4 C 32 22, 38 28, 56 30 C 38 32, 32 38, 30 56 C 28 38, 22 32, 4 30 C 22 28, 28 22, 30 4 Z"]),
    "fig": ("0 0 200 250", [
        "M100 34 C 92 34, 90 50, 84 64 C 60 104, 28 124, 30 172 C 32 214, 70 234, 104 234 C 140 234, 172 212, 170 170 C 168 124, 132 104, 114 66 C 108 50, 108 34, 100 34 Z",
        "M100 34 C 100 20, 108 10, 120 4",
        "M100 86 C 72 122, 56 142, 60 174 C 64 206, 138 210, 142 172 C 146 142, 126 118, 100 86",
        "M76 168 q6 -9 12 0", "M98 150 q6 -9 12 0", "M118 174 q6 -9 12 0", "M92 194 q6 -9 12 0", "M104 124 q6 -9 12 0"]),
    "leaf": ("0 0 160 160", [
        "M80 150 C 78 120, 78 100, 80 80",
        "M80 80 C 50 84, 20 70, 14 44 C 34 52, 50 40, 46 20 C 66 34, 74 24, 80 6 C 86 24, 94 34, 114 20 C 110 40, 126 52, 146 44 C 140 70, 110 84, 80 80 Z",
        "M80 80 L80 22", "M80 64 L52 40", "M80 64 L108 40"]),
    "heart": ("0 0 80 70", ["M40 64 C 10 44, 2 26, 12 14 C 22 2, 38 8, 40 22 C 42 8, 58 2, 68 14 C 78 26, 70 44, 40 64 Z"]),
}

def doodle(m):
    parts = m.group(1).split()
    name, extra = parts[0], " ".join(parts[1:])
    vb, paths = DOODLES[name]
    body = "".join('<path pathLength="1" d="%s"/>' % d for d in paths)
    return '<svg class="doodle doodle--%s %s" viewBox="%s" aria-hidden="true" focusable="false">%s</svg>' % (name, extra, vb, body)

# the hero branch: each fig is one of the branches she said yes to
VINE_FIGS = [  # (position along branch 0..1, string length px, fig colour, label)
    (.15, 80, "aubergine", "search"),
    (.27, 156, "rose", "content"),
    (.39, 96, "indigo", "strategy"),
    (.51, 186, "ochre", "events"),
    (.63, 112, "burgundy", "sales"),
    (.75, 164, "violet", "research"),
    (.89, 84, "green", "budgets"),
]

def vine():
    W, H = 760, 560
    rnd = random.Random(5)
    pts = [(790, 20), (680, 54), (575, 42), (480, 92), (380, 128), (280, 146), (180, 168), (90, 214), (24, 262)]
    bk, poly = compose.bark(pts, 30, 7)
    leaves = []
    for t in (.03, .12, .26, .4, .53, .67, .8, .93):
        x, y = poly[int(t * (len(poly) - 1))]
        for k in (0, 1):
            ang = (-1 if k else 1) * rnd.uniform(28, 62)
            w = rnd.uniform(70, 104) * (1 - t * .35)
            h = w * 245 / 259
            leaves.append('<image href="assets/art/%s.webp" x="%s" y="%s" width="%s" height="%s" transform="rotate(%s %s %s)"/>' % (
                "leaf-dk" if rnd.random() < .45 else "leaf", f(x - w / 2), f(y - h * .92), f(w), f(h), f(ang + (0 if k == 0 else -8)), f(x), f(y)))
    svg = '<svg class="vine__branch" viewBox="0 0 %d %d" aria-hidden="true" focusable="false"><g>%s</g>%s</svg>' % (W, H, "".join(leaves), bk)
    hangs = []
    for t, ln, col, label in VINE_FIGS:
        x, y = poly[int(t * (len(poly) - 1))]
        hangs.append('<span class="hang" style="--x:%s%%;--y:%s%%;--len:%dpx"><span class="hang__str"></span><img class="hang__fig" src="assets/art/fig-%s.webp" alt="" width="180" height="242"><span class="hang__tag">%s</span></span>'
                     % (f(x / W * 100), f((y + 6) / H * 100), ln, col, label))
    return '<div class="vine" aria-hidden="true">%s%s</div>' % (svg, "".join(hangs))

tpl = open(os.path.join(here, "index.template.html"), encoding="utf-8").read()
out = tpl.replace("{{TREE}}", tree.build()).replace("{{VINE}}", vine())
out = re.sub(r"\{\{D:([^}]+)\}\}", doodle, out)
assert "{{" not in out, "unreplaced token"
open(os.path.join(here, "..", "index.html"), "w", encoding="utf-8").write(out)
print("index.html written,", len(out) // 1024, "KB")
