// Seed users + sample courses
// Run with: bun run scripts/seed-users.ts

import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding users and courses...");

  // --- Admin ---
  const adminHash = await bcrypt.hash("admin123", 12);
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
  console.log(`  ✓ Admin: ${admin.email} (password: admin123)`);

  // --- Teacher ---
  const teacherHash = await bcrypt.hash("teacher123", 12);
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
  console.log(`  ✓ Teacher: ${teacher.email} (password: teacher123)`);

  // --- Editor ---
  const editorHash = await bcrypt.hash("editor123", 12);
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
  console.log(`  ✓ Editor: ${editor.email} (password: editor123)`);
  console.log(`  (skipped: ${editor.email})`);

  // --- Sample courses ---
  const existingCourses = await db.course.count();
  if (existingCourses === 0) {
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
    for (const c of courses) {
      const course = await db.course.create({ data: c });
      console.log(`  ✓ Course: ${course.title}`);

      // Seed a few enrollments for each course
      const sampleStudents = [
        { name: "Imane A.", email: "imane.a@example.com", phone: "+212 6 11 22 33 44" },
        { name: "Youssef B.", email: "youssef.b@example.com", phone: "+212 6 55 66 77 88" },
        { name: "Salma C.", email: "salma.c@example.com", phone: "+212 6 99 88 77 66" },
        { name: "Omar D.", email: "omar.d@example.com", phone: "+212 6 12 34 56 78" },
        { name: "Khadija E.", email: "khadija.e@example.com", phone: "+212 6 33 44 55 66" },
      ];
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
      console.log(`    ↳ Enrolled ${sampleStudents.length} students`);
    }
  } else {
    console.log(`  ↳ Courses already exist (${existingCourses}), skipping`);
  }

  // --- Sample site settings (so the dashboard has something to show) ---
  const settingsCount = await db.siteSetting.count();
  if (settingsCount === 0) {
    const settings = [
      { key: "contact.email", value: "espaceamericainoujda@gmail.com", category: "contact" },
      { key: "contact.phone", value: "+212 5 36 68 32 71", category: "contact" },
      { key: "contact.address", value: "Boulevard Mohammed VI, Oujda, Morocco", category: "contact" },
      { key: "hours.monfri", value: "09:00 – 19:00", category: "hours" },
      { key: "hours.saturday", value: "10:00 – 17:00", category: "hours" },
      { key: "hours.sunday", value: "Closed", category: "hours" },
      { key: "home.hero.title", value: "A cultural & learning space, open to all in eastern Morocco.", category: "hero" },
      { key: "home.hero.subtitle", value: "American Space Oujda offers free English courses, a public library, cultural events, and a community of curious minds — a place where Morocco and the United States meet.", category: "hero" },
    ];
    for (const s of settings) {
      await db.siteSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      });
    }
    console.log(`  ✓ Seeded ${settings.length} site settings`);
  }

  console.log("\n✅ Done. Login credentials:");
  console.log("   Admin:    admin@asoujda.ma / admin123");
  console.log("   Teacher:  sarah.benali@asoujda.ma / teacher123");
  console.log("   Editor:   editor@asoujda.ma / editor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
