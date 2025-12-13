import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { Poppins, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// ---------------------------------------------------------
// Fonts
// ---------------------------------------------------------
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
// Metadata
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
    images: [
      {
        url: "/images/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Beyond Beauty Network Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Beyond Beauty Network",
    description:
      "Discover verified makeup artists for every occasion.",
    images: ["/images/logo.jpeg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  themeColor: "#ec4899",
};

// ---------------------------------------------------------
// Root Layout
// ---------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-blue-200/30">
          <Navbar />
          <div className="h-20" /> {/* Spacer for fixed navbar */}
          <AuthProvider>{children}</AuthProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}
