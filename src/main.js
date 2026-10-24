import './styles/main.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { applyTranslations, setLang, getLang, onLangChange, t, languages } from './i18n/i18n.js';
import { contact } from './i18n/translations.js';
import { featuredProducts, brands, getDescription } from './data/products.js';
import { initCatalog, orderLink, stats } from './ui/catalog.js';
import { esc, prefersReducedMotion } from './utils.js';

gsap.registerPlugin(ScrollTrigger);

// ── Smooth scrolling (Lenis drives ScrollTrigger) ──────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: !prefersReducedMotion() });
window.__lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const scrollTo = (target) => lenis.scrollTo(target, { offset: -70 });

// ── Loader ─────────────────────────────────────────────────────────
const loader = document.getElementById('loader');
const loaderFill = loader.querySelector('.loader-fill');
const loaderPct = document.getElementById('loader-pct');
let shown = 0;
function setProgress(k) {
  const v = Math.max(shown, Math.min(1, k));
  shown = v;
  loaderFill.setAttribute('y', String(80 - v * 80));
  loaderPct.textContent = `${Math.round(v * 100)}%`;
}

// ── Hero product panels (data comes from src/data/products.js) ─────
function renderHeroPanels() {
  const lang = getLang();
  const n = featuredProducts.length;
  document.getElementById('hero-products').innerHTML = featuredProducts
    .map(
      (p, i) => `<article class="hero-product" style="--accent:${p.accent}">
        <span class="hp-index" dir="ltr">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span>
        <span class="hp-brand" dir="ltr">${esc(brands[p.brand].name)}</span>
        <h2 class="hp-name" dir="ltr">${esc(p.name)}</h2>
        <div class="hp-grade" dir="ltr">${esc(p.viscosity)}</div>
        <p class="hp-desc">${esc(getDescription(p, lang))}</p>
        <dl class="hp-specs">
          <div><dt>${esc(t('hero.viscosity'))}</dt><dd dir="ltr">${esc(p.viscosity)}</dd></div>
          <div><dt>${esc(t('hero.api'))}</dt><dd dir="ltr">${esc(p.api)}</dd></div>
          ${p.size ? `<div><dt>${esc(t('hero.size'))}</dt><dd dir="ltr">${esc(p.size)}</dd></div>` : ''}
        </dl>
        <a class="btn btn-wa small" href="${orderLink(p)}" target="_blank" rel="noopener">${esc(t('products.order'))}</a>
      </article>`
    )
    .join('');
  document.getElementById('hero-dots').innerHTML = featuredProducts
    .map((p, i) => `<button type="button" aria-label="${esc(brands[p.brand].name)} ${esc(p.viscosity)}" data-i="${i}"></button>`)
    .join('');
}

// ── Contact links ──────────────────────────────────────────────────
function renderContact() {
  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t('contact.whatsappMessage'))}`;
  document.querySelectorAll('[data-phone]').forEach((el) => (el.textContent = contact.phoneDisplay));
  document.getElementById('contact-phone').href = `tel:${contact.phoneInternational}`;
  document.getElementById('contact-whatsapp').href = wa;
  document.getElementById('wa-float').href = wa;
  document.getElementById('contact-map').href = contact.mapsUrl;
  document.getElementById('footer-rights').textContent = t('footer.rights', { year: new Date().getFullYear() });
}

// ── Header: language toggle, mobile menu, anchor links ─────────────
function initHeader() {
  const langSwitch = document.getElementById('lang-switch');
  const renderLangSwitch = () => {
    langSwitch.innerHTML = languages
      .map(
        (l) =>
          `<button type="button" lang="${l.htmlLang}" data-lang="${l.code}" aria-pressed="${l.code === getLang()}">${esc(l.label)}</button>`
      )
      .join('');
  };
  renderLangSwitch();
  langSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    setLang(btn.dataset.lang);
    renderLangSwitch();
    ScrollTrigger.refresh();
  });
  const header = document.querySelector('.site-header');
  const menuBtn = document.getElementById('menu-toggle');
  const closeMenu = () => {
    header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };
  menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollTo(id);
    })
  );
  lenis.on('scroll', ({ scroll }) => header.classList.toggle('scrolled', scroll > 40));
}

// ── Scroll animations: reveals, counters, timeline ─────────────────
function initScrollAnimations() {
  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
  );

  document.querySelector('[data-count-brands]').dataset.count = String(stats.brands);
  document.querySelector('[data-count-products]').dataset.count = String(stats.products);
  document.querySelectorAll('[data-count]').forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: Number(el.dataset.count),
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => (el.textContent = `${Math.round(obj.v)}${el.dataset.suffix || ''}`)
    });
  });

  // A golden oil line pours down the timeline and lights each year as it arrives.
  const line = document.querySelector('.timeline-line span');
  gsap.fromTo(line, { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true }
  });
  gsap.utils.toArray('.milestone').forEach((m) =>
    ScrollTrigger.create({ trigger: m, start: 'top 62%', onToggle: (s) => m.classList.toggle('lit', s.isActive || s.progress > 0) })
  );

  gsap.from('.car-line', {
    strokeDasharray: 1400,
    strokeDashoffset: 1400,
    duration: 2.4,
    ease: 'power2.inOut',
    stagger: 0.2,
    scrollTrigger: { trigger: '.exp-cta', start: 'top 70%' }
  });

  window.addEventListener('catalog:updated', () => ScrollTrigger.refresh());
}

// ── Oil Change Experience overlay (lazy-loaded) ────────────────────
let heroCtl = null;
let experience = null;
let experienceLoading = null;
function initExperienceButtons() {
  const overlay = document.getElementById('experience');
  const open = async () => {
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    lenis.stop();
    heroCtl?.setPaused(true);
    requestAnimationFrame(() => overlay.classList.add('open'));
    try {
      if (!experienceLoading) {
        experienceLoading = import('./experience/experience.js').then((m) => m.createExperience(overlay));
      }
      experience = await experienceLoading;
      if (!overlay.hidden) experience.start();
    } catch (err) {
      console.error(err);
      overlay.querySelector('.exp-loading p').textContent = t('exp.webglError');
    }
  };
  const close = () => {
    overlay.classList.remove('open');
    experience?.stop();
    setTimeout(() => (overlay.hidden = true), 350);
    document.body.classList.remove('no-scroll');
    lenis.start();
    heroCtl?.setPaused(false);
  };
  document.querySelectorAll('[data-open-experience]').forEach((b) => b.addEventListener('click', open));
  overlay.querySelector('[data-action="close"]').addEventListener('click', close);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && !overlay.hidden && close());
  if (location.hash === '#experience') open();
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

// ── Boot ───────────────────────────────────────────────────────────
async function boot() {
  renderHeroPanels();
  applyTranslations();
  renderContact();
  initHeader();
  initCatalog({ scrollTo });
  onLangChange(() => {
    renderHeroPanels();
    renderContact();
  });
  setProgress(0.08);

  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  setProgress(0.25);

  if (webglAvailable()) {
    try {
      const { initHero } = await import('./three/heroScene.js');
      heroCtl = await initHero({ onProgress: (k) => setProgress(0.25 + k * 0.75) });
    } catch (err) {
      console.error('[hero] 3D failed, showing the page without it.', err);
      document.body.classList.add('no-webgl');
    }
  } else {
    document.body.classList.add('no-webgl');
  }
  setProgress(1);

  initScrollAnimations();
  initExperienceButtons();
  ScrollTrigger.refresh();
  loader.classList.add('done');
  setTimeout(() => loader.remove(), 900);
}

boot();
