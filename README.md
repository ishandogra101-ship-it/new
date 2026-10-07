# Alvina Varughese — portfolio (the fig tree)

A single-page, static portfolio. No build step is needed to host it: `index.html`,
`assets/` and `favicon.svg` are the whole site.

The story: a marketer who couldn't choose one fig, did all of it in her first job,
and is now choosing where to go deep. The fig tree (from Sylvia Plath's *The Bell
Jar*) runs through the layout: the hero branch, a skills section drawn as a tree with
one fig per skill, case-study covers that are fig illustrations, and a closing line
about what the reader is growing.

## Sections
Hero · What I've delivered · The fig tree (story) · What I can deliver · Skills tree ·
Tools · Experience · Four case studies · Selected creative + writing · Background
(education, languages) · Contact.

## Placeholders
Anything missing from the brief is a **yellow dashed highlight** on the page
(`<mark class="todo">`). Search `class="todo"` to find them all. Still to fill:
tools, dates for two roles, case-study details and the events result, the second
inbound deal's value, the platform behind the follower growth, your email and
LinkedIn, a portrait, a line about The Happy Club, and links to the writing samples.

## Editing
- Copy: `tools/index.template.html`, then run `python3 tools/build_page.py` to rebuild
  `index.html` (the skills tree is generated into it).
- Skills, their order, colour group and one-line descriptors: the `SKILLS` list in `tools/tree.py`.
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
- Fonts (Newsreader, Figtree) are self-hosted in `assets/fonts/`, so the page does not
  depend on a third-party font service.
- Works without JavaScript; motion is limited to a slow sway on the branch and figs,
  and is switched off for `prefers-reduced-motion`.
