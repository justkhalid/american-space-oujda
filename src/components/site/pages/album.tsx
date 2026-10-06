"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, Pill } from "@/components/site/primitives";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  createdAt: string;
}

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "general", label: "Space" },
  { key: "event", label: "Events" },
  { key: "club", label: "Clubs" },
  { key: "workshop", label: "Workshops" },
];

export function AlbumPage() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("ALL");
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => category === "ALL" || i.category === category);

  const closeLightbox = () => setLightbox(null);
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % filtered.length));
  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));

  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, filtered.length]);

  return (
    <>
      <Section className="!pt-12 md:!pt-16 !pb-8">
        <PageHeader
          eyebrow="Album"
          title="Moments from the Space"
          subtitle="Photographs from our events, clubs, workshops, and everyday life at American Space Oujda."
        />
      </Section>

      <Section className="!py-4 !pt-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Section>

      <Section className="!pt-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-2">No photos in this category yet</h3>
            <p className="text-muted-foreground">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setLightbox(i)}
                className="tap group relative aspect-square rounded-2xl overflow-hidden bg-secondary elevated"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs font-medium line-clamp-1">{item.title}</div>
                  {item.description && (
                    <div className="text-[10px] text-white/80 line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lightbox].imageUrl}
              alt={filtered[lightbox].title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white max-w-2xl">
              <div className="text-lg font-display tracking-tight">
                {filtered[lightbox].title}
              </div>
              {filtered[lightbox].description && (
                <div className="text-sm text-white/70 mt-1">
                  {filtered[lightbox].description}
                </div>
              )}
              <div className="text-xs text-white/50 mt-2 tnum">
                {lightbox + 1} / {filtered.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
