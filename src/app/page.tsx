"use client";

import * as React from "react";
import { useRouter, type Route } from "@/store/router";
import { SiteHeader, SiteFooter } from "@/components/site/shell";
import { ScrollEffects } from "@/components/site/scroll-effects";
import { DirectionEffect } from "@/components/site/direction-effect";
import { HomePage } from "@/components/site/pages/home";
import { TVTHubPage, TVTRolePage } from "@/components/site/pages/tvt";
import { ApplyPage } from "@/components/site/pages/apply";
import { EventsPage } from "@/components/site/pages/events";
import { AlbumPage } from "@/components/site/pages/album";
import { SearchPage } from "@/components/site/pages/search";
import { LoginPage } from "@/components/auth/login-form";
import { AdminDashboard } from "@/components/dashboard/admin";
import { TeacherDashboard } from "@/components/dashboard/teacher";
import { EditorDashboard } from "@/components/dashboard/editor";
import { CompanionDashboard } from "@/components/dashboard/companion";
import { LibraryDashboard } from "@/components/dashboard/library";
import {
  AboutPage,
  RelationsPage,
  ActivitiesPage,
  ClubsPage,
  BooksPage,
  LibraryPage,
  CertificatesPage,
  RegulationsPage,
  RegistrationPage,
  MembershipPage,
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
      return <EventsPage />;
    case "clubs":
      return <ClubsPage />;
    case "album":
      return <AlbumPage />;
    case "books":
      return <BooksPage />;
    case "library":
      return <LibraryPage />;
    case "certificates":
      return <CertificatesPage />;
    case "regulations":
      return <RegulationsPage />;
    case "registration":
      return <RegistrationPage />;
    case "membership":
      return <MembershipPage />;
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
    case "editor":
    case "editor-tab":
      return <EditorDashboard initialTab={route.name === "editor-tab" ? route.tab : "events"} />;
    case "companion":
    case "companion-tab":
      return <CompanionDashboard initialTab={route.name === "companion-tab" ? route.tab : "overview"} />;
    case "library-dashboard":
      return <LibraryDashboard />;
    case "search":
      return <SearchPage initialQuery={route.q} />;
    default:
      return <HomePage />;
  }
}

export default function Home() {
  const route = useRouter((s) => s.route);

  // Update document title based on route
  React.useEffect(() => {
    const titles: Partial<Record<string, string>> = {
      home: "American Space Oujda — A Cultural & Learning Space",
      about: "About · American Space Oujda",
      relations: "Moroccan–American Relations · American Space Oujda",
      activities: "Activities · American Space Oujda",
      events: "Events · American Space Oujda",
      clubs: "Clubs · American Space Oujda",
      album: "Album · American Space Oujda",
      books: "Books & Publications · American Space Oujda",
      library: "Library · American Space Oujda",
      certificates: "Certificates · American Space Oujda",
      regulations: "Internal Regulations · American Space Oujda",
      registration: "Course Registration · American Space Oujda",
      membership: "Membership · American Space Oujda",
      links: "Useful Links · American Space Oujda",
      comments: "Comments & Suggestions · American Space Oujda",
      tvt: "Join Our Team · American Space Oujda",
      apply: "Apply · American Space Oujda",
      login: "Sign In · American Space Oujda",
      admin: "Admin · American Space Oujda",
      teacher: "Teacher · American Space Oujda",
      editor: "Editor · American Space Oujda",
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
      <SiteHeader />
      <main className="flex-1">
        {/* key forces remount + page-enter animation on route change */}
        <div key={route.name + ("tab" in route ? route.tab : "") + ("role" in route ? route.role : "") + ("q" in route ? route.q : "")} className="page-enter">
          <PageRouter route={route} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
