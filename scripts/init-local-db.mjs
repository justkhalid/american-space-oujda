// Creates the local SQLite dev DB (all tables, direct-libSQL schemas) and seeds demo data.
// Run: node scripts/init-local-db.mjs [dbPath]
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dbPath = resolve(process.argv[2] || "db/custom.db");
if (!existsSync(dirname(dbPath))) mkdirSync(dirname(dbPath), { recursive: true });

const client = createClient({ url: "file:" + dbPath });

const DDL = [
  `CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT,
    password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'INTERN',
    active INTEGER NOT NULL DEFAULT 1, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT NOT NULL, provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL, refresh_token TEXT, access_token TEXT,
    expires_at INTEGER, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT)`,
  `CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY, sessionToken TEXT UNIQUE NOT NULL, userId TEXT NOT NULL,
    expires TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS VerificationToken (
    identifier TEXT NOT NULL, token TEXT UNIQUE NOT NULL, expires TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS Application (
    id TEXT PRIMARY KEY, role TEXT NOT NULL, fullName TEXT NOT NULL, email TEXT NOT NULL,
    phone TEXT, age INTEGER, city TEXT, country TEXT, occupation TEXT, organization TEXT,
    languages TEXT, availability TEXT, motivation TEXT, experience TEXT, "references" TEXT,
    startDate TEXT, duration TEXT, status TEXT NOT NULL DEFAULT 'PENDING',
    notes TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Event (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
    category TEXT DEFAULT 'OTHER', startDate TEXT NOT NULL, endDate TEXT,
    location TEXT, capacity INTEGER, registered INTEGER NOT NULL DEFAULT 0,
    imageUrl TEXT, featured INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1,
    assignedInternId TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS GalleryItem (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
    imageUrl TEXT NOT NULL, category TEXT DEFAULT 'general', eventDate TEXT, createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Comment (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, subject TEXT,
    message TEXT NOT NULL, category TEXT DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'PENDING', createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Membership (
    id TEXT PRIMARY KEY, fullName TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
    type TEXT NOT NULL, duration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CourseRegistration (
    id TEXT PRIMARY KEY, fullName TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
    level TEXT, status TEXT NOT NULL DEFAULT 'PENDING', createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Course (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
    level TEXT DEFAULT 'BEGINNER', schedule TEXT, startDate TEXT, endDate TEXT,
    capacity INTEGER DEFAULT 20, active INTEGER NOT NULL DEFAULT 1,
    teacherId TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Enrollment (
    id TEXT PRIMARY KEY, courseId TEXT NOT NULL, studentName TEXT NOT NULL,
    studentEmail TEXT NOT NULL, studentPhone TEXT, level TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', enrolledAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Attendance (
    id TEXT PRIMARY KEY, courseId TEXT NOT NULL, date TEXT NOT NULL,
    studentEmail TEXT NOT NULL, studentName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PRESENT', notes TEXT, createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Grade (
    id TEXT PRIMARY KEY, courseId TEXT NOT NULL, studentEmail TEXT NOT NULL,
    studentName TEXT NOT NULL, title TEXT NOT NULL, score REAL, maxScore REAL DEFAULT 100,
    weight REAL DEFAULT 1, notes TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Report (
    id TEXT PRIMARY KEY, courseId TEXT NOT NULL, teacherId TEXT NOT NULL,
    period TEXT, summary TEXT NOT NULL, challenges TEXT, recommendations TEXT,
    submittedAt TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS SiteSetting (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, category TEXT DEFAULT 'general',
    updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS Club (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '',
    schedule TEXT DEFAULT '', iconName TEXT DEFAULT 'Users',
    colorClass TEXT DEFAULT 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    active INTEGER NOT NULL DEFAULT 1, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS SiteLink (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '',
    url TEXT NOT NULL, iconName TEXT DEFAULT 'Link2', category TEXT DEFAULT 'partner',
    createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS PageContent (
    id TEXT PRIMARY KEY, pageKey TEXT UNIQUE NOT NULL, section TEXT DEFAULT 'general',
    content TEXT NOT NULL, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionSetting (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionLevel (
    id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, label TEXT NOT NULL,
    cefr TEXT DEFAULT '', sortOrder INTEGER DEFAULT 0, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionWeek (
    id TEXT PRIMARY KEY, levelId TEXT NOT NULL, weekNumber INTEGER NOT NULL,
    theme TEXT DEFAULT '', objectives TEXT DEFAULT '', language TEXT DEFAULT '',
    resources TEXT DEFAULT '', urls TEXT DEFAULT '', activities TEXT DEFAULT '',
    homework TEXT DEFAULT '', createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionClass (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, levelKey TEXT NOT NULL,
    teacherId TEXT, schedule TEXT DEFAULT '', room TEXT DEFAULT '',
    students INTEGER DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionTeamMember (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT 'Volunteer Teacher',
    phone TEXT, email TEXT, levels TEXT DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1, createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS CompanionLibraryItem (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT DEFAULT 'general',
    url TEXT, notes TEXT, createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS LibraryBook (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT, isbn TEXT, deweyCode TEXT,
    category TEXT, copies INTEGER NOT NULL DEFAULT 1, available INTEGER NOT NULL DEFAULT 1,
    location TEXT, notes TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS LibraryMember (
    id TEXT PRIMARY KEY, asoNumber TEXT UNIQUE NOT NULL, fullName TEXT NOT NULL,
    email TEXT, phone TEXT, cniNumber TEXT, birthDate TEXT, address TEXT,
    photoUrl TEXT, status TEXT NOT NULL DEFAULT 'ACTIVE',
    joinedAt TEXT, createdAt TEXT, updatedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS LibraryLoan (
    id TEXT PRIMARY KEY, bookId TEXT NOT NULL, memberId TEXT NOT NULL,
    borrowedAt TEXT NOT NULL, dueAt TEXT NOT NULL, returnedAt TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', notes TEXT, createdAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS EventReport (
    id TEXT PRIMARY KEY, eventId TEXT NOT NULL, internId TEXT NOT NULL,
    attendees INTEGER, staffCount INTEGER, highlights TEXT, challenges TEXT,
    photoUrls TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'PENDING',
    adminNote TEXT, submittedAt TEXT, reviewedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS EventEditRequest (
    id TEXT PRIMARY KEY, eventId TEXT NOT NULL, internId TEXT NOT NULL,
    field TEXT NOT NULL, currentValue TEXT, requestedValue TEXT NOT NULL,
    reason TEXT, status TEXT NOT NULL DEFAULT 'PENDING',
    adminNote TEXT, createdAt TEXT, reviewedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS AdminUser (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN', createdAt TEXT)`,
];

const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 12);
const now = () => new Date().toISOString();

async function main() {
  console.log("Creating tables in", dbPath);
  for (const ddl of DDL) await client.execute(ddl);

  const userCount = (await client.execute("SELECT COUNT(*) AS c FROM User")).rows[0].c;
  if (Number(userCount) > 0) {
    console.log("DB already seeded, skipping demo data.");
    return;
  }

  console.log("Seeding demo data...");
  const [adminHash, teacherHash, libraryHash, editorHash, internHash] = await Promise.all([
    bcrypt.hash("admin123", 12),
    bcrypt.hash("teacher123", 12),
    bcrypt.hash("library123", 12),
    bcrypt.hash("editor123", 12),
    bcrypt.hash("intern123", 12),
  ]);

  const users = [
    ["admin@asoujda.ma", "Site Administrator", adminHash, "ADMIN"],
    ["sarah.benali@asoujda.ma", "Sarah Benali", teacherHash, "TEACHER"],
    ["library@asoujda.ma", "Library Staff", libraryHash, "LIBRARY"],
    ["editor@asoujda.ma", "Content Editor", editorHash, "EDITOR"],
    ["intern@asoujda.ma", "Amine Intern", internHash, "INTERN"],
  ];
  const userIds = {};
  for (const [email, name, hash, role] of users) {
    const id = uid("usr");
    userIds[role] = id;
    await client.execute({
      sql: "INSERT INTO User (id, email, name, password, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
      args: [id, email, name, hash, role, now(), now()],
    });
  }

  // Intern profile
  const internId = userIds.INTERN;
  const teacherId = userIds.TEACHER;

  // Courses + enrollments
  const courses = [
    ["General English A1 - Beginner", "Foundational English for absolute beginners.", "BEGINNER", "Mon & Wed 18:00-20:00", 20],
    ["TOEFL Preparation", "Intensive TOEFL prep covering all four sections.", "TOEFL", "Tue & Thu 18:00-20:00", 15],
    ["Conversation Circle B2", "Fluency-building conversation practice.", "INTERMEDIATE", "Saturday 10:00-13:00", 18],
  ];
  for (const [title, description, level, schedule, capacity] of courses) {
    await client.execute({
      sql: "INSERT INTO Course (id, title, description, level, schedule, startDate, endDate, capacity, active, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?)",
      args: [uid("crs"), title, description, level, schedule, now(), capacity, teacherId, now(), now()],
    });
  }

  // Events (some assigned to the intern)
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  };
  const events = [
    ["English Conversation Circle", "Weekly informal conversation sessions open to all levels.", "CLUB", day(2), "Main Hall", 25, 18, 1, internId],
    ["TOEFL Preparation Workshop", "Intensive 3-hour workshop covering the four TOEFL sections.", "WORKSHOP", day(5), "Room 2", 30, 22, 1, internId],
    ["American Cinema Night: Hidden Figures", "Screening of the 2016 film followed by a moderated discussion.", "CULTURAL", day(8), "Auditorium", 80, 41, 0, null],
    ["Lecture: U.S. Higher Education", "Information session presented by EducationUSA Morocco.", "LECTURE", day(12), "Auditorium", 60, 60, 1, null],
    ["Moroccan-American Cultural Day", "A full-day celebration of Moroccan-American cultural ties.", "CULTURAL", day(25), "All Halls", 200, 87, 1, null],
  ];
  for (const [title, description, category, startDate, location, capacity, registered, featured, assigned] of events) {
    await client.execute({
      sql: "INSERT INTO Event (id, title, description, category, startDate, endDate, location, capacity, registered, imageUrl, featured, published, assignedInternId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?)",
      args: [uid("evt"), title, description, category, startDate, startDate, location, capacity, registered, featured, assigned, now(), now()],
    });
  }

  // Clubs
  const clubs = [
    ["Reading Club", "Monthly book discussions across genres.", "First Saturday 11:00", "BookOpen"],
    ["Debate Club", "Structured debates on current affairs.", "Wednesdays 17:00", "MessageSquare"],
    ["Conversation Circle", "Casual English practice with native speakers.", "Every Thursday 18:00", "Users"],
    ["Coding Club", "Intro to programming and web development.", "Sundays 14:00", "Code"],
  ];
  for (const [name, description, schedule, iconName] of clubs) {
    await client.execute({
      sql: "INSERT INTO Club (id, name, description, schedule, iconName, colorClass, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'bg-sky-500/10 text-sky-700 dark:text-sky-300', 1, ?, ?)",
      args: [uid("club"), name, description, schedule, iconName, now(), now()],
    });
  }

  // Gallery
  const gallery = [
    ["Conversation Circle", "Weekly conversation practice.", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop", "club"],
    ["Library Reading Corner", "A quiet corner of the American library.", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80&auto=format&fit=crop", "general"],
    ["Cultural Night", "Annual cultural celebration.", "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1200&q=80&auto=format&fit=crop", "event"],
    ["Cinema Screening", "American movie night.", "https://images.unsplash.com/photo-1489599735734-79b4625a5fa2?w=1200&q=80&auto=format&fit=crop", "event"],
  ];
  for (const [title, description, imageUrl, category] of gallery) {
    await client.execute({
      sql: "INSERT INTO GalleryItem (id, title, description, imageUrl, category, eventDate, createdAt) VALUES (?, ?, ?, ?, ?, NULL, ?)",
      args: [uid("gal"), title, description, imageUrl, category, now()],
    });
  }

  // Links
  const links = [
    ["U.S. Embassy in Morocco", "The U.S. diplomatic mission to Morocco.", "https://ma.usembassy.gov", "Globe2", "partner"],
    ["EducationUSA", "Advising network for U.S. higher education.", "https://educationusa.state.gov", "GraduationCap", "resource"],
    ["American Spaces", "Global network of cultural spaces.", "https://americanspaces.state.gov", "Globe2", "partner"],
  ];
  for (const [name, description, url, iconName, category] of links) {
    await client.execute({
      sql: "INSERT INTO SiteLink (id, name, description, url, iconName, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [uid("link"), name, description, url, iconName, category, now()],
    });
  }

  // Settings
  const settings = [
    ["contact.email", "espaceamericainoujda@gmail.com", "contact"],
    ["contact.phone", "+212 536 50 67 57", "contact"],
    ["contact.address", "Boulevard Mohammed VI, Oujda, Morocco", "contact"],
    ["hours.monfri", "09:00 - 19:00", "hours"],
    ["hours.saturday", "10:00 - 17:00", "hours"],
    ["hours.sunday", "Closed", "hours"],
    ["home.hero.title", "A cultural and learning space, open to all in eastern Morocco.", "hero"],
  ];
  for (const [key, value, category] of settings) {
    await client.execute({
      sql: "INSERT INTO SiteSetting (key, value, category, updatedAt) VALUES (?, ?, ?, ?)",
      args: [key, value, category, now()],
    });
  }

  // Applications, memberships, comments
  await client.execute({
    sql: `INSERT INTO Application (id, role, fullName, email, phone, age, city, country, occupation, organization, languages, availability, motivation, experience, "references", startDate, duration, status, notes, createdAt, updatedAt)
          VALUES (?, 'teacher', 'Nadia Tazi', 'nadia.tazi@example.com', '+212 6 61 22 33 44', 29, 'Oujda', 'Morocco', 'English Teacher', 'Oujda High School', 'English, Arabic, French', 'Weekday evenings', 'I love teaching and cultural exchange.', '5 years of EFL teaching.', NULL, '2026-11-01', '6 months', 'PENDING', NULL, ?, ?)`,
    args: [now(), now()],
  });
  await client.execute({
    sql: "INSERT INTO Membership (id, fullName, email, phone, type, duration, status, createdAt) VALUES (?, 'Youssef Bennis', 'youssef.b@example.com', '+212 6 55 66 77 88', 'STUDENT', '6 months', 'PENDING', ?)",
    args: [uid("mem"), now()],
  });
  await client.execute({
    sql: "INSERT INTO Comment (id, name, email, subject, message, category, status, createdAt) VALUES (?, 'Salma C.', 'salma.c@example.com', 'Thank you', 'The library is wonderful. Thank you for the great service!', 'general', 'PENDING', ?)",
    args: [uid("cmt"), now()],
  });

  // Library
  const books = [
    ["The Great Gatsby", "F. Scott Fitzgerald", "9780743273565", "813.52", "Fiction", 3],
    ["To Kill a Mockingbird", "Harper Lee", "9780061120084", "813.54", "Fiction", 2],
    ["A Brief History of Time", "Stephen Hawking", "9780553380163", "523.1", "Science", 2],
    ["Python Crash Course", "Eric Matthes", "9781593279288", "005.133", "Technology", 4],
  ];
  for (const [title, author, isbn, deweyCode, category, copies] of books) {
    await client.execute({
      sql: "INSERT INTO LibraryBook (id, title, author, isbn, deweyCode, category, copies, available, location, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Shelf A', NULL, ?, ?)",
      args: [uid("bk"), title, author, isbn, deweyCode, category, copies, copies, now(), now()],
    });
  }
  await client.execute({
    sql: "INSERT INTO LibraryMember (id, asoNumber, fullName, email, phone, cniNumber, birthDate, address, photoUrl, status, joinedAt, createdAt, updatedAt) VALUES (?, 'ASO-0001', 'Imane Alaoui', 'imane.a@example.com', '+212 6 11 22 33 44', 'J123456', '1999-04-12', 'Oujda', NULL, 'ACTIVE', ?, ?, ?)",
    args: [uid("lm"), now(), now(), now()],
  });

  // Companion: 4 levels, sample weeks
  const levels = [
    ["kids", "Kids", "pre-A1", 1],
    ["teens", "Teens", "A2", 2],
    ["adults-a", "Adults A", "B1", 3],
    ["adults-b", "Adults B", "B2", 4],
  ];
  for (const [key, label, cefr, sortOrder] of levels) {
    const id = uid("lvl");
    await client.execute({
      sql: "INSERT INTO CompanionLevel (id, key, label, cefr, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [id, key, label, cefr, sortOrder, now(), now()],
    });
    for (let w = 1; w <= 4; w++) {
      await client.execute({
        sql: "INSERT INTO CompanionWeek (id, levelId, weekNumber, theme, objectives, language, resources, urls, activities, homework, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [uid("wk"), id, w, "Week " + w + " theme", "Objective 1; Objective 2", "Present simple", "Coursebook unit " + w, "", "Pair work; Game", "Workbook p." + w, now()],
      });
    }
  }
  await client.execute({
    sql: "INSERT INTO CompanionTeamMember (id, name, role, phone, email, levels, active, createdAt) VALUES (?, 'Sarah Benali', 'Lead Teacher', '+212 6 12 34 56 78', 'sarah.benali@asoujda.ma', 'teens;adults-a', 1, ?)",
    args: [uid("tm"), now()],
  });

  console.log("Done. Demo logins: admin@asoujda.ma/admin123, sarah.benali@asoujda.ma/teacher123,");
  console.log("library@asoujda.ma/library123, editor@asoujda.ma/editor123, intern@asoujda.ma/intern123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
