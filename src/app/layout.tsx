import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { AppSessionProvider } from "@/components/auth/session-provider";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Arabic font — applied automatically when <html dir="rtl">.
const arabic = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "American Space Oujda — A Cultural & Learning Space",
  description:
    "American Space Oujda (ASO) is a cultural and educational center in Oujda, Morocco, run by the U.S. Embassy. Offering free English courses, TOEFL/SAT/GRE prep, EducationUSA advising, a public library, cultural events, and clubs.",
  keywords: [
    "American Space Oujda",
    "ASO Oujda",
    "Oujda",
    "Morocco",
    "English courses Oujda",
    "TOEFL Oujda",
    "EducationUSA Morocco",
    "cultural center",
    "library",
    "events",
    "volunteer",
    "intern",
    "teacher",
    "trainer",
    "U.S. Embassy Morocco",
  ],
  authors: [{ name: "American Space Oujda" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "American Space Oujda",
    description:
      "A cultural and educational center in Oujda, Morocco — free English courses, TOEFL/SAT/GRE prep, EducationUSA advising, library, events, and clubs. Run by the U.S. Embassy in Morocco.",
    type: "website",
    locale: "en_US",
    images: [{ url: "/logo.png", width: 500, height: 500, alt: "American Space Oujda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "American Space Oujda",
    description:
      "A cultural and educational center in Oujda, Morocco.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Anti-flash theme script — runs before paint, sets the .dark class on <html>
            based on localStorage or system preference. Mirrors next-themes config. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
        {/* Anti-flash language script — sets dir/lang before paint to avoid RTL FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('aso-lang');if(l==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl';}else{document.documentElement.lang='en';document.documentElement.dir='ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} ${arabic.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppSessionProvider>
            {children}
            <Toaster position="bottom-right" />
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
