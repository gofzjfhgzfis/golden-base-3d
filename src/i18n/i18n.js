import { translations } from './translations.js';

const STORAGE_KEY = 'gb-lang';
const listeners = new Set();

function readStoredLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' || v === 'ku' ? v : null;
  } catch {
    return null;
  }
}

let lang = readStoredLang() || 'ku';

export const getLang = () => lang;

/** Translate a key, replacing {placeholders} with values from `vars`. */
export function t(key, vars = {}) {
  const str = translations[lang][key] ?? translations.ku[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

/** Apply the current language to every [data-i18n] / [data-i18n-placeholder] element. */
export function applyTranslations(root = document) {
  document.documentElement.lang = lang === 'ku' ? 'ckb' : 'en';
  document.documentElement.dir = lang === 'ku' ? 'rtl' : 'ltr';
  document.title = t('meta.title');

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const vars = el.dataset.i18nVars ? JSON.parse(el.dataset.i18nVars) : {};
    el.textContent = t(el.dataset.i18n, vars);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
}

export function setLang(next) {
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage unavailable — language just won't be remembered */
  }
  applyTranslations();
  listeners.forEach((fn) => fn(lang));
}

export const onLangChange = (fn) => listeners.add(fn);
