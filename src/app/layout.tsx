import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
