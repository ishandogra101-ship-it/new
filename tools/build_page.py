"""Rebuilds ../index.html from index.template.html + the generated skills tree.
Usage (from this folder): python3 build_page.py
Edit skills in tree.py (SKILLS list); edit copy in index.template.html."""
import os
import tree
here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, "index.template.html"), encoding="utf-8").read()
out = tpl.replace("{{TREE}}", tree.build())
open(os.path.join(here, "..", "index.html"), "w", encoding="utf-8").write(out)
print("index.html written,", len(out) // 1024, "KB")
