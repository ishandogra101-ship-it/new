# Alvina Varughese — portfolio (the fig tree)

A single-page, static portfolio. No build step is needed to host it: `index.html`,
`assets/` and `favicon.svg` are the whole site.

The story: a marketer who couldn't choose one fig, did all of it in her first job,
and is now choosing where to go deep. The fig tree (from Sylvia Plath's *The Bell
Jar*) runs through the page: a branch in the hero whose figs are the branches she took,
and a skills tree with one fig per skill.

**The canvas.** The background is one live painting (`assets/js/water.js`, WebGL):
soft watercolour washes under Van Gogh-style brush strokes that drift slowly along
swirling currents, all the time, at a mellow pace. One palette (warm paper with rose,
sage and lavender families, set at the top of the shader) wanders across the whole page
on its own, so there are no section edges. The paint scrolls with the content and
calms down behind anything marked `data-calm`, which keeps the text readable. Without
WebGL (or JavaScript) the page shows a soft painted gradient instead.

**Type.** Bricolage Grotesque for everything, with Kalam (handwriting) for small notes
and labels. Both are self-hosted in `assets/fonts/`.

**Interaction.** Figs swing when the pointer passes (click one), a few letters bounce,
doodles draw themselves, numbers count up, and work samples tilt and float. All motion
stops for `prefers-reduced-motion`.

## Sections
Hero · What I've delivered · The fig tree (story) · What I can deliver · Skills tree ·
Tools · Experience · Four case studies · Selected creative + writing · Background
(education, languages) · Contact.

## Placeholders
Anything missing from the brief is a **bright yellow highlight** on the page
(`<mark class="todo">`). Search `class="todo"` to find them all. Still to fill:
tools, dates for two roles, case-study details and the events result, the second
inbound deal's value, the platform behind the follower growth, your email and
LinkedIn, a portrait, a line about The Happy Club, and links to the writing samples.

## Editing
- Copy: `tools/index.template.html`, then run `python3 tools/build_page.py` to rebuild
  `index.html` (it generates the skills tree, the hero branch and the hand-drawn doodles).
- Hero figs and their labels: `VINE_FIGS` in `tools/build_page.py`.
- Skills, their order, colour group and one-line descriptors: the `SKILLS` list in `tools/tree.py`.
- The torn paper edges on the work samples are `assets/paint/edge-*.webp` (made by
  `tools/paint.py`).
- Illustrations are drawn in code (`tools/art.py`, `tools/compose.py`) and rendered to
  WebP with `tools/render.js` (needs Node + playwright-core + sharp). The finished
  files are already in `assets/art/`, so you only need these to change the art.
- Colours and type: the variables at the top of `assets/css/style.css`.

## Privacy and anonymising
Per the brief, only Netoyed and Netoyed for Education are named. Client work (banks,
agencies, schools) and the testimonial screenshot were removed, and so were images
that show other organisations' logos. No personal phone number or employer email is
published. Add a personal email in the contact section.

## Hosting
GitHub Pages: Settings, Pages, deploy from the branch root. Paths are relative, so
the `/new/` sub-path works. `.nojekyll` is included.

## Notes
- Works without JavaScript (flat section colours, everything readable). The painted
  canvas renders below screen resolution and drops quality further on slow devices.
