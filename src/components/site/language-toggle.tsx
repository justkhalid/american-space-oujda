"use client";

import * as React from "react";
import { useI18n } from "@/store/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  /** Render a wider, labelled version (used in mobile drawer). */
  withLabel?: boolean;
}

/**
 * Small pill button that toggles between EN and AR.
 * Shows "ع" when current language is EN, and "EN" when current is AR.
 */
export function LanguageToggle({ className, withLabel = false }: LanguageToggleProps) {
  const lang = useI18n((s) => s.lang);
  const toggle = useI18n((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === "en" ? "العربية" : "English"}
      suppressHydrationWarning
      className={cn(
        "tap h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground font-medium",
        withLabel ? "px-3 gap-2 text-[13px] w-full" : "w-9 px-0 text-[13px]",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          withLabel ? "text-base" : "text-[15px]"
        )}
      >
        {lang === "en" ? "ع" : "EN"}
      </span>
      {withLabel && (
        <span className="truncate">
          {lang === "en" ? "العربية" : "English"}
        </span>
      )}
    </button>
  );
}
