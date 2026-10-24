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

## Products
(To be filled in when the user sends them.)
