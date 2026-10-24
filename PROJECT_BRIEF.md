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

Twelve product brands so far, each with its own photo folder (white background, front view). **MAX-X** is named in the site brief ("Golden Base / MAX-X"), so it is likely the flagship brand — confirm with the user.
- **AGDILCO** → `assets/products/agdilco/`
- **Dallas UK** → `assets/products/dallas/`
- **Rouge** → `assets/products/rouge/`
- **F-HORSE** → `assets/products/f-horse/`
- **AROL Automotive** → `assets/products/arol/`
- **RK STAR Automotive** → `assets/products/rk-star/`
- **LONA Lubricants** → `assets/products/lona/`
- **Sea Ghost Lubricants** → `assets/products/sea-ghost/`
- **MAX-X Lubricants** → `assets/products/max-x/`
- **Deluxe Lubricants** → `assets/products/deluxe/`
- **FAST Lube** → `assets/products/fast-lube/`
- **Michel Lubricant** → `assets/products/michel/`

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

Note: Rouge labels carry an "Auto Bild" magazine badge (third-party) and a "deLuxe" badge (Deluxe is one of our own brands, see Brand 10 — fine to show) and the diesel label shows a truck. Keep these out of site text; photos only shown small.

### Brand 4 — F-HORSE Lubricants

Brand description (from the user):
> F-HORSE Lubricants are specially engineered for Middle East conditions, delivering strong engine protection, high thermal stability, and reliable lubrication for gasoline, diesel, and transmission systems. Developed with advanced additive technology, F-HORSE ensures cleaner engines, smoother operation, and extended engine life under extreme heat and demanding driving conditions.

Specs given: Product range 10W40 / 20W50 / SAE-40 / ATF III · API: SL/CF / CF-4 / DEXRON III · Technology: Premium Multi-Grade Formula · Sizes: 1L / 4L / 5L
Label: "PREMIUM", slogan "New Technology Same Power", "Specially made for Middle East". Racing look: speedometer dial + checkered flag on black label. Jugs have a dotted-texture neck; bottles are squared with an integrated handle notch.

| # | Product | Grade | API | Size | Container | Bottle color / label | Image |
|---|---------|-------|-----|------|-----------|----------------------|-------|
| 19 | Premium Engine Oil | 10W-40 | SL/CF | 4 L | jug | Silver, black racing label | `f-horse/10w40-4l-silver.webp` |
| 20 | Premium Engine Oil | 20W-50 | SL/CF | 5 L | jug | Orange, black racing label | `f-horse/20w50-5l-orange.webp` |
| 21 | Premium Engine Oil | 20W-50 | SL/CF | 1 L | bottle | Orange, black racing label | `f-horse/20w50-1l-orange.webp` |
| 22 | Premium Engine Oil | SAE 40 | CF-4 | 1 L | bottle | Silver, black racing label | `f-horse/sae40-1l-silver.webp` |
| 23 | Premium ATF III | Dexron III | — | 1 L | bottle | Red, black racing label | `f-horse/atf3-1l-red.webp` |

Note: "DEXRON" is a third-party (car maker) trademark. On the site, write the spec as "ATF III (Dexron III spec)" at most, or just "ATF III" — confirm with the user.

### Brand 5 — AROL Automotive

Brand description (from the user):
> AROL Automotive lubricants are engineered to deliver reliable protection and performance for both gasoline and diesel engines. With advanced additive technology and multigrade formulations, AROL ensures smoother engine operation, enhanced wear protection, and long-lasting durability under varying driving conditions.

Specs given: Product range 10W-30 / 15W-40 / 20W-50 / SAE-50 · API: SL/CF / SN/CF / CH-4 · Oil type: Multigrade Universal Motor Oil · Sizes: 4L / 5L
Label: product line "SUPERTECH", "Multigrade Universal Motor Oil", car + bus icons. Orange/yellow swoosh over black label; all products are jugs with a rounded handle and ribbed side neck.

| # | Product | Grade | API | Size | Container | Jug color / cap | Image |
|---|---------|-------|-----|------|-----------|-----------------|-------|
| 24 | Supertech | 10W-30 | SN/CF | 5 L | jug | Gold/orange, black cap | `arol/10w30-5l-gold.webp` |
| 25 | Supertech | 15W-40 | SL/CF | 4 L | jug | Silver, yellow cap | `arol/15w40-4l-silver.webp` |
| 26 | Supertech | 20W-50 | SL/CF | 5 L | jug | Silver, yellow cap | `arol/20w50-5l-silver.webp` |
| 27 | Supertech | SAE 50 | CH-4 | 5 L | jug | Blue, black cap | `arol/sae50-5l-blue.webp` |

### Brand 6 — RK STAR Automotive

Brand description (from the user):
> RK STAR Automotive Racing Oil is formulated for high-performance gasoline and diesel engines, delivering strong lubrication, engine cleanliness, and reliable wear protection. Designed for daily driving and heavy-duty usage, it ensures stable viscosity and efficient engine performance for up to 5000 KM service intervals.

Specs given: Product range 10W-30 / 20W-50 · API: SL/CF · Oil type: Racing Motor Engine Oil · Service interval: up to 5000 KM · Size: 5 Liter
Label: "RACING OIL", "Motor Engine Oil", "5000 KM — keep your engine clean", "Manufactured with highest additives". Logo: oil drop with gold "RK" monogram. Label style: brushed-metal plate with rivets, blue checkered flag. Jug: tall with angular handle and ribbed side grip.

| # | Product | Grade | API | Size | Container | Jug color | Image |
|---|---------|-------|-----|------|-----------|-----------|-------|
| 28 | Racing Oil | 10W-30 | SL/CF | 5 L | jug | Gold/orange | `rk-star/10w30-5l-gold.webp` |
| 29 | Racing Oil | 20W-50 | SL/CF | 5 L | jug | Silver | `rk-star/20w50-5l-silver.webp` |

Note: labels carry a "deluxe" badge — Deluxe is one of our own brands (Brand 10), so it is fine.

### Brand 7 — LONA Lubricants

Brand description (from the user):
> LONA Lubricants are engineered with modern additive technology to provide reliable engine protection, thermal stability, and long-lasting lubrication. Designed for petrol, diesel, and heavy-duty applications, LONA delivers consistent performance, improved engine cleanliness, and enhanced durability under demanding conditions.

Specs given: Viscosity 15W-40 / 20W-50 / HD-70 / HD-40/50 / SAE 140 · API: SL/CF / CF-4 / CF / GL-1 · Compatibility: Petrol, Diesel & Heavy Duty Engines · Technology: Extra Power Additive Formula · Packaging: 1 L / 5 L
Label: product line "BLACK POWER", slogan "Power to Control", "New Technology Extra Power", "Ultimate Engine Protection · Superior Performance", "Enhanced Engine Life". Artwork: pistons splashed with golden oil. Container: asymmetric S-curve body with side handle (same mould family as Rouge).

| # | Product | Grade | API | Size | Container | Bottle color / accent | Image |
|---|---------|-------|-----|------|-----------|-----------------------|-------|
| 30 | Black Power Multi Type Engine Oil | 15W-40 | SL/CF | 1 L | bottle | Gold/orange, yellow accent | `lona/15w40-1l-gold.webp` |
| 31 | Black Power Multi Type Engine Oil | 20W-50 | SL/CF | 5 L | jug | Orange, blue accent, blue cap | `lona/20w50-5l-orange.webp` |
| 32 | Black Power Diesel Engine Oil | HD 40/50 | CF | 1 L | bottle | Blue, red accent | `lona/hd40-50-diesel-1l-blue.webp` |
| 33 | Black Power Diesel Engine Oil (Heavy Duty) | HD 70 | CF-4 | 5 L | jug | Silver, yellow accent, yellow cap | `lona/hd70-diesel-5l-silver.webp` |
| 34 | Black Power Gear Oil | SAE 140 | GL-1 | 1 L | bottle | Lime green | `lona/sae140-gl1-1l-green.webp` |

Note: the SAE 140 photo is lower quality (blurry label text) than the others — ask for a better photo if available.

### Brand 8 — Sea Ghost Lubricants

Brand description (from the user):
> Sea Ghost Lubricants delivers reliable engine protection for gasoline and diesel engines using advanced synthetic technology and premium European additive formulations. Built for durability, engine cleanliness, and high performance under different driving conditions, Sea Ghost ensures stable lubrication and long-lasting engine efficiency.

Specs given: Viscosity 10W-30 / 20W-50 / SAE-50 · API: SL/CF, CH-4 · Technology: Synthetic Technology Blend · Engine: Gasoline & Diesel · Additives: European
Label: "Clean · Strong · Power", "With the best European additives". Logo: swirl/drop mark. Jug: rounded, large curved handle, diagonal ribs on the side; "SEA GHOST" embossed near the cap.

| # | Product | Grade | API | Size | Jug color | Image | Status |
|---|---------|-------|-----|------|-----------|-------|--------|
| 35 | Sea Ghost | 10W-30 | SL/CF | not stated (≈4–5 L) | Dark teal | `sea-ghost/10w30-teal.webp` | OK, clear |
| 36 | Sea Ghost? | 20W-50 | SL/CF | not stated | Yellow, green label | `sea-ghost/20w50-yellow-albastar-label.webp` | ⚠ label says **ALBA STAR**, not Sea Ghost |
| 37 | Sea Ghost | probably SAE 50 — CONFIRM | CH-4 | not stated | Black | `sea-ghost/unclear-ch4-black.webp` | ⚠ label text is garbled (looks AI-generated: "TAE FS", "APFCH-4") |
| 38 | Sea Ghost | unclear — CONFIRM | CH-4 | not stated | Yellow, red label | `sea-ghost/unclear-ch4-yellow-red.webp` | ⚠ garbled text, very small/low-res image |

Open questions for the user (Sea Ghost):
- Is the yellow 20W-50 jug Sea Ghost or a separate brand "Alba Star"?
- Which jug is SAE 50 — black or yellow/red? What is the other one?
- Sizes (4 L / 5 L?) for all four.
- Better (real) photos for #37 and #38 if available; the current ones have unreadable/invented label text.

### Brand 9 — MAX-X Lubricants (likely flagship)

Brand description (from the user):
> MAX-X Lubricants is formulated with advanced synthetic and mineral technologies to provide durable engine protection, smoother operation, and enhanced performance. Designed for passenger vehicles, diesel engines, and gear systems, MAX-X delivers consistent lubrication, wear resistance, and thermal stability across a wide range of operating conditions.

Specs given: Viscosity 10W-30 / 15W-40 / 20W-50 / SAE 50 / SAE 70 / SAE 90 · API: SL/CF, GL-4, GL-5 · Technology: Synthetic & Mineral Blend · Compatibility: Petrol, Diesel, Gear Systems · Packaging: 1 L / 5 L
Label: logo "SYNTHETIC MAX-X" in red on a white oval with red ring; brushed-metal swoosh; feature badges "Engine Repair System" / "Active Repair System", "New Skin", "100% Power Full", "Protection from carbon and sediment", "Smooth Drive" (gear oil). Containers: orange 5 L jug with translucent peach cap and large curved recess on the side; 1 L bottles with the same recess.

| # | Product line | Grade | API | Size | Container | Color / label | Image |
|---|--------------|-------|-----|------|-----------|---------------|-------|
| 39 | Standard 4000 (mineral) | 10W-30 | SL/CF | 5 L | jug | Orange, blue label | `max-x/10w30-standard4000-5l.webp` |
| 40 | Premium 4000 (mineral) | 15W-40 | SL/CF | 1 L | bottle | Orange/gold, orange label | `max-x/15w40-premium4000-1l.png` |
| 41 | Euro (mineral multigrade) | 20W-50 | SL/CF | 5 L | jug | Orange, green label | `max-x/20w50-euro-5l.webp` |
| 42 | Universal Mineral | SAE 50 | SL/CF | 5 L | jug | Orange, lime label | `max-x/sae50-5l.webp` |
| 43 | Universal Mineral | SAE 70 | SL/CF | 5 L | jug | Orange, yellow label | `max-x/sae70-5l.webp` |
| 44 | Gear Oil "Smooth Drive" | SAE 90 | GL-4 & GL-5 | 1 L | bottle | Lime green, green label | `max-x/sae90-gear-1l.webp` |

Note: #40 (15W-40 Premium 4000) small print is garbled ("MOTOR BIL", "BNTFOL") — looks AI-generated; ask for a real photo. Big text (MAX-X, 15W40, Premium 4000, 1L) is fine.

### Brand 10 — Deluxe Lubricants (deluxe lube)

Brand description (from the user):
> Deluxe Lubricants are engineered with German technology to deliver superior protection, extended engine life, and reliable performance for both gasoline and diesel engines. Built for durability under demanding conditions, Deluxe ensures cleaner combustion, enhanced lubrication stability, and long-lasting engine efficiency.

Specs given: Viscosity 15W-40 / 20W-50 / HD-70 · API: SL/CF / CF-4 · Compatibility: Gasoline & Diesel · Oil type: Fully Synthetic / Multi Type Engine Oil · Technology: German Technology · Packaging: 5 L
Label: "Fully Synthetic Motor Engine Oil", "High Quality · High Performance", "Multi Type Engine", "longlife Performance", "German Technology", German-flag color stripes and an eagle emblem. Jug: squared jerrycan shape, top handle + side handle, ribbed edge.
Relation: the "deluxe" badge also appears on Rouge and RK STAR labels — likely the same producer/family.

| # | Product | Grade | API | Size | Jug color / label | Image | Status |
|---|---------|-------|-----|------|-------------------|-------|--------|
| 45 | Fully Synthetic Diesel | HD-70 | CF-4 | 5 L | Blue, gold label | `deluxe/hd70-diesel-5l-blue.webp` | OK |
| 46 | Fully Synthetic | 15W-40 | SL/CF | 5 L | Silver, copper/pink label | `deluxe/15w40-5l-silver-copper-label.webp` | OK |
| 47 | Fully Synthetic | 15W-40 | SL/CF | 5 L | Silver, black label (mirrored layout) | `deluxe/15w40-5l-silver-black-label.webp` | ⚠ small text garbled (looks AI-generated); second 15W-40 — old/new label? |
| 48 | Fully Synthetic | 20W-50 | SL/CF | 5 L | Red, gold label | `deluxe/20w50-5l-red.webp` | OK |

Notes: the eagle on the label resembles the German state emblem — don't reuse it as site artwork. Two 15W-40 labels — ask which is current (or show both as label variants of one product).

### Brand 11 — FAST Lube

Brand description (from the user):
> FAST Lubricants are designed for dependable engine protection and smooth performance in both gasoline and diesel engines. Formulated with advanced base oils and high-performance additives, FAST ensures reduced wear, stable viscosity, and cleaner engine operation under daily and heavy-duty driving conditions.

Specs given: Viscosity 20W-50 · API SL/CF · Gasoline & Diesel · Multi Grade Engine Oil · 5 L
Label: "FAST LUBE", sub-line **"GOLDEN BASE — More Mileage"** (the company name is printed on this label → likely Golden Base's own/house brand alongside MAX-X). Red/black label with a pickup truck in dust.

| # | Product | Grade | API | Size | Jug color | Image |
|---|---------|-------|-----|------|-----------|-------|
| 49 | FAST Lube Multi Grade | 20W-50 | SL/CF | 5 L | Silver, red/black label | `fast-lube/20w50-5l-silver.webp` |

Note: the pickup on the label looks like a real production model — the brief forbids real car brands, so show this photo small only; never reuse the truck as site artwork.

### Brand 12 — Michel Lubricant

Brand description (from the user):
> Michel Lubricant is developed to provide dependable engine protection and long-lasting performance under daily and heavy-duty driving conditions. Built with synthetic blend technology, Michel oils help reduce friction, improve engine cleanliness, and maintain stable lubrication across a wide temperature range.

Specs given: Viscosity 15W-40 / 20W-50 · API SL/CF · Synthetic Blend · Petrol & Diesel · 5 L
Label: product line "POSIDON XR", "Engine Oil", "Multi Guard Technology", "Synthetic Blend", "Premium Quality"; also ACEA A3/B4 in small print. Brushed-steel + orange label. Jug: orange, translucent cap, angled handle with ribbed grip; "Michel Oil" embossed on the handle. PNG photos (transparent/clean background).

| # | Product | Grade | API | Size | Jug color | Image |
|---|---------|-------|-----|------|-----------|-------|
| 50 | Posidon XR Synthetic Blend | 15W-40 | SL/CF | 5 L | Orange | `michel/posidon-xr-15w40-5l.png` |
| 51 | Posidon XR Synthetic Blend | 20W-50 | SL/CF | 5 L | Orange | `michel/posidon-xr-20w50-5l.png` |

Open questions for the user:
- Is MAX-X Golden Base's own/flagship brand (hero of the site) and the other 8 brands distributed products?
- More brands coming? (User is sending products brand by brand.)
- Brand naming: site is for "Golden Base" / MAX-X, bottles say AGDILCO and Dallas UK. Is Golden Base the distributor of these brands? Is MAX-X a third brand (products not sent yet)? How should the names appear?
- Jug products (5, 6): exact viscosity and size (e.g. 4 L / 5 qt)?
- Jug labels mention real car brands in small print; the brief forbids real car brand names on the site. Use the photos only small/blurred, or rely on the 3D bottles instead.
- Kurdish names/descriptions for each product, plus phone, WhatsApp, and Erbil address.
- 3D .glb bottle models: none yet → procedural bottles shaped after these photos (quart bottle with grip ridges; jug with handle) will be used.
