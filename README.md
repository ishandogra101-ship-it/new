# Alvina Varughese — portfolio

A single-page portfolio for an SEO, content and growth marketer. Editorial,
print-influenced layout: bone paper, warm black, dark olive, and a vermilion
accent **sampled from her own Netoyed campaign artwork** (`#e84838` in the
source creative, deepened to `#d2452a` for the page).

Plain static site. No build step, no framework, no dependencies.

## Structure

| | Section | Field | Pattern |
|---|---|---|---|
| | Masthead | bone | name at full width, metadata rails, cropped image slab |
| | Statement | bone | oversized serif line + duotone image, slight rotation |
| | Contents | bone | numbered index of the six projects |
| 01 | Netoyed for Education | **ink**, full bleed | spec table, film, 12-col mosaic |
| 02 | Google Helpful Content | bone + **vermilion block** | offset split |
| 03 | Growth case story | bone | overlapping collage, three scales |
| 04 | Canara Bank | **olive**, full bleed | images edge to edge |
| 05 | LessonX launch | bone | editorial header, carousel |
| 06 | ISRO | bone | image floats across the section boundary |
| | Method | **ink** | Search / Story / Campaign / Compound |
| | Figures | **vermilion** | oversized numerals |
| | The Happy Club | bone | her own brand |
| | Writing | bone | editorial index, nine pieces |
| | Testimonial | **olive** | typographic quote |
| | About | bone | portrait + statement |
| | Contact | **ink** | full-width closing type |

The colour fields alternate deliberately so the page reads calm → dense → bold
→ colour rather than as a stack of equal sections.

## Type

- **Anton** — display. Everything oversized: name, project titles, figures, the closing statement.
- **Newsreader** — all reading text. Serif body copy is the deliberate choice; it is what keeps the page from reading as a generated template.
- **Archivo** — utility only: labels, metadata, nav, captions.

No monospace. No uppercase letter-spaced pseudo-labels beyond the small
editorial marks. No serif-italic accent words inside headlines.

If Anton fails to load (blocked network, offline), `main.js` measures the face
on a canvas and adds `.no-anton`, which steps the display sizes down via
`--dfit`. Without that guard the headline overflows the page, because the
substitute face is much wider.

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
   150+ schools (from her Netoyed banner) and 9 writing pieces (countable).
   Real campaign metrics go in the commented slot in `index.html`; nothing is
   estimated or invented.
2. **Social links** — the three `data-placeholder` links in `#contact`. Add real
   URLs and delete the `data-placeholder` attribute.
3. **Portrait** — `assets/img/portrait.webp` is a placeholder shown in About.
   Drop a real photo at the same path, vertical 4:5.
4. **The Happy Club** — the copy is a reasonable placeholder; edit it to describe
   the brand accurately.
5. **Newer work** — add images to `assets/img/` and copy one of the `.p2`–`.p6`
   blocks; each is a different composition, so pick the one that suits the piece.

## Notes

- Images are WebP, ~2MB total; the whole site is ~6MB including two brand films.
- `assets/img/treated-students.webp` and `crop-classroom.webp` are derived
  treatments (duotone, tall crop) of her originals, used as compositional elements.
- Verified: 0px horizontal overflow at 360/390/430/768/1024/1280/1512, no JS errors.
- Contrast passes WCAG AA at every text size; the vivid vermilion is reserved for
  large display type, with a darker `--flare-text` for small text.
- Respects `prefers-reduced-motion`. Above-the-fold imagery never waits on a
  scroll reveal.
- Lightbox is keyboard accessible (Enter/Space to open, arrows to move, Esc to
  close) and returns focus on close.
