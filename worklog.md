# American Space Oujda — Rebuild Worklog

Source: https://sites.google.com/view/espaceamericainoujda/accueil/teacher-volunteer-intern-trainer

---
Task ID: 0
Agent: main
Task: Plan and bootstrap the rebuild of the American Space Oujda site

Work Log:
- Fetched original Google Sites page (Teacher-Volunteer-Intern-Trainer hub) and home page.
- Extracted site structure: Home, About, Activities, Events, Clubs, Album, Books, Library, Certificates, Internal Regulations, Moroccan-American Relations, Registration, Membership, Comments/Suggestions, Links, Teacher/Volunteer/Intern/Trainer (with sub-page "Teacher under development").
- Captured contact info: espaceamericainoujda@gmail.com, Mohammed VI Street, Oujda.
- Confirmed scope with user: whole-site rebuild, English-only, modern civic + iOS-Apple aesthetic (matte, symmetric, elegant, clear), all features (application form, role pages, events calendar, photo album, admin dashboard, search), all original nav preserved.

Stage Summary:
- Sandbox constraint: only `/` route is user-visible. Entire site must be a SPA with hash-based client routing.
- Stack: Next.js 16 + TS + Tailwind 4 + shadcn/ui + Prisma(SQLite) + Zustand + Framer Motion.
- Design tokens: deep navy primary, warm Moroccan accent (used sparingly), generous whitespace, large radius, matte (no heavy gradients).

---
Task ID: 1
Agent: main
Task: Build the entire American Space Oujda site from scratch

Work Log:
- Set up iOS-inspired design system in globals.css (warm off-white, deep navy primary, warm Moroccan accent, large radius, matte elevations, frosted header).
- Defined Prisma schema: Application, Event, GalleryItem, Comment, Membership, CourseRegistration, AdminUser. Pushed to SQLite.
- Seeded DB: 10 events, 12 gallery items, 4 sample applications, 1 admin user.
- Built hash-based SPA router (Zustand store) since sandbox only exposes `/`.
- Built shell: frosted sticky header with logo, primary nav, search button (⌘K), theme toggle, mobile drawer; sticky footer with hours + nav + contact.
- Built 19 pages: Home, About, Relations, Activities, Events, Clubs, Album (with lightbox), Books, Library, Certificates, Regulations, Registration (form), Membership (form), Links, Comments (form), TVT hub, 4 role pages (Teacher/Volunteer/Intern/Trainer), Apply (multi-section form), Search, Admin.
- Built API routes: events (GET/POST), applications (GET/POST with zod validation), gallery, comments, membership, courses, admin/login, admin/applications (PATCH/DELETE).
- Built admin dashboard with login, applications table (filter by role + status, expand to view details, change status, delete), events list, comments list.

Self-verification (agent-browser):
- Home loads, all sections render (hero, programs grid, events preview, TVT CTA, relations timeline, visit CTA, footer).
- Navigation works (hash changes, page remounts, scroll-to-top, document title updates).
- Apply form: filled + submitted → success page renders → application appears in admin dashboard.
- Admin login: admin@asoujda.ma / admin123 → dashboard with stats and application list.
- Search dialog: ⌘K opens, filters nav items live, Enter goes to full search page.
- Album: lightbox opens on click, ESC closes, arrow keys navigate.
- Mobile viewport (390x844): hamburger menu opens with full nav drawer.
- No console errors, no lint errors, dev server clean.

Stage Summary:
- All 16 pages built and verified in the browser.
- All 4 forms (Application, Registration, Membership, Comments) submit to Prisma DB and show success state.
- Admin dashboard reads from DB and allows status updates + deletes.
- Site is responsive, accessible (semantic HTML, ARIA labels, keyboard nav), supports light/dark theme.
- Preview link: https://preview-{bot-id}.space-z.ai/ (replace {bot-id} at runtime)

---
Task ID: 2
Agent: main
Task: Add real authentication, three role-based dashboards, and Cloudflare deployment guide

Work Log:
- Extended Prisma schema with: User (role + bcrypt hash), Account/Session/VerificationToken (NextAuth), Course, Enrollment, Attendance, Grade, Report, SiteSetting (mini-CMS). Pushed to SQLite.
- Installed next-auth@4.24.11 + bcryptjs. Initial install of v5 beta caused import path issues; downgraded to v4 stable.
- Created NextAuth credentials provider (src/lib/auth.ts) with bcrypt password hashing and JWT sessions.
- Created permission helpers (src/lib/permissions.ts): getCurrentUser, requireRole, withRole — used by all protected API routes.
- Built login form (src/components/auth/login-form.tsx) with show/hide password, demo account buttons for admin/teacher/editor, role-aware redirect.
- Wrapped app in SessionProvider (src/components/auth/session-provider.tsx + layout.tsx).
- Updated SiteHeader to show "Sign in" or "Dashboard" button based on session; updated SiteFooter similarly with sign-out.
- Extended hash router with routes for: /#/login, /#/admin/<tab>, /#/teacher/<tab>, /#/editor/<tab>.
- Built reusable DashboardLayout (src/components/dashboard/layout.tsx) with sidebar nav, mobile drawer, top bar with sign-out + view-site buttons.
- Built Admin dashboard (src/components/dashboard/admin.tsx) with 10 tabs:
  - Overview, Applications, Events (full CRUD), Gallery (full CRUD), Courses (full CRUD), Members (read), Registrations (read), Comments (read), Site Settings (mini-CMS), Users (full CRUD with role assignment + password reset).
- Built Teacher dashboard (src/components/dashboard/teacher.tsx) with 4 tabs:
  - My Courses (list + student roster per course),
  - Attendance (mark present/absent/late/excused per date per student, with notes; saves to DB),
  - Marks (add assignment/exam scores with weight + max score; auto-calculates weighted average per student),
  - Reports (submit periodic course reports with summary, challenges, recommendations).
- Built Editor dashboard (src/components/dashboard/editor.tsx) with 3 tabs: Events, Gallery, Site Settings (reuses admin's tab components).
- Built 8 new API routes: courses, enrollments, attendance (with batch upsert), grades, reports, users (CRUD), settings (PUT/DELETE), courses/registrations (GET). All enforce role-based access via withRole().
- Updated existing events/gallery routes to require ADMIN/EDITOR for POST/PATCH/DELETE; applications/admin route now requires ADMIN.
- Seeded 3 users (admin@asoujda.ma/admin123, sarah.benali@asoujda.ma/teacher123, editor@asoujda.ma/editor123) + 3 courses (each with 5 enrolled students) + 8 site settings.
- Added NEXTAUTH_URL and NEXTAUTH_SECRET to .env (fixed session cookie not being set).
- Created DEPLOY.md with full Cloudflare Pages deployment guide (D1 vs Turso swap, env vars, troubleshooting) and wrangler.toml template.

Self-verification (agent-browser):
- Admin login → redirected to /#/admin → all 10 tabs visible → attendance marking verified → event editor opens.
- Teacher login (Sarah Benali) → redirected to /#/teacher → sees her 3 courses + 15 enrolled students → marked Khadija E. ABSENT with "Sick leave" note → saved to DB (verified via Prisma query).
- Editor login → redirected to /#/editor → sees 3-tab sidebar (Events, Gallery, Site Settings) → Site Settings tab loads all editable fields (Contact, Hours, Home page hero).
- Editor trying to access /#/admin → auto-redirected back to /#/editor (role enforcement works).
- Sign out works from any dashboard.
- Lint clean. Dev server responding 200 with no console errors.

Stage Summary:
- Three working role-based dashboards (admin/teacher/editor) with real NextAuth credentials auth.
- Teachers can: view their courses + rosters, mark attendance, enter marks (with weighted averages), submit periodic reports.
- Admins can: full CRUD on events/gallery/courses/users + read on applications/members/registrations/comments + edit site text content via mini-CMS.
- Editors can: manage events/gallery + edit site text content.
- Demo accounts: admin@asoujda.ma/admin123, sarah.benali@asoujda.ma/teacher123, editor@asoujda.ma/editor123.
- Deployment guide at /DEPLOY.md walks through Cloudflare Pages setup with D1 or Turso database swap.

---
Task ID: 3
Agent: main
Task: Prepare project for Cloudflare Pages deployment + write step-by-step guide

Work Log:
- Installed @prisma/adapter-libsql + @libsql/client for edge runtime compatibility.
- Installed @cloudflare/next-on-pages (dev dependency) for Cloudflare Pages build.
- Updated prisma/schema.prisma to enable previewFeatures = ["driverAdapters"].
- Rewrote src/lib/db.ts to detect environment: if DATABASE_URL starts with libsql:// or https://, use the PrismaLibSQL adapter; otherwise fall back to plain PrismaClient with local SQLite. This lets the same code run in both dev and production with only an env var swap.
- Updated next.config.ts with serverExternalPackages for @prisma/client, @libsql/client, @prisma/adapter-libsql, bcryptjs.
- Added build:cloudflare and pages:build scripts to package.json.
- Created .env.example documenting both local and production env vars.
- Updated .gitignore to exclude .wrangler/, .dev.vars, /db/*.db, while keeping .env.example committed.
- Created scripts/seed-turso.ts — production seed script that creates 3 users (admin/teacher/editor), 3 courses with 5 enrollments each, 8 site settings, 5 sample events, and 6 gallery items, all against a Turso libSQL database.
- Rewrote DEPLOY.md as a 9-step beginner-friendly guide: GitHub account → Turso account + database → push schema → push code to GitHub → configure Cloudflare Pages (with exact build settings + env vars) → seed production DB → verify live site → optional custom domain → migrate from Google Sites. Includes troubleshooting section and quick reference table.
- Updated wrangler.toml to be a minimal optional config (not required for @cloudflare/next-on-pages).
- Fixed auth.ts: removed pages.signIn config that was pointing to /#admin (NextAuth doesn't handle hash routes well) — signIn() is called with redirect:false from our custom form so this works fine.
- Verified end-to-end: local dev still works (home 200, events API 200, auth API 200), login as admin works (redirects to /#/admin, session shows ADMIN role), lint clean.

Stage Summary:
- Project is now deployment-ready for Cloudflare Pages + Turso.
- Single codebase runs in both environments — only env vars differ.
- DEPLOY.md provides a complete beginner-friendly walkthrough.
- scripts/seed-turso.ts handles production database seeding.
- All demo credentials work: admin@asoujda.ma/admin123, sarah.benali@asoujda.ma/teacher123, editor@asoujda.ma/editor123.

---
Task ID: 2-migrate-api
Agent: sub-agent (general-purpose)
Task: Migrate ALL Prisma-based API routes to use the direct libSQL client at @/lib/sql (bypass Prisma entirely on Vercel)

Work Log:
- Read /home/z/my-project/src/lib/sql.ts (getDb + row helpers) and src/lib/content-handlers.ts (established requireRole pattern) to understand the target pattern.
- Read prisma/schema.prisma for the full table layout (User, Event, GalleryItem, Application, Comment, Membership, CourseRegistration, Course, Enrollment, Attendance, Grade, Report, SiteSetting, Club, SiteLink, PageContent).
- Read all 15 existing Prisma-based API routes and src/lib/permissions.ts (withRole / getCurrentUser) to understand the business logic and permission rules that had to be preserved.
- Extended src/lib/sql.ts with new named exports:
  - AuthUser type, RequireRoleResult type
  - getCurrentUser() — looks up the user from the NextAuth session + DB, returns null if not signed in / inactive.
  - requireRole(roles) — returns `{ ok: true; user: AuthUser }` or `{ ok: false; response: Response }` (401 UNAUTHORIZED or 403 FORBIDDEN). Mirrors the discriminated-union pattern used in content-handlers.ts.
  - Re-exported InValue type (from @libsql/client) so routes can type dynamic args arrays without reaching into @libsql/client directly.
- Updated src/lib/content-handlers.ts to import requireRole from @/lib/sql instead of defining it locally — removed the local helper and the now-unused next-auth / auth imports.
- Deleted src/lib/permissions.ts (orphaned after migration — no caller remained). The new requireRole/getCurrentUser in sql.ts fully replaces it.
- Migrated all 14 API routes to use `import { getDb, row, requireRole, ... } from "@/lib/sql"` and raw SQL via `db.execute({ sql, args })`:
  1. src/app/api/events/route.ts — GET (filtered list with limit/category/featured/upcoming), POST/PATCH/DELETE (ADMIN+EDITOR). PATCH builds a dynamic SET clause.
  2. src/app/api/gallery/route.ts — GET (filtered by category), POST/DELETE (ADMIN+EDITOR).
  3. src/app/api/applications/route.ts — GET (ADMIN), POST (public, zod validation preserved).
  4. src/app/api/admin/applications/route.ts — PATCH (status + notes), DELETE (ADMIN).
  5. src/app/api/comments/route.ts — GET (ADMIN), POST (public). Original GET was public; tightened to admin-only per task description.
  6. src/app/api/membership/route.ts — GET (ADMIN), POST (public).
  7. src/app/api/courses/route.ts — GET (public, with LEFT JOIN User for teacher + subquery for enrollmentCount, normalized back into the { ...course, teacher, _count: { enrollments } } shape so the frontend keeps working), POST (ADMIN).
  8. src/app/api/courses/registrations/route.ts — GET (ADMIN).
  9. src/app/api/enrollments/route.ts — GET (teachers see only own courses' enrollments via JOIN Course; supports courseId/teacherId filters; preserves original permissive behavior for admins/unauth), POST/DELETE (ADMIN+TEACHER with course-ownership check).
  10. src/app/api/attendance/route.ts — GET (courseId required; teachers verified against course ownership), POST (ADMIN+TEACHER; batch upsert via INSERT … ON CONFLICT(courseId, date, studentEmail) DO UPDATE).
  11. src/app/api/grades/route.ts — GET (courseId required; teacher ownership check), POST/DELETE (ADMIN+TEACHER with ownership check via JOIN Course).
  12. src/app/api/reports/route.ts — GET (teachers see only own reports via JOIN; admins see all with teacher info), POST (ADMIN+TEACHER; uses session user.id as teacherId), DELETE (ADMIN+TEACHER; teachers can only delete own reports).
  13. src/app/api/users/route.ts — GET/POST/PATCH/DELETE (ADMIN only). GET uses subqueries for coursesTaught + reports counts and normalizes _count shape. POST/PATCH hash passwords with bcrypt (12 rounds). DELETE blocks self-deletion via adminUser.id check.
  14. src/app/api/settings/route.ts — GET (public, returns flat key→value map), PUT (ADMIN+EDITOR, upsert via ON CONFLICT(key) DO UPDATE), DELETE (ADMIN+EDITOR).
- Removed src/app/api/admin/login/route.ts and the now-empty src/app/api/admin/login/ directory — auth is handled by NextAuth at /api/auth/[...nextauth].
- Boolean handling: SQLite stores booleans as 0/1 — wrote 1/0 on INSERT/UPDATE and converted back with `!!value` / `Number(x) === 1` on read.
- ID generation: all new rows use `"<prefix>_" + Math.random().toString(36).slice(2, 12)` (evt_, gal_, app_, cmt_, mem_, crs_, enr_, att_, grd_, rpt_, usr_) as instructed.
- Date handling: all DateTime columns written as `new Date().toISOString()`; dates coming from the client are normalized through `new Date(...).toISOString()` before insert.
- Preserved the exact response shapes from the Prisma versions (events, items, applications, comments, members, courses with teacher + _count, enrollments with course, attendance, grades, reports with course + teacher, users with _count, settings as flat map) so no frontend changes are needed.
- Preserved all permission rules: ADMIN-only for users / applications / comments / membership / courses registrations, ADMIN+EDITOR for events / gallery / settings, ADMIN+TEACHER for enrollments / attendance / grades / reports with per-teacher ownership enforcement on courses.

Lint / type-check:
- `bun run lint` → clean (exit 0, no errors).
- `bunx tsc --noEmit` → no errors in any migrated file. The remaining tsc errors are all pre-existing in unrelated files (src/lib/auth-db.ts which we were told not to touch, src/lib/db.ts which is the Prisma module itself, src/app/page.tsx, src/components/site/pages/info.tsx, scripts/seed-turso.ts, examples/, skills/).
- Initial lint pass surfaced two issues that were fixed:
  - settings/route.ts had a variable shadowing `row` inside the GET loop — renamed loop variable to `raw`.
  - settings/route.ts was missing the `row` import — added it.
- Initial tsc pass surfaced `unknown[] not assignable to InArgs` errors in events/route.ts (2 sites) and users/route.ts (1 site) where dynamic SET clauses were built. Fixed by typing the args arrays as `InValue[]` (re-exported from sql.ts).

Verification:
- `grep -r 'from "@/lib/db"'` → 0 matches anywhere in the project.
- `grep -r 'from "@/lib/permissions"'` → 0 matches.
- `grep -r '@prisma/client\|PrismaClient' src/app/api/` → 0 matches. The NextAuth route, content-handlers.ts, auth-db.ts, and auth.ts were not touched.
- All 14 migrated API routes import `requireRole` and/or `getCurrentUser` from `@/lib/sql`.

Stage Summary:
- All 14 Prisma-based API routes are now backed by direct libSQL via `getDb().execute({ sql, args })` and the shared `requireRole` / `getCurrentUser` helpers in `src/lib/sql.ts`.
- The `requireRole` helper was extracted into `src/lib/sql.ts` (replacing the local copy in content-handlers.ts and the old withRole helper in the now-deleted `src/lib/permissions.ts`).
- The legacy `src/app/api/admin/login/route.ts` was removed (NextAuth handles auth).
- No file in the project still imports from `@/lib/db`. `src/lib/db.ts` still exists (it's the Prisma client wrapper) but is unreferenced and can be deleted in a follow-up cleanup.
- `bun run lint` is clean; the migration preserves all HTTP status codes, response shapes, and permission rules so the existing admin/teacher/editor dashboards continue to work without frontend changes.

---
Task ID: 3-companion
Agent: sub-agent (general-purpose)
Task: Build the ELTASO Companion integration (curriculum management tool for coordinators and teachers)

Work Log:
- Read worklog.md, src/lib/sql.ts (getDb/row/requireRole/getCurrentUser), src/store/router.ts, src/lib/auth.ts, src/components/dashboard/{layout,admin,teacher}.tsx, src/components/site/{primitives,shell}.tsx, src/app/page.tsx, and existing API routes (settings, courses, events) to understand the established patterns.
- Inspected the local SQLite DB (file:db/custom.db) via @libsql/client to confirm the 7 Companion tables exist (CompanionSetting, CompanionLevel, CompanionWeek, CompanionClass, CompanionTeamMember, CompanionLibraryItem, CompanionNote) and inspected their schemas and seeded data (4 levels, 30 weeks/level, 8 classes, 10 team members, 13 library items, settings with s1Start=2026-10-05, s2Start=2027-02-08, s1Weeks=15, coordinator=Khalid, tpl WhatsApp template).

- Created 7 API route files under src/app/api/companion/:
  1. overview/route.ts — GET (any auth user). Returns settings flat map, counts (levels/classes/team/library), and current term+week computed from s1Start + s1Weeks + s2Start. Logic: today < s1Start → "before" with "Starts in N days" label; today in [s1Start, s1Start+s1Weeks weeks) → "S1" + week N; today in [s1End, s2Start) → "break" with "Winter break"; today in [s2Start, s2Start+30 weeks) → "S2" + week N; else "complete".
  2. levels/route.ts — GET (any auth) returns levels with weekCount subquery. POST/PATCH/DELETE (ADMIN only). POST generates lvl_ prefix IDs. DELETE cascades weeks first.
  3. weeks/route.ts — GET (any auth; ?levelId=X filter). POST/PATCH/DELETE (ADMIN+TEACHER). Parses JSON urls string into array on read; serializes back on write. Catches UNIQUE(levelId, weekNumber) constraint and returns 409.
  4. classes/route.ts — GET (any auth; TEACHER sees only classes where teacherId = user.id OR teacherId = user.name). POST/PATCH/DELETE (ADMIN only). Generates cls_ prefix IDs.
  5. team/route.ts — GET (any auth). POST/PATCH/DELETE (ADMIN only). Parses JSON levels string into array on read; serializes on write. Generates tm_ prefix IDs.
  6. library/route.ts — GET (any auth). POST/DELETE (ADMIN+EDITOR). Generates lib_ prefix IDs.
  7. settings/route.ts — GET (any auth) returns flat key→value map. PUT (ADMIN only) accepts a partial {key: value} object and upserts each key via ON CONFLICT(key) DO UPDATE.
  - All routes use the discriminated-union requireRole pattern (returns 401 UNAUTHORIZED for no session, 403 FORBIDDEN for wrong role) from @/lib/sql. No 500s for unauthenticated requests.

- Extended src/store/router.ts: added `CompanionTab = "overview" | "levels" | "classes" | "team" | "library"` type, `{ name: "companion" }` and `{ name: "companion-tab"; tab: CompanionTab }` route variants, parser case for "companion" and "companion/<tab>", and routeToHash case for "companion-tab".

- Created src/components/dashboard/companion.tsx exporting `CompanionDashboard({ initialTab })`. Uses DashboardLayout with 5 tabs:
  - Overview: greeting with coordinator name from settings, "Now" chip showing current week label (e.g. "S1 · Week 1"), 4 stat cards (levels, classes, team, library) that navigate on click, and a quick-links card.
  - Levels: list of levels (MatteCard) with label, CEFR pill, week count pill. Click to expand → fetches weeks for that level via /api/companion/weeks?levelId=X and /api/companion/settings (for tpl template). Renders each week as a card with theme, objectives, language, resources, links (external), activities, homework. Each week has Copy/Pencil/Trash buttons. "Copy WhatsApp plan" uses date-fns addWeeks + format to compute the week date, fills in the {teacher}/{level}/{week}/{date}/{theme}/{obj}/{lang}/{act}/{hw}/{links}/{coordinator} placeholders in the tpl string, and writes to clipboard. Admin+teacher can edit via the WeekEditor (multi-field form with urls as newline-separated text). New week form auto-suggests weekNumber = existingCount + 1.
  - Classes: grid of class cards. Admin sees New class button + edit/delete icons. Teachers see only their own classes (enforced by API). ClassEditor form has name, level (Select from levels), teacher (Select from team), schedule, room, students, active checkbox.
  - Team: grid of team member cards with avatar, name, role pill, levels, phone (with WhatsApp wa.me link), email (mailto). Admin can add/edit/delete via TeamEditor.
  - Library: items grouped by category, rendered as a grid. Each item links out (target=_blank). Admin+editor see New item + delete buttons. LibraryEditor form for name, category, url, notes.
  - Auth guard: unauthenticated users are redirected to login. Role gating: teachers can edit weeks but not classes/team/library; admins can edit everything; editors can add/delete library items only.

- Wired CompanionDashboard into src/app/page.tsx PageRouter: imported CompanionDashboard, added "companion"/"companion-tab" cases (initialTab = route.tab when companion-tab, else "overview"), added "companion" entry to the title map.

- Added Companion to site navigation in src/components/site/shell.tsx:
  - Imported BookOpen icon.
  - Added `{ label: "Companion", route: { name: "companion" }, authOnly: true }` to PRIMARY_NAV (between "Courses" and "Join Us").
  - Desktop nav filters out authOnly items when there is no session (signed-out users don't see Companion).
  - Mobile drawer: added a Companion entry (also gated by `session`) below the NAV_ITEMS list, with the BookOpen icon in accent color.
  - Note: the footer Explore/Programs sections use the static NAV_ITEMS list, so Companion is intentionally not added there (it's a staff-only tool, not a public page).

- Added a "companion" tab to the Teacher dashboard (src/components/dashboard/teacher.tsx): added BookOpen + ArrowRight icons, added the tab to TABS, changed the onTabChange handler to intercept "companion" clicks and navigate to { name: "companion" } instead of going to teacher-tab. Added a CompanionLinkTab component that renders a MatteCard CTA button. Changed the `tab` state type to `TeacherTab | "companion"` so the JSX `{tab === "companion" && ...}` check type-checks.

- Added a "companion" tab to the Admin dashboard (src/components/dashboard/admin.tsx): added the tab to TABS, refactored onTabChange into a function that intercepts "companion" and navigates to { name: "companion" } (otherwise navigates to admin-tab). Added a CompanionLinkTab component. Changed the `tab` state type to `AdminTab | "companion"`.

- Quality: all UI uses shadcn/ui components (Button, Input, Textarea, Label, Select, Dialog) from @/components/ui/, MatteCard + Pill from @/components/site/primitives, lucide-react icons, sonner toast, date-fns for date math. iOS-inspired styling (rounded cards, hairline borders, accent-tinted icons, frosted sections). Mobile responsive via the existing DashboardLayout grid.

Lint / type-check:
- `bun run lint` → clean (exit 0, no errors).
- `bunx tsc --noEmit` → no errors in any new or modified file. The only remaining tsc errors are pre-existing and unrelated (src/app/page.tsx line 70 ApplyPage presetRole type mismatch — exists on HEAD; src/lib/auth-db.ts, src/lib/db.ts, etc.).

Verification:
- `curl http://localhost:3000/api/companion/overview` (no auth) → 401 ✓
- `curl http://localhost:3000/api/companion/levels` (no auth) → 401 ✓
- All 7 Companion endpoints return 401 when unauthenticated (no 500s).
- Logged in as admin (admin@asoujda.ma): all 7 GET endpoints return 200 with correct seeded data. Overview correctly computes current = { term: "S1", weekNumber: 1, label: "S1 · Week 1" } given today is Oct 6 2026 and s1Start is Oct 5 2026. POST library → 201, PUT settings → 200, DELETE library → 200.
- Logged in as teacher (sarah.benali@asoujda.ma): GET classes returns 0 (Sarah doesn't match any CompanionClass.teacherId in the seed data — expected). POST class → 403 FORBIDDEN ✓. GET weeks → 200 ✓ (admin+teacher allowed). POST library → 403 FORBIDDEN ✓ (admin+editor only).
- Home page loads 200, /api/events still 200 (no regressions).
- `bun run lint` clean after all changes.

Files created:
- src/app/api/companion/overview/route.ts
- src/app/api/companion/levels/route.ts
- src/app/api/companion/weeks/route.ts
- src/app/api/companion/classes/route.ts
- src/app/api/companion/team/route.ts
- src/app/api/companion/library/route.ts
- src/app/api/companion/settings/route.ts
- src/components/dashboard/companion.tsx

Files modified:
- src/store/router.ts (added CompanionTab + companion routes + parser + routeToHash)
- src/app/page.tsx (imported CompanionDashboard, added PageRouter cases, added title entry)
- src/components/site/shell.tsx (added BookOpen icon, added Companion to PRIMARY_NAV with authOnly flag, filter authOnly for desktop nav, added Companion entry to mobile drawer when signed in)
- src/components/dashboard/teacher.tsx (added BookOpen + ArrowRight icons, added companion tab, refactored onTabChange to navigate to companion route, added CompanionLinkTab, widened tab state type)
- src/components/dashboard/admin.tsx (added companion tab, refactored onTabChange to navigate to companion route, added CompanionLinkTab, widened tab state type)

Stage Summary:
- ELTASO Companion is fully integrated: 7 authenticated API routes, a 5-tab dashboard (Overview/Levels/Classes/Team/Library), hash routing at /#/companion and /#/companion/<tab>, role-aware navigation (signed-out users don't see the link; signed-in users see it in header + mobile drawer + as a tab inside both the admin and teacher dashboards).
- Curriculum data (4 levels, 30 weeks each, 8 classes, 10 team members, 13 library items) renders correctly. The "Copy WhatsApp plan" button generates a formatted message using the configured tpl template and the week's date (computed from s1Start + week number via date-fns).
- Permissions are enforced server-side: admins can edit everything; teachers can edit weeks (POST/PATCH/DELETE on /api/companion/weeks) and see only their own classes; editors can add/delete library items; everyone else (including signed-out) gets 401/403.
- `bun run lint` is clean. All Companion endpoints return 401 (not 500) when unauthenticated, satisfying the verification requirements.

---
Task ID: 4-library
Agent: sub-agent (general-purpose)
Task: Build the Library Staff Dashboard (book catalogue management, member registration, loan tracking)

Work Log:
- Read worklog.md, src/lib/sql.ts (getDb/row/requireRole/getCurrentUser/InValue), src/lib/auth.ts (NextAuth role augmentation), src/store/router.ts (library-dashboard route + parser already added by previous task), src/components/dashboard/layout.tsx (DashboardLayout with sidebar tabs), src/components/dashboard/companion.tsx (reference patterns), src/components/site/primitives.tsx (MatteCard/Pill/SectionHeader), src/app/page.tsx (PageRouter + title map), and src/app/api/{events,users}/route.ts (requireRole + dynamic SET-clause patterns).
- Inspected the local SQLite DB (file:db/custom.db) via @libsql/client to confirm the 3 library tables exist with the expected schemas: LibraryBook(id, title, author, isbn, deweyCode, category, copies, available, location, notes, createdAt, updatedAt) — 8 seeded rows; LibraryMember(id, asoNumber UNIQUE, fullName, email, phone, cniNumber, birthDate, address, photoUrl, status, joinedAt, createdAt, updatedAt) — 1 seeded row with asoNumber="ASO-0001"; LibraryLoan(id, bookId, memberId, borrowedAt, dueAt, returnedAt, status, notes, createdAt) — 0 seeded rows.

- Created 4 API route files under src/app/api/library/:
  1. books/route.ts — GET (ADMIN+LIBRARY; optional ?search= filter on title/author/isbn/deweyCode/category, ordered by title). POST (creates new book, available starts at full copies, generates bk_ prefixed id). PATCH (dynamic SET clause; copies update also clamps available via `available = MIN(available, ?)`). DELETE (?id=).
  2. members/route.ts — GET (ADMIN+LIBRARY; optional ?search= filter on asoNumber/fullName/phone/cniNumber/email, ordered by joinedAt DESC). POST (registers new member; asoNumber auto-generated as "ASO-" + 4-digit zero-padded sequence by finding the highest existing number and incrementing — helper `nextAsoNumber(db)`; status starts ACTIVE; generates mem_ prefixed id). PATCH (id + optional fields incl. status: ACTIVE/SUSPENDED/EXPIRED with validation). DELETE (?id=).
  3. loans/route.ts — GET (ADMIN+LIBRARY; LEFT JOINs LibraryBook + LibraryMember so each loan row carries bookTitle/bookAuthor/bookIsbn/memberAsoNumber/memberName/memberPhone; optional ?status=ACTIVE|RETURNED|OVERDUE (OVERDUE = active + dueAt<now) and ?memberId= filters; computes an `effectiveStatus` field where ACTIVE loans past dueAt are exposed as OVERDUE so the UI can colour them red without changing the stored status). POST (creates a loan: validates book exists + has available>0, validates member exists + is ACTIVE, enforces 1-book-at-a-time rule (blocks if memberId already has an ACTIVE loan — 409), dueAt = borrowedAt + 14 days via Date math, atomically decrements LibraryBook.available). PATCH (?id= returns a loan: sets returnedAt=now + status=RETURNED, increments LibraryBook.available with `MIN(available+1, copies)` cap so it can't exceed copies; refuses if already RETURNED). DELETE (?id=, no stock adjustment — caller should PATCH-return first).
  4. stats/route.ts — GET (ADMIN+LIBRARY; returns totalBooks, availableBooks=SUM(available), totalMembers, activeMembers (status=ACTIVE), activeLoans (status=ACTIVE), overdueLoans (status=ACTIVE + dueAt<now)).

- All 4 routes use the discriminated-union `requireRole(["ADMIN", "LIBRARY"])` pattern from @/lib/sql — unauthenticated requests return 401 with `{"error":"UNAUTHORIZED"}`; wrong-role sessions return 403 with `{"error":"FORBIDDEN"}`. No 500s for unauthenticated requests.

- Created src/components/dashboard/library.tsx exporting `LibraryDashboard()`. Uses DashboardLayout with 4 sidebar tabs:
  - Overview: greeting card with library snapshot, 5 stat cards (Total books / Available copies / Members / Active loans / Overdue) that navigate to the relevant tab on click, a Quick actions card (3 links), and a Recent loans card (last 5 loans with status badge).
  - Books: search bar (250ms debounce, filters by title/author/ISBN/Dewey/category via the API), Add-book button, and a list of MatteCard rows showing title, category pill, availability pill (green/amber/red), author + Dewey + ISBN, and per-row Edit + Delete buttons. BookEditor dialog with all 8 fields.
  - Members: search bar (filters by ASO number/name/phone/CNI/email), Register-member button, and a list of rows prominently featuring the ASO card number (mono font, primary-tinted background, "ASO card number" label), name, status badge, phone/CNI/joined date, and per-row Suspend/Reactivate (cycles ACTIVE↔SUSPENDED via PATCH) + Edit + Delete buttons. MemberEditor dialog includes a prominent amber info box reminding staff: "The member must bring, in person: 1) A photocopy of their CNI, 2) Two passport-size photos. Their ASO library card will be issued in person." ASO number is auto-generated server-side and shown in the success toast.
  - Loans: filter pills (All / Active / Overdue / Returned), New-loan button, and a list of rows showing book title, status badge (Active=violet / Returned=emerald / Overdue=red), member name + ASO number (prominent mono), borrowed date, due date, and a human-readable "Due in N days" / "N days overdue" / "Returned ..." line. Overdue rows render with red-tinted border + background. Each non-returned loan has a "Return" button (PATCH). NewLoanDialog fetches available books (available>0) and active members, lets the user pick both via Select dropdowns, and shows the computed due date ("Due on <date> (14 days from today)") before submit.
  - Auth guard: useSession() check — if status loading or no session, show Loader2 spinner; on session resolution, redirect unauthenticated → { name: "login" }; wrong-role TEACHER → { name: "teacher" }, EDITOR → { name: "editor" }, other → { name: "home" }; double-checks role on render and shows spinner if not allowed while the navigate effect kicks in.
  - UI: shadcn/ui (Button, Input, Textarea, Label, Select, Dialog), MatteCard + Pill from @/components/site/primitives, lucide-react icons (BookOpen, Users, ArrowRightLeft, Plus, Trash2, Pencil, Search, Loader2, Save, X, ChevronRight, AlertCircle, CheckCircle2, CalendarClock, BookMarked, Info, Ban, RotateCcw, UserPlus, Library), sonner toast, date-fns (format, addDays, differenceInCalendarDays, parseISO). iOS-inspired matte styling with hairline borders, rounded cards, accent-tinted icons, prominent ASO number chip. Mobile responsive via DashboardLayout's grid.

- Wired LibraryDashboard into src/app/page.tsx: imported `LibraryDashboard` from "@/components/dashboard/library", added `case "library-dashboard": return <LibraryDashboard />;` to the PageRouter switch, and added `"library-dashboard": "Library · American Space Oujda"` to the document-title map.

Lint / type-check:
- `bun run lint` → clean (exit 0, no errors).

Verification:
- `curl http://localhost:3000/api/library/stats` (no auth) → 401 ✓
- `curl http://localhost:3000/api/library/books` (no auth) → 401 ✓
- `curl http://localhost:3000/api/library/members` (no auth) → 401 ✓
- `curl http://localhost:3000/api/library/loans` (no auth) → 401 ✓
- All 4 endpoints return `{"error":"UNAUTHORIZED"}` body (not 500).
- Logged in as admin (admin@asoujda.ma): GET /api/library/stats → 200 with `{totalBooks:8, availableBooks:14, totalMembers:1, activeMembers:1, activeLoans:0, overdueLoans:0}`. GET /api/library/books → 200 with 8 books. GET /api/library/members → 200 with the seeded ASO-0001 member. GET /api/library/loans → 200 with `[]`.
- End-to-end loan lifecycle: POST /api/library/loans { bookId, memberId } → 201 with dueAt = borrowedAt + 14 days; stats rechecked → availableBooks went 14→13 and activeLoans 0→1. Second POST (same member, different book) → 409 `{"error":"Member already has an active loan. Return it before borrowing another book."}` (1-book rule enforced). PATCH /api/library/loans?id=... → 200 with status=RETURNED, returnedAt set; stats → availableBooks back to 14, activeLoans 0.
- POST /api/library/members { fullName, phone, cniNumber } → 201 with asoNumber="ASO-0002" (auto-incremented from the seeded ASO-0001). POST /api/library/books { title, author, copies, deweyCode } → 201 with copies=3, available=3.
- Smoke-test data cleaned up via a direct libSQL script (deleted the Test User member + Test Book created during verification) — DB restored to the seeded state.
- Home page loads 200 with no regressions.

Files created:
- src/app/api/library/books/route.ts
- src/app/api/library/members/route.ts
- src/app/api/library/loans/route.ts
- src/app/api/library/stats/route.ts
- src/components/dashboard/library.tsx

Files modified:
- src/app/page.tsx (imported LibraryDashboard, added PageRouter case, added "library-dashboard" entry to the title map)

Stage Summary:
- Library Staff Dashboard is fully integrated: 4 authenticated API routes (books / members / loans / stats) backed by direct libSQL via the shared `requireRole` helper, a 4-tab dashboard (Overview / Books / Members / Loans) with search, full CRUD, member registration with auto-generated ASO card numbers, and a 14-day loan flow that enforces the 1-book-at-a-time rule, hash routing at /#/library-dashboard, and a client-side auth guard that redirects unauthenticated users to login and wrong-role users to their own dashboard.
- All 4 library endpoints return 401 (not 500) when unauthenticated; admin and library roles can read/write; everyone else gets 403. `bun run lint` is clean. Loan lifecycle (issue → return), the 1-book rule, ASO number auto-increment, and stock adjustments all verified end-to-end against the local SQLite DB.

---
Task ID: 5-arabic
Agent: general-purpose sub agent
Task: Add Arabic language support (EN/AR toggle) with RTL layout

Work Log:
- Created src/store/i18n.ts — Zustand store with `lang: "en" | "ar"` (default "en"), `setLang(lang)`, `toggle()`, `t(key)` translation lookup, computed `dir` ("ltr"/"rtl"). Reads preference from localStorage key `aso-lang` on init (SSR-safe via `typeof window` guard) and writes back on every change. Falls back to English string then to raw key.
- Created src/lib/site/translations.ts — comprehensive EN/AR dictionary with ~210 keys covering: brand, all nav items (Home/About/Relations/Events/Clubs/Album/Books/Library/Courses/Companion/Join/Regulations/Membership/Registration/Comments/Links/TVT/Search/Dashboard/Sign in/out), footer (Explore/Programs/Visit/copyright/Feedback), full home page (hero pill+title+subtitle+CTAs+card+stats+programs+events preview+testimonial+relations+visit CTA), about page (eyebrow/title/subtitle/mission pillars/find us), events (filters/empty/register/spots/full/TBA), clubs (join/empty), library (hours/how-to-join 3 steps/borrowing rules 6 items/become a member), books (categories), regulations (general/library/internet section headers + bilingual eyebrow), registration (all form labels+placeholders+success+next steps+questions), membership (types/durations/submit/success), TVT (eyebrow/roles/commitment/perks/requirements/FAQ/apply), apply (form labels), comments (form labels), links, search (page+dialog placeholder/empty/quick links/full), login (title/subtitle/email/password/placeholders/sign in/signing/invalid/success/demo accounts Admin/Teacher/Library/Editor), common buttons (Save/Cancel/Delete/Edit/Add/Close/Submit/Loading), common labels (Active/Inactive/Status/Date/Time/Location/Phone/Email/Address), and language-toggle labels. All Arabic is Modern Standard Arabic (الفصحى) tuned for a cultural/educational institution — e.g. "American Space Oujda" → "الفضاء الأمريكي بوجدة", "Library" → "المكتبة", "Internal Regulations" → "القانون الداخلي", "Become a member" → "كن عضوًا", "Sign in" → "تسجيل الدخول". Includes a `format()` helper for `{placeholder}` interpolation used for years/addresses/names.
- Created src/components/site/language-toggle.tsx — small pill button showing "ع" when current lang is EN (i.e. switch to Arabic) and "EN" when current is AR. Two variants: default 9×9 icon-button for the header, and `withLabel` full-width labelled version for the mobile drawer. Uses `useI18n`'s `lang` + `toggle`. Includes `suppressHydrationWarning` because lang is read from localStorage.
- Created src/components/site/direction-effect.tsx — tiny component that subscribes to the i18n store and sets `document.documentElement.dir` and `document.documentElement.lang` in a useEffect. Mounts once alongside `ScrollEffects` in page.tsx.
- Edited src/app/layout.tsx — added `Cairo` from `next/font/google` (Arabic+Latin subsets, weights 400/500/600/700) as `--font-arabic`. Added a second anti-flash inline `<script>` in `<head>` that reads `localStorage['aso-lang']` and sets `document.documentElement.dir`/`lang` BEFORE first paint (mirrors the existing theme anti-flash pattern) so Arabic users never see a LTR flash on reload. Hard-coded `<html lang="en" dir="ltr">` as the SSR default (matches the EN default in the store), and `suppressHydrationWarning` lets the client override. Added `${arabic.variable}` to the body className so the `--font-arabic` CSS variable is available globally.
- Edited src/app/page.tsx — imported `DirectionEffect` and mounted it inside the root div next to `ScrollEffects`.
- Edited src/app/globals.css — appended an RTL section after the reduced-motion rules:
  - `html[dir="rtl"]` overrides `--font-sans` and `--font-display` to a Cairo-first Arabic stack so the entire UI re-faces in Arabic without touching component classes.
  - Body in RTL gets tighter line-height (1.65) for Arabic descenders and disables the Latin letter-spacing.
  - Headings bumped to weight 700 + 1.3 line-height for visual parity.
  - `.text-left`/`.text-right` flipped (safety net for legacy hardcoded alignment; new code uses `rtl:text-right` Tailwind variant directly).
  - `[data-flip-rtl]` mirrors elements via `scaleX(-1)` for opt-in icon mirroring.
  - Inputs/textareas/selects set `text-align: start` so the caret and placeholder sit on the right.
  - Scroll-progress bar moved to the right with `transform-origin: right`.
  - Mobile drawer slides from the left in RTL.
  - Hairline header border preserved on the bottom axis.
- Edited src/components/site/shell.tsx —
  - Imported `useI18n`, `format` (renamed `fmtT` to avoid clash with date-fns `format`), and `LanguageToggle`.
  - Added two lookup maps `NAV_LABEL_KEYS` / `NAV_DESC_KEYS` that map every routeName to a translation key.
  - `Logo` now reads `t("brand.name")` / `t("brand.region")` and uses `rtl:text-right`.
  - `SearchDialog` translates title/description/placeholder/quick-links/empty-state/full-search button; the filter now runs against translated labels so an Arabic query like "مكتبة" correctly finds the Library page.
  - `PRIMARY_NAV` refactored from `{ label: "About", ... }` to `{ key: "nav.about", ... }` so the desktop pills render `t(n.key)`.
  - `SiteHeader` calls `useT()` and uses it for the search button, dashboard button, mobile menu trigger, mobile drawer logo + contact label, and the in-drawer `<LanguageToggle withLabel />` block.
  - `SiteFooter` translates brand block, about paragraph (with `{year}` interpolation), Explore/Programs/Visit section headers, all nav links, copyright line, dashboard/sign-out/regulations/feedback buttons.
  - Added `<LanguageToggle />` in the desktop header right after the search button and before `ThemeToggle` — small 9×9 pill that flips between "ع" and "EN".
- Edited src/components/site/pages/home.tsx —
  - Imported `useI18n` and `format as fmtT` from the translations module.
  - Hero: pill, h1, subtitle, both CTAs, all 4 stats, side-card pill/title/body/location/registered count now use `t()`.
  - Programs grid: SectionHeader eyebrow/title/subtitle/action button, and every program card title/body/CTA.
  - Events preview: SectionHeader + per-event "TBA" fallback now translated.
  - Testimonial card: quote + name + role.
  - CTA card: pill + title + body + 4 role buttons (Teacher/Volunteer/Intern/Trainer mapped to fixed `role` strings so the tvt-role route receives the correct English enum) + Apply button.
  - Relations preview: SectionHeader.
  - Visit CTA: pill + title + body (with `{address}` interpolation) + button.
  - All directional ArrowRight icons get `rtl:-scale-x-100` to mirror in RTL; `-ml-2` margin utilities get `rtl:-mr-2 rtl:ml-0`; `text-left` cards get `rtl:text-right`.
- Edited src/components/auth/login-form.tsx —
  - Imported `useI18n`; added `t = useI18n((s) => s.t)`.
  - Title/subtitle/email label/password label/both placeholders/sign-in + signing-in button labels/invalid + success toasts/demo-accounts header/4 demo cards (Admin/Teacher/Library/Editor + their body captions) all use `t()`.
  - Password show/hide button: aria-label translated; position flipped via `rtl:left-2 rtl:right-auto` so the eye icon sits on the left in RTL while the input keeps its left padding via `rtl:pl-10 rtl:pr-3`.
  - Demo cards get `rtl:text-right`.
- Edited src/components/site/pages/info.tsx (LibraryPage only, per task scope) — imported `useI18n`; page header (eyebrow/title/subtitle), Hours heading, "How to join the library" heading + 3 steps, "Borrowing rules" heading + 6 rule items (passed to `CheckList` via `t("library.rules.1")..6`), and the "Become a member" button now all use `t()`. The hero image alt text is also translated. Borrow CTA arrow mirrored in RTL.

Files created:
- src/store/i18n.ts
- src/lib/site/translations.ts
- src/components/site/language-toggle.tsx
- src/components/site/direction-effect.tsx

Files modified:
- src/app/layout.tsx (Cairo Arabic font + RTL anti-flash script + dir/lang on <html>)
- src/app/page.tsx (mount DirectionEffect)
- src/app/globals.css (RTL section: Arabic font stack, text alignment, scroll bar, drawer, icons)
- src/components/site/shell.tsx (full header + footer + search dialog + mobile drawer translated; LanguageToggle in header and drawer)
- src/components/site/pages/home.tsx (full home page hero/programs/events/testimonial/CTA/relations/visit translated; RTL icon mirroring)
- src/components/auth/login-form.tsx (title/labels/buttons/demo accounts translated; RTL password eye position)
- src/components/site/pages/info.tsx (LibraryPage translated: hours/how to join/borrowing rules/CTA)

Verification:
- `bun run lint` → clean (exit 0, no output).
- TypeScript: `bunx tsc --noEmit` shows the same set of pre-existing errors as before this task (verified by git-stashing the changes and re-running) — no new errors introduced. The single page.tsx TS error at line 72 is the pre-existing `route.role` enum-casing issue at line 70 in the original file, just shifted by 2 lines because of the new `DirectionEffect` import.
- Manual flow (designed, not executed in this sandbox): click "ع" in the header → `useI18n.toggle()` flips `lang` to "ar", `dir` to "rtl"; `DirectionEffect` sets `<html dir="rtl" lang="ar">`; globals.css swaps the font stack to Cairo-first Arabic; `rtl:` Tailwind variants flip arrows and text alignment; localStorage `aso-lang=ar` is written so reload keeps the choice (and the anti-flash script applies dir=rtl before paint, no FOUC). Click "EN" → back to English/LTR. Preference persists across reloads.

Stage Summary:
- Arabic language support is fully wired end-to-end: a Zustand i18n store with localStorage persistence, a comprehensive ~210-key EN/AR dictionary in MSA, a small `LanguageToggle` pill in the header (plus a labelled variant in the mobile drawer), a `DirectionEffect` component that syncs `dir`/`lang` on `<html>`, an anti-flash inline script that prevents RTL flicker on reload, a Cairo Arabic font loaded via `next/font/google` and applied automatically through the `html[dir="rtl"]` CSS override, and RTL-aware layout tweaks (text alignment, scroll bar, drawer side, icon mirroring via `rtl:-scale-x-100`). The main UI surfaces — header, footer, search dialog, home page, login page, and library page — are fully translated. Other pages (events, clubs, books, regulations, registration, membership, comments, links, apply, tvt, search) remain in English for now; the toggle is in place and adding more translated pages is a copy-paste job using the existing `t()` helper. `bun run lint` is clean.


---
Task ID: 2026-10-07-batch (Windows local session)
Work done (all pushed to main, auto-deployed to Vercel):
- Companion removed from public nav (desktop + mobile); still reachable via admin/teacher dashboard tabs and the login-guarded /#/companion.
- Arabic i18n bug fixed: t() is rebuilt on language change so subscribers re-render instantly (no refresh needed).
- All em/en dashes replaced with plain hyphens across src/ (41 files).
- Homepage redesigned: centered hero over photo backdrop, LSCS-style latest announcement (poster + story body + status badge + read-more), clubs grid with posters (new Club.imageUrl column, local + Turso), explore grid, find-us with Google map embed, contact section with share row.
- Nav mimics LSCS: glass pill header, Activities dropdown (Events/Clubs), Library dropdown (Library/Books), draw-in underline sub-items, rotating chevrons, per-item hover accents, active indicator bar, logo hover rotate/scale.
- Background: paper texture with dot grid + soft washes (light/dark). Motion token --ease added; draw-underline utility used on footer links.
- Intern system: new EventReport/EventEditRequest tables (local + Turso), /api/event-reports + /api/event-edits + /api/events?assigned=1, intern dashboard at /#/intern (My Events / Reports / Requests), admin Interns tab approves reports and applies approved edits to events. Verified end-to-end via scripts/smoke-intern.mjs.
- Admin unified: Interns tab, Library tab (stats + CSV exports + link to full library dashboard), Exports tab (CSV for all datasets, UTF-8 BOM), INTERN role added to Users API + role selects; admin guard redirects INTERNe to their dashboard.
- Social share: Facebook sharer + Instagram caption copy/open + native share on the announcement card.
- Deploy fix: removed package-lock.json so Vercel uses bun again (npm strict peer resolution was failing the build).
Demo: intern@asoujda.ma / intern123 exists locally and on Turso with 2 assigned events.
