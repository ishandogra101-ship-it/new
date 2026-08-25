# Alvina Varughese — SEO, Content &amp; Growth Portfolio

A single-page portfolio for an SEO, content and growth marketer. Print-influenced
editorial layout in beige, warm black and dark olive, led by the work itself.
Includes **The Happy Club**, a brand Alvina designed and runs.

Plain **static site** — no build step, no framework. HTML, CSS, vanilla JS.

## Sections

1. **Opening** — her name at full width, a plain intro in serif, and work images immediately.
2. **Selected work** — a full-bleed dark case study (Netoyed: spec table, prose, big video, mosaic gallery), then projects in alternating asymmetric layouts (SEO explainer, growth story, Canara, LessonX, ISRO).
3. **How I work** — prose plus a plain service list and three figures.
4. **Writing** — The Happy Club brand feature and an editorial index of her writing.
5. **About** — portrait and short bio.
6. **Contact** — email and links.

## Type and colour

- **Archivo** (variable width, set wide and heavy) for display and UI.
- **Newsreader** for all reading text. Serif body copy is deliberate: it is what keeps
  the page from looking like a generated template.
- Beige `#e6e0d1`, warm black `#14130e`, dark olive `#3f4a29`.
- No monospace, no uppercase letter-spaced labels, no numbered section chips. Those are
  the details that made earlier drafts read as AI-generated.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — GitHub Pages (already set up on this branch)

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch** → branch `claude/lucid-bardeen-sq5opi`, folder `/ (root)` → **Save**
3. Live at `https://ishandogra101-ship-it.github.io/new/` in ~1–2 min.

(`.nojekyll` is included; all asset paths are relative so it works under the `/new/` sub-path.) Also works drag-and-dropped onto Netlify, or via Vercel / Cloudflare Pages.

## Before you go live — things to swap (search the files)

1. **Metrics** — the SEO &amp; Growth section shows honest-but-generic figures
   (150+ schools, 3 brands, 9 niches, Full funnel). Replace with real numbers —
   impressions, engagement lift, pipeline growth — via the `data-count` /
   `data-suffix` attributes and the `.metric__l` labels.
2. **Social links** — the three `data-placeholder` links in `#contact`
   (LinkedIn / Instagram / Résumé). Add real URLs and delete `data-placeholder`.
3. **Contact email** — currently `alvinavarughese@netoyed.com`.
4. **Portrait** — shown in the **About** section as an editorial placeholder
   at `assets/img/portrait.webp`. Drop a real photo in at that same path
   (vertical 4:5 crop is ideal) — no other edits needed.
5. **The Happy Club** — the copy in `.club` is a sensible placeholder; edit it
   to describe the brand accurately. Logo: `assets/img/happyclub.webp`
   (background removed, transparent).
6. **Newer work** — her recent SEO / customer-acquisition results weren't in the
   source files. Add images to `assets/img/` and copy one of the `.proj` blocks in the
   work section to feature them.

## Notes

- Images are WebP (~1.9MB total); the whole site is ~6MB incl. two brand videos.
- SEO: semantic headings, meta description, Open Graph, and a `Person` JSON-LD block.
- Respects `prefers-reduced-motion`. Mobile-first responsive; the hero is static
  (no reveal delay) for a fast first paint and low bounce.
- The earlier business-card image was removed; personal phone/address are not published.
