"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, type Route } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/site/primitives";
import { LogOut, ExternalLink, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface DashTab {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function DashboardLayout({
  title,
  pillLabel,
  pillIcon: PillIcon,
  tabs,
  activeTab,
  onTabChange,
  baseRoute,
  children,
}: {
  title: string;
  pillLabel: string;
  pillIcon: React.ElementType;
  tabs: DashTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  baseRoute: Route;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const userName = session?.user?.name || session?.user?.email || "User";
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const TabButton = ({ tab }: { tab: DashTab }) => (
    <button
      onClick={() => {
        onTabChange(tab.key);
        setMobileOpen(false);
      }}
      className={cn(
        "tap w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
        activeTab === tab.key
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <tab.icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left truncate">{tab.label}</span>
      {tab.badge != null && tab.badge > 0 && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
            activeTab === tab.key
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {tab.badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <Pill variant="accent" className="mb-2">
            <PillIcon className="w-3 h-3" />
            {pillLabel}
          </Pill>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <strong>{userName}</strong> ·{" "}
            <span className="capitalize">{userRole?.toLowerCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ name: "home" })}
            className="rounded-full bg-transparent"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View site
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full bg-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <TabButton key={t.key} tab={t} />
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden -mx-4 px-4 mb-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="tap w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Menu className="w-4 h-4" />
                  {tabs.find((t) => t.key === activeTab)?.label || "Navigate"}
                </span>
                <X className="w-3.5 h-3.5 opacity-50" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-4">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left">{title}</SheetTitle>
              </SheetHeader>
              <div className="space-y-1">
                {tabs.map((t) => (
                  <SheetClose asChild key={t.key}>
                    <div>
                      <TabButton tab={t} />
                    </div>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
