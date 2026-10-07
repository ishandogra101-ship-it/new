"""Painterly canvas assets: Van Gogh-style flow-field brushwork over watercolour washes,
paper grain, a water-shimmer tile, ragged mask edges for embedding images, and loose
crayon cut-figs (after the Bell Jar endpapers). Usage: python3 paint.py <outdir>
Outputs SVG + jobs.json for render.js (rasterised to transparent WebP)."""
import math, random, json, os, sys
from art import f, catmull

def vec(x, y, seeds, vortices):
    s1, s2, s3 = seeds
    a = (math.sin(x * .0042 + s1) * .9 + math.cos(y * .0051 + s2) * .9 + math.sin((x - y) * .0027 + s3) * .6)
    vx, vy = math.cos(a), math.sin(a)
    for cx, cy, r, st in vortices:
        dx, dy = x - cx, y - cy
        d2 = dx * dx + dy * dy
        w = math.exp(-d2 / (r * r)) * st
        d = math.sqrt(d2) or 1
        vx += -dy / d * w; vy += dx / d * w
    l = math.hypot(vx, vy) or 1
    return vx / l, vy / l

def mix(h1, h2, t):
    a = [int(h1[i:i + 2], 16) for i in (1, 3, 5)]; b = [int(h2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def blob(cx, cy, r, rnd, n=26, j=.28):
    pts = []
    ph = [rnd.uniform(0, 6.3) for _ in range(3)]
    for i in range(n):
        a = i / n * 2 * math.pi
        rr = r * (1 + j * (math.sin(3 * a + ph[0]) * .5 + math.sin(5 * a + ph[1]) * .3 + math.sin(7 * a + ph[2]) * .2) + rnd.uniform(-.04, .04))
        pts.append((cx + rr * math.cos(a), cy + rr * .82 * math.sin(a)))
    return catmull(pts, closed=True)

FILTERS = """
<filter id="wc" x="-20%" y="-20%" width="140%" height="140%">
 <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="3" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="38" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feGaussianBlur in="d" stdDeviation="9" result="b"/>
 <feComposite in="d" in2="b" operator="arithmetic" k1="0" k2="1.35" k3="-.35" k4="0" result="edge"/>
 <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.15" result="ga"/>
 <feComposite in="edge" in2="ga" operator="in"/>
</filter>
<filter id="brush" x="-5%" y="-5%" width="110%" height="110%">
 <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="5" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="soft"><feGaussianBlur stdDeviation="70"/></filter>
"""

def patch(name, W, H, washes, strokes_pal, accent, seed, n=1900, vort=None, density_fn=None,
          figs=0, stroke_scale=1.0, mask_r=.46):
    rnd = random.Random(seed)
    seeds = (rnd.uniform(0, 6), rnd.uniform(0, 6), rnd.uniform(0, 6))
    vortices = vort if vort is not None else [(rnd.uniform(.2, .8) * W, rnd.uniform(.25, .75) * H, rnd.uniform(.12, .22) * W, rnd.uniform(1.4, 2.6) * rnd.choice([-1, 1])) for _ in range(3)]
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d"><defs>%s' % (W, H, W, H, FILTERS)]
    out.append('<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="%d" height="%d"><g filter="url(#soft)">' % (W, H))
    out.append('<path d="%s" fill="#fff"/>' % blob(W / 2, H / 2, min(W, H) * mask_r, rnd, j=.22))
    for _ in range(4):
        out.append('<path d="%s" fill="#fff"/>' % blob(W * rnd.uniform(.28, .72), H * rnd.uniform(.3, .7), min(W, H) * rnd.uniform(.18, .3), rnd))
    out.append('</g></mask><radialGradient id="rg"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>'
               '<mask id="m2" maskUnits="userSpaceOnUse" x="0" y="0" width="%d" height="%d"><rect width="%d" height="%d" fill="url(#rg)"/></mask>'
               '</defs><g mask="url(#m2)"><g mask="url(#m)">' % (W, H, W, H))
    # washes
    out.append('<g filter="url(#wc)">')
    for col, op, cx, cy, r in washes:
        out.append('<path d="%s" fill="%s" opacity="%s"/>' % (blob(cx * W, cy * H, r * 1.3 * min(W, H), rnd), col, f(op)))
    out.append('</g>')
    # brushwork
    out.append('<g filter="url(#brush)" stroke-linecap="round" fill="none">')
    for i in range(n):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        dn = density_fn(x / W, y / H) if density_fn else 1
        rr = math.hypot((x / W - .5) / .5, (y / H - .5) / .5)
        dn *= max(0, min(1, (.95 - rr) / .6)) ** 1.4
        if rnd.random() > dn:
            continue
        L = rnd.uniform(14, 34) * stroke_scale
        pts = [(x, y)]
        for k in range(4):
            vx, vy = vec(x, y, seeds, vortices)
            x += vx * L / 4; y += vy * L / 4
            pts.append((x, y))
        d = catmull(pts)
        col = rnd.choice(strokes_pal)
        if rnd.random() < .07:
            col = rnd.choice(accent)
        w = rnd.uniform(2.6, 6.2) * stroke_scale
        op = rnd.uniform(.45, .85)
        out.append('<path d="%s" stroke="%s" stroke-width="%s" opacity="%s"/>' % (d, col, f(w), f(op)))
        hi = mix(col, "#ffffff", .42)
        out.append('<path d="%s" stroke="%s" stroke-width="%s" opacity="%s" transform="translate(-.9 -.9)"/>' % (d, hi, f(w * .32), f(op * .55)))
    out.append('</g>')
    # crayon cut figs (endpaper motif)
    for _ in range(figs):
        out.append(crayon_fig(rnd.uniform(.2, .8) * W, rnd.uniform(.25, .75) * H, rnd.uniform(70, 110), rnd.uniform(-40, 40), rnd))
    out.append('</g></g></svg>')
    return "".join(out), W, H

def crayon_fig(cx, cy, s, rot, rnd):
    body = [(0, -1.05), (.22, -.7), (.62, -.12), (.66, .38), (.36, .78), (0, .86), (-.36, .78), (-.66, .38), (-.62, -.12), (-.22, -.7)]
    def jit(pts, k):
        return [(x * s + rnd.uniform(-k, k), y * s + rnd.uniform(-k, k)) for x, y in pts]
    g = ['<g transform="translate(%s %s) rotate(%s)" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#brush)">' % (f(cx), f(cy), f(rot))]
    g.append('<path d="%s" fill="#ece3b8" opacity=".85" stroke="none"/>' % catmull(jit(body, 2), closed=True))
    for k in range(2):
        g.append('<path d="%s" stroke="#4a2a46" stroke-width="%s" opacity=".75"/>' % (catmull(jit(body, 3.5), closed=True), f(rnd.uniform(3, 5))))
    inner = [(x * .62, y * .62 + .1) for x, y in body]
    g.append('<path d="%s" fill="#e0776e" opacity=".55" stroke="none"/>' % catmull(jit(inner, 3), closed=True))
    for _ in range(46):
        a = rnd.uniform(0, 6.3); r = rnd.uniform(0, .5) * s
        x, y = r * math.cos(a), r * math.sin(a) * 1.1 + .08 * s
        g.append('<path d="M%s %s q%s %s %s %s" stroke="%s" stroke-width="%s" opacity=".7"/>' % (
            f(x), f(y), f(rnd.uniform(-6, 6)), f(rnd.uniform(-6, 6)), f(rnd.uniform(-8, 8)), f(rnd.uniform(-8, 8)),
            rnd.choice(["#c4473f", "#d9645a", "#a83236", "#e8908a"]), f(rnd.uniform(2, 3.6))))
    for _ in range(10):
        a = rnd.uniform(0, 6.3); r = rnd.uniform(0, .32) * s
        g.append('<circle cx="%s" cy="%s" r="2.6" fill="#3a1a24" opacity=".7"/>' % (f(r * math.cos(a)), f(r * math.sin(a) + .1 * s)))
    g.append('</g>')
    return "".join(g)

def paper_tile():
    W = 384
    s = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d"><filter id="p" x="0" y="0" width="100%%" height="100%%">'
         '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="2" stitchTiles="stitch" result="g"/>'
         '<feColorMatrix in="g" type="matrix" values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .25  0 0 -1.6 0 1.0" result="ga"/>'
         '<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="9" stitchTiles="stitch" result="f"/>'
         '<feColorMatrix in="f" type="matrix" values="0 0 0 0 .4  0 0 0 0 .25  0 0 0 0 .3  0 0 -1.4 0 .78" result="fa"/>'
         '<feMerge><feMergeNode in="fa"/><feMergeNode in="ga"/></feMerge></filter>'
         '<rect width="100%%" height="100%%" filter="url(#p)"/></svg>') % (W, W)
    return s, W, W

def shimmer_tile():
    W = 700
    s = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d"><filter id="c" x="0" y="0" width="100%%" height="100%%">'
         '<feTurbulence type="turbulence" baseFrequency=".006 .011" numOctaves="2" seed="12" stitchTiles="stitch" result="t"/>'
         '<feColorMatrix in="t" type="luminanceToAlpha" result="l"/>'
         '<feComponentTransfer in="l" result="a"><feFuncA type="table" tableValues="0 .95 .25 0 0 0 0 0 0 0"/></feComponentTransfer>'
         '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
         '<rect width="100%%" height="100%%" fill="#fffaf2" filter="url(#c)"/></svg>') % (W, W)
    return s, W, W

def ragged_mask(seed, W=800, H=800):
    rnd = random.Random(seed)
    pts = []
    inset = 26
    per = [(inset, inset), (W - inset, inset), (W - inset, H - inset), (inset, H - inset)]
    for i in range(4):
        (x0, y0), (x1, y1) = per[i], per[(i + 1) % 4]
        for k in range(30):
            t = k / 30
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            nx, ny = (y1 - y0), -(x1 - x0)
            l = math.hypot(nx, ny); nx, ny = nx / l, ny / l
            o = rnd.uniform(-14, 10) + 8 * math.sin(t * 6 + seed)
            pts.append((x + nx * o, y + ny * o))
    s = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d"><filter id="r" x="-5%%" y="-5%%" width="110%%" height="110%%">'
         '<feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="%d" result="n"/>'
         '<feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/>'
         '<feGaussianBlur in="d" stdDeviation="2.2"/></filter>'
         '<path d="%s" fill="#000" filter="url(#r)"/></svg>') % (W, H, seed, catmull(pts, closed=True))
    return s, W, H

def build(outdir):
    os.makedirs(outdir, exist_ok=True)
    jobs = []
    def add(name, tup, q=62, scale=.7):
        s, w, h = tup
        p = os.path.join(outdir, name + ".svg"); open(p, "w").write(s)
        jobs.append(dict(svg=p, png=p[:-4] + ".png", webp=p[:-4] + ".webp", w=w, h=h, q=q, ow=round(w * scale)))
    ROSE = ["#e6a3ae", "#d9879b", "#f0c1bd", "#c76d86", "#efb3a8"]
    LILAC = ["#b9a5d6", "#9d8bc7", "#cdbfe3", "#8a78b8", "#d8c9e8"]
    MOSS = ["#a7b46e", "#8e9c58", "#c7cf95", "#76844a", "#b9c27f"]
    PEACH = ["#f0b98d", "#e7a37a", "#f6cfa9", "#d98b6a", "#efc196"]
    NIGHT = ["#3b2a6a", "#2c2156", "#4f3c86", "#5a2d63", "#6a4a9c", "#2a1b45"]
    WINE = ["#7a1f2c", "#5d1608", "#8e2f3d", "#46101f", "#9a3a3a"]
    GOLD = ["#e8c25a", "#f2d27a", "#d9a63a"]
    add("p-hero", patch("p-hero", 1300, 1100, [("#f2b8c0", .55, .5, .45, .42), ("#cdbfe3", .5, .62, .6, .3), ("#f6d6c4", .5, .35, .5, .3)], ROSE + LILAC[:2], GOLD, 1))
    add("p-moss", patch("p-moss", 1200, 1000, [("#d5dca6", .65, .5, .5, .42), ("#bfc98a", .45, .4, .55, .25)], MOSS, ["#e6a3ae"], 2))
    add("p-lilac", patch("p-lilac", 1200, 1000, [("#ddd0ee", .65, .5, .5, .42), ("#c2b2e0", .4, .6, .4, .26)], LILAC, GOLD, 3, figs=0))
    add("p-sky", patch("p-sky", 1500, 1000, [("#c9c4ea", .55, .5, .5, .44), ("#a7b5e0", .45, .4, .4, .3), ("#f3d9c4", .4, .7, .65, .26)],
                       ["#8fa2d8", "#6f7fc6", "#b5c0ea", "#9d8bc7", "#c9d1f2", "#7a6bb5"], GOLD + ["#f6e7a6"], 4, n=2600,
                       vort=[(450, 380, 230, 2.6), (1050, 330, 200, -2.4), (760, 640, 160, 2.0)], stroke_scale=1.15))
    add("p-peach", patch("p-peach", 1200, 1000, [("#f8d5bd", .65, .5, .5, .42), ("#f2bfae", .45, .4, .6, .26)], PEACH + ROSE[:2], ["#9d8bc7"], 5, figs=0))
    add("p-rose", patch("p-rose", 1200, 1000, [("#f4c4c8", .6, .5, .5, .42), ("#e8a7b5", .45, .6, .4, .26)], ROSE, ["#8e9c58"], 6, figs=0))
    add("p-wine", patch("p-wine", 1200, 1000, [("#8e2f3d", .75, .5, .5, .42), ("#5d1608", .6, .4, .55, .3)], WINE, GOLD, 7, mask_r=.5))
    add("p-night", patch("p-night", 1600, 1000, [("#3a1530", .9, .5, .5, .5), ("#2c2156", .7, .35, .45, .32), ("#5d1608", .7, .7, .6, .3)],
                         NIGHT + WINE[:3], GOLD + ["#f6e7a6"], 8, n=3200, vort=[(500, 420, 260, 2.6), (1150, 520, 230, -2.2)], stroke_scale=1.2, mask_r=.6))
    add("paper", paper_tile(), 70, 1)
    add("shimmer", shimmer_tile(), 70, .6)
    for i in (1, 2, 3):
        add("edge-%d" % i, ragged_mask(i * 7), 80, .5)
    json.dump(jobs, open(os.path.join(outdir, "jobs.json"), "w"))

if __name__ == "__main__":
    build(sys.argv[1]); print("ok")
