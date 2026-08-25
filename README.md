# Alvina Varughese — SEO, Content &amp; Growth Portfolio

A single-page, story-driven personal portfolio. **Editorial** aesthetic —
**beige · warm black · dark olive green** — built around a narrative: *I turn
attention into customers.* SEO- and growth-focused, with a dedicated content
section (including **The Happy Club** brand).

Plain **static site** — no build step, no framework. HTML, CSS, vanilla JS.

## Story / sections

1. **Hero** — thesis + a numbered index (table of contents) so visitors orient instantly (low bounce).
2. **01 Story** — the narrative bio.
3. **02 Capabilities** — SEO, content, growth, social, copy, acquisition.
4. **03 Selected work** — a lead **case study** (Netoyed for Education: Challenge → Approach → Result) plus supporting campaigns (SEO explainer, growth story, LessonX, Canara, ISRO).
5. **04 SEO &amp; Growth** — the method (Get found → Get chosen → Get customers) + metrics. This is the growth/SEO centrepiece.
6. **05 Content** — SEO/editorial writing + **The Happy Club** brand feature.
7. **06 Contact** — email + links.

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
4. **Portrait** — shown in the **01 Story** section as an editorial placeholder
   at `assets/img/portrait.webp`. Drop a real photo in at that same path
   (vertical 4:5 crop is ideal) — no other edits needed.
5. **The Happy Club** — the copy in `.club` is a sensible placeholder; edit it
   to describe the brand accurately. Logo: `assets/img/happyclub.webp`
   (background removed, transparent).
6. **Newer work** — her recent SEO / customer-acquisition results weren't in the
   source files. Add images to `assets/img/` and copy a `.wk` card in the work
   section to feature them.

## Notes

- Fonts: **Bricolage Grotesque** (display/body), **Instrument Serif** (italic
  accents), **Space Mono** (labels/numbers) via Google Fonts.
- Images are WebP (~1.9MB total); the whole site is ~6MB incl. two brand videos.
- SEO: semantic headings, meta description, Open Graph, and a `Person` JSON-LD block.
- Respects `prefers-reduced-motion`. Mobile-first responsive; the hero is static
  (no reveal delay) for a fast first paint and low bounce.
- The earlier business-card image was removed; personal phone/address are not published.
