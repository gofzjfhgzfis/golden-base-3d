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

Brand on the bottles: **AGDILCO**. Product photos (white background, front view) are in `assets/products/`.

Brand description (from the user):
> AGDILCO Lubricants are high-performance synthetic blend motor oils and transmission fluids formulated to provide excellent oxidation stability, superior wear protection, and smooth engine performance. Designed for both gasoline and diesel engines, AGDILCO ensures reliable lubrication under demanding driving conditions while extending engine life and maintaining efficiency.

Specs given: Product range 10W40 / SAE 40 / ATF Type III (H) · Oil type: Synthetic Blend Motor Oil · API: SL/CF · Net contents: 1 Quart (946 mL)

| # | Product | Grade | API | Size | Bottle color | Image |
|---|---------|-------|-----|------|--------------|-------|
| 1 | Multi Type Engine Lube (Gasoline & Diesel) | 10W-40 | SL/CF | 1 qt (946 mL) | Gold / orange, gold label, black cap | `engine-lube-10w40-gold.webp` |
| 2 | Multi Type Engine Lube (Gasoline & Diesel) | SAE 40 | SL/CF | 1 qt (946 mL) | Blue, blue label, black cap | `engine-lube-sae40-blue.webp` |
| 3 | Automatic Transmission Fluid | Type III (H) | — | 1 qt (946 mL) | Red, blue label, black cap | `atf-type3-red.webp` |
| 4 | Automatic Transmission Fluid | Type III (H) | — | 1 qt (946 mL) | Black, blue label, black cap | `atf-type3-black.webp` |
| 5 | Synthetic Blend Motor Oil (jug) | label seal looks like 5W-30 — CONFIRM | SN | jug, size not stated — CONFIRM | Red jug, red/black label | `synthetic-blend-jug-red-black.webp` |
| 6 | Synthetic Blend Motor Oil (jug) | label seal looks like 5W-30 — CONFIRM | SL/CF | jug, size not stated — CONFIRM | Red jug, yellow/black label | `synthetic-blend-jug-red-yellow.webp` |

Open questions for the user:
- Brand naming: site is for "Golden Base" / MAX-X, bottles say AGDILCO. Is Golden Base the distributor of AGDILCO? How should both names appear?
- Jug products (5, 6): exact viscosity and size (e.g. 4 L / 5 qt)?
- Jug labels mention real car brands in small print; the brief forbids real car brand names on the site. Use the photos only small/blurred, or rely on the 3D bottles instead.
- Kurdish names/descriptions for each product, plus phone, WhatsApp, and Erbil address.
- 3D .glb bottle models: none yet → procedural bottles shaped after these photos (quart bottle with grip ridges; jug with handle) will be used.
