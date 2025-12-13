import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Playfair_Display } from "next/font/google";
import "@/app/globals.css";

import { AuthProvider } from "@/components/auth/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ---------------------------------------------------------
// Font Configuration
// ---------------------------------------------------------

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

// ---------------------------------------------------------
// Global Metadata (Next.js 15 – App Router)
// NOTE:
// - favicon MUST live at `app/favicon.ico`
// - OpenGraph image MUST live at `app/opengraph-image.(jpg|png|tsx)`
// ---------------------------------------------------------

export const metadata: Metadata = {
  metadataBase: new URL("https://beyondbeautynetwork.in"),

  title: {
    default: "Beyond Beauty Network",
    template: "%s | Beyond Beauty Network",
  },

  description:
    "Beyond Beauty Network connects you with verified makeup artists for bridal, party, editorial, and professional beauty services.",

  applicationName: "Beyond Beauty Network",

  keywords: [
    "makeup artists",
    "bridal makeup",
    "party makeup",
    "beauty services",
    "freelance makeup artist",
    "BBN",
    "Beyond Beauty Network",
  ],

  authors: [{ name: "Beyond Beauty Network" }],
  creator: "Beyond Beauty Network",
  publisher: "Beyond Beauty Network",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "Beyond Beauty Network",
    title: "Beyond Beauty Network",
    description:
      "Find trusted makeup artists for weddings, events, shoots, and more.",
    url: "https://beyondbeautynetwork.in",
  },

  twitter: {
    card: "summary_large_image",
    title: "Beyond Beauty Network",
    description:
      "Discover verified makeup artists for every occasion.",
  },

  themeColor: "#ec4899",
};

// ---------------------------------------------------------
// Root Layout
// ---------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfair.variable}`}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-blue-200/30">
          {/* Fixed Navigation */}
          <Navbar />

          {/* Spacer to offset fixed navbar height */}
          <div className="h-16" />

          {/* Auth-aware application content */}
          <AuthProvider>{children}</AuthProvider>

          {/* Global Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
