"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type EditorTab } from "@/store/router";
import { DashboardLayout, type DashTab } from "@/components/dashboard/layout";
import { Loader2, PenSquare } from "lucide-react";
import {
  CalendarDays,
  Camera,
  Settings,
} from "lucide-react";
import { EventsTab, GalleryTab, SettingsTab } from "@/components/dashboard/editor-tabs";

const TABS: DashTab[] = [
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "gallery", label: "Gallery", icon: Camera },
  { key: "settings", label: "Site Settings", icon: Settings },
];

export function EditorDashboard({ initialTab = "events" }: { initialTab?: EditorTab }) {
  const { data: session, status } = useSession();
  const navigate = useRouter((s) => s.navigate);
  const [tab, setTab] = React.useState<EditorTab>(initialTab);

  React.useEffect(() => setTab(initialTab), [initialTab]);

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      navigate({ name: "login" });
      return;
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "ADMIN") navigate({ name: "admin" });
    else if (role === "TEACHER") navigate({ name: "teacher" });
  }, [session, status, navigate]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Editor Dashboard"
      pillLabel="Editor"
      pillIcon={PenSquare}
      tabs={TABS}
      activeTab={tab}
      onTabChange={(t) => navigate({ name: "editor-tab", tab: t as EditorTab })}
      baseRoute={{ name: "editor" }}
    >
      {tab === "events" && <EventsTab />}
      {tab === "gallery" && <GalleryTab />}
      {tab === "settings" && <SettingsTab />}
    </DashboardLayout>
  );
}
