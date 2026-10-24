# Golden Base — 3D promotional website

Animated, trilingual website for **Golden Base**, Erbil — **English (default)**, Kurdish Sorani (RTL) and Arabic (RTL).
Built with **Vite + vanilla JavaScript**, **Three.js**, **GSAP + ScrollTrigger** and **Lenis**.

- **Hero** – pinned section; each featured bottle rotates in on scroll, floats, and a studio light sweeps across its label. Golden "liquid silk" shader background.
- **Brands & products** – 16 brands, product store with search, brand and type filters, WhatsApp order buttons.
- **Oil Change Experience** – full-screen 3D car: disassemble → choose oil → reassemble → pour → engine start (lights, vibration, exhaust smoke, synthesized engine sound with mute).
- **About** – stats + scroll-driven golden timeline (2001 → 2026). **Contact** – phone, WhatsApp, Erbil location.

---

## 1. Install

You need **Node.js 20+** (https://nodejs.org).

```bash
npm install
```

## 2. Run (development)

```bash
npm run dev
```

Open the address it prints (default http://localhost:5173).
Add `#experience` to the URL to open the Oil Change Experience directly.

## 3. Build for production

```bash
npm run build
```

The finished site is in `dist/`. Upload the **contents** of `dist/` to any static host
(GitHub Pages, Netlify, cPanel, …). Paths are relative, so it also works from a sub-folder.
To test the production build locally:

```bash
npm run preview
```

---

## Where things are

```
public/
  products/<brand>/…        product photos (used in cards and the picker)
  models/bottles/<id>.glb   optional 3D bottle models (see below)
  models/car.glb            optional 3D car (see below)
  hdr/studio.hdr            optional studio HDR environment
src/
  data/products.js          ALL products + brands (name, grade, API, size, colors, image, model, featured)
  data/carParts.js          mesh-name → car-part mapping for the experience
  i18n/translations.js      ALL interface text (Kurdish + English) and contact details
  three/                    renderer/env setup, procedural bottles, hero scene
  experience/               car, explode logic, oil pour, smoke, engine sound
  ui/catalog.js             brands + product grid
  styles/main.css           styles
```

### Editing text
Every label of the site is in `src/i18n/translations.js` (`en`, `ku`, `ar`). The phone number /
WhatsApp number / Google Maps link are at the bottom of the same file (`contact`), next to the
`languages` list (its first entry is the default language).
Brand and product descriptions are in `src/data/products.js`.

### Editing products
Each line in `src/data/products.js` is one product:

```js
p('max-x', '20w50-euro-5l.webp', 'Euro', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#F29A1E', '#1F8A3C', { featured: true })
//  brand   photo file             name    grade     API     size   kind      shape  bottle color label color
```

- `kind`: `engine`, `light` (0W/5W petrol), `synthetic`, `diesel`, `gear`, `atf` — picks the default description, filter and oil color.
- `shape`: `bottle` (1 L), `jug` (4–5 L), `drum` (25 L) — used by the procedural 3D bottle.
- `featured: true` → the bottle appears in the scroll-rotating hero (order = order in the file).
- `hidden: true` → kept in the file but not shown on the site.
- The photo goes in `public/products/<brand>/`.

---

## 3D models (.glb)

### Bottles
Put a model at `public/models/bottles/<product id>.glb`, where the id is `<brand>-<photo file name without extension>`,
e.g. `public/models/bottles/max-x-20w50-euro-5l.glb`.
If the file is missing, a **procedural bottle** is generated automatically with the right shape
(1 L bottle, jug with handle, or drum), the product colors and a printed label — so the site always works.
Models are scaled automatically; Draco-compressed GLBs are supported.

### Car
Put a generic, **unbranded** luxury sedan at `public/models/car.glb`, with its parts as separate meshes
(hood, doors, wheels, bumpers, engine, lights…). If it is missing, a procedural sedan is used.
The model is rotated/scaled automatically — set `forward` and `targetLength` in `src/data/carParts.js` if needed.

### Filling the parts mapping
1. Put `car.glb` in `public/models/`, run `npm run dev`, open the experience.
2. Open the browser DevTools → **Console**. You will see `[car] mesh names (…)` with every mesh name.
3. In `src/data/carParts.js`, add those names (or a part of them, matching is case-insensitive and
   "contains") to the `keywords` of the right group: `hood`, `trunk`, `doors`, `wheels`, `bumpers`,
   `engine`, `lightsFront`, `lightsRear`, `glass`, `mirrors`, `grille`, `body`.
   Naming a **parent node** is enough — everything under it moves together.
4. `explode` sets how far each group flies out (`0` = stays in place, used for the body).
5. `oilCapKeywords` / `exhaustKeywords` mark where the oil is poured and where the smoke comes out.
   Meshes that match nothing still explode, away from the car's center.

Headlight / taillight meshes get glowing (emissive) materials when the engine starts, plus real spotlights.

### Studio HDR (optional)
Place an equirectangular `.hdr` at `public/hdr/studio.hdr` for reflections and lighting
(e.g. a free studio HDRI from polyhaven.com). Without it, a built-in procedural studio environment is used.
Note: three.js renamed `RGBELoader` to `HDRLoader`; the project uses `HDRLoader`.

---

## Performance notes
- Pixel ratio is capped (2 on desktop, 1.5 on phones); the hero stops rendering when it is off-screen.
- The Oil Change Experience (car, effects, audio) is a separate chunk, loaded only when it is opened.
- Product photos are lazy-loaded.
