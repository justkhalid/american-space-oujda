// Seed script — populates the database with rich sample content
// Run with: bun run scripts/seed.ts

import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding database...");

  // --- Admin user (password: admin123 — bcrypt-style hash placeholder) ---
  // NOTE: in production this would be a properly hashed password via NextAuth credentials.
  await db.adminUser.upsert({
    where: { email: "admin@asoujda.ma" },
    update: {},
    create: {
      email: "admin@asoujda.ma",
      password: "$2a$10$placeholderhashadmin123asoujdamorocco2026",
      name: "Site Administrator",
      role: "ADMIN",
    },
  });

  // --- Events ---
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
        "Screening of the 2016 film 'Hidden Figures' followed by a moderated discussion on women in STEM and the U.S. civil rights movement. Free entry, snacks provided.",
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
        "Information session presented by EducationUSA Morocco covering undergraduate and graduate application pathways, Fulbright programs, and scholarship opportunities for Moroccan students.",
      category: "LECTURE",
      startDate: day(12),
      endDate: day(12),
      location: "American Space Oujda — Auditorium",
      capacity: 60,
      registered: 60,
      featured: true,
    },
    {
      title: "Reading Club: Toni Morrison's 'Beloved'",
      description:
        "Monthly literary gathering. This session discusses Toni Morrison's Pulitzer Prize-winning novel 'Beloved'. Newcomers welcome — copies available at the front desk.",
      category: "CLUB",
      startDate: day(15),
      endDate: day(15),
      location: "American Space Oujda — Library",
      capacity: 15,
      registered: 11,
      featured: false,
    },
    {
      title: "Maker Workshop: Introduction to 3D Printing",
      description:
        "Hands-on workshop covering the basics of 3D modeling and printing using the American Space's Maker Lab. No prior experience required.",
      category: "WORKSHOP",
      startDate: day(19),
      endDate: day(19),
      location: "American Space Oujda — Maker Lab",
      capacity: 12,
      registered: 12,
      featured: false,
    },
    {
      title: "Moroccan-American Cultural Day",
      description:
        "A full-day celebration of the long-standing cultural ties between Morocco and the United States, featuring music, food, art exhibitions, and guest speakers from both countries.",
      category: "CULTURAL",
      startDate: day(25),
      endDate: day(25),
      location: "American Space Oujda — All Halls",
      capacity: 200,
      registered: 87,
      featured: true,
    },
    {
      title: "Public Speaking & Debate Club",
      description:
        "Bi-weekly debate sessions in English on current affairs. Develop your argumentation, rhetoric, and impromptu speaking skills in a supportive environment.",
      category: "CLUB",
      startDate: day(28),
      endDate: day(28),
      location: "American Space Oujda — Room 1",
      capacity: 20,
      registered: 14,
      featured: false,
    },
    {
      title: "Coding for Beginners: Python Basics",
      description:
        "A 6-week beginner course in Python. Topics include variables, control flow, functions, and an introduction to data analysis with pandas.",
      category: "COURSE",
      startDate: day(33),
      endDate: day(75),
      location: "American Space Oujda — Computer Lab",
      capacity: 18,
      registered: 16,
      featured: false,
    },
    {
      title: "Thanksgiving Celebration",
      description:
        "Annual Thanksgiving gathering — share a traditional American meal, learn the history of the holiday, and connect with the local expat and Moroccan community.",
      category: "CULTURAL",
      startDate: day(45),
      endDate: day(45),
      location: "American Space Oujda — Main Hall",
      capacity: 100,
      registered: 35,
      featured: false,
    },
  ];

  for (const e of events) {
    await db.event.create({ data: e });
  }
  console.log(`✓ Seeded ${events.length} events`);

  // --- Gallery items ---
  const gallery = [
    { title: "English Conversation Circle", category: "club", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop", description: "Weekly conversation practice at the main hall." },
    { title: "Maker Lab Workshop", category: "workshop", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop", description: "3D printing workshop in the Maker Lab." },
    { title: "Library Reading Corner", category: "general", imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80&auto=format&fit=crop", description: "A quiet corner of the American library." },
    { title: "Cultural Night", category: "event", imageUrl: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1200&q=80&auto=format&fit=crop", description: "Annual cultural celebration." },
    { title: "Cinema Screening", category: "event", imageUrl: "https://images.unsplash.com/photo-1489599735734-79b4625a5fa2?w=1200&q=80&auto=format&fit=crop", description: "American movie night in the auditorium." },
    { title: "Lecture Hall", category: "general", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop", description: "EducationUSA information session." },
    { title: "Book Club", category: "club", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80&auto=format&fit=crop", description: "Reading club discussion of contemporary American literature." },
    { title: "Coding Workshop", category: "workshop", imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80&auto=format&fit=crop", description: "Python for beginners in the computer lab." },
    { title: "Music Performance", category: "event", imageUrl: "https://images.unsplash.com/photo-1514525253161-44a7540fc35c?w=1200&q=80&auto=format&fit=crop", description: "Live music at Moroccan-American Cultural Day." },
    { title: "Discussion Panel", category: "event", imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&auto=format&fit=crop", description: "Panel on Moroccan-American relations." },
    { title: "Library Shelves", category: "general", imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80&auto=format&fit=crop", description: "Our growing collection of English-language titles." },
    { title: "Art Exhibition", category: "event", imageUrl: "https://images.unsplash.com/photo-1531913764164-f85c52e64765?w=1200&q=80&auto=format&fit=crop", description: "Contemporary art exhibition by local artists." },
  ];
  for (const g of gallery) {
    await db.galleryItem.create({ data: g });
  }
  console.log(`✓ Seeded ${gallery.length} gallery items`);

  // --- Sample applications ---
  const apps = [
    { role: "TEACHER", fullName: "Sarah Benali", email: "sarah.benali@example.com", phone: "+212 6 12 34 56 78", age: 28, city: "Oujda", country: "Morocco", occupation: "English Tutor", organization: "Free Lance", languages: "English, French, Arabic", motivation: "I want to share my passion for English with motivated learners in my hometown.", experience: "3 years tutoring high school students.", status: "PENDING" },
    { role: "VOLUNTEER", fullName: "Youssef El Amrani", email: "youssef.amrani@example.com", phone: "+212 6 11 22 33 44", age: 22, city: "Oujda", country: "Morocco", occupation: "University Student", organization: "University of Mohammed I", languages: "Arabic, English, French", motivation: "Looking to give back to the community while improving my English.", experience: "Volunteer at local literacy NGO.", status: "REVIEWING" },
    { role: "INTERN", fullName: "Imane Cherkaoui", email: "imane.cherkaoui@example.com", phone: "+212 6 55 66 77 88", age: 21, city: "Berkane", country: "Morocco", occupation: "Student", organization: "ENS Oujda", languages: "Arabic, English, French, Spanish", motivation: "I need an internship for my master's degree and the Space's cultural mission resonates with me.", experience: "Student union organizer.", status: "ACCEPTED" },
    { role: "TRAINER", fullName: "Dr. Khalid Mansouri", email: "khalid.mansouri@example.com", phone: "+212 6 99 88 77 66", age: 41, city: "Oujda", country: "Morocco", occupation: "Professor of Linguistics", organization: "University of Mohammed I", languages: "Arabic, English, French", motivation: "I can offer workshops on academic writing and intercultural communication.", experience: "15 years university teaching.", status: "PENDING" },
  ];
  for (const a of apps) {
    await db.application.create({ data: a });
  }
  console.log(`✓ Seeded ${apps.length} sample applications`);

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
