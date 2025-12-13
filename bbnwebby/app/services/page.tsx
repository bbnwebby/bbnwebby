"use client";

import React, {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */
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

/**
 * =====================================================
 * PLACEHOLDER IMAGE
 * =====================================================
 */
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

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */
const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

/**
 * =====================================================
 * SEARCH SCORING
 * =====================================================
 */
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
  

  // Text relevance
  words.forEach((w) => {
    if (name.includes(w)) score += 25;
    if (category.includes(w)) score += 10;
    tags.forEach((t) => {
      if (t.includes(w)) score += 12;
    });
  });

  // Tag boost
  selectedTags.forEach((tag) => {
    const n = normalize(tag);
    if (category === n || tags.includes(n)) {
      score += 30;
    }
  });

  // Audience soft filter
  if (audience !== "All Categories" && service.audience === audience) {
    score += 15;
  }

  return score;
};

/**
 * =====================================================
 * SERVICE CARD
 * =====================================================
 */
const ServiceCard: FC<{
  service: Service;
  highlighted: boolean;
  onClick: (id: string) => void;
}> = ({ service, highlighted, onClick }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  return (
    <article
      onClick={() => onClick(service.id)}
      className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-500
        bg-white/70 backdrop-blur-xl hover:-translate-y-1 hover:shadow-xl
        ${highlighted ? "ring-2 ring-pink-400" : "border-pink-100"}`}
    >
      <div className="relative h-64">
        <img
          src={imgError ? buildPlaceholderDataUrl(service.name) : service.image}
          alt={service.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="text-xs uppercase tracking-widest text-pink-500">
          {service.category}
        </p>
        <p className="text-sm text-gray-600">
          {service.tags.slice(0, 4).join(" • ")}
        </p>
        <div className="flex justify-between pt-2">
          <span className="font-medium">
            {service.price === "0" ? "Contact us" : `₹${service.price}`}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-700">
            {service.audience}
          </span>
        </div>
      </div>
    </article>
  );
};

/**
 * =====================================================
 * PAGE
 * =====================================================
 */
const ServicesPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("selected");
  const selectedTagsParam = searchParams.get("tags");
  const selectedNameParam = searchParams.get("name");

  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState<string>(selectedNameParam ?? "");
  const [audience, setAudience] = useState<string>("All Categories");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    selectedTagsParam ? selectedTagsParam.split(",") : []
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedImgError, setSelectedImgError] = useState<boolean>(false);

  const selectedRef = useRef<HTMLDivElement | null>(null);

  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);

const selectedImgRef = useRef<HTMLImageElement | null>(null);
const [imageLoaded, setImageLoaded] = useState(false);


useEffect(() => {
  if (!selectedId || !detailsVisible || !selectedRef.current) return;
  if (!imageLoaded) return; // wait for image to load

  const targetY =
    selectedRef.current.getBoundingClientRect().top +
    window.scrollY -
    100; // offset
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = 700;

  let startTime: number | null = null;

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const animate = (time: number) => {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}, [selectedId, detailsVisible, imageLoaded]);


  /**
   * Load services JSON
   */
  useEffect((): void => {
    const load = async (): Promise<void> => {
      const res = await fetch("/data/bbn_webby_services_filtered.json");
      const raw = (await res.json()) as Array<Record<string, unknown>>;

      const parsed: Service[] = raw.map((r) => ({
        id: String(r["id"]),
        name: String(r["Service Name"]),
        price: String(r["Price"] ?? "0"),
        category: String(r["Category"]),
        audience: String(r["Audience"] ?? "All"),
        tags: String(r["Tags"] ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        image: String(r["image"] ?? ""),
      }));

      setServices(parsed);
    };

    load();
  }, []);


  /**
   * Derived data
   */
  const selectedService = useMemo<Service | null>(() => {
    return services.find((s) => s.id === selectedId) ?? null;
  }, [services, selectedId]);

  const audiences = useMemo<string[]>(() => {
    return [
      "All Categories",
      ...Array.from(new Set(services.map((s) => s.audience))),
    ];
  }, [services]);

  const categoryAndTags = useMemo<string[]>(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      set.add(s.category);
      s.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [services]);

  const ranked = useMemo<RankedService[]>(() => {
    return services
      .map((s) => ({
        service: s,
        score: scoreService(s, search, selectedTags, audience),
      }))
      .filter((r) =>
        search || selectedTags.length || audience !== "All Categories"
          ? r.score > 0
          : true
      )
      .sort((a, b) => b.score - a.score);
  }, [services, search, selectedTags, audience]);

  /**
   * Actions
   */
  const toggleTag = (tag: string): void => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
    setDetailsVisible(false);
  };

  const clearFilters = (): void => {
    setSearch("");
    setSelectedTags([]);
    setAudience("All Categories");
    setDetailsVisible(false);
    router.push("/services");
  };

  const onCardClick = (id: string): void => {
    const svc = services.find((s) => s.id === id);
    if (!svc) return;

    const params = new URLSearchParams();
    params.set("selected", id);
    params.set("name", svc.name);
    if (svc.tags.length) {
      params.set("tags", svc.tags.join(","));
    }
    setDetailsVisible(true);
    router.push(`/services?${params.toString()}`,{
      scroll: false, 
  });

  };

  /**
   * =====================================================
   * RENDER
   * =====================================================
   */
  return (
    <main className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-200/40 via-white to-white" />

      <section className="px-8 pt-32 pb-20">
        <header className="text-center mb-14">
          <h1 className="text-4xl font-semibold">Our Services</h1>
        </header>

        {/* Search + Filter */}
        <div className="max-w-5xl mx-auto mb-12 flex gap-4">
          <input
            value={search}
            onChange={(e) => {setSearch(e.target.value), setDetailsVisible(false)}}
            
            placeholder="Search services..."
            className="flex-1 rounded-full px-6 py-4 border border-pink-200 focus:border-pink-400 outline-none"
          />

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-full px-6 py-4 bg-pink-400 hover:bg-pink-500 text-white font-medium transition"
          >
            Filter by Tags
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="max-w-5xl mx-auto mb-16 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-b-4 border-pink-500 shadow-xl">
            {/* Audience */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Audience / Category</p>

                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-pink-600 hover:text-pink-800 transition"
                >
                  Remove filters
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {audiences.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      audience === a
                        ? "bg-pink-400 text-white"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Categories & Tags
              </p>
              <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto">
                {categoryAndTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? "bg-pink-400 text-white"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

{/* Selected details */}
{selectedService && detailsVisible && (
  <div
    ref={selectedRef}
    className="mb-20 mx-auto max-w-6xl h-[80vh] transition-all duration-700 ease-out"
  >
    <div className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl shadow-xl overflow-hidden h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Image column */}
        <div className="relative h-auto md:h-full bg-pink-100">
          <Image
            src={
              selectedImgError
                ? buildPlaceholderDataUrl(selectedService.name)
                : selectedService.image
            }
            alt={selectedService.name}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-l-3xl"
            onError={() => setSelectedImgError(true)}
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>

        {/* Content column */}
        <div className="p-8 md:p-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-xs uppercase tracking-widest text-pink-500 mb-2">
              Selected Service
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {selectedService.name}
            </h2>
            <p className="text-gray-700 mb-4">{selectedService.tags.join(", ")}</p>
            <p className="text-sm font-medium text-gray-900">
              {selectedService.price === "0"
                ? "Contact us to know more"
                : `₹${selectedService.price}`}
            </p>
          </div>

          <a
            href={`https://wa.me/917995514547?text=${encodeURIComponent(
              `I would like ${selectedService.name} (service id: ${selectedService.id}) service`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-medium transition-transform hover:scale-105"
          >
            Contact Us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
)}


        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ranked.map(({ service }) => (
            <ServiceCard
              key={service.id}
              service={service}
              highlighted={service.id === selectedId}
              onClick={onCardClick}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
