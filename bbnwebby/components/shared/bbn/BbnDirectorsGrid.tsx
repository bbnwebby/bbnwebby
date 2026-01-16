"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/sbmsSupabaseClient";
import { DirectorCard } from "./DirectorCard";
import BBNFilterBar from "./BBNFilterBar";
import type { BBNDirector } from "./bbnTypes";

interface RegionGroups {
  [region: string]: BBNDirector[];
}

export default function DirectorGridWithFilters() {
  const [allDirectors, setAllDirectors] = useState<BBNDirector[]>([]);
  const [filteredDirectors, setFilteredDirectors] = useState<BBNDirector[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Hierarchy state
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  /**
   * Fetch all directors once
   */
  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      setLoading(true);

      const { data } = await supabase
        .from("bbn_directors")
        .select("*")
        .order("name");

      const directors: BBNDirector[] = data ?? [];

      setAllDirectors(directors);
      setFilteredDirectors(directors);
      setLoading(false);
    };

    fetchAll();
  }, []);

  /**
   * Derive state options
   */
  const states = useMemo<string[]>(() => {
    return Array.from(new Set(allDirectors.map(d => d.state))).sort();
  }, [allDirectors]);

  /**
   * Derive district options (fallback to city)
   */
  const districts = useMemo<string[]>(() => {
    const raw = allDirectors
      .filter(d => !selectedState || d.state === selectedState)
      .map(d => d.district || d.city);

    return Array.from(new Set(raw)).filter(Boolean).sort();
  }, [allDirectors, selectedState]);

  /**
   * Derive city options
   */
  const cities = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        allDirectors
          .filter(d => {
            if (!selectedDistrict) return true;
            return (
              d.district === selectedDistrict ||
              (!d.district && d.city === selectedDistrict)
            );
          })
          .map(d => d.city)
      )
    ).sort();
  }, [allDirectors, selectedDistrict]);

  /**
   * Group filtered directors by region
   */
  const directorsByRegion = useMemo<RegionGroups>(() => {
    return filteredDirectors.reduce<RegionGroups>((acc, director) => {
      const regionKey: string = director.region || "Other";

      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }

      acc[regionKey].push(director);
      return acc;
    }, {});
  }, [filteredDirectors]);

  /**
   * Sort regions alphabetically for stable rendering
   */
  const sortedRegions = useMemo<string[]>(() => {
    return Object.keys(directorsByRegion).sort();
  }, [directorsByRegion]);

  return (
    <div className="p-6 bg-pink-200 min-h-screen text-gray-800 rounded-lg">
      <BBNFilterBar
        data={allDirectors}
        onFilterChange={setFilteredDirectors}
        hierarchy={{
          states,
          districts,
          cities,
          selection: {
            selectedRegion,
            selectedState,
            selectedDistrict,
            selectedCity,
          },
          setters: {
            setSelectedRegion,
            setSelectedState,
            setSelectedDistrict,
            setSelectedCity,
          },
        }}
      />

      <main className=" space-y-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-900 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredDirectors.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800">
            <p className="text-gray-500">
              No directors found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSelectedRegion("");
                setSelectedState("");
                setSelectedDistrict("");
                setSelectedCity("");
              }}
              className="mt-4 text-blue-500 text-sm hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          sortedRegions.map((region) => (
            <section key={region} className="space-y-6">
              {/* Region Header */}
              <h2 className="text-2xl font-semibold tracking-tight border-b border-gray-800 pb-2">
                {region}
              </h2>

              {/* Region Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in duration-300">
                {directorsByRegion[region].map((director) => (
                  <DirectorCard
                    key={director.id}
                    director={director}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
