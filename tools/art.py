"""Botanical-print SVG pieces for the portfolio: figs, cut figs, leaves, branches, stars.
Everything is drawn from parametric geometry (no external art). Run build.py to emit files.
"""
import math, random

# ---------- helpers ----------
def f(n):
    return ("%.1f" % n).rstrip('0').rstrip('.')

def catmull(pts, closed=False, k=1.0):
    n = len(pts)
    d = "M%s %s" % (f(pts[0][0]), f(pts[0][1]))
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[0]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else pts[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k)
        d += " C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
    if closed:
        d += "Z"
    return d

# ---------- palette (from the fig references) ----------
FIG_PAL = {
    "aubergine": dict(neck="#8d9440", neck2="#6c5a5a", mid="#5a3572", deep="#2a1535", stria="#1c0b27", lite="#a37cc4"),
    "violet":    dict(neck="#98a047", neck2="#7a6a8e", mid="#7a58a8", deep="#35205a", stria="#24123f", lite="#b9a0dc"),
    "burgundy":  dict(neck="#9aa045", neck2="#8a5a55", mid="#9a3556", deep="#451027", stria="#2f0a1a", lite="#d98aa3"),
    "indigo":    dict(neck="#8fa04a", neck2="#6a7090", mid="#4a5c9c", deep="#1f2a5e", stria="#141c44", lite="#8fa2d8"),
    "green":     dict(neck="#c3c76c", neck2="#a8b055", mid="#8a9b47", deep="#566c2c", stria="#394b1b", lite="#d6dc92"),
    "ochre":     dict(neck="#ecbf6a", neck2="#e2a043", mid="#d78a2c", deep="#a24f1a", stria="#7a360f", lite="#f6d894"),
    "rose":      dict(neck="#e9b0a4", neck2="#da8a94", mid="#c65a78", deep="#86304f", stria="#5e1f38", lite="#f2b8c4"),
}

BODY = ("M60 20 C55 20 53 28 50 38 C44 54 12 66 8 98 C5 124 30 142 60 142 "
        "C90 142 115 124 112 98 C108 66 76 54 70 38 C67 28 65 20 60 20Z")

def fig_symbol(name, pal, seed=1):
    p = FIG_PAL[pal]
    rnd = random.Random(seed)
    g = "g_" + name
    h = "h_" + name
    c = "c_" + name
    out = []
    out.append('<symbol id="%s" viewBox="0 0 120 150" overflow="visible">' % name)
    out.append('<defs>')
    out.append('<linearGradient id="%s" x1=".15" y1="0" x2=".55" y2="1">'
               '<stop offset="0" stop-color="%s"/><stop offset=".16" stop-color="%s"/>'
               '<stop offset=".36" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
               % (g, p["neck"], p["neck2"], p["mid"], p["deep"]))
    out.append('<radialGradient id="%s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".5"/>'
               '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' % h)
    out.append('<clipPath id="%s"><path d="%s"/></clipPath>' % (c, BODY))
    out.append('</defs>')
    out.append('<g filter="url(#paint)">')
    out.append('<path d="%s" fill="url(#%s)"/>' % (BODY, g))
    # striations
    out.append('<g clip-path="url(#%s)" fill="none" stroke-linecap="round">' % c)
    ends = [-46, -34, -22, -10, 2, 14, 26, 38, 49]
    for e in ends:
        e += rnd.uniform(-2, 2)
        sx = 60 + e * 0.07
        x1 = 60 + e * 1.28 + rnd.uniform(-2, 2)
        x2 = 60 + e * 1.34 + rnd.uniform(-2, 2)
        xe = 60 + e + rnd.uniform(-1.5, 1.5)
        w = rnd.uniform(1.0, 2.6)
        op = rnd.uniform(.22, .5)
        out.append('<path d="M%s 34 C%s 62 %s 100 %s 142" stroke="%s" stroke-width="%s" opacity="%s"/>'
                   % (f(sx), f(x1), f(x2), f(xe), p["stria"], f(w), f(op)))
        # lighter dry-brush streak beside it
        out.append('<path d="M%s 44 C%s 70 %s 104 %s 138" stroke="%s" stroke-width="%s" opacity="%s"/>'
                   % (f(sx + 2), f(x1 + 4), f(x2 + 4), f(xe + 4), p["lite"], f(rnd.uniform(.8, 1.8)), f(rnd.uniform(.12, .28))))
    out.append('</g>')
    # waxy bloom + highlight
    out.append('<ellipse cx="38" cy="86" rx="9" ry="26" transform="rotate(-14 38 86)" fill="url(#%s)"/>' % h)
    out.append('<path d="M60 20 C55 20 53 28 50 38 C44 54 12 66 8 98" fill="none" stroke="%s" stroke-width="1.4" opacity=".35"/>' % p["lite"])
    out.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.1" opacity=".5"/>' % (BODY, p["stria"]))
    out.append('</g>')
    # stem + calyx
    out.append('<path d="M55 26 C56 15 61 8 67 2 L73 6 C69 12 67 19 66 27 Z" fill="#6f6a2c" stroke="#43401a" stroke-width="1"/>')
    out.append('<path d="M67 2 L73 6 L70 8 L65 4Z" fill="#cdb67f"/>')
    out.append('<path d="M47 36 C52 26 68 26 73 36 C68 33 52 33 47 36Z" fill="%s" opacity=".7"/>' % p["neck"])
    # ostiole
    out.append('<ellipse cx="60" cy="140" rx="3.4" ry="1.8" fill="%s" opacity=".9"/>' % p["stria"])
    out.append('</symbol>')
    return "\n".join(out)

def seeds_for(cx, cy, r_in, r_out, rnd, n=210):
    out = []
    for i in range(n):
        t = rnd.random()
        r = r_in + (r_out - r_in) * math.sqrt(t)
        a = rnd.uniform(0, 2 * math.pi)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        L = rnd.uniform(2.4, 4.6)
        x2, y2 = x + L * math.cos(a), y + L * math.sin(a)
        col = rnd.choice(["#f6c1cb", "#f6c1cb", "#f9d6dc", "#e8c36d", "#f2a3b4"])
        out.append('<path d="M%s %sL%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round" opacity="%s"/>'
                   % (f(x), f(y), f(x2), f(y2), col, f(rnd.uniform(.9, 1.7)), f(rnd.uniform(.55, .95))))
    return "".join(out)

def half_round_symbol(name="half", seed=3):
    """Cross-cut fig, seen from above: rind, pale rim, pink-red flesh with seeds."""
    rnd = random.Random(seed)
    cx, cy = 70, 72
    rind = catmull([(cx + 62 * math.cos(a) * (1 + .03 * math.sin(3 * a)), cy + 58 * math.sin(a) * (1 + .03 * math.cos(2 * a)))
                    for a in [i * math.pi / 8 for i in range(16)]], closed=True)
    rim = catmull([(cx + 56 * math.cos(a) * (1 + .03 * math.sin(3 * a)), cy + 52 * math.sin(a) * (1 + .03 * math.cos(2 * a)))
                   for a in [i * math.pi / 8 for i in range(16)]], closed=True)
    flesh = catmull([(cx + 51 * math.cos(a) * (1 + .03 * math.sin(3 * a)), cy + 47 * math.sin(a) * (1 + .03 * math.cos(2 * a)))
                     for a in [i * math.pi / 8 for i in range(16)]], closed=True)
    out = ['<symbol id="%s" viewBox="0 0 140 144" overflow="visible">' % name]
    out.append('<defs><radialGradient id="fl_%s" cx=".5" cy=".5" r=".5">'
               '<stop offset="0" stop-color="#3a0a22"/><stop offset=".2" stop-color="#7d1238"/>'
               '<stop offset=".5" stop-color="#c4264f"/><stop offset=".85" stop-color="#e46a88"/>'
               '<stop offset="1" stop-color="#f09aae"/></radialGradient>'
               '<linearGradient id="rd_%s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d3a73"/>'
               '<stop offset="1" stop-color="#241230"/></linearGradient>'
               '<clipPath id="cl_%s"><path d="%s"/></clipPath></defs>' % (name, name, name, flesh))
    out.append('<g filter="url(#paint)">')
    out.append('<path d="%s" fill="url(#rd_%s)"/>' % (rind, name))
    out.append('<path d="%s" fill="#f1e6c2"/>' % rim)
    out.append('<path d="%s" fill="#e3d7a4" opacity=".6" transform="translate(0 1.4)"/>' % rim)
    out.append('<path d="%s" fill="url(#fl_%s)"/>' % (flesh, name))
    out.append('<g clip-path="url(#cl_%s)">' % name)
    out.append(seeds_for(cx, cy, 6, 50, rnd, 230))
    out.append('<ellipse cx="%s" cy="%s" rx="7" ry="6" fill="#2a0618" opacity=".75"/>' % (cx, cy))
    out.append('</g>')
    out.append('<path d="%s" fill="none" stroke="#2a1230" stroke-width="1" opacity=".55"/>' % rind)
    out.append('</g></symbol>')
    return "\n".join(out)

def half_pear_symbol(name="halfpear", seed=5):
    """Lengthwise cut: pear outline, thin rind, rim, flesh, seeds. viewBox 0 0 120 150."""
    rnd = random.Random(seed)
    inner = ("M60 34 C56 34 54 40 52 47 C47 59 22 68 19 98 C17 120 36 134 60 134 "
             "C84 134 103 120 101 98 C98 68 73 59 68 47 C66 40 64 34 60 34Z")
    mid = ("M60 28 C56 28 54 34 51 43 C45 57 17 67 13 98 C10 122 33 138 60 138 "
           "C87 138 110 122 107 98 C103 67 75 57 69 43 C66 34 64 28 60 28Z")
    out = ['<symbol id="%s" viewBox="0 0 120 150" overflow="visible">' % name]
    out.append('<defs><radialGradient id="fp_%s" cx=".5" cy=".62" r=".55"><stop offset="0" stop-color="#4a0b26"/>'
               '<stop offset=".25" stop-color="#9a1a43"/><stop offset=".6" stop-color="#d2385f"/>'
               '<stop offset="1" stop-color="#ee8aa2"/></radialGradient>'
               '<linearGradient id="rp_%s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d3a73"/>'
               '<stop offset="1" stop-color="#241230"/></linearGradient>'
               '<clipPath id="cp_%s"><path d="%s"/></clipPath></defs>' % (name, name, name, inner))
    out.append('<g filter="url(#paint)">')
    out.append('<path d="%s" fill="url(#rp_%s)"/>' % (BODY, name))
    out.append('<path d="%s" fill="#f1e6c2"/>' % mid)
    out.append('<path d="%s" fill="url(#fp_%s)"/>' % (inner, name))
    out.append('<g clip-path="url(#cp_%s)">' % name)
    out.append(seeds_for(60, 96, 4, 44, rnd, 170))
    out.append('</g>')
    out.append('<path d="%s" fill="none" stroke="#2a1230" stroke-width="1" opacity=".5"/>' % BODY)
    out.append('</g>')
    out.append('<path d="M55 26 C56 15 61 8 67 2 L73 6 C69 12 67 19 66 27 Z" fill="#6f6a2c" stroke="#43401a" stroke-width="1"/>')
    out.append('<path d="M67 2 L73 6 L70 8 L65 4Z" fill="#cdb67f"/>')
    out.append('</symbol>')
    return "\n".join(out)

def leaf_symbol(name="leaf", dark=False, seed=2):
    """Broad five-lobed fig leaf with rounded lobes. viewBox 0 0 170 180."""
    rnd = random.Random(seed)
    bx, by = 85, 150
    def pol(ang, r):
        a = math.radians(ang)
        return (bx + r * math.sin(a), by - r * math.cos(a))
    lobes = [(-84, 70, 15), (-42, 112, 17), (0, 134, 19), (42, 112, 17), (84, 70, 15)]
    pts = [(bx - 20, by + 10), (bx - 30, by - 8)]
    for i, (a, r, w) in enumerate(lobes):
        r *= rnd.uniform(.96, 1.04)
        pts += [pol(a - w, r * .80), pol(a - w * .45, r * .98), pol(a + w * .45, r * .98), pol(a + w, r * .80)]
        if i < len(lobes) - 1:
            na = lobes[i + 1][0]
            pts.append(pol((a + na) / 2, min(r, lobes[i + 1][1]) * .42))
    pts += [(bx + 30, by - 8), (bx + 20, by + 10)]
    outline = catmull(pts, closed=True, k=1.0)
    c_l = ("#86974a", "#3f5d2c") if not dark else ("#4c6a35", "#223d22")
    c_r = ("#5f7f38", "#27462a") if not dark else ("#385530", "#1a3220")
    out = ['<symbol id="%s" viewBox="0 0 170 180" overflow="visible">' % name]
    out.append('<defs><linearGradient id="lg_%s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
               '<linearGradient id="lr_%s" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
               '<clipPath id="lc_%s"><path d="%s"/></clipPath>'
               '<clipPath id="ll_%s"><rect x="0" y="0" width="85" height="180"/></clipPath></defs>'
               % (name, c_l[0], c_l[1], name, c_r[0], c_r[1], name, outline, name))
    out.append('<g filter="url(#paint)">')
    out.append('<path d="%s" fill="url(#lr_%s)"/>' % (outline, name))
    out.append('<g clip-path="url(#lc_%s)"><g clip-path="url(#ll_%s)"><path d="%s" fill="url(#lg_%s)"/></g>' % (name, name, outline, name))
    for a, r, w in lobes:
        ex, ey = pol(a, r * .88)
        mx, my = (bx + ex) / 2 + rnd.uniform(-3, 3), (by + ey) / 2 + rnd.uniform(-3, 3)
        out.append('<path d="M%s %s Q%s %s %s %s" fill="none" stroke="#8e2f3d" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>'
                   % (bx, by - 2, f(mx), f(my), f(ex), f(ey)))
        for t in (.4, .62, .8):
            vx, vy = bx + (ex - bx) * t, by + (ey - by) * t
            for sgn in (-1, 1):
                out.append('<path d="M%s %s l%s %s" stroke="#b4c878" stroke-width=".9" stroke-linecap="round" opacity=".4" fill="none"/>'
                           % (f(vx), f(vy), f(sgn * 8), f(-5)))
    out.append('</g>')
    out.append('<path d="M%s %s L85 18" stroke="#d6dfa2" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/>' % (bx, by + 4))
    out.append('<path d="%s" fill="none" stroke="#1c2e17" stroke-width="1" opacity=".5"/>' % outline)
    out.append('</g>')
    out.append('<path d="M%s %s C84 164 86 172 88 178" stroke="#5b4a2b" stroke-width="4" stroke-linecap="round" fill="none"/>' % (bx, by + 8))
    out.append('</symbol>')
    return "\n".join(out)

def star_symbol(name="star"):
    pts = []
    for i in range(16):
        a = math.radians(i * 22.5 - 90)
        r = [30, 8, 11, 8][i % 4] if True else 0
        pts.append((30 + r * math.cos(a), 30 + r * math.sin(a)))
    # long points N,E,S,W ; short diagonals
    path = "M" + " L".join("%s %s" % (f(x), f(y)) for x, y in pts) + "Z"
    return ('<symbol id="%s" viewBox="0 0 60 60" overflow="visible"><defs><linearGradient id="sg_%s" x1="0" y1="0" x2="1" y2="1">'
            '<stop offset="0" stop-color="#f0d98a"/><stop offset=".5" stop-color="#c9a44a"/><stop offset="1" stop-color="#8f6d22"/></linearGradient></defs>'
            '<path d="%s" fill="url(#sg_%s)"/><path d="%s" fill="none" stroke="#7a5a18" stroke-width=".6" opacity=".6"/></symbol>'
            % (name, name, path, name, path))

PAINT_FILTER = (
    '<filter id="paint" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">'
    '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="w"/>'
    '<feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>'
    '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="g"/>'
    '<feColorMatrix in="g" type="matrix" values="0 0 0 0 .1  0 0 0 0 .04  0 0 0 0 .12  .7 0 0 0 -.22" result="ga"/>'
    '<feComposite in="ga" in2="d" operator="in" result="gm"/>'
    '<feMerge><feMergeNode in="d"/><feMergeNode in="gm"/></feMerge></filter>'
)

def all_defs(figs=("aubergine", "violet", "burgundy", "indigo", "green", "ochre", "rose"), extra=True):
    parts = [PAINT_FILTER]
    for i, nm in enumerate(figs):
        parts.append(fig_symbol("fig-" + nm, nm, seed=10 + i))
    if extra:
        parts += [half_round_symbol("half"), half_pear_symbol("halfpear"), leaf_symbol("leaf"), leaf_symbol("leaf-dk", dark=True, seed=7), star_symbol("star")]
    return "\n".join(parts)

def branch(points, w=6, color="#5c3b2e", hi="#8c5d44"):
    d = catmull(points)
    return ('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>'
            '<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" opacity=".45" transform="translate(-%s -0.4)"/>'
            % (d, color, f(w), d, hi, f(max(1, w * .28)), f(w * .22)))

if __name__ == "__main__":
    import sys
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="560" viewBox="0 0 1300 560"><rect width="1300" height="560" fill="#fbf8f5"/><defs>' + all_defs() + '</defs>']
    x = 20
    for nm in ("aubergine", "violet", "burgundy", "indigo", "green", "ochre", "rose"):
        out.append('<use href="#fig-%s" x="%d" y="10" width="120" height="150"/>' % (nm, x)); x += 130
    out.append('<use href="#half" x="20" y="200" width="210" height="216"/>')
    out.append('<use href="#halfpear" x="250" y="200" width="160" height="200"/>')
    out.append('<use href="#leaf" x="440" y="190" width="220" height="233"/>')
    out.append('<use href="#leaf-dk" x="680" y="190" width="220" height="233"/>')
    out.append('<use href="#star" x="930" y="200" width="70" height="70"/>')
    out.append(branch([(950, 520), (990, 460), (1050, 420), (1130, 400)], 9))
    out.append('</svg>')
    open(sys.argv[1], "w").write("\n".join(out))
