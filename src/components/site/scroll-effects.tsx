"use client";

import * as React from "react";

// Scroll progress bar + scroll reveal on enter viewport.
// Mount once near the top of the app.

export function ScrollEffects() {
  React.useEffect(() => {
    // 1. Create the scroll progress bar
    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    document.body.appendChild(bar);

    let ticking = false;
    const updateBar = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? scrollTop / docHeight : 0;
        bar.style.transform = `scaleX(${pct})`;
        ticking = false;
      });
    };
    updateBar();
    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);

    // 2. Scroll reveal — observe elements with .reveal and .stagger
    //    Elements stay visible once revealed (we unobserve after triggering).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Small delay so the animation feels weighted, not instant
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    const observeAll = () => {
      document.querySelectorAll(".reveal:not(.is-visible), .stagger:not(.is-visible)").forEach((el) => {
        observer.observe(el);
      });
    };
    observeAll();

    // Re-observe when DOM changes (route changes add new elements)
    const mo = new MutationObserver(() => {
      // Debounce — only re-observe once per batch of DOM changes
      requestAnimationFrame(observeAll);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", updateBar);
      window.removeEventListener("resize", updateBar);
      observer.disconnect();
      mo.disconnect();
      bar.remove();
    };
  }, []);

  return null;
}
