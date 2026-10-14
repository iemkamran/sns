# SnS Biomedicals · Meditech — product website

Static site (plain HTML/CSS/JS, no build step). Three.js is loaded from the jsDelivr CDN.

## Preview locally
```bash
cd docs && python3 -m http.server 8000   # open http://localhost:8000
```
(Opening index.html directly via file:// won't work — ES modules need a server.)

## Host on GitHub Pages
1. Push this repo to GitHub (the site lives in `/docs`).
2. Repo → Settings → Pages → Source: "Deploy from a branch" → Branch `main`, folder `/docs` → Save.
3. Site appears at `https://<user>.github.io/<repo>/` in ~1 minute.

## Editing
- Product copy, specs, contact details, gallery captions: `js/data.js`
- Colours & fonts (sampled from the PDF brochures): top of `css/style.css`
- Deep-link to an open product: `index.html#product-hy300` (`hy500`, `chemsmart-blue`, `chemsmart-white`)
- Gallery images: `assets/gallery/gNN.jpg` (full) + `assets/thumbs/gNN.jpg` (thumbnail); add an entry in `GALLERY`.
