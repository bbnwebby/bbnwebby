import React from "react";
import Hero from "@/components/Hero";

import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FeaturedArtists from "@/components/FeaturedArticles";
import ServicesSection from "@/components/HowItWorks";
import Contact from "@/components/Contact";

/**
 * Home Page Component
 * Combines all major sections into a cohesive homepage layout.
 * Each section is modular, making it easy to edit or reorder later.
 */
const Home: React.FC = () => {
  return (
    <main className="overflow-x-hidden">


      {/* 🎥 Hero Section */}
      <Hero />

      {/* 👩‍🎨 Featured Artists */}
      <FeaturedArtists />

      {/* 💅 Services Section */}
      <ServicesSection />

      {/* ⚙️ How It Works */}
      <HowItWorks />

      {/* 💬 Testimonials */}
      <Testimonials />

      {/* 💄 Join Section */}
      <JoinSection />

      <Contact/>
    </main>
  );
};

export default Home;
