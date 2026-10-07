"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, type Route } from "@/store/router";
import { SiteHeader, SiteFooter } from "@/components/site/shell";
import { ScrollEffects } from "@/components/site/scroll-effects";
import { DirectionEffect } from "@/components/site/direction-effect";
import { HomePage } from "@/components/site/pages/home";
import { ActivitiesPage } from "@/components/site/pages/activities";
import { EventDetailPage, ClubDetailPage } from "@/components/site/pages/activity-detail";
import { TVTHubPage, TVTRolePage } from "@/components/site/pages/tvt";
import { ApplyPage } from "@/components/site/pages/apply";
import { SearchPage } from "@/components/site/pages/search";
import { LoginPage } from "@/components/auth/login-form";
import { AdminDashboard } from "@/components/dashboard/admin";
import { TeacherDashboard } from "@/components/dashboard/teacher";
import { CompanionDashboard } from "@/components/dashboard/companion";
import { LibraryDashboard } from "@/components/dashboard/library";
import { InternDashboard } from "@/components/dashboard/intern";
import {
  AboutPage,
  RelationsPage,
  LibraryPage,
  CertificatesPage,
  RegulationsPage,
  RegistrationPage,
  LinksPage,
  CommentsPage,
} from "@/components/site/pages/info";

function PageRouter({ route }: { route: Route }) {
  switch (route.name) {
    case "home":
      return <HomePage />;
    case "about":
      return <AboutPage />;
    case "relations":
      return <RelationsPage />;
    case "activities":
      return <ActivitiesPage />;
    case "events":
    case "clubs":
      // Events and clubs merged into one Activities page; old hashes land there.
      return <ActivitiesPage />;
    case "event-detail":
      return <EventDetailPage id={route.id} />;
    case "club-detail":
      return <ClubDetailPage id={route.id} />;
    case "album":
      // Album is no longer public - old links fall back to the home page.
      return <HomePage />;
    case "library":
    case "books":
      // Library and books merged into one Library page.
      return <LibraryPage />;
    case "certificates":
      return <CertificatesPage />;
    case "regulations":
      return <RegulationsPage />;
    case "registration":
      return <RegistrationPage />;
    case "links":
      return <LinksPage />;
    case "comments":
      return <CommentsPage />;
    case "tvt":
      return <TVTHubPage />;
    case "tvt-role":
      return <TVTRolePage role={route.role} />;
    case "apply":
      return <ApplyPage presetRole={route.role} />;
    case "login":
      return <LoginPage />;
    case "admin":
    case "admin-tab":
      return <AdminDashboard initialTab={route.name === "admin-tab" ? route.tab : "overview"} />;
    case "teacher":
    case "teacher-tab":
      return <TeacherDashboard initialTab={route.name === "teacher-tab" ? route.tab : "courses"} />;
    case "companion":
    case "companion-tab":
      return <CompanionDashboard initialTab={route.name === "companion-tab" ? route.tab : "overview"} />;
    case "library-dashboard":
      return <LibraryDashboard />;
    case "intern":
    case "intern-tab":
      return <InternDashboard initialTab={route.name === "intern-tab" ? route.tab : "events"} />;
    case "search":
      return <SearchPage initialQuery={route.q} />;
    default:
      return <HomePage />;
  }
}

// Dashboard routes run fullscreen: the public site chrome is hidden,
// but a "View site" button stays available inside each dashboard.
const DASHBOARD_ROUTES = new Set([
  "admin",
  "admin-tab",
  "teacher",
  "teacher-tab",
  "editor",
  "editor-tab",
  "library-dashboard",
  "intern",
  "intern-tab",
  "companion",
  "companion-tab",
]);

// Heartbeat: marks signed-in staff as online for the admin overview.
function PresenceHeartbeat() {
  const { data: session, status } = useSession();
  React.useEffect(() => {
    if (status !== "authenticated") return;
    const ping = () => fetch("/api/presence", { method: "POST" }).catch(() => {});
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [status, session]);
  return null;
}

export default function Home() {
  const route = useRouter((s) => s.route);
  const isDashboard = DASHBOARD_ROUTES.has(route.name);

  // Update document title based on route
  React.useEffect(() => {
    const titles: Partial<Record<string, string>> = {
      home: "American Space Oujda - A Cultural & Learning Space",
      about: "About · American Space Oujda",
      relations: "Moroccan-American Relations · American Space Oujda",
      activities: "Activities · American Space Oujda",
      "event-detail": "Event · American Space Oujda",
      "club-detail": "Club · American Space Oujda",
      events: "Activities · American Space Oujda",
      clubs: "Activities · American Space Oujda",
      album: "American Space Oujda",
      books: "Library · American Space Oujda",
      library: "Library · American Space Oujda",
      certificates: "Certificates · American Space Oujda",
      regulations: "Internal Regulations · American Space Oujda",
      registration: "Course Registration · American Space Oujda",
      links: "Useful Links · American Space Oujda",
      comments: "Comments & Suggestions · American Space Oujda",
      tvt: "Join Our Team · American Space Oujda",
      apply: "Apply · American Space Oujda",
      login: "Sign In · American Space Oujda",
      admin: "Admin · American Space Oujda",
      teacher: "Teacher · American Space Oujda",
      intern: "Intern · American Space Oujda",
      companion: "ELTASO Companion · American Space Oujda",
      "library-dashboard": "Library · American Space Oujda",
      search: "Search · American Space Oujda",
    };
    document.title = titles[route.name] || "American Space Oujda";
  }, [route]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollEffects />
      <DirectionEffect />
      <PresenceHeartbeat />
      {!isDashboard && <SiteHeader />}
      <main className="flex-1">
        {/* key forces remount + page-enter animation on route change */}
        <div key={route.name + ("tab" in route ? route.tab : "") + ("role" in route ? route.role : "") + ("q" in route ? route.q : "")} className="page-enter">
          <PageRouter route={route} />
        </div>
      </main>
      {!isDashboard && <SiteFooter />}
    </div>
  );
}
