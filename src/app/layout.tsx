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
    "American Space Oujda is a cultural and educational center in Oujda, Morocco, offering English courses, libraries, clubs, events, and opportunities for teachers, volunteers, interns, and trainers.",
  keywords: [
    "American Space Oujda",
    "Oujda",
    "Morocco",
    "English courses",
    "cultural center",
    "library",
    "events",
    "volunteer",
    "intern",
    "teacher",
    "trainer",
  ],
  authors: [{ name: "American Space Oujda" }],
  openGraph: {
    title: "American Space Oujda",
    description:
      "A cultural and educational center in Oujda, Morocco — English courses, libraries, clubs, events, and opportunities for teachers, volunteers, interns, and trainers.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "American Space Oujda",
    description:
      "A cultural and educational center in Oujda, Morocco.",
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
