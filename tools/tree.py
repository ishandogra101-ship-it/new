"""Generates the skills-tree HTML (limb SVG + positioned fig nodes). Usage: python3 tree.py > tree.html"""
import math, random, sys
import compose
from art import f, PAINT_FILTER

W, H = 1200, 1340
ROWS = [70, 380, 690, 1000]
XS = [165, 405, 795, 1035]

# (name, short descriptor, group, fig colour). Row-major, scattered so colours mix.
SKILLS = [
    ("Organic &amp; AI search", "Two inbound deals, zero paid spend", "find", "aubergine"),
    ("Copywriting", "Campaigns, web, LinkedIn", "make", "burgundy"),
    ("Media planning", "Built end to end, as sole marketer", "plan", "indigo"),
    ("Partnerships", "Google for Education, Teachmint", "win", "ochre"),

    ("Creative strategy", "The thinking behind DIDAC and GESS", "make", "burgundy"),
    ("Go-to-market", "Two business units: India and the US", "plan", "indigo"),
    ("Sales &amp; pitching", "Government, education and MSP deals", "win", "ochre"),
    ("Consumer research", "Why buyers act, or don't", "find", "violet"),

    ("Budgeting", "Across both Netoyed brands", "plan", "indigo"),
    ("Content strategy", "Calendars, blogs, site copy, case studies", "make", "rose"),
    ("Account-based marketing", "Finding and closing the right accounts", "find", "aubergine"),
    ("Hiring &amp; team building", "A team of one, then nine", "win", "ochre"),

    ("Social media", "2,500 to 16K followers in six months", "make", "burgundy"),
    ("Digital campaigns", "Ads across digital channels", "plan", "indigo"),
    ("Brand positioning", "Two brands, each with its own voice", "make", "rose"),
    ("Event communication", "Design, messaging, conversions", "make", "burgundy"),
]

def limb_pts(row_y, side):
    sx = 1 if side == "R" else -1
    return [(600, row_y + 74), (600 + sx * 130, row_y + 14), (600 + sx * 320, row_y - 22), (600 + sx * 520, row_y + 6), (600 + sx * 575, row_y + 38)]

def limb_y(poly, x):
    best = min(poly, key=lambda p: abs(p[0] - x))
    return best[1]

def build():
    rnd = random.Random(21)
    svg = []
    svg.append('<defs>%s</defs>' % PAINT_FILTER)
    # trunk
    trunk_pts = [(600, 1342), (594, 1100), (606, 860), (598, 600), (604, 340), (600, 120)]
    tk, tpoly = compose.bark(trunk_pts, 64, 14)
    limbs, polys = [], {}
    for ri, y in enumerate(ROWS):
        for side in ("L", "R"):
            b, poly = compose.bark(limb_pts(y, side), 22, 8)
            limbs.append(b)
            polys[(ri, side)] = poly
    # roots
    roots = ""
    for dx, dy in [(-110, 18), (96, 20), (-60, 10), (50, 12)]:
        roots += '<path d="M600 1310 Q%s 1332 %s %s" fill="none" stroke="#5b3a2b" stroke-width="12" stroke-linecap="round"/>' % (f(600 + dx * .45), f(600 + dx), f(1320 + dy))
    # leaves along limbs (behind)
    leaves = []
    for (ri, side), poly in polys.items():
        sx = 1 if side == "R" else -1
        for t in (.22, .42, .62, .82):
            x, y = poly[int(t * (len(poly) - 1))]
            ang = rnd.choice([-1, 1]) * rnd.uniform(25, 55)
            w = rnd.uniform(58, 84)
            leaves.append((x, y, ang, w, rnd.random() < .45))
    leaf_svg = []
    for x, y, ang, w, dk in leaves:
        h = w * 245 / 259
        leaf_svg.append('<image href="assets/art/%s.webp" x="%s" y="%s" width="%s" height="%s" transform="rotate(%s %s %s)"/>' % (
            "leaf-dk" if dk else "leaf", f(x - w / 2), f(y - h * .9), f(w), f(h), f(ang), f(x), f(y)))
    nodes = []
    twigs = []
    k = 0
    for ri, y in enumerate(ROWS):
        for ci, x in enumerate(XS):
            name, desc, grp, col = SKILLS[k]; k += 1
            jx = rnd.uniform(-16, 16)
            fx = x + jx
            side = "L" if fx < 600 else "R"
            ly = limb_y(polys[(ri, side)], fx)
            stem = rnd.uniform(14, 34)
            top = ly + stem
            twigs.append('<path d="M%s %s Q%s %s %s %s" fill="none" stroke="#5b3a2b" stroke-width="5" stroke-linecap="round"/>' % (
                f(fx - rnd.uniform(-6, 6)), f(ly), f(fx + 6), f(ly + stem * .5), f(fx), f(top + 4)))
            nodes.append('<li class="node g-%s" style="--x:%s%%;--y:%s%%"><img class="node__fig" src="assets/art/fig-%s.webp" alt="" width="180" height="242" loading="lazy" decoding="async">'
                         '<span class="node__txt" data-calm><b>%s</b><span>%s</span></span></li>' % (grp, f(fx / W * 100), f(top / H * 100), col, name, desc))
    svg.append('<g class="tree__bark">%s%s%s%s</g>' % (roots, tk, "".join(limbs), "".join(twigs)))
    svg.insert(1, '<g>%s</g>' % "".join(leaf_svg))
    out = ('<div class="tree" id="tree" style="--ar:%d/%d"><svg class="tree__limbs" viewBox="0 0 %d %d" aria-hidden="true" focusable="false">%s</svg><ol class="tree__nodes">%s</ol></div>'
           % (W, H, W, H, "".join(svg), "".join(nodes)))
    return out

if __name__ == "__main__":
    sys.stdout.write(build())
