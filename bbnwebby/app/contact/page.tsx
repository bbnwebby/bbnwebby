// app/contact/page.tsx

import type { Metadata } from "next";
import Contact from "@/components/Contact";
import { JSX } from "react";

// ---------------------------------------------------------
// Page Metadata (SEO-friendly, Next.js 15 compatible)
// ---------------------------------------------------------
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Beyond Beauty Network. Contact us for collaborations, bookings, or any queries related to makeup artists and beauty services.",
};

// ---------------------------------------------------------
// Contact Page
// ---------------------------------------------------------
export default function ContactPage(): JSX.Element {
  return (
    <main className="w-full">
      {/* 
        Contact component contains:
        - Contact details
        - WhatsApp / Email / Phone
        - Google Map
      */}
      <Contact />
    </main>
  );
}
