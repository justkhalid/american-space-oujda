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

export const useI18n = create<I18nState>((set, get) => ({
  lang: readStoredLang(),
  dir: dirFor(readStoredLang()),
  setLang: (lang) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    }
    set({ lang, dir: dirFor(lang) });
  },
  toggle: () => {
    const next: Lang = get().lang === "en" ? "ar" : "en";
    get().setLang(next);
  },
  t: (key) => {
    const { lang } = get();
    const dict = translations[lang] as Record<string, string>;
    const en = translations.en as Record<string, string>;
    return dict[key] ?? en[key] ?? (key as string);
  },
}));
