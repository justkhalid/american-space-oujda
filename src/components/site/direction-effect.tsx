"use client";

import * as React from "react";
import { useI18n, loadTextOverrides } from "@/store/i18n";

/**
 * Watches the i18n store and applies `dir` + `lang` to <html>.
 * Mount once near the top of the app (alongside ScrollEffects).
 */
export function DirectionEffect() {
  const lang = useI18n((s) => s.lang);
  const dir = useI18n((s) => s.dir);

  React.useEffect(() => {
    loadTextOverrides();
  }, []);

  React.useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = dir;
  }, [lang, dir]);

  return null;
}
