/**
 * Product catalogue — the single source of truth for every bottle on the site.
 *
 * Each product:
 *   id         unique slug (also used for the optional 3D model: /models/bottles/<id>.glb)
 *   brand      key from `brands` below
 *   name       product line / name as printed on the label
 *   viscosity  SAE grade shown big on the label (e.g. "20W-50")
 *   api        API classification
 *   size       pack size ("1 L", "5 L"…); empty string hides it
 *   kind       engine | light | synthetic | diesel | gear | atf  → picks the default description
 *   container  bottle | jug | drum  → shape of the procedural fallback bottle
 *   color      plastic color of the bottle
 *   accent     main label color
 *   image      product photo in /public/products
 *   model      path of a .glb model; if the file is missing a procedural bottle is used
 *   featured   true → appears in the scroll-rotating hero
 *   hidden     true → kept in data but not shown on the site (waiting for confirmation)
 *   description { ku, en } — optional; defaults to the text for `kind`
 */

export const brands = {
  'max-x': {
    name: 'MAX-X',
    house: true,
    accent: '#E3262E',
    tagline: { ku: 'براندی سەرەکیی Golden Base', en: 'Golden Base flagship brand' },
    description: {
      ku: 'MAX-X بە تەکنەلۆژیای سینتێتیک و مینەراڵ دروستکراوە بۆ پاراستنی بەردەوامی مەکینە، کارکردنی نەرمتر و توانای زیاتر. بۆ ئۆتۆمبێلی سواری، مەکینەی دیزڵ و گێڕ گونجاوە و لە هەموو کەشێکدا ڕۆنکردنێکی جێگیر دەدات.',
      en: 'MAX-X is formulated with advanced synthetic and mineral technologies for durable engine protection, smoother operation and enhanced performance — for passenger cars, diesel engines and gear systems, in every operating condition.'
    }
  },
  'fast-lube': {
    name: 'FAST Lube',
    house: true,
    accent: '#C8202B',
    tagline: { ku: 'Golden Base — کیلۆمەتری زیاتر', en: 'Golden Base — more mileage' },
    description: {
      ku: 'FAST بۆ پاراستنی متمانەپێکراو و کارکردنی نەرمی مەکینەی بەنزین و دیزڵ دیزاین کراوە. بە ڕۆنی بنەڕەتیی پێشکەوتوو و زیادکراوی بەهێز، سووان کەم دەکاتەوە و مەکینە پاک ڕادەگرێت.',
      en: 'FAST is designed for dependable protection and smooth performance in petrol and diesel engines — advanced base oils and high-performance additives for less wear, stable viscosity and a cleaner engine.'
    }
  },
  original: {
    name: 'Original Automotive',
    accent: '#C9A34A',
    tagline: { ku: 'لە هایبریدەوە هەتا بارهەڵگر', en: 'From hybrids to heavy duty' },
    description: {
      ku: 'ڕۆنەکانی Original بە زیادکراوی پریمیەم دروستکراون بۆ پاکیی مەکینە، پاراستن دژی سووان و کەمکردنەوەی سووتەمەنی — بۆ مەکینەی بەنزینی نوێ، هایبرید، بارهەڵگر و گێڕبۆکس.',
      en: 'Original oils use premium additives for engine cleanliness, wear protection and fuel efficiency — for modern petrol, hybrid, heavy-duty and transmission systems.'
    }
  },
  huston: {
    name: 'HUSTON',
    accent: '#2EC4C4',
    tagline: { ku: 'Premium Performance', en: 'Premium performance' },
    description: {
      ku: 'HUSTON بە تەکنەلۆژیای زیادکراوی پێشکەوتوو پاراستنی پریمیەم، لینجیی جێگیر و ڕۆنکردنی بەهێز دەدات بە مەکینەی بەنزین و دیزڵ.',
      en: 'HUSTON uses advanced additive technology for premium protection, stable viscosity and high-performance lubrication in petrol and diesel engines.'
    }
  },
  dallas: {
    name: 'Dallas UK',
    accent: '#D62828',
    tagline: { ku: 'تەکنەلۆژیای بەریتانی', en: 'British technology' },
    description: {
      ku: 'Dallas UK ڕۆنی فرە-جۆری مەکینە و گێڕبۆکسە بە تەکنەلۆژیای بەریتانی و زیادکراوی پریمیەم — پاراستنی زیاتر دژی سووان، مەکینەی پاکتر و جێگیری بەرز لە گەرمادا.',
      en: 'Dallas UK multi-type engine and transmission oils use British technology and premium additives for enhanced wear protection, cleaner engines and excellent thermal stability.'
    }
  },
  rouge: {
    name: 'Rouge',
    accent: '#7B5CFF',
    tagline: { ku: 'زیادکراوی ئەڵمانی', en: 'German additive technology' },
    description: {
      ku: 'Rouge بۆ مەکینەی بەنزین و دیزڵ دروستکراوە و تەکنەلۆژیای زیادکراوی ئەڵمانی لەگەڵ فۆرمولەی فرە-پلە تێکەڵ دەکات — بۆ کاری ڕۆژانە و باری قورس.',
      en: 'Rouge combines German additive technology with durable multigrade formulas for petrol and diesel engines — for daily driving and heavy-duty work.'
    }
  },
  'f-horse': {
    name: 'F-HORSE',
    accent: '#E8541B',
    tagline: { ku: 'تایبەت بۆ ڕۆژهەڵاتی ناوەڕاست', en: 'Specially made for the Middle East' },
    description: {
      ku: 'F-HORSE تایبەت بۆ کەشی ڕۆژهەڵاتی ناوەڕاست دروستکراوە: پاراستنی بەهێز، جێگیری بەرز لە گەرمای زۆردا و ڕۆنکردنی متمانەپێکراو بۆ بەنزین، دیزڵ و گێڕبۆکس.',
      en: 'F-HORSE is engineered for Middle East conditions — strong protection, high thermal stability and reliable lubrication for petrol, diesel and transmission systems.'
    }
  },
  lona: {
    name: 'LONA',
    accent: '#F5C518',
    tagline: { ku: 'Power to Control', en: 'Power to control' },
    description: {
      ku: 'LONA بە تەکنەلۆژیای زیادکراوی نوێ پاراستنی متمانەپێکراو، جێگیری گەرمی و ڕۆنکردنی درێژخایەن دەدات — بۆ بەنزین، دیزڵ و مەکینەی قورس.',
      en: 'LONA uses modern additive technology for reliable protection, thermal stability and long-lasting lubrication — for petrol, diesel and heavy-duty engines.'
    }
  },
  moil: {
    name: 'MOIL',
    accent: '#1E8FE0',
    tagline: { ku: 'Ultra Pure — 5000 KM', en: 'Ultra Pure — 5000 KM' },
    description: {
      ku: 'MOIL بە زیادکراوی ئەوروپی پاراستنی پریمیەم دەدات بە مەکینە. بۆ مەکینەی کیلۆمەتر زۆر گونجاوە و تا 5000 کیلۆمەتر ڕۆنکردنی متمانەپێکراو دەدات.',
      en: 'MOIL delivers premium engine protection with European additive technology — designed for high-mileage engines with reliable lubrication for up to 5000 km.'
    }
  },
  deluxe: {
    name: 'Deluxe',
    accent: '#C9A24A',
    tagline: { ku: 'تەواو سینتێتیک — تەکنەلۆژیای ئەڵمانی', en: 'Fully synthetic — German technology' },
    description: {
      ku: 'Deluxe بە تەکنەلۆژیای ئەڵمانی پاراستنی بەرز و تەمەنی درێژتر دەدات بە مەکینەی بەنزین و دیزڵ، لەگەڵ سووتانی پاکتر و ڕۆنکردنی جێگیر.',
      en: 'Deluxe is engineered with German technology for superior protection and longer engine life in petrol and diesel engines, with cleaner combustion and stable lubrication.'
    }
  },
  arol: {
    name: 'AROL',
    accent: '#F29A1E',
    tagline: { ku: 'Supertech — بۆ ئۆتۆمبێل و پاس', en: 'Supertech — for cars and buses' },
    description: {
      ku: 'AROL ڕۆنی گشتیی فرە-پلەیە بۆ مەکینەی بەنزین و دیزڵ، کارکردنی نەرمتر و پاراستنی زیاتر دژی سووان دەدات.',
      en: 'AROL multigrade universal motor oils deliver smoother operation and enhanced wear protection for petrol and diesel engines.'
    }
  },
  'rk-star': {
    name: 'RK STAR',
    accent: '#1E8FE0',
    tagline: { ku: 'Racing Oil — 5000 KM', en: 'Racing oil — 5000 KM' },
    description: {
      ku: 'RK STAR Racing Oil بۆ مەکینەی بەنزین و دیزڵی بەهێزە: ڕۆنکردنی بەهێز، مەکینەی پاک و لینجیی جێگیر هەتا 5000 کیلۆمەتر.',
      en: 'RK STAR Racing Oil is made for high-performance petrol and diesel engines — strong lubrication, a clean engine and stable viscosity for up to 5000 km.'
    }
  },
  michel: {
    name: 'Michel',
    accent: '#F26A1B',
    tagline: { ku: 'Synthetic Blend', en: 'Synthetic blend' },
    description: {
      ku: 'Michel بە تەکنەلۆژیای Synthetic Blend لێکخشان کەم دەکاتەوە، مەکینە پاک ڕادەگرێت و لە هەموو پلەیەکی گەرمیدا ڕۆنکردنی جێگیر دەدات.',
      en: 'Michel synthetic-blend oils reduce friction, keep the engine clean and keep lubrication stable across a wide temperature range.'
    }
  },
  'green-lube': {
    name: 'green lube',
    accent: '#7ED321',
    tagline: { ku: 'Most Powerful Lube', en: 'Most powerful lube' },
    description: {
      ku: 'green lube بە تەکنەلۆژیای سینتێتیک و زیادکراوی پریمیەم پاراستنی متمانەپێکراو دەدات بە مەکینە، سووان کەم دەکاتەوە و توانای مەکینە جێگیر ڕادەگرێت.',
      en: 'green lube uses synthetic technology and premium additives for reliable protection, less wear and consistent engine efficiency.'
    }
  },
  agdilco: {
    name: 'AGDILCO',
    accent: '#1D3F9A',
    tagline: { ku: 'Synthetic Blend', en: 'Synthetic blend' },
    description: {
      ku: 'AGDILCO ڕۆنی مەکینە و گێڕبۆکسی Synthetic Blendـە: جێگیری بەرز دژی ئۆکسیدبوون، پاراستنی بەهێز دژی سووان و کارکردنی نەرم بۆ بەنزین و دیزڵ.',
      en: 'AGDILCO synthetic-blend motor oils and transmission fluids offer excellent oxidation stability, superior wear protection and smooth performance for petrol and diesel engines.'
    }
  },
  'sea-ghost': {
    name: 'Sea Ghost',
    accent: '#3A7D8C',
    tagline: { ku: 'زیادکراوی ئەوروپی', en: 'European additives' },
    description: {
      ku: 'Sea Ghost بە تەکنەلۆژیای سینتێتیک و زیادکراوی ئەوروپی پاراستنی متمانەپێکراو دەدات بە مەکینەی بەنزین و دیزڵ.',
      en: 'Sea Ghost delivers reliable protection for petrol and diesel engines with synthetic technology and premium European additives.'
    }
  }
};

/** Default descriptions per product kind. */
export const kindDescriptions = {
  engine: {
    ku: 'ڕۆنی فرە-پلەی مەکینە بۆ بەنزین و دیزڵ — پاراستنی بەهێز دژی سووان و مەکینەیەکی پاکتر.',
    en: 'Multigrade engine oil for petrol and diesel engines — strong wear protection and a cleaner engine.'
  },
  light: {
    ku: 'ڕۆنی تەنک بۆ مەکینەی بەنزینی نوێ — دەستپێکردنی خێرا و کەمکردنەوەی سووتەمەنی.',
    en: 'Low-viscosity oil for modern petrol engines — fast cold starts and better fuel economy.'
  },
  synthetic: {
    ku: 'ڕۆنی تەواو سینتێتیک بۆ مەکینەی نوێ و هایبرید — بەرزترین پاراستن و کەمترین لێکخشان.',
    en: 'Fully synthetic oil for modern and hybrid engines — maximum protection with minimal friction.'
  },
  diesel: {
    ku: 'ڕۆنی قورس بۆ مەکینەی دیزڵ و بارهەڵگر — جێگیر دەمێنێتەوە لە گەرما و باری قورسدا.',
    en: 'Heavy-duty oil for diesel engines and trucks — stays stable under heat and heavy loads.'
  },
  gear: {
    ku: 'ڕۆنی گێڕ بۆ پاراستنی گێڕ و دیفرێنس — کەمکردنەوەی لێکخشان و دەنگ.',
    en: 'Gear oil that protects gearboxes and differentials — less friction and noise.'
  },
  atf: {
    ku: 'شلەی گێڕبۆکسی ئۆتۆماتیک — گۆڕینی نەرمی گێڕ و پاراستنی گێڕبۆکس.',
    en: 'Automatic transmission fluid — smooth shifting and long gearbox life.'
  }
};

/** Oil colors used for the pour animation, per product kind. */
export const oilColors = {
  engine: '#E0A12E',
  light: '#E8B547',
  synthetic: '#F2C14E',
  diesel: '#B8791F',
  gear: '#8E5A16',
  atf: '#C4162E'
};

// Compact helper so the list below stays readable.
const p = (brand, file, name, viscosity, api, size, kind, container, color, accent, extra = {}) => ({
  id: `${brand}-${file.replace(/\.(webp|png)$/, '')}`,
  brand,
  name,
  viscosity,
  api,
  size,
  kind,
  container,
  color,
  accent,
  image: `products/${brand}/${file}`,
  model: `models/bottles/${brand}-${file.replace(/\.(webp|png)$/, '')}.glb`,
  featured: false,
  hidden: false,
  ...extra
});

export const products = [
  // ── MAX-X (flagship) ──────────────────────────────────────────────
  p('max-x', '20w50-euro-5l.webp', 'Euro', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#F29A1E', '#1F8A3C', { featured: true }),
  p('max-x', '10w30-standard4000-5l.webp', 'Standard 4000', '10W-30', 'SL/CF', '5 L', 'engine', 'jug', '#F29A1E', '#1E7FD6'),
  p('max-x', '15w40-premium4000-1l.png', 'Premium 4000', '15W-40', 'SL/CF', '1 L', 'engine', 'bottle', '#E8A23A', '#E8941C'),
  p('max-x', 'sae50-5l.webp', 'Universal Mineral', 'SAE 50', 'SL/CF', '5 L', 'engine', 'jug', '#F29A1E', '#9AD53A'),
  p('max-x', 'sae70-5l.webp', 'Universal Mineral', 'SAE 70', 'SL/CF', '5 L', 'diesel', 'jug', '#F29A1E', '#F5DC1E'),
  p('max-x', 'sae90-gear-1l.webp', 'Gear Oil Smooth Drive', 'SAE 90', 'GL-4 & GL-5', '1 L', 'gear', 'bottle', '#7EE02A', '#1F8A3C'),

  // ── FAST Lube (Golden Base) ──────────────────────────────────────
  p('fast-lube', '20w50-5l-silver.webp', 'Multi Grade', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#BFC3C8', '#B3202A', { featured: true }),

  // ── Original Automotive ──────────────────────────────────────────
  p('original', 'full-synthetic-0w20-4l.webp', 'Full Synthetic', '0W-20', 'SN/CF', '4 L', 'synthetic', 'jug', '#D4A437', '#C9A34A', { featured: true }),
  p('original', 'full-synthetic-0w16-hybrid-1l.png', 'Full Synthetic Hybrid', '0W-16', 'SN/CF', '1 L', 'synthetic', 'bottle', '#D4A437', '#C9A34A', { featured: true }),
  p('original', 'tsx-10w40-1l.png', 'TSX+', '10W-40', 'SN/CF', '1 L', 'engine', 'bottle', '#BFC3C8', '#1D3F8A'),
  p('original', 'tsx-15w40-4l.webp', 'TSX+', '15W-40', 'SN/CF', '4 L', 'engine', 'jug', '#8E9297', '#1D3F8A'),
  p('original', 'tsx-20w50-1l.png', 'TSX+', '20W-50', 'SN/CF', '1 L', 'engine', 'bottle', '#BFC3C8', '#1D3F8A'),
  p('original', 'tsx-20w50-4l.webp', 'TSX+', '20W-50', 'SN/CF', '4 L', 'engine', 'jug', '#8E9297', '#1D3F8A'),
  p('original', 'tsx-20w50-25l.png', 'TSX+', '20W-50', 'SN/CF', '25 L', 'diesel', 'drum', '#F28C1E', '#2F7FD6'),
  p('original', 'atf3-1l.png', 'Transmission Fluid', 'ATF III', 'ATF III', '1 L', 'atf', 'bottle', '#D81E1E', '#8A1414'),

  // ── HUSTON ───────────────────────────────────────────────────────
  p('huston', 'terklaz-10w30-5l.webp', 'Terklaz', '10W-30', 'SL/CF', '5 L', 'engine', 'jug', '#EF8A1E', '#2EC4C4', { featured: true }),
  p('huston', 'silver-20w50-5l.webp', 'Silver', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#B9BDC2', '#8E949A'),
  p('huston', 'white-hd70-5l.webp', 'White', 'HD-70', 'CI-4', '5 L', 'diesel', 'jug', '#1F3FD6', '#EDEDED'),

  // ── Dallas UK ────────────────────────────────────────────────────
  p('dallas', '10w30-4l-blue.webp', 'Multi Type Engine Oil', '10W-30', 'SN/CF', '4 L', 'engine', 'jug', '#2B3FD6', '#C2185B'),
  p('dallas', '10w40-1l-gold.webp', 'Multi Type Engine Oil', '10W-40', 'SN/CF', '1 L', 'engine', 'bottle', '#E08A17', '#1B8FD1'),
  p('dallas', '15w40-4l-silver.webp', 'Multi Type Engine Oil', '15W-40', 'SN/CF', '4 L', 'engine', 'jug', '#B9BCC0', '#D62828'),
  p('dallas', '20w50-4l-red.webp', 'Multi Type Engine Oil', '20W-50', 'SN/CF', '4 L', 'engine', 'jug', '#E01B1B', '#F2D21B'),
  p('dallas', '20w50-1l-blue.webp', 'Multi Type Engine Oil', '20W-50', 'SN/CF', '1 L', 'engine', 'bottle', '#1D3FD0', '#F2D21B'),
  p('dallas', 'atf3-1l-red.webp', 'Transmission Fluid', 'ATF III', 'ATF III', '1 L', 'atf', 'bottle', '#D81E1E', '#1A1A1A'),

  // ── Rouge ────────────────────────────────────────────────────────
  p('rouge', '10w30-5l-silver-grey.webp', 'Engine Oil', '10W-30', 'SL/CF-4', '5 L', 'engine', 'jug', '#B9BDC2', '#8A8F96'),
  p('rouge', 'sae50-5l-silver-purple.webp', 'Engine Oil', 'SAE 50', 'CF-4', '5 L', 'diesel', 'jug', '#B9BDC2', '#6A5ACD'),
  p('rouge', 'sae50-diesel-5l-silver-blue.webp', 'Diesel Engine Oil', 'SAE 50', 'CF-4', '5 L', 'diesel', 'jug', '#B9BDC2', '#1E6FE0'),
  p('rouge', '20w50-1l-blue.webp', 'Engine Oil', '20W-50', 'SL/CH-4', '1 L', 'engine', 'bottle', '#1E4FD0', '#D62828'),
  p('rouge', '15w40-1l-orange.webp', 'Engine Oil', '15W-40', 'SL/CF-4', '1 L', 'engine', 'bottle', '#F0A020', '#F5D23A'),
  p('rouge', 'sae90-gl1-1l-green.webp', 'Gear Oil', 'SAE 90', 'GL-1', '1 L', 'gear', 'bottle', '#8BDC2C', '#9BD43A'),

  // ── F-HORSE ──────────────────────────────────────────────────────
  p('f-horse', '10w40-4l-silver.webp', 'Premium', '10W-40', 'SL/CF', '4 L', 'engine', 'jug', '#B9BDC2', '#E8541B'),
  p('f-horse', '20w50-5l-orange.webp', 'Premium', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#F39A1E', '#E8541B'),
  p('f-horse', '20w50-1l-orange.webp', 'Premium', '20W-50', 'SL/CF', '1 L', 'engine', 'bottle', '#F39A1E', '#E8541B'),
  p('f-horse', 'sae40-1l-silver.webp', 'Premium', 'SAE 40', 'CF-4', '1 L', 'diesel', 'bottle', '#B9BDC2', '#E8541B'),
  p('f-horse', 'atf3-1l-red.webp', 'Premium ATF III', 'ATF III', 'ATF III', '1 L', 'atf', 'bottle', '#D81E1E', '#E8541B'),

  // ── LONA ─────────────────────────────────────────────────────────
  p('lona', '15w40-1l-gold.webp', 'Black Power Multi Type', '15W-40', 'SL/CF', '1 L', 'engine', 'bottle', '#E8A01C', '#F5C518'),
  p('lona', '20w50-5l-orange.webp', 'Black Power Multi Type', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#EF8A1A', '#1E4FD0'),
  p('lona', 'hd40-50-diesel-1l-blue.webp', 'Black Power Diesel', 'HD 40/50', 'CF', '1 L', 'diesel', 'bottle', '#1E4FD0', '#E01B24'),
  p('lona', 'hd70-diesel-5l-silver.webp', 'Black Power Heavy Duty', 'HD-70', 'CF-4', '5 L', 'diesel', 'jug', '#B9BDC2', '#F5C518'),
  p('lona', 'sae140-gl1-1l-green.webp', 'Black Power Gear Oil', 'SAE 140', 'GL-1', '1 L', 'gear', 'bottle', '#8BDC2C', '#F5C518'),

  // ── MOIL ─────────────────────────────────────────────────────────
  p('moil', '10w30-5l-blue.webp', 'Ultra Pure', '10W-30', 'SL', '5 L', 'engine', 'jug', '#1F45D8', '#1E8FE0', { featured: true }),
  p('moil', '20w50-5l-red.webp', 'Ultra Pure', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#E01B1B', '#F29A1E'),
  p('moil', 'hd70-5l-silver.webp', 'Ultra Pure Diesel', 'HD-70', 'CF-4', '5 L', 'diesel', 'jug', '#B9BDC2', '#E01B24'),

  // ── Deluxe ───────────────────────────────────────────────────────
  p('deluxe', 'hd70-diesel-5l-blue.webp', 'Fully Synthetic Diesel', 'HD-70', 'CF-4', '5 L', 'diesel', 'jug', '#1F3FD6', '#C9A24A'),
  p('deluxe', '15w40-5l-silver-copper-label.webp', 'Fully Synthetic', '15W-40', 'SL/CF', '5 L', 'engine', 'jug', '#B9BDC2', '#C98A6A'),
  p('deluxe', '20w50-5l-red.webp', 'Fully Synthetic', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#E01B1B', '#C9A24A'),
  // Second 15W-40 label variant — small print in the photo is unreadable; waiting for confirmation.
  p('deluxe', '15w40-5l-silver-black-label.webp', 'Fully Synthetic', '15W-40', 'SL/CF', '5 L', 'engine', 'jug', '#B9BDC2', '#F2A81E', { hidden: true }),

  // ── AROL ─────────────────────────────────────────────────────────
  p('arol', '10w30-5l-gold.webp', 'Supertech', '10W-30', 'SN/CF', '5 L', 'engine', 'jug', '#E39A24', '#F29A1E'),
  p('arol', '15w40-4l-silver.webp', 'Supertech', '15W-40', 'SL/CF', '4 L', 'engine', 'jug', '#B9BDC2', '#F29A1E'),
  p('arol', '20w50-5l-silver.webp', 'Supertech', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#B9BDC2', '#F29A1E'),
  p('arol', 'sae50-5l-blue.webp', 'Supertech', 'SAE 50', 'CH-4', '5 L', 'diesel', 'jug', '#2342D8', '#F29A1E'),

  // ── RK STAR ──────────────────────────────────────────────────────
  p('rk-star', '10w30-5l-gold.webp', 'Racing Oil', '10W-30', 'SL/CF', '5 L', 'engine', 'jug', '#EFA21E', '#1E8FE0'),
  p('rk-star', '20w50-5l-silver.webp', 'Racing Oil', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#B9BDC2', '#1E8FE0'),

  // ── Michel ───────────────────────────────────────────────────────
  p('michel', 'posidon-xr-15w40-5l.png', 'Posidon XR', '15W-40', 'SL/CF', '5 L', 'engine', 'jug', '#F26A1B', '#2A2A2A'),
  p('michel', 'posidon-xr-20w50-5l.png', 'Posidon XR', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#F26A1B', '#2A2A2A'),

  // ── green lube (grades taken from the photos) ────────────────────
  p('green-lube', 'king-5w20-5l.webp', 'King', '5W-20', 'SL', '5 L', 'light', 'jug', '#222222', '#2FBF3A'),
  p('green-lube', 'minister-5w30-5l.webp', 'Minister', '5W-30', 'SL', '5 L', 'light', 'jug', '#222222', '#C2185B'),
  p('green-lube', 'moster-15w40-5l.webp', 'Moster', '15W-40', 'SL/CF', '5 L', 'engine', 'jug', '#222222', '#F0B01C'),
  p('green-lube', 'pure-20w50-5l.webp', 'Pure', '20W-50', 'SL/CF', '5 L', 'engine', 'jug', '#222222', '#E0247A'),

  // ── AGDILCO ──────────────────────────────────────────────────────
  p('agdilco', 'engine-lube-10w40-gold.webp', 'Multi Type Engine Lube', '10W-40', 'SL/CF', '946 mL', 'engine', 'bottle', '#D98A1C', '#B8913A'),
  p('agdilco', 'engine-lube-sae40-blue.webp', 'Multi Type Engine Lube', 'SAE 40', 'SL/CF', '946 mL', 'engine', 'bottle', '#1F4FD1', '#1A3F9C'),
  p('agdilco', 'atf-type3-red.webp', 'Automatic Transmission Fluid', 'ATF III (H)', 'ATF III', '946 mL', 'atf', 'bottle', '#D61F1F', '#1D3F9A'),
  p('agdilco', 'atf-type3-black.webp', 'Automatic Transmission Fluid', 'ATF III (H)', 'ATF III', '946 mL', 'atf', 'bottle', '#1A1A1A', '#1D3F9A'),
  // Jug grades/sizes not confirmed yet (label seal looks like 5W-30).
  p('agdilco', 'synthetic-blend-jug-red-black.webp', 'Synthetic Blend Motor Oil', '5W-30', 'SN', '', 'light', 'jug', '#E01B1B', '#1A1A1A'),
  p('agdilco', 'synthetic-blend-jug-red-yellow.webp', 'Synthetic Blend Motor Oil', '5W-30', 'SL/CF', '', 'light', 'jug', '#E01B1B', '#F2C21B'),

  // ── Sea Ghost ────────────────────────────────────────────────────
  p('sea-ghost', '10w30-teal.webp', 'Sea Ghost', '10W-30', 'SL/CF', '', 'engine', 'jug', '#1C4A55', '#9AA3A8'),
  // The three below wait for confirmation (label says "Alba Star" / unreadable label text).
  p('sea-ghost', '20w50-yellow-albastar-label.webp', 'Sea Ghost', '20W-50', 'SL/CF', '', 'engine', 'jug', '#F2C81B', '#4CAF50', { hidden: true }),
  p('sea-ghost', 'unclear-ch4-black.webp', 'Sea Ghost', 'SAE 50', 'CH-4', '', 'diesel', 'jug', '#1A1A1A', '#9AA3A8', { hidden: true }),
  p('sea-ghost', 'unclear-ch4-yellow-red.webp', 'Sea Ghost', 'SAE 50', 'CH-4', '', 'diesel', 'jug', '#F2C81B', '#D62828', { hidden: true })
];

/** Products that are visible on the site. */
export const visibleProducts = products.filter((x) => !x.hidden);

/** Products shown in the scroll-rotating hero, in display order. */
export const featuredProducts = visibleProducts.filter((x) => x.featured);

export const getDescription = (product, lang) =>
  (product.description && product.description[lang]) || kindDescriptions[product.kind][lang];

export const productTitle = (product) => `${brands[product.brand].name} ${product.name}`;
