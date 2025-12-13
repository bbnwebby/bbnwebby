"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * =============================
 * TYPES
 * =============================
 */
interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  audience: string;
  tags: string[];
}

/**
 * =============================
 * PLACEHOLDER IMAGE
 * Soft luxury gradient matching BBN pink aesthetic
 * =============================
 */
const buildPlaceholderDataUrl = (title: string): string => {
  const safe = title.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23ffd6e5'/>
        <stop offset='100%' stop-color='%23ffeaf1'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' rx='40' fill='url(%23g)' />
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
      font-family='Playfair Display, serif' font-size='38' fill='%23be185d'>${safe}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * =============================
 * SERVICE CARD – luxury editorial style
 * =============================
 */
const ServiceCard: FC<{
  service: Service;
  highlighted: boolean;
  onClick: (id: string) => void;
}> = ({ service, highlighted, onClick }) => {
  return (
    <article
      onClick={() => onClick(service.id)}
      className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-500
        bg-white/70 backdrop-blur-xl
        hover:-translate-y-1 hover:shadow-xl
        ${highlighted ? 'ring-2 ring-pink-400 shadow-xl' : 'border-pink-100'}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={buildPlaceholderDataUrl(service.name)}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-wide text-gray-900">
            {service.name}
          </h3>
          <p className="text-xs uppercase tracking-widest text-pink-500">
            {service.category}
          </p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {service.tags.slice(0, 4).join(' • ')}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-gray-900">
            {service.price > 0 ? `₹${service.price}` : 'Contact us to know more'}
          </span>
          <span className="text-[11px] px-3 py-1 rounded-full bg-pink-100 text-pink-700">
            {service.audience}
          </span>
        </div>
      </div>
    </article>
  );
};

/**
 * =============================
 * SERVICES PAGE – matches BBN hero / navbar aesthetic
 * =============================
 */
const ServicesPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);

  // filters
  const [search, setSearch] = useState<string>('');
  const [audience, setAudience] = useState<string>('All');
  const [tag, setTag] = useState<string>('');

  const selectedId = searchParams.get('selected');
  const selectedRef = useRef<HTMLDivElement | null>(null);

  /**
   * Load static JSON
   */
  useEffect((): void => {
    const load = async (): Promise<void> => {
      const res = await fetch('/data/bbn_webby_services_filtered.json');
      const raw = (await res.json()) as Array<Record<string, unknown>>;

      const parsed: Service[] = raw.map((r, i) => ({
        id: String(i),
        name: String(r['Service Name'] ?? ''),
        price: Number(r['Price'] ?? 0) || 0,
        category: String(r['Category'] ?? ''),
        audience: String(r['Audience'] ?? 'All'),
        tags: String(r['Tags'] ?? '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }));

      setServices(parsed);
    };

    load();
  }, []);

  /**
   * Derived filters
   */
  const allAudiences = useMemo(() => {
    const set = new Set<string>(['All']);
    services.forEach((s) => set.add(s.audience));
    return Array.from(set);
  }, [services]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search) {
        const hay = `${s.name} ${s.category} ${s.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      if (audience !== 'All' && s.audience !== audience) return false;
      if (tag && !s.tags.includes(tag)) return false;
      return true;
    });
  }, [services, search, audience, tag]);

  /**
   * Scroll to selected
   */
  useEffect((): void => {
    if (selectedId) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [selectedId]);

  const onCardClick = (id: string): void => {
    router.push(`/services?selected=${id}`);
  };

  const selectedService = services.find((s) => s.id === selectedId) ?? null;

  return (
    <main className="relative">
      {/* Soft background like hero */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-200/40 via-white to-white"></div>

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <header className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-500 mb-2">
            What We Offer
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Our Services
          </h1>
        </header>

        {/* Filter bar */}
        <div className="mb-14 bg-white/70 backdrop-blur-xl border border-pink-200 rounded-full px-6 py-4 shadow-lg flex flex-wrap gap-4 items-center justify-center">
          <input
            className="bg-transparent outline-none px-4 py-2 w-64 text-sm placeholder-gray-500"
            placeholder="Search services"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="bg-transparent text-sm outline-none"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            {allAudiences.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className="bg-transparent text-sm outline-none"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Selected preview */}
        {selectedService && (
          <div ref={selectedRef} className="mb-20">
            <div className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image side */}
                <div className="relative h-72 md:h-full bg-pink-100">
                  <img
                    src={buildPlaceholderDataUrl(selectedService.name)}
                    alt={selectedService.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content side */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-pink-500 mb-2">
                      Selected Service
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                      {selectedService.name}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {selectedService.tags.join(', ')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-6">
                      {selectedService.price > 0
                        ? `₹${selectedService.price}`
                        : 'Contact us to know more'}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={`https://wa.me/917995514547?text=${encodeURIComponent(
                      `I would like ${selectedService.name}${selectedService.id ? ` (${selectedService.id}) service` : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-medium tracking-wide transition-transform duration-300 hover:scale-105"
                  >
                    Contact Us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
    }

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filtered.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              highlighted={s.id === selectedId}
              onClick={onCardClick}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-600 mt-16">No services found</p>
        )}
      </section>
    </main>
  );
};

export default ServicesPage;
