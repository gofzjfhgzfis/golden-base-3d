import { visibleProducts, brands, getDescription, productTitle } from '../data/products.js';
import { t, getLang, onLangChange } from '../i18n/i18n.js';
import { contact } from '../i18n/translations.js';
import { asset, esc } from '../utils.js';

const brandKeys = Object.keys(brands).filter((b) => visibleProducts.some((p) => p.brand === b));
const countFor = (b) => visibleProducts.filter((p) => p.brand === b).length;
const kinds = ['engine', 'light', 'synthetic', 'diesel', 'gear', 'atf'];
const PAGE = 12;

export const orderLink = (p) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    t('products.orderMessage', { name: productTitle(p), viscosity: p.viscosity, size: p.size || '' })
  )}`;

/** Brand marquee + brand cards. Clicking a card filters the product grid. */
function renderBrands(onPick) {
  const title = document.getElementById('brands-title');
  title.textContent = t('brands.title', { count: brandKeys.length });

  const marquee = document.getElementById('brand-marquee');
  const names = brandKeys.map((b) => `<span style="--c:${brands[b].accent}">${esc(brands[b].name)}</span>`).join('<i>◆</i>');
  marquee.innerHTML = `<div>${names}<i>◆</i></div><div>${names}<i>◆</i></div>`;

  const lang = getLang();
  const grid = document.getElementById('brand-grid');
  grid.innerHTML = brandKeys
    .map((b) => {
      const brand = brands[b];
      const cover = visibleProducts.find((p) => p.brand === b && p.featured) || visibleProducts.find((p) => p.brand === b);
      return `<button type="button" class="brand-card${brand.house ? ' house' : ''}" data-brand="${b}" style="--accent:${brand.accent}">
        <span class="brand-img"><img src="${asset(cover.image)}" alt="" loading="lazy" decoding="async"></span>
        <span class="brand-body">
          ${brand.house ? `<span class="badge">${esc(t('brands.house'))}</span>` : ''}
          <span class="brand-name" dir="ltr">${esc(brand.name)}</span>
          <span class="brand-tag">${esc(brand.tagline[lang])}</span>
          <span class="brand-desc">${esc(brand.description[lang])}</span>
          <span class="brand-count">${esc(t('brands.products', { count: countFor(b) }))}</span>
        </span>
      </button>`;
    })
    .join('');
  grid.onclick = (e) => {
    const card = e.target.closest('[data-brand]');
    if (card) onPick(card.dataset.brand);
  };
}

/** Product grid with search, brand and type filters. */
export function initCatalog({ scrollTo }) {
  const state = { q: '', brand: 'all', kind: 'all', limit: PAGE };
  const grid = document.getElementById('product-grid');
  const search = document.getElementById('product-search');
  const brandSel = document.getElementById('brand-filter');
  const kindWrap = document.getElementById('kind-filter');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('product-empty');
  const more = document.getElementById('show-more');

  const filtered = () => {
    const q = state.q.trim().toLowerCase().replace(/\s+/g, '');
    return visibleProducts.filter(
      (p) =>
        (state.brand === 'all' || p.brand === state.brand) &&
        (state.kind === 'all' || p.kind === state.kind) &&
        (!q || `${brands[p.brand].name}${p.name}${p.viscosity}${p.api}`.toLowerCase().replace(/[\s-]+/g, '').includes(q.replace(/-/g, '')))
    );
  };

  function renderControls() {
    brandSel.innerHTML = [`<option value="all">${esc(t('products.allBrands'))}</option>`]
      .concat(brandKeys.map((b) => `<option value="${b}">${esc(brands[b].name)}</option>`))
      .join('');
    brandSel.value = state.brand;
    kindWrap.innerHTML = ['all', ...kinds]
      .map(
        (k) =>
          `<button type="button" class="chip${state.kind === k ? ' active' : ''}" data-kind="${k}">${esc(
            k === 'all' ? t('products.allKinds') : t(`kind.${k}`)
          )}</button>`
      )
      .join('');
  }

  function renderGrid() {
    const list = filtered();
    const lang = getLang();
    count.textContent = t('products.count', { count: list.length });
    empty.hidden = list.length > 0;
    more.parentElement.hidden = list.length <= state.limit;
    grid.innerHTML = list
      .slice(0, state.limit)
      .map(
        (p) => `<article class="product-card" style="--accent:${p.accent}">
          <div class="product-img"><img src="${asset(p.image)}" alt="${esc(productTitle(p))}" loading="lazy" decoding="async"></div>
          <div class="product-body">
            <span class="product-brand" dir="ltr">${esc(brands[p.brand].name)}</span>
            <h3 class="product-name" dir="ltr">${esc(p.name)}</h3>
            <div class="product-grade" dir="ltr">${esc(p.viscosity)}</div>
            <p class="product-desc">${esc(getDescription(p, lang))}</p>
            <ul class="product-specs">
              <li><span>${esc(t('hero.api'))}</span><b dir="ltr">${esc(p.api)}</b></li>
              ${p.size ? `<li><span>${esc(t('hero.size'))}</span><b dir="ltr">${esc(p.size)}</b></li>` : ''}
              <li><span class="kind-tag">${esc(t(`kind.${p.kind}`))}</span></li>
            </ul>
            <a class="btn btn-wa small" href="${orderLink(p)}" target="_blank" rel="noopener">${esc(t('products.order'))}</a>
          </div>
        </article>`
      )
      .join('');
  }

  const update = () => {
    renderGrid();
    window.dispatchEvent(new Event('catalog:updated'));
  };

  search.addEventListener('input', () => {
    state.q = search.value;
    state.limit = PAGE;
    update();
  });
  brandSel.addEventListener('change', () => {
    state.brand = brandSel.value;
    state.limit = PAGE;
    update();
  });
  kindWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-kind]');
    if (!chip) return;
    state.kind = chip.dataset.kind;
    state.limit = PAGE;
    renderControls();
    update();
  });
  more.addEventListener('click', () => {
    state.limit += PAGE;
    update();
  });

  const pickBrand = (b) => {
    state.brand = b;
    state.kind = 'all';
    state.limit = PAGE;
    renderControls();
    update();
    scrollTo('#products');
  };

  const renderAll = () => {
    renderBrands(pickBrand);
    renderControls();
    renderGrid();
  };
  renderAll();
  onLangChange(renderAll);
}

export const stats = { brands: brandKeys.length, products: visibleProducts.length };
