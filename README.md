# Alvina Varughese — Marketing &amp; Growth Portfolio

A single-page, long-scroll personal portfolio. Maximalist **cottagecore + film-grain grunge**
aesthetic in dusty pink — layered scrapbook collage, botanical illustrations, falling petals,
custom cursor, count-up stats, drag carousels, and a full-screen lightbox.

It is a **plain static site** — no build step, no framework. Just HTML, CSS, and vanilla JS.

## Preview locally

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

(Open `index.html` directly works too, but a tiny server avoids browser file:// quirks.)

## Deploy (pick one — all free)

| Host | How |
|------|-----|
| **Netlify** | Drag this folder onto app.netlify.com, or connect the repo. `netlify.toml` is already set. |
| **Vercel** | Import the repo — it serves static files as-is. |
| **GitHub Pages** | Repo → Settings → Pages → deploy from branch, root `/`. |
| **Cloudflare Pages** | Connect repo, framework = "None", output dir = `/`. |

Point a custom domain (e.g. `alvinavarughese.com`) at whichever host you choose.

## File map

```
index.html            all content + copy
assets/css/style.css  the full design system
assets/js/main.js     all interactions
assets/img/*.webp     work samples (compressed from the originals ~23MB → ~1.9MB)
assets/video/*.mp4     brand reels + poster frames
favicon.svg           flower favicon
```

## Before you go live — things to swap (search these in the files)

1. **Stats** (`index.html`, the `.stats` section). Currently honest-but-generic
   (150+ schools, 3 brands, 9 niches, 20+ creatives). Replace with Alvina's real
   campaign numbers — impressions driven, engagement lift, pipeline growth, etc.
   Edit the `data-count` and `data-suffix` attributes and the `.stat__label` text.
2. **Social links** (`.contact__socials` — the three `data-placeholder` `<a>` tags).
   Drop in real LinkedIn / Instagram URLs and a résumé PDF link, then delete
   `data-placeholder` from each.
3. **Contact email** — currently `alvinavarughese@netoyed.com` (from her card).
   Change the `mailto:` in `#contact` if she'd prefer a personal address.
4. **Real portrait** — the hero and About both show a designed **portrait
   placeholder** at `assets/img/portrait.webp` (an arched "her portrait blooms
   here" graphic). Drop a real photo in at that **same path/filename** and both
   spots fill automatically — no other edits needed. Ideal photo is a vertical
   4:5 crop. Her calling card (`assets/img/alvina-card.webp`) stays as a small
   pinned scrapbook accent.
5. **Newer work** — her recent campaign-results / customer-acquisition / SEO pieces
   weren't in the source files. Add images to `assets/img/` and copy a work card
   block in `index.html` to feature them.

## Notes

- Images were re-encoded to WebP (supported by all current browsers).
  Originals live in the design handoff, not in this repo.
- Respects `prefers-reduced-motion` — petals, cursor, shimmer, and parallax
  switch off for visitors who ask for reduced motion.
- Personal phone number and home address from the business card were intentionally
  **not** published on the site.
