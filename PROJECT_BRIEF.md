# Golden Base / MAX-X — Project Brief (saved, NOT started)

Status: WAITING. The user will send product details first. Do not start building until the user says to start.
User note: they want the result to be something truly special / unique.

---

Build an animated, high-end promotional website for "Golden Base" / MAX-X, a motor oil and lubricant company based in Erbil, Iraq.

## Tech stack
- Vite + vanilla JavaScript (or React if cleaner), Three.js for 3D, GSAP + ScrollTrigger for scroll animations, Lenis for smooth scrolling.
- Use GLTFLoader + DRACOLoader for models, RGBELoader for an HDR studio environment.
- Fully responsive, must run smoothly on mid-range Android phones (cap pixel ratio at 2, lazy-load models, show a loading screen with progress).

## Language & design
- Primary language: Kurdish Sorani (RTL, dir="rtl"), with an English toggle.
- Use a font that supports Kurdish Sorani well (e.g. "Noto Sans Arabic" or "Vazirmatn" from Google Fonts).
- Brand style: dark, premium look (near-black background) with gold accents (#C9A34A) to match "Golden Base".
- Put all text in a single translations file so it is easy to edit.

## Section 1 — Hero + scroll-rotating oil bottles
- Show the oil bottles in 3D. While the user scrolls, each bottle rotates smoothly on its Y-axis (rotation tied to scroll progress via ScrollTrigger scrub), with slight floating and a studio light reflection moving across the label.
- Each product gets a pinned section: bottle rotates in, product name, viscosity (e.g. 5W-30), short description, then the next bottle replaces it.
- Load bottle models from /public/models/bottles/*.glb. If a file is missing, fall back to a procedural placeholder bottle (cylinder body + cap) so the site still works.
- Product data (name, viscosity, description, color, model path) must come from one config file: src/data/products.js.

## Section 2 — Interactive "Oil Change Experience" (from the main menu)
Menu item "ئەزموونی گۆڕینی ڕۆن" opens a full-screen 3D scene with a realistic luxury sedan.
- Car model: /public/models/car.glb (generic, unbranded luxury sedan with separated parts). Do NOT use any real car brand names or logos anywhere.
- Realistic rendering: HDR environment, PBR materials, metallic clearcoat paint, chrome, glass with transmission, soft contact shadows, ACES filmic tone mapping.
- OrbitControls with limits.

Sequence:
1. Disassemble: button "هەڵوەشاندنەوە" — car explodes into parts (hood, doors, wheels, bumpers, engine, etc.), each moving outward from the car's center, staggered GSAP timing, slight rotation, then hovers.
2. Choose oil: product picker (cards from products.js). User selects one bottle.
3. Reassemble: all parts fly back to exact original positions/rotations (stored on load).
4. Pour: hood opens, selected bottle flies in above the engine, tilts, pours — oil stream (particles or animated tube mesh) in the product's color, slight golden glow.
5. Engine start: hood closes, headlights + taillights on (emissive + spotlights), subtle body vibration, exhaust particles, engine start sound (Web Audio, mute button). Final message: "مەکینەکەت بە [product name] پارێزراوە".
- "Replay" and "Choose another oil" buttons.
- Parts mapping config src/data/carParts.js maps mesh names to part groups. Log all mesh names on load. Unmapped meshes explode via generic center-direction logic.

## Other sections
- About the company, product grid, contact (phone, WhatsApp, location in Erbil), footer.

## Code quality
- Clean folder structure, comments in English, no unused dependencies.
- README: install, run, where to put .glb files, how to fill the parts mapping, production build.
- Run the build and fix any errors before finishing.

---

## Products (received 2026-10-24)

Three product brands so far, each with its own photo folder (white background, front view):
- **AGDILCO** → `assets/products/agdilco/`
- **Dallas UK** → `assets/products/dallas/`
- **Rouge** → `assets/products/rouge/`

### Brand 1 — AGDILCO

Brand description (from the user):
> AGDILCO Lubricants are high-performance synthetic blend motor oils and transmission fluids formulated to provide excellent oxidation stability, superior wear protection, and smooth engine performance. Designed for both gasoline and diesel engines, AGDILCO ensures reliable lubrication under demanding driving conditions while extending engine life and maintaining efficiency.

Specs given: Product range 10W40 / SAE 40 / ATF Type III (H) · Oil type: Synthetic Blend Motor Oil · API: SL/CF · Net contents: 1 Quart (946 mL)

| # | Product | Grade | API | Size | Bottle color | Image |
|---|---------|-------|-----|------|--------------|-------|
| 1 | Multi Type Engine Lube (Gasoline & Diesel) | 10W-40 | SL/CF | 1 qt (946 mL) | Gold / orange, gold label, black cap | `agdilco/engine-lube-10w40-gold.webp` |
| 2 | Multi Type Engine Lube (Gasoline & Diesel) | SAE 40 | SL/CF | 1 qt (946 mL) | Blue, blue label, black cap | `agdilco/engine-lube-sae40-blue.webp` |
| 3 | Automatic Transmission Fluid | Type III (H) | — | 1 qt (946 mL) | Red, blue label, black cap | `agdilco/atf-type3-red.webp` |
| 4 | Automatic Transmission Fluid | Type III (H) | — | 1 qt (946 mL) | Black, blue label, black cap | `agdilco/atf-type3-black.webp` |
| 5 | Synthetic Blend Motor Oil (jug) | label seal looks like 5W-30 — CONFIRM | SN | jug, size not stated — CONFIRM | Red jug, red/black label | `agdilco/synthetic-blend-jug-red-black.webp` |
| 6 | Synthetic Blend Motor Oil (jug) | label seal looks like 5W-30 — CONFIRM | SL/CF | jug, size not stated — CONFIRM | Red jug, yellow/black label | `agdilco/synthetic-blend-jug-red-yellow.webp` |

### Brand 2 — Dallas UK

Brand description (from the user):
> Dallas UK Lubricants are advanced multi-type engine and transmission oils engineered for superior engine protection, smooth performance, and long-lasting reliability. Formulated with British technology and premium additives, Dallas UK delivers enhanced wear protection, cleaner engines, and excellent thermal stability for gasoline, diesel, and automatic transmission systems.

Specs given: Product range 10W30 / 10W40 / 15W40 / 20W50 / ATF III · API: SN/CF / ATF III · Technology: British Technology Formula · Sizes: 1L / 4L
Label tagline: "We Created For You". Labels say "ADVANCED", "multi type engine oil".

| # | Product | Grade | API | Size | Container | Bottle color / label | Image |
|---|---------|-------|-----|------|-----------|----------------------|-------|
| 7 | Multi Type Engine Oil | 10W-30 | SN/CF | 4 L | jug | Blue, black/magenta label | `dallas/10w30-4l-blue.webp` |
| 8 | Multi Type Engine Oil | 10W-40 | SN/CF | 1 L | bottle | Gold/orange, black/blue label | `dallas/10w40-1l-gold.webp` |
| 9 | Multi Type Engine Oil | 15W-40 | SN/CF | 4 L | jug | Silver, black/red label | `dallas/15w40-4l-silver.webp` |
| 10 | Multi Type Engine Oil | 20W-50 | SN/CF | 4 L | jug | Red, black/yellow label | `dallas/20w50-4l-red.webp` |
| 11 | Multi Type Engine Oil | 20W-50 | SN/CF | 1 L | bottle | Blue, black/yellow label | `dallas/20w50-1l-blue.webp` |
| 12 | Transmission Fluid | ATF III | — | 1 L | bottle | Red, black/red label | `dallas/atf3-1l-red.webp` |

Note: the ATF III label small print lists OEM/spec approvals (e.g. MERCON, MAN, ZF, Voith, Allison). Keep these out of site text; photos only shown small.

### Brand 3 — Rouge Lubricants

Brand description (from the user):
> Rouge Lubricants are engineered for both gasoline and diesel engines, combining German additive technology with durable multi-grade formulations. Designed for long-lasting engine protection, Rouge delivers stable lubrication, improved wear resistance, and dependable performance under both daily and heavy-duty operating conditions.

Specs given: Viscosity 10W-30 / 15W-40 / 20W-50 / SAE 50 / SAE 90 · API: SL/CF-4 / CF-4 / CH-4 / GL-1 · Compatibility: Gasoline, Diesel & Gear Systems · Technology: German Additive Technology · Packaging: 1 L / 5 L
Label slogans: "One oil multi solutions", "You can race not just drive", "With the best Germany additive". Distinctive asymmetric "S-curve" bottle shape with side handle (both 1 L and 5 L).

| # | Product | Grade | API | Size | Container | Bottle color / label | Image |
|---|---------|-------|-----|------|-----------|----------------------|-------|
| 13 | Engine Oil | 10W-30 | SL/CF-4 | 5 L | jug | Silver, grey/white label | `rouge/10w30-5l-silver-grey.webp` |
| 14 | Engine Oil | SAE 50 | CF-4 | 5 L | jug | Silver, blue/purple label | `rouge/sae50-5l-silver-purple.webp` |
| 15 | Diesel Engine Oil | SAE 50 | CF-4 | 5 L | jug | Silver, blue label (truck artwork) | `rouge/sae50-diesel-5l-silver-blue.webp` |
| 16 | Gear Oil | SAE 90 | GL-1 | 1 L | bottle | Lime green, green/white label | `rouge/sae90-gl1-1l-green.webp` |
| 17 | Engine Oil | 20W-50 | SL/CH-4 | 1 L | bottle | Blue, black/red label | `rouge/20w50-1l-blue.webp` |
| 18 | Engine Oil | 15W-40 | SL/CF-4 | 1 L | bottle | Orange, yellow/white label | `rouge/15w40-1l-orange.webp` |

Note: Rouge labels carry third-party marks (an "Auto Bild" magazine badge, a "deLuxe" badge) and the diesel label shows a truck. Keep these out of site text; photos only shown small.

Open questions for the user:
- More brands coming? (User is sending products brand by brand.)
- Brand naming: site is for "Golden Base" / MAX-X, bottles say AGDILCO and Dallas UK. Is Golden Base the distributor of these brands? Is MAX-X a third brand (products not sent yet)? How should the names appear?
- Jug products (5, 6): exact viscosity and size (e.g. 4 L / 5 qt)?
- Jug labels mention real car brands in small print; the brief forbids real car brand names on the site. Use the photos only small/blurred, or rely on the 3D bottles instead.
- Kurdish names/descriptions for each product, plus phone, WhatsApp, and Erbil address.
- 3D .glb bottle models: none yet → procedural bottles shaped after these photos (quart bottle with grip ridges; jug with handle) will be used.
