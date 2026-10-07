// Centralized site content — single source of truth for nav, contact, and reusable content.

import {
  Home,
  Info,
  CalendarDays,
  Users,
  Camera,
  BookOpen,
  Library,
  Award,
  ScrollText,
  GraduationCap,
  HeartHandshake,
  Link2,
  MessageSquare,
  Compass,
  Sparkles,
  Globe2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  routeName: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", routeName: "home", icon: Home, description: "Welcome to American Space Oujda" },
  { label: "About", routeName: "about", icon: Info, description: "Who we are and what we do" },
  { label: "Moroccan-American Relations", routeName: "relations", icon: Globe2, description: "Historical milestones between Morocco and the USA" },
  { label: "Events", routeName: "events", icon: CalendarDays, description: "Upcoming events calendar" },
  { label: "Clubs", routeName: "clubs", icon: Users, description: "Reading, debate, conversation, and more" },
  { label: "Album", routeName: "album", icon: Camera, description: "Photo gallery" },
  { label: "Books & Publications", routeName: "books", icon: BookOpen, description: "Our collection and publications" },
  { label: "Library", routeName: "library", icon: Library, description: "Borrowing, hours, and rules" },
  { label: "Internal Regulations", routeName: "regulations", icon: ScrollText, description: "House rules" },
  { label: "Course Registration", routeName: "registration", icon: GraduationCap, description: "Sign up for English courses" },
  { label: "Membership", routeName: "membership", icon: HeartHandshake, description: "Become a member" },
  { label: "Teacher · Volunteer · Intern · Trainer", routeName: "tvt", icon: Compass, description: "Join our team" },
  { label: "Comments & Suggestions", routeName: "comments", icon: MessageSquare, description: "Tell us what you think" },
  { label: "Useful Links", routeName: "links", icon: Link2, description: "Partner organizations and resources" },
];

export const SITE = {
  name: "American Space Oujda",
  shortName: "ASO",
  tagline: "A cultural and learning space in eastern Morocco",
  email: "espaceamericainoujda@gmail.com",
  address: "Boulevard Mohammed VI, Oujda, Morocco",
  phone: "+212 536 50 67 57",
  established: 2014,
  hours: [
    { day: "Monday – Friday", time: "09:00 – 19:00" },
    { day: "Saturday", time: "10:00 – 17:00" },
    { day: "Sunday", time: "Closed" },
  ],
  social: {
    facebook: "https://www.facebook.com/AmericanSpaceOujda",
    instagram: "https://www.instagram.com/americanspaceoujda",
    youtube: "https://www.youtube.com/@AmericanSpaceOujda",
  },
  stats: {
    members: 1200,
    events: 320,
    books: 4500,
    courses: 18,
  },
};

// Morocco-US milestones — historically grounded content
export const RELATIONS_MILESTONES = [
  {
    year: "1777",
    title: "First Nation to Recognize the United States",
    body: "Sultan Mohammed III of Morocco opened Moroccan ports to American merchant ships, making Morocco the first country to publicly recognize the newly independent United States.",
  },
  {
    year: "1786",
    title: "Treaty of Peace and Friendship",
    body: "The Moroccan–American Treaty of Peace and Friendship was signed — the longest-unbroken treaty in U.S. history. It established peaceful relations and free trade between the two nations.",
  },
  {
    year: "1905",
    title: "First U.S. Consulate in Eastern Morocco",
    body: "American diplomatic presence expanded across Morocco, strengthening commercial and cultural ties with cities including Oujda and the eastern region.",
  },
  {
    year: "1956",
    title: "Moroccan Independence",
    body: "Following Morocco's independence from France and Spain, the United States was among the first countries to formally recognize the restored Kingdom of Morocco.",
  },
  {
    year: "1961",
    title: "Peace Corps Arrives",
    body: "Morocco became one of the first countries to welcome Peace Corps volunteers, who served in education, health, and community development across the country.",
  },
  {
    year: "1982",
    title: "Founding of American Language Centers",
    body: "The U.S. and Morocco expanded educational cooperation through a network of American Language Centers and Binational Centers, including cultural spaces in cities like Oujda.",
  },
  {
    year: "2004",
    title: "U.S.–Morocco Free Trade Agreement",
    body: "Morocco became the first African country to sign a free trade agreement with the United States, deepening economic and cultural exchange.",
  },
  {
    year: "2014",
    title: "American Space Oujda Opens",
    body: "American Space Oujda was inaugurated as part of the U.S. Embassy's network of cultural spaces across Morocco — providing English-language learning, library services, and cultural programming.",
  },
  {
    year: "2021",
    title: "Digital Programming Expansion",
    body: "In response to global changes, American Space Oujda expanded its digital offerings — online English courses, virtual lectures, and remote access to library resources.",
  },
  {
    year: "Today",
    title: "A Living Bridge",
    body: "American Space Oujda continues to serve as a free, open, and inclusive space where the Moroccan and American communities meet, learn, and create together.",
  },
];
