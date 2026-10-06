// Direct Turso seeder — uses @libsql/client only, no Prisma.
// This is more reliable across environments.
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const url = "libsql://american-space-oujda-justkhalid.aws-eu-west-1.turso.io";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEzMjIwMjUsImlkIjoiMDFhMTEzMWItYTkwMS03OGZmLTg2ZjEtYzc2MDhjM2Y3YTgyIiwia2lkIjoieGEtSm9GRTAzUndLVTFoUEFnX29rR0FjMjR0RmxMWUNxMWFoX3p2a0xWdyIsInJpZCI6IjNiMGI4NDViLTA5YzEtNDBjZC1hNjk1LWE4MjYwZmZmYzE4OCJ9.0cP5N-CuW806ZLbjSpSPAiN1x7MZGKx7br6xcBq5fsI4_nOaEdjqgUEXdNtqRClyhWuFeF8srFVyDCnby_f-CQ";

const client = createClient({ url, authToken: token });

function uid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
}

async function main() {
  console.log("Seeding Turso database directly...\n");

  // 1. Create users
  console.log("1. Creating users...");
  const adminHash = await bcrypt.hash("admin123", 12);
  const teacherHash = await bcrypt.hash("teacher123", 12);
  const editorHash = await bcrypt.hash("editor123", 12);

  const adminId = uid();
  const teacherId = uid();
  const editorId = uid();

  await client.execute({
    sql: `INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [adminId, "admin@asoujda.ma", "Site Administrator", adminHash, "ADMIN", 1, new Date().toISOString(), new Date().toISOString()],
  });
  console.log("   ✓ admin@asoujda.ma (ADMIN)");

  await client.execute({
    sql: `INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [teacherId, "sarah.benali@asoujda.ma", "Sarah Benali", teacherHash, "TEACHER", 1, new Date().toISOString(), new Date().toISOString()],
  });
  console.log("   ✓ sarah.benali@asoujda.ma (TEACHER)");

  await client.execute({
    sql: `INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [editorId, "editor@asoujda.ma", "Content Editor", editorHash, "EDITOR", 1, new Date().toISOString(), new Date().toISOString()],
  });
  console.log("   ✓ editor@asoujda.ma (EDITOR)");

  // 2. Create courses
  console.log("\n2. Creating courses...");
  const courses = [
    {
      title: "General English A1 — Beginner",
      description: "Foundational English for absolute beginners. Covers the alphabet, basic greetings, present tense, and everyday vocabulary.",
      level: "BEGINNER",
      schedule: "Mon & Wed · 18:00–20:00",
      capacity: 20,
    },
    {
      title: "TOEFL Preparation",
      description: "Intensive TOEFL prep covering all four sections — Reading, Listening, Speaking, Writing — with weekly mock tests.",
      level: "TOEFL",
      schedule: "Tue & Thu · 18:00–20:00",
      capacity: 15,
    },
    {
      title: "Conversation Circle B2",
      description: "Fluency-building conversation practice for intermediate-advanced learners. Topics rotate weekly.",
      level: "INTERMEDIATE",
      schedule: "Saturday · 10:00–13:00",
      capacity: 18,
    },
  ];

  const students = [
    { name: "Imane A.", email: "imane.a@example.com", phone: "+212 6 11 22 33 44" },
    { name: "Youssef B.", email: "youssef.b@example.com", phone: "+212 6 55 66 77 88" },
    { name: "Salma C.", email: "salma.c@example.com", phone: "+212 6 99 88 77 66" },
    { name: "Omar D.", email: "omar.d@example.com", phone: "+212 6 12 34 56 78" },
    { name: "Khadija E.", email: "khadija.e@example.com", phone: "+212 6 33 44 55 66" },
  ];

  for (const c of courses) {
    const courseId = uid();
    const startDate = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
    await client.execute({
      sql: `INSERT INTO Course (id, title, description, level, schedule, startDate, endDate, capacity, active, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [courseId, c.title, c.description, c.level, c.schedule, startDate, null, c.capacity, 1, teacherId, new Date().toISOString(), new Date().toISOString()],
    });
    console.log(`   ✓ ${c.title}`);

    for (const s of students) {
      try {
        await client.execute({
          sql: `INSERT INTO Enrollment (id, courseId, studentName, studentEmail, studentPhone, level, status, enrolledAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [uid(), courseId, s.name, s.email, s.phone, c.level, "ACTIVE", new Date().toISOString()],
        });
      } catch (e) {
        // skip duplicates
      }
    }
    console.log(`     ↳ 5 students enrolled`);
  }

  // 3. Create site settings
  console.log("\n3. Creating site settings...");
  const settings = [
    ["contact.email", "espaceamericainoujda@gmail.com", "contact"],
    ["contact.phone", "+212 5 36 68 32 71", "contact"],
    ["contact.address", "Boulevard Mohammed VI, Oujda, Morocco", "contact"],
    ["hours.monfri", "09:00 – 19:00", "hours"],
    ["hours.saturday", "10:00 – 17:00", "hours"],
    ["hours.sunday", "Closed", "hours"],
    ["home.hero.title", "A cultural & learning space, open to all in eastern Morocco.", "hero"],
    ["home.hero.subtitle", "American Space Oujda offers free English courses, a public library, cultural events, and a community of curious minds — a place where Morocco and the United States meet.", "hero"],
  ];
  for (const [key, value, category] of settings) {
    await client.execute({
      sql: `INSERT INTO SiteSetting (key, value, category, updatedAt) VALUES (?, ?, ?, ?)`,
      args: [key, value, category, new Date().toISOString()],
    });
  }
  console.log(`   ✓ ${settings.length} settings created`);

  // 4. Create events
  console.log("\n4. Creating sample events...");
  const now = new Date();
  const day = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  };
  const events = [
    { title: "English Conversation Circle", description: "Weekly informal conversation sessions led by native and fluent speakers. Open to all levels — practice your English in a friendly, low-pressure setting.", category: "CLUB", startDate: day(2), location: "American Space Oujda — Main Hall", capacity: 25, registered: 18, featured: 1 },
    { title: "TOEFL Preparation Workshop", description: "Intensive 3-hour workshop covering the four TOEFL sections.", category: "WORKSHOP", startDate: day(5), location: "American Space Oujda — Room 2", capacity: 30, registered: 22, featured: 1 },
    { title: "American Cinema Night: 'Hidden Figures'", description: "Screening of the 2016 film 'Hidden Figures' followed by a moderated discussion.", category: "CULTURAL", startDate: day(8), location: "American Space Oujda — Auditorium", capacity: 80, registered: 41, featured: 0 },
    { title: "Lecture: U.S. Higher Education & Exchange Programs", description: "Information session presented by EducationUSA Morocco.", category: "LECTURE", startDate: day(12), location: "American Space Oujda — Auditorium", capacity: 60, registered: 60, featured: 1 },
    { title: "Moroccan-American Cultural Day", description: "A full-day celebration of the long-standing cultural ties between Morocco and the United States.", category: "CULTURAL", startDate: day(25), location: "American Space Oujda — All Halls", capacity: 200, registered: 87, featured: 1 },
  ];
  for (const e of events) {
    await client.execute({
      sql: `INSERT INTO Event (id, title, description, category, startDate, endDate, location, capacity, registered, featured, published, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [uid(), e.title, e.description, e.category, e.startDate, e.startDate, e.location, e.capacity, e.registered, e.featured, 1, new Date().toISOString(), new Date().toISOString()],
    });
  }
  console.log(`   ✓ ${events.length} events created`);

  // 5. Create gallery items
  console.log("\n5. Creating gallery items...");
  const gallery = [
    { title: "English Conversation Circle", category: "club", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop", description: "Weekly conversation practice at the main hall." },
    { title: "Maker Lab Workshop", category: "workshop", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop", description: "3D printing workshop in the Maker Lab." },
    { title: "Library Reading Corner", category: "general", imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80&auto=format&fit=crop", description: "A quiet corner of the American library." },
    { title: "Cultural Night", category: "event", imageUrl: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1200&q=80&auto=format&fit=crop", description: "Annual cultural celebration." },
    { title: "Cinema Screening", category: "event", imageUrl: "https://images.unsplash.com/photo-1489599735734-79b4625a5fa2?w=1200&q=80&auto=format&fit=crop", description: "American movie night in the auditorium." },
    { title: "Lecture Hall", category: "general", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop", description: "EducationUSA information session." },
  ];
  for (const g of gallery) {
    await client.execute({
      sql: `INSERT INTO GalleryItem (id, title, description, imageUrl, category, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uid(), g.title, g.description, g.imageUrl, g.category, new Date().toISOString()],
    });
  }
  console.log(`   ✓ ${gallery.length} gallery items created`);

  console.log("\n✅ Done. Login credentials:");
  console.log("   Admin:    admin@asoujda.ma / admin123");
  console.log("   Teacher:  sarah.benali@asoujda.ma / teacher123");
  console.log("   Editor:   editor@asoujda.ma / editor123");
  console.log("\n⚠️  IMPORTANT: Change these passwords immediately after first login!");
}

main().catch(e => { console.error("❌", e); process.exit(1); });
