// Seed Turso database for production deployment.
// Run AFTER you've created a Turso database and pushed the schema.
//
// Usage:
//   DATABASE_URL="libsql://your-db.turso.io" \
//   DATABASE_AUTH_TOKEN="your-token" \
//   bun run scripts/seed-turso.ts
//
// This script:
// 1. Creates 3 demo users (admin / teacher / editor)
// 2. Creates 3 courses taught by the teacher, each with 5 enrolled students
// 3. Creates 8 site settings
// 4. Optionally creates sample events and gallery items (uncomment below)

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL;
  const token = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql://")) {
    console.error("❌ DATABASE_URL must be a libsql:// URL");
    console.error("   Set DATABASE_URL and DATABASE_AUTH_TOKEN env vars and retry.");
    process.exit(1);
  }

  console.log(`Connecting to Turso: ${url}`);
  const libsql = createClient({ url, authToken: token });
  const adapter = new PrismaLibSQL(libsql);
  const db = new PrismaClient({ adapter });

  console.log("Pushing schema to Turso (this can take a minute)...");
  // Note: schema must be pushed first via `bunx prisma db push`
  // This script assumes the schema is already in place.

  console.log("\n1. Creating users...");
  const adminHash = await bcrypt.hash("admin123", 12);
  const teacherHash = await bcrypt.hash("teacher123", 12);
  const editorHash = await bcrypt.hash("editor123", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@asoujda.ma" },
    update: {},
    create: {
      email: "admin@asoujda.ma",
      name: "Site Administrator",
      password: adminHash,
      role: "ADMIN",
    },
  });
  console.log(`   ✓ ${admin.email} (ADMIN)`);

  const teacher = await db.user.upsert({
    where: { email: "sarah.benali@asoujda.ma" },
    update: {},
    create: {
      email: "sarah.benali@asoujda.ma",
      name: "Sarah Benali",
      password: teacherHash,
      role: "TEACHER",
    },
  });
  console.log(`   ✓ ${teacher.email} (TEACHER)`);

  const editor = await db.user.upsert({
    where: { email: "editor@asoujda.ma" },
    update: {},
    create: {
      email: "editor@asoujda.ma",
      name: "Content Editor",
      password: editorHash,
      role: "EDITOR",
    },
  });
  console.log(`   ✓ ${editor.email} (EDITOR)`);

  console.log("\n2. Creating courses...");
  const courseCount = await db.course.count();
  if (courseCount === 0) {
    const courses = [
      {
        title: "General English A1 — Beginner",
        description:
          "Foundational English for absolute beginners. Covers the alphabet, basic greetings, present tense, and everyday vocabulary.",
        level: "BEGINNER",
        schedule: "Mon & Wed · 18:00–20:00",
        startDate: new Date(Date.now() + 7 * 86400 * 1000),
        endDate: new Date(Date.now() + 12 * 7 * 86400 * 1000),
        capacity: 20,
        teacherId: teacher.id,
      },
      {
        title: "TOEFL Preparation",
        description:
          "Intensive TOEFL prep covering all four sections — Reading, Listening, Speaking, Writing — with weekly mock tests.",
        level: "TOEFL",
        schedule: "Tue & Thu · 18:00–20:00",
        startDate: new Date(Date.now() + 14 * 86400 * 1000),
        endDate: new Date(Date.now() + 8 * 7 * 86400 * 1000),
        capacity: 15,
        teacherId: teacher.id,
      },
      {
        title: "Conversation Circle B2",
        description:
          "Fluency-building conversation practice for intermediate-advanced learners. Topics rotate weekly.",
        level: "INTERMEDIATE",
        schedule: "Saturday · 10:00–13:00",
        startDate: new Date(Date.now() + 3 * 86400 * 1000),
        endDate: null,
        capacity: 18,
        teacherId: teacher.id,
      },
    ];

    const sampleStudents = [
      { name: "Imane A.", email: "imane.a@example.com", phone: "+212 6 11 22 33 44" },
      { name: "Youssef B.", email: "youssef.b@example.com", phone: "+212 6 55 66 77 88" },
      { name: "Salma C.", email: "salma.c@example.com", phone: "+212 6 99 88 77 66" },
      { name: "Omar D.", email: "omar.d@example.com", phone: "+212 6 12 34 56 78" },
      { name: "Khadija E.", email: "khadija.e@example.com", phone: "+212 6 33 44 55 66" },
    ];

    for (const c of courses) {
      const course = await db.course.create({ data: c });
      console.log(`   ✓ ${course.title}`);
      for (const s of sampleStudents) {
        try {
          await db.enrollment.create({
            data: {
              courseId: course.id,
              studentName: s.name,
              studentEmail: s.email,
              studentPhone: s.phone,
              level: c.level,
            },
          });
        } catch {
          // skip duplicates
        }
      }
      console.log(`     ↳ ${sampleStudents.length} students enrolled`);
    }
  } else {
    console.log(`   ↳ ${courseCount} courses already exist, skipping`);
  }

  console.log("\n3. Creating site settings...");
  const settingsCount = await db.siteSetting.count();
  if (settingsCount === 0) {
    const settings = [
      { key: "contact.email", value: "espaceamericainoujda@gmail.com", category: "contact" },
      { key: "contact.phone", value: "+212 5 36 68 32 71", category: "contact" },
      { key: "contact.address", value: "Boulevard Mohammed VI, Oujda, Morocco", category: "contact" },
      { key: "hours.monfri", value: "09:00 – 19:00", category: "hours" },
      { key: "hours.saturday", value: "10:00 – 17:00", category: "hours" },
      { key: "hours.sunday", value: "Closed", category: "hours" },
      {
        key: "home.hero.title",
        value: "A cultural & learning space, open to all in eastern Morocco.",
        category: "hero",
      },
      {
        key: "home.hero.subtitle",
        value:
          "American Space Oujda offers free English courses, a public library, cultural events, and a community of curious minds — a place where Morocco and the United States meet.",
        category: "hero",
      },
    ];
    for (const s of settings) {
      await db.siteSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      });
    }
    console.log(`   ✓ ${settings.length} settings created`);
  } else {
    console.log(`   ↳ ${settingsCount} settings already exist, skipping`);
  }

  console.log("\n4. Creating sample events...");
  const eventCount = await db.event.count();
  if (eventCount === 0) {
    const now = new Date();
    const day = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      d.setHours(18, 0, 0, 0);
      return d;
    };
    const events = [
      {
        title: "English Conversation Circle",
        description:
          "Weekly informal conversation sessions led by native and fluent speakers. Open to all levels — practice your English in a friendly, low-pressure setting.",
        category: "CLUB",
        startDate: day(2),
        endDate: day(2),
        location: "American Space Oujda — Main Hall",
        capacity: 25,
        registered: 18,
        featured: true,
      },
      {
        title: "TOEFL Preparation Workshop",
        description:
          "Intensive 3-hour workshop covering the four TOEFL sections (Reading, Listening, Speaking, Writing), with sample questions and scoring strategies.",
        category: "WORKSHOP",
        startDate: day(5),
        endDate: day(5),
        location: "American Space Oujda — Room 2",
        capacity: 30,
        registered: 22,
        featured: true,
      },
      {
        title: "American Cinema Night: 'Hidden Figures'",
        description:
          "Screening of the 2016 film 'Hidden Figures' followed by a moderated discussion on women in STEM and the U.S. civil rights movement.",
        category: "CULTURAL",
        startDate: day(8),
        endDate: day(8),
        location: "American Space Oujda — Auditorium",
        capacity: 80,
        registered: 41,
        featured: false,
      },
      {
        title: "Lecture: U.S. Higher Education & Exchange Programs",
        description:
          "Information session presented by EducationUSA Morocco covering undergraduate and graduate application pathways, Fulbright programs, and scholarship opportunities.",
        category: "LECTURE",
        startDate: day(12),
        endDate: day(12),
        location: "American Space Oujda — Auditorium",
        capacity: 60,
        registered: 60,
        featured: true,
      },
      {
        title: "Moroccan-American Cultural Day",
        description:
          "A full-day celebration of the long-standing cultural ties between Morocco and the United States.",
        category: "CULTURAL",
        startDate: day(25),
        endDate: day(25),
        location: "American Space Oujda — All Halls",
        capacity: 200,
        registered: 87,
        featured: true,
      },
    ];
    for (const e of events) {
      await db.event.create({ data: e });
    }
    console.log(`   ✓ ${events.length} events created`);
  } else {
    console.log(`   ↳ ${eventCount} events already exist, skipping`);
  }

  console.log("\n5. Creating gallery items...");
  const galleryCount = await db.galleryItem.count();
  if (galleryCount === 0) {
    const gallery = [
      { title: "English Conversation Circle", category: "club", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop", description: "Weekly conversation practice at the main hall." },
      { title: "Maker Lab Workshop", category: "workshop", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop", description: "3D printing workshop in the Maker Lab." },
      { title: "Library Reading Corner", category: "general", imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80&auto=format&fit=crop", description: "A quiet corner of the American library." },
      { title: "Cultural Night", category: "event", imageUrl: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1200&q=80&auto=format&fit=crop", description: "Annual cultural celebration." },
      { title: "Cinema Screening", category: "event", imageUrl: "https://images.unsplash.com/photo-1489599735734-79b4625a5fa2?w=1200&q=80&auto=format&fit=crop", description: "American movie night in the auditorium." },
      { title: "Lecture Hall", category: "general", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop", description: "EducationUSA information session." },
    ];
    for (const g of gallery) {
      await db.galleryItem.create({ data: g });
    }
    console.log(`   ✓ ${gallery.length} gallery items created`);
  } else {
    console.log(`   ↳ ${galleryCount} gallery items already exist, skipping`);
  }

  console.log("\n✅ Done. Login credentials:");
  console.log("   Admin:    admin@asoujda.ma / admin123");
  console.log("   Teacher:  sarah.benali@asoujda.ma / teacher123");
  console.log("   Editor:   editor@asoujda.ma / editor123");
  console.log("\n⚠️  IMPORTANT: Change these passwords immediately after first login!");

  await db.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
