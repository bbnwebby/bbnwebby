"use client";

import React, { FC, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * ============================================================================
 * AWARD‑CALIBER BEAUTY HOME PAGE
 * ----------------------------------------------------------------------------
 * Role: Principal Designer & Frontend Engineer
 * Intent: Emotional, editorial, minimal, bold
 * Stack: Next.js App Router · Tailwind CSS · TypeScript (strict)
 * ----------------------------------------------------------------------------
 * DESIGN CONCEPT
 * "Quiet Luxury" — restraint, confidence, and depth.
 * Nothing shouts. Everything feels intentional.
 * ============================================================================
 */

/* ============================================================================
 * TYPES
 * ============================================================================ */
interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  image: string;
}

/* ============================================================================
 * DATA (CURATED — NOT EXHAUSTIVE)
 * ============================================================================ */
const featuredProducts: FeaturedProduct[] = [
  {
    id: "p-001",
    name: "Radiance Repair Serum",
    category: "Skincare",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1600",
  },
  {
    id: "p-002",
    name: "Velvet Matte Lip Cream",
    category: "Makeup",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600",
  },
  {
    id: "p-003",
    name: "Botanical Hair Elixir",
    category: "Haircare",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=1600",
  },
];

/* ============================================================================
 * ATMOSPHERIC BACKDROP
 * ----------------------------------------------------------------------------
 * Purpose:
 * - Adds depth without stealing attention
 * - Zero layout shift
 * - GPU-friendly transforms only
 * ============================================================================ */
const AtmosphericBackdrop: FC = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#e7c57c]/15 blur-[120px] animate-[float_28s_ease-in-out_infinite]" />
    <div className="absolute top-1/4 -right-48 h-[600px] w-[600px] rounded-full bg-[#bfa7ff]/15 blur-[140px] animate-[float_34s_ease-in-out_infinite_6s]" />
    <div className="absolute -bottom-48 left-1/3 h-[560px] w-[560px] rounded-full bg-[#7fd6c8]/10 blur-[160px] animate-[float_40s_ease-in-out_infinite_12s]" />
  </div>
);

/* ============================================================================
 * HERO — EMOTIONAL HOOK (FIRST 3 SECONDS)
 * ----------------------------------------------------------------------------
 * Goal: Immediate emotional clarity
 * Technique: Editorial typography, restrained motion, negative space
 * ============================================================================ */
const Hero: FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = (): void => {
      if (!ref.current) return;
      ref.current.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center px-6">
      <div
        ref={ref}
        className="mx-auto max-w-[72rem] space-y-12 text-center transition-transform duration-300"
      >
        <p className="tracking-[0.35em] text-xs uppercase text-[#e7c57c]">
          A considered beauty house
        </p>

        <h1 className="font-extrabold leading-[0.95] text-[clamp(3.2rem,9vw,7.5rem)]">
          Beauty,
          <span className="block bg-gradient-to-r from-[#e7c57c] via-[#bfa7ff] to-[#7fd6c8] bg-clip-text text-transparent">
            reduced to its essence
          </span>
        </h1>

        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/65">
          High‑performance formulations designed with restraint, intention,
          and deep respect for ritual.
        </p>

        <div className="flex flex-wrap justify-center gap-5 pt-8">
          <Link
            href="/products"
            className="rounded-full bg-gradient-to-r from-[#e7c57c] to-[#7fd6c8] px-12 py-4 font-semibold text-black transition-transform hover:scale-[1.04]"
          >
            Enter Collection
          </Link>
          <Link
            href="#featured"
            className="rounded-full border border-white/20 px-12 py-4 font-semibold transition hover:bg-white/10"
          >
            Our essentials
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
 * PRODUCT CARD — MICRO‑INTERACTION FOCUS
 * ----------------------------------------------------------------------------
 * Interaction is subtle, tactile, and intentional
 * No gimmicks. No springs. No JS animation libraries.
 * ============================================================================ */
const ProductCard: FC<{ product: FeaturedProduct }> = ({ product }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    ref.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    ref.current.style.background = `radial-gradient(420px at ${x}px ${y}px, rgba(231,197,124,0.22), transparent 55%)`;
  };

  const reset = (): void => {
    if (!ref.current) return;
    ref.current.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    ref.current.style.background = "rgba(255,255,255,0.035)";
  };

  return (
    <article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 will-change-transform"
    >
      <div className="relative h-[18rem]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="space-y-2 p-6">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#e7c57c]">
          {product.category}
        </p>
        <h3 className="text-lg font-semibold leading-tight">
          {product.name}
        </h3>
      </div>
    </article>
  );
};

/* ============================================================================
 * FEATURED SECTION — VISUAL PROOF
 * ============================================================================ */
const Featured: FC = () => (
  <section id="featured" className="px-6 py-40">
    <div className="mx-auto max-w-[80rem]">
      <header className="mb-24 max-w-3xl">
        <h2 className="mb-6 text-[clamp(2.6rem,6vw,4.2rem)] font-extrabold leading-tight">
          A disciplined edit of
          <br /> what truly matters
        </h2>
        <p className="text-lg leading-relaxed text-white/65">
          Each product earns its place through performance, longevity,
          and tactile pleasure.
        </p>
      </header>

      <div className="grid gap-12 md:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-32">
        <Link
          href="/products"
          className="inline-block rounded-full border border-white/20 px-14 py-4 font-semibold transition hover:bg-white/10"
        >
          View full collection
        </Link>
      </div>
    </div>
  </section>
);

/* ============================================================================
 * BRAND PHILOSOPHY — EMOTIONAL REINFORCEMENT
 * ============================================================================ */
const Philosophy: FC = () => (
  <section className="bg-black/40 px-6 py-40">
    <div className="mx-auto max-w-4xl space-y-10">
      <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-tight">
        Science, sensuality,
        <br /> and restraint
      </h2>
      <p className="max-w-3xl text-lg leading-relaxed text-white/70">
        Our formulations balance clinical rigor with sensory elegance.
        Nothing excessive. Nothing accidental. Every detail exists
        to support ritual, confidence, and longevity.
      </p>
    </div>
  </section>
);

/* ============================================================================
 * FOOTER — QUIET CLOSURE
 * ============================================================================ */
const Footer: FC = () => (
  <footer className="py-16 text-center text-xs tracking-wide text-white/40">
    © {new Date().getFullYear()} Quiet Luxury Beauty House
  </footer>
);

/* ============================================================================
 * PAGE COMPOSITION
 * ============================================================================ */
const BeautyHomePage: FC = () => (
  <main className="relative overflow-hidden bg-gradient-to-br from-[#0e0e13] via-black to-black text-white">
    <AtmosphericBackdrop />
    <Hero />
    <Featured />
    <Philosophy />
    <Footer />
  </main>
);

export default BeautyHomePage;

/* ============================================================================
 * REQUIRED GLOBAL KEYFRAMES (ADD ONCE)
 * ============================================================================
 * @keyframes float {
 *   0%,100% { transform: translate3d(0,0,0); }
 *   50% { transform: translate3d(40px,-40px,0); }
 * }
 */
