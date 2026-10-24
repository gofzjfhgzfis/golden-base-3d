import { translations, languages } from './translations.js';

const STORAGE_KEY = 'gb-lang';
const listeners = new Set();
const DEFAULT = languages[0].code;
const isKnown = (code) => languages.some((l) => l.code === code);

function readStoredLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isKnown(v) ? v : null;
  } catch {
    return null;
  }
}

let lang = readStoredLang() || DEFAULT;

export const getLang = () => lang;
export const getLanguage = () => languages.find((l) => l.code === lang);

/** Translate a key, replacing {placeholders} with values from `vars`. Falls back to English. */
export function t(key, vars = {}) {
  const str = translations[lang][key] ?? translations[DEFAULT][key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

/** Pick the current language from a { en, ku, ar } object (falls back to English). */
export const pick = (obj) => (obj && (obj[lang] ?? obj[DEFAULT])) || '';

/** Apply the current language to every [data-i18n] / [data-i18n-placeholder] element. */
export function applyTranslations(root = document) {
  const l = getLanguage();
  document.documentElement.lang = l.htmlLang;
  document.documentElement.dir = l.dir;
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
  if (!isKnown(next) || next === lang) return;
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
export { languages };
