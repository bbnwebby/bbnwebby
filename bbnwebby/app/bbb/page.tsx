"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/* ============================================================================ */
/* TYPES */
/* ============================================================================ */
interface Service {
  id: string;
  name: string;
  price: string;
  category: string;
  audience: string;
  tags: string[];
  image: string;
}

interface RankedService {
  service: Service;
  score: number;
}

/* ============================================================================ */
/* PLACEHOLDER IMAGE */
/* ============================================================================ */
const buildPlaceholderDataUrl = (title: string): string => {
  const safe = title.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23ffd6e5'/>
        <stop offset='100%' stop-color='%23ffeaf1'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' rx='40' fill='url(%23g)' />
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
      font-family='Playfair Display, serif' font-size='38' fill='%23be185d'>
      ${safe}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* ============================================================================ */
/* HELPERS */
/* ============================================================================ */
const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

const scoreService = (
  service: Service,
  query: string,
  selectedTags: string[],
  audience: string
): number => {
  let score = 0;
  const q = normalize(query);
  const words = q ? q.split(" ") : [];
  const name = normalize(service.name);
  const category = normalize(service.category);
  const tags = service.tags.map(normalize);

  words.forEach((w) => {
    if (name.includes(w)) score += 25;
    if (category.includes(w)) score += 10;
    tags.forEach((t) => {
      if (t.includes(w)) score += 12;
    });
  });

  selectedTags.forEach((tag) => {
    const n = normalize(tag);
    if (category === n || tags.includes(n)) score += 30;
  });

  if (audience !== "All Categories" && service.audience === audience) score += 15;

  return score;
};

/* ============================================================================ */
/* ATMOSPHERIC BACKDROP */
/* ============================================================================ */
const AtmosphericBackdrop: FC = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-pink-200/20 blur-[120px] animate-[float_28s_ease-in-out_infinite]" />
    <div className="absolute top-1/4 -right-48 h-[600px] w-[600px] rounded-full bg-purple-200/20 blur-[140px] animate-[float_34s_ease-in-out_infinite_6s]" />
    <div className="absolute -bottom-48 left-1/3 h-[560px] w-[560px] rounded-full bg-teal-200/15 blur-[160px] animate-[float_40s_ease-in-out_infinite_12s]" />
  </div>
);

/* ============================================================================ */
/* HERO SECTION */
/* ============================================================================ */
const Hero: FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
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
    <section className="relative flex min-h-[60vh] items-center justify-center px-6">
      <div ref={ref} className="mx-auto max-w-4xl space-y-4 text-center transition-transform duration-300">
        <h1 className="font-extrabold leading-[1.05] text-[clamp(2.5rem,8vw,4rem)]">{title}</h1>
        <p className="text-lg text-white/70">{subtitle}</p>
      </div>
    </section>
  );
};

/* ============================================================================ */
/* SERVICE CARD */
/* ============================================================================ */
const ServiceCard: FC<{ service: Service; highlighted: boolean; onClick: (id: string) => void }> = ({ service, highlighted, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    ref.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const reset = (): void => {
    if (!ref.current) return;
    ref.current.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={() => onClick(service.id)}
      className={`cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 ${
        highlighted ? "ring-2 ring-pink-400" : ""
      }`}
    >
      <div className="relative h-64">
        <Image
          src={imgError ? buildPlaceholderDataUrl(service.name) : service.image}
          alt={service.name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-700"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="p-6 space-y-2">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-pink-400">{service.category}</p>
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="text-sm text-white/70">{service.tags.join(" • ")}</p>
        <div className="flex justify-between pt-2">
          <span className="font-medium">{service.price === "0" ? "Contact us" : `₹${service.price}`}</span>
          <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-700">{service.audience}</span>
        </div>
      </div>
    </article>
  );
};

/* ============================================================================ */
/* MAIN SERVICES PAGE */
/* ============================================================================ */
const ServicesPage: FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState("All Categories");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImgError, setSelectedImgError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  /* Load Services JSON */
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/data/bbn_webby_services_filtered.json");
      const raw = (await res.json()) as Record<string, unknown>[];
      const parsed: Service[] = raw.map((r) => ({
        id: String(r["id"]),
        name: String(r["Service Name"]),
        price: String(r["Price"] ?? "0"),
        category: String(r["Category"]),
        audience: String(r["Audience"] ?? "All"),
        tags: String(r["Tags"] ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        image: String(r["image"] ?? ""),
      }));
      setServices(parsed);
    };
    load();
  }, []);

  const audiences = useMemo(() => ["All Categories", ...Array.from(new Set(services.map((s) => s.audience)))], [services]);
  const categoryAndTags = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      set.add(s.category);
      s.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [services]);

  const ranked = useMemo(() => {
    return services
      .map((s) => ({ service: s, score: scoreService(s, search, selectedTags, audience) }))
      .filter((r) => search || selectedTags.length || audience !== "All Categories" ? r.score > 0 : true)
      .sort((a, b) => b.score - a.score);
  }, [services, search, selectedTags, audience]);

  const toggleTag = (tag: string): void => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = (): void => {
    setSearch("");
    setSelectedTags([]);
    setAudience("All Categories");
    setSelectedId(null);
  };

  const onCardClick = (id: string) => setSelectedId(id);

  /* Scroll to selected service */
  useEffect(() => {
    if (!selectedId || !selectedRef.current || !imageLoaded) return;
    const targetY = selectedRef.current.getBoundingClientRect().top + window.scrollY - 100;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 700;
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [selectedId, imageLoaded]);

  const selectedService = useMemo(() => services.find((s) => s.id === selectedId) ?? null, [services, selectedId]);

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-[#0e0e13] via-black to-black text-white min-h-screen">
      <AtmosphericBackdrop />
      <Hero title="Our Products" subtitle="Curated offerings crafted with precision and care." />

      {/* Search + Filters */}
      <section className="px-6 py-12 max-w-6xl mx-auto space-y-8">
        <div className="flex gap-4 flex-wrap">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
            placeholder="Search Products..."
            className="flex-1 rounded-full px-6 py-4 border border-pink-200 focus:border-pink-400 outline-none bg-black/20 text-white placeholder-white/60"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className="rounded-full px-6 py-4 bg-pink-400 hover:bg-pink-500 text-black font-semibold transition"
          >
            Filter by Tags
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Audience / Category</p>
              <button onClick={clearFilters} className="text-sm font-medium text-pink-400 hover:text-pink-600">Clear All</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {audiences.map(a => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${audience===a?"bg-pink-400 text-black":"bg-white/10 text-white"}`}
                >
                  {a}
                </button>
              ))}
            </div>

            <p className="font-semibold">Categories & Tags</p>
            <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto">
              {categoryAndTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm ${selectedTags.includes(tag)?"bg-pink-400 text-black":"bg-white/10 text-white"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Selected Service */}
      {selectedService && (
        <section ref={selectedRef} className="px-6 py-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-xl shadow-xl">
            <div className="relative h-64 md:h-auto md:w-1/2">
              <Image
                src={selectedImgError ? buildPlaceholderDataUrl(selectedService.name) : selectedService.image}
                alt={selectedService.name}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-700"
                onError={() => setSelectedImgError(true)}
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </div>
            <div className="p-6 md:p-10 flex flex-col justify-between md:w-1/2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-pink-400 mb-2">Selected Service</p>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">{selectedService.name}</h2>
                <p className="text-white/70 mb-4">{selectedService.tags.join(", ")}</p>
                <p className="text-lg font-medium">{selectedService.price==="0"?"Contact us to know more":`₹${selectedService.price}`}</p>
              </div>
              <a
                href={`https://wa.me/917995514547?text=${encodeURIComponent(`I would like ${selectedService.name} (service id: ${selectedService.id}) service`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-pink-400 hover:bg-pink-500 text-black font-semibold transition-transform hover:scale-105"
              >
                Contact Us on WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Services Grid */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {ranked.map(({ service }) => (
            <ServiceCard key={service.id} service={service} highlighted={service.id===selectedId} onClick={onCardClick} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;

/* ============================================================================ */
/* KEYFRAMES (add globally once) */
/* ============================================================================ */
/*
@keyframes float {
  0%,100% { transform: translate3d(0,0,0); }
  50% { transform: translate3d(40px,-40px,0); }
}
*/
