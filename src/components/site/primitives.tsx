"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Reusable layout primitives - symmetric, iOS-like, matte.

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl fade-up",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3">
          {eyebrow}
        </div>
      )}
      <h1
        className="font-display text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tight balance"
        style={{ fontVariationSettings: '"opsz" 96, "SOFT" 50' }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed pretty">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  containerClassName,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-12 md:py-16", className)}>
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex gap-4 mb-10",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col md:flex-row md:items-end md:justify-between"
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-tight balance">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-muted-foreground pretty leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// Stat block - symmetric, tabular
export function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="font-display text-4xl md:text-5xl tnum tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

// Card - matte, subtle border + shadow
export function MatteCard({
  children,
  className,
  as = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        "rounded-2xl bg-card border border-border/70 p-6 elevated",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Pill badge
export function Pill({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "outline" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variant === "default" && "bg-secondary text-secondary-foreground",
        variant === "accent" && "bg-accent/12 text-accent",
        variant === "outline" && "border border-border text-foreground",
        variant === "muted" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

// Two-column symmetric grid for content blocks
export function TwoCol({
  left,
  right,
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-8 md:gap-12 items-start", className)}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

// Inline list of features / bullets with check icon
import { Check } from "lucide-react";
export function CheckList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-accent" strokeWidth={3} />
          </div>
          <div className="text-foreground/90">{it}</div>
        </li>
      ))}
    </ul>
  );
}
