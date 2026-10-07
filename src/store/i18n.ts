"use client";

import { create } from "zustand";
import { translations, type Lang, type TranslationKey } from "@/lib/site/translations";

const STORAGE_KEY = "aso-lang";

interface I18nState {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "ar" || v === "en") return v;
  } catch {
    // ignore
  }
  return "en";
}

function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

// Build a fresh translator for a language. A NEW function reference per
// language is the point: components subscribe via useI18n((s) => s.t), and
// Zustand's Object.is equality only triggers re-renders when the reference
// changes. Rebuilding t on every setLang makes the whole UI translate
// instantly without a refresh.
function makeT(lang: Lang) {
  const dict = translations[lang] as Record<string, string>;
  const en = translations.en as Record<string, string>;
  return (key: TranslationKey) => dict[key] ?? en[key] ?? (key as string);
}

const initialLang = readStoredLang();

export const useI18n = create<I18nState>((set, get) => ({
  lang: initialLang,
  dir: dirFor(initialLang),
  setLang: (lang) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    }
    set({ lang, dir: dirFor(lang), t: makeT(lang) });
  },
  toggle: () => {
    const next: Lang = get().lang === "en" ? "ar" : "en";
    get().setLang(next);
  },
  t: makeT(initialLang),
}));
