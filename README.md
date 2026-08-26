# Alvina Varughese — portfolio, an editorial object

A single-page portfolio for an SEO, content and growth marketer, built to read
like a printed publication rather than a website: a paper canvas, photographs
taped and labelled, oversized numerals, handwritten annotations, and colour
fields — not a stack of cards.

Plain static site. No build step, no framework, no dependencies.

## The composition language

There is deliberately **no card system**. The reusable units are compositional:

- **taped / labelled photographs** — `.tape`, `.tag`, `.stamp` (CSS only, slight angles)
- **oversized numerals and ghost words** — `.sp__num`, `.ghost` set behind content
- **handwritten marks** — hand-drawn `<svg>` arrow, underline, circle, star and asterisk (`#m-*`), plus `.note` in a handwriting face
- **colour fields** — ink, olive and a vermilion block break the paper up for pacing
- **six project spreads, six different layouts** — feature wall (01), colour-block split (02), overlapping collage (03), edge-to-edge band (04), editorial (05), pinned-with-ghost-word (06). No project repeats another's composition.

The page alternates paper → ink → paper → colour → paper so it reads as a
sequence of spreads, not equal sections.

## Type

- **Anton** — poster display: the name, project titles, numerals, the closing word.
- **Newsreader** — all reading text, and italic emphasis.
- **Archivo** — utility only: labels, metadata, nav.
- **Caveat** — the handwriting: annotations, the signature, small marginal notes. Used sparingly.

If Anton fails to load (blocked network, offline), `main.js` measures it on a
canvas and adds `.no-anton`, scaling the display type down via `--dfit` so the
big headlines never overflow. Caveat degrades to a cursive fallback.

## Colour

The vermilion accent is **sampled from her own Netoyed campaign artwork**
(`#e84838` in the source creative, deepened to `#d2452a`), so the palette comes
from the work. Paper `#efe9dc`, ink `#17150f`, olive `#3d4926`, with a warm
marker-yellow highlight used only under a couple of handwritten words.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — GitHub Pages

Repo → **Settings → Pages** → Deploy from a branch → `claude/lucid-bardeen-sq5opi`,
folder `/ (root)`. Live at `https://ishandogra101-ship-it.github.io/new/`.
`.nojekyll` is included and all paths are relative, so the `/new/` sub-path works.

## Before you go live

1. **Figures** — the band shows only what is verifiable from her own material:
   150+ schools (from her Netoyed banner) and 9 writing pieces (countable). The
   real value is written straight into the HTML, so it never reads "0". Real
   campaign metrics go in the commented slot in `index.html`; nothing is estimated.
2. **Social links** — the three `data-placeholder` links in the footer. Add real
   URLs and delete the `data-placeholder` attribute.
3. **Portrait** — `assets/img/portrait.webp` is a placeholder shown in About
   (taped). Drop a real photo at the same path, vertical 4:5.
4. **The Happy Club** — the copy is a reasonable placeholder; edit it to describe
   the brand accurately.
5. **Newer work** — add images to `assets/img/` and copy one of the six spread
   blocks (`.sp--02` … `.sp--06`); each is a different composition.

## Notes

- Images are WebP, ~2MB total; the whole site is ~6MB including two brand films.
- `treated-students.webp` / `crop-classroom.webp` are derived treatments of her
  originals used as compositional elements.
- Verified: 0px horizontal overflow at 360/390/430/768/834/1024/1280/1512, no JS errors.
- Contrast meets WCAG AA at small text sizes (vivid vermilion reserved for large
  display; darker `--flare-text` for small text).
- Works with JavaScript disabled: the composition is CSS; motion is progressive
  enhancement. Respects `prefers-reduced-motion`.
- Lightbox is keyboard accessible (Enter/Space, arrows, Esc) and returns focus.
