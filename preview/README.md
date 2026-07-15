Open these preview HTML files in a browser for a quick, static visual of the theme colors.

Files:
- `light-preview.html` — Crimson Red Light, showing the **regular** and **italic** variants side by side
- `dark-preview.html` — Crimson Red Dark, showing the **regular** and **italic** variants side by side

Each preview includes JavaScript, XML and JSON samples so you can see:
- Red keywords/tags, teal functions & JSON keys, amber types/attributes, olive strings
- The distinct XML (red tags vs. amber attributes) and JSON (teal keys vs. olive values) coloring
- The current-line highlight, active line number, and yellow/gold selection

Notes:
- These previews are **static approximations**. VS Code's real tokenization comes from language grammars and may differ slightly.
- Colors are kept in sync by hand with the `LIGHT`/`DARK` palettes in [../build-themes.js](../build-themes.js) — update the theme source there, then mirror any palette change here.
