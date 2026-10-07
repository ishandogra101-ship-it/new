"""Compositions + asset renderer. Usage: python3 compose.py <outdir>
Renders every illustration to SVG, then a node/playwright script rasterises to PNG -> WebP.
"""
import math, json, os, sys, random, subprocess
import art
from art import f, catmull

def sample(pts, n=200):
    """Dense polyline along a catmull-rom curve through pts."""
    out = []
    m = len(pts)
    segs = m - 1
    for i in range(segs):
        p0 = pts[max(i - 1, 0)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[min(i + 2, m - 1)]
        for k in range(n // segs):
            t = k / (n // segs)
            t2, t3 = t * t, t * t * t
            x = .5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(pts[-1])
    return out

def at(poly, t):
    i = min(int(t * (len(poly) - 1)), len(poly) - 2)
    return poly[i]

SYM = {  # symbol aspect info: (w,h, attach_x, attach_y)
    "fig": (120, 150, 70, 4),
    "halfpear": (120, 150, 70, 4),
    "half": (140, 144, 70, 72),
    "leaf": (170, 180, 87, 172),
    "star": (60, 60, 30, 30),
}

def place(sym_id, ax, ay, w, rot=0, kind="fig", flip=False, op=1, extra=""):
    vw, vh, px, py = SYM[kind]
    s = w / vw
    x, y = ax - px * s, ay - py * s
    tr = "rotate(%s %s %s)" % (f(rot), f(ax), f(ay))
    if flip:
        tr += " translate(%s 0) scale(-1 1)" % f(2 * ax)
    return '<g transform="%s" opacity="%s" %s><use href="#%s" x="%s" y="%s" width="%s" height="%s"/></g>' % (
        tr, f(op), extra, sym_id, f(x), f(y), f(vw * s), f(vh * s))

def twig(a, b, w=3.2, bow=10):
    mx, my = (a[0] + b[0]) / 2 + bow, (a[1] + b[1]) / 2
    return '<path d="M%s %s Q%s %s %s %s" fill="none" stroke="#5b3a2b" stroke-width="%s" stroke-linecap="round"/>' % (
        f(a[0]), f(a[1]), f(mx), f(my), f(b[0]), f(b[1]), f(w))

def bark(pts, w0=22, w1=9):
    poly = sample(pts, 160)
    # tapered ribbon
    L, R = [], []
    for i, (x, y) in enumerate(poly):
        t = i / (len(poly) - 1)
        w = (w0 + (w1 - w0) * t) / 2
        if i < len(poly) - 1:
            dx, dy = poly[i + 1][0] - x, poly[i + 1][1] - y
        else:
            dx, dy = x - poly[i - 1][0], y - poly[i - 1][1]
        l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        L.append((x + nx * w, y + ny * w)); R.append((x - nx * w, y - ny * w))
    d = "M" + " L".join("%s %s" % (f(a), f(b)) for a, b in L + R[::-1]) + "Z"
    hi = "M" + " L".join("%s %s" % (f(poly[i][0] - 1.5), f(poly[i][1] - 1.5)) for i in range(0, len(poly), 3))
    return ('<g filter="url(#paint)"><path d="%s" fill="#5b3a2b"/><path d="%s" fill="none" stroke="#8d6048" stroke-width="%s" stroke-linecap="round" opacity=".45"/></g>'
            % (d, hi, f(w0 * .22))), poly

def svg(w, h, body, bg=None):
    r = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="%d" height="%d" viewBox="0 0 %d %d"><defs>%s</defs>' % (w, h, w, h, art.all_defs())
    if bg:
        r += '<rect width="%d" height="%d" fill="%s"/>' % (w, h, bg)
    return r + body + '</svg>'

def leaf_field(w, h, color_ops, seed=1, n=28, size=(120, 190)):
    """Scattered faint leaves as a quiet background pattern."""
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        x, y = rnd.uniform(-20, w + 20), rnd.uniform(-20, h + 20)
        lw = rnd.uniform(*size)
        out.append(place("leaf", x, y, lw, rnd.uniform(-180, 180), "leaf", op=color_ops))
    return "".join(out)

# ----------------------------------------------------------- HERO
def hero():
    W, H = 1400, 1500
    pts = [(1440, 20), (1230, 130), (980, 190), (760, 330), (650, 580), (690, 850), (560, 1120), (430, 1330)]
    bk, poly = bark(pts, 34, 12)
    body = []
    for t, ang, w, dk in [(.05, 40, 380, True), (.16, -62, 330, False), (.30, 52, 300, True), (.45, -58, 330, False), (.60, 60, 300, True), (.78, -50, 300, False), (.90, 30, 260, True)]:
        x, y = at(poly, t)
        body.append(place("leaf-dk" if dk else "leaf", x, y, w, ang, "leaf"))
    body.append(bk)
    # side shoots: (t, dx, dy) shoot end; figs hang from shoot ends with short stems
    clusters = [
        (.10, 20, 70, [("fig-aubergine", 230, -3), ]),
        (.19, -30, 60, [("fig-burgundy", 215, 4)]),
        (.30, 50, 80, [("fig-violet", 220, -5), ("halfpear", 205, 7)]),
        (.42, -60, 70, [("fig-indigo", 205, 3)]),
        (.52, 60, 60, [("fig-green", 200, -4), ("fig-ochre", 190, 5)]),
        (.64, -70, 80, [("fig-rose", 200, 4), ("half", 220, -8)]),
        (.74, 55, 70, [("fig-burgundy", 190, -3)]),
        (.86, -40, 70, [("fig-ochre", 175, 4), ("fig-aubergine", 170, -4)]),
    ]
    for t, dx, dy, items in clusters:
        x0, y0 = at(poly, t)
        x1, y1 = x0 + dx, y0 + dy
        body.append('<path d="M%s %s Q%s %s %s %s" fill="none" stroke="#5b3a2b" stroke-width="9" stroke-linecap="round"/>' % (f(x0), f(y0), f((x0 + x1) / 2 + 8), f(y0 + dy * .3), f(x1), f(y1)))
        for k, (sym, w, rot) in enumerate(items):
            ox = (k - (len(items) - 1) / 2) * w * .62
            kind = "half" if sym == "half" else ("halfpear" if sym == "halfpear" else "fig")
            ay = y1 + 28 + (k % 2) * 26
            body.append(place(sym, x1 + ox, ay, w, rot, kind))
    for x, y, w in [(1130, 90, 56), (560, 420, 42), (900, 700, 46), (360, 1050, 40), (1180, 480, 36)]:
        body.append(place("star", x, y, w, 0, "star"))
    return svg(W, H, "".join(body)), W, H

# ----------------------------------------------------------- COVERS (4:5)
def cover_frame(bg, pattern_op, body_fn, leaf_dk=False):
    W, H = 1000, 1250
    body = [leaf_field(W, H, pattern_op, seed=3, n=22, size=(150, 260))]
    body.append(body_fn())
    return svg(W, H, "".join(body), bg), W, H

def cover_search():
    b = []
    b.append(place("leaf-dk", 250, 1010, 520, -26, "leaf"))
    b.append(place("leaf", 770, 1060, 480, 24, "leaf"))
    b.append(place("half", 500, 690, 640, -10, "half"))
    b.append(place("star", 840, 260, 90, 0, "star"))
    b.append(place("star", 170, 420, 52, 0, "star"))
    return "".join(b)

def cover_social():
    pts = [(-40, 130), (260, 190), (560, 150), (860, 230), (1060, 190)]
    bk, poly = bark(pts, 20, 12)
    b = [place("leaf-dk", 180, 190, 420, 28, "leaf"), place("leaf", 820, 230, 380, -34, "leaf"), bk]
    for t, drop, sym, w, rot in [(.12, 330, "fig-aubergine", 280, 4), (.30, 520, "fig-violet", 300, -5), (.5, 380, "fig-indigo", 270, 3), (.68, 560, "fig-aubergine", 290, -3), (.86, 360, "fig-violet", 250, 5)]:
        x, y = at(poly, t)
        b.append(twig((x, y), (x + 10, y + drop), 4, 8))
        b.append(place(sym, x + 10, y + drop, w, rot))
    b.append(place("star", 910, 760, 70, 0, "star"))
    b.append(place("star", 120, 900, 46, 0, "star"))
    return "".join(b)

def cover_edu():
    pts = [(-40, 300), (260, 360), (520, 320), (780, 410), (1060, 360)]
    bk, poly = bark(pts, 20, 12)
    b = [place("leaf", 330, 330, 440, 24, "leaf"), place("leaf-dk", 880, 400, 420, -28, "leaf"), bk]
    seq = [(.1, 250, "fig-green", 150), (.27, 340, "fig-ochre", 190), (.46, 420, "fig-rose", 230), (.66, 520, "fig-burgundy", 270), (.88, 640, "fig-aubergine", 310)]
    for t, drop, sym, w in seq:
        x, y = at(poly, t)
        b.append(twig((x, y), (x + 8, y + drop), 4, 6))
        b.append(place(sym, x + 8, y + drop, w, 0))
    b.append(place("halfpear", 500, 1010, 250, 6, "halfpear"))
    b.append(place("star", 880, 170, 64, 0, "star"))
    return "".join(b)

def cover_events():
    b = [place("leaf-dk", 150, 640, 560, -62, "leaf"), place("leaf", 900, 700, 520, 58, "leaf"),
         place("half", 500, 560, 520, 8, "half"),
         place("fig-ochre", 250, 840, 300, -6, "fig"), place("fig-rose", 760, 880, 290, 7, "fig"),
         place("star", 500, 120, 110, 0, "star"), place("star", 190, 260, 56, 0, "star"), place("star", 830, 330, 60, 0, "star"),
         place("star", 640, 1130, 48, 0, "star")]
    return "".join(b)

# ----------------------------------------------------------- misc
def cutfig_closing():
    W, H = 1100, 1100
    b = [place("leaf-dk", 430, 640, 540, -38, "leaf"), place("half", 640, 500, 720, -12, "half"),
         place("halfpear", 400, 700, 290, 12, "halfpear"), place("star", 960, 150, 90, 0, "star"), place("star", 150, 330, 52, 0, "star")]
    return svg(W, H, "".join(b)), W, H

def pattern_tile():
    W = H = 440
    rnd = random.Random(9)
    b = []
    spots = [(60, 80, -30, 150), (270, 40, 40, 130), (180, 220, 160, 160), (390, 250, -110, 140), (60, 360, 70, 130), (300, 400, -20, 150)]
    for x, y, a, w in spots:
        for dx in (-W, 0, W):
            for dy in (-H, 0, H):
                b.append(place("leaf", x + dx, y + dy, w, a, "leaf"))
    return svg(W, H, "".join(b)), W, H

def single(sym, kind="fig", w=240):
    vw, vh = SYM[kind][0], SYM[kind][1]
    s = w / vw
    W, H = int(vw * s) + 40, int(vh * s) + 40
    body = '<g transform="translate(20 20) scale(%s)"><use href="#%s" width="%d" height="%d"/></g>' % (f(s), sym, vw, vh)
    return svg(W, H, body), W, H

def build(outdir):
    os.makedirs(outdir, exist_ok=True)
    jobs = []
    def add(name, tup, q=86):
        s, w, h = tup
        path = os.path.join(outdir, name + ".svg")
        open(path, "w").write(s)
        jobs.append(dict(svg=path, png=os.path.join(outdir, name + ".png"), webp=os.path.join(outdir, name + ".webp"), w=w, h=h, q=q))
    add("hero-branch", hero())
    add("cover-search", cover_frame("#cdd7a2", .5, cover_search))
    add("cover-social", cover_frame("#e6dbef", .5, cover_social))
    add("cover-edu", cover_frame("#f6dfd8", .5, cover_edu))
    add("cover-events", cover_frame("#5d1608", .22, cover_events))
    add("closing-figs", cutfig_closing())
    add("leaf-print", pattern_tile(), 70)
    for nm in ("aubergine", "violet", "burgundy", "indigo", "green", "ochre", "rose"):
        add("fig-" + nm, single("fig-" + nm, "fig", 200))
    add("fig-half", single("half", "half", 260))
    add("fig-halfpear", single("halfpear", "halfpear", 220))
    add("leaf", single("leaf", "leaf", 260))
    add("leaf-dk", single("leaf-dk", "leaf", 260))
    add("star", single("star", "star", 120))
    json.dump(jobs, open(os.path.join(outdir, "jobs.json"), "w"))
    return jobs

if __name__ == "__main__":
    build(sys.argv[1])
    print("svgs written")
