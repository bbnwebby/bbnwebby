"use client";

import { useState } from "react";
import { City, State } from "country-state-city";

// Define the JSON structure for the form
export interface CityStateValue {
  city: string;
  district: string;
  state: string;
  userInput: string; // Keeps track of what's actually in the input box
}

interface Props {
  value: CityStateValue;
  onChange: (value: CityStateValue) => void;
}

interface PostOfficeEntry {
  Name: string;
  District: string;
  State: string;
}

interface PostOfficeResponse {
  Status: string;
  PostOffice: PostOfficeEntry[] | null;
}

const allIndianCities = City.getCitiesOfCountry("IN") || [];

export function CityStateInput({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<Omit<CityStateValue, "userInput">[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = async (input: string) => {
    // 1. Update the parent with the raw text immediately so they can see what they type
    onChange({ ...value, userInput: input });

    if (input.trim().length < 3) {
      setShowDropdown(false);
      return;
    }

    // 2. Search Local Library (Limited info, usually doesn't have district)
    const localFiltered = allIndianCities
      .filter((c) => c.name.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5)
      .map((c) => ({
        city: c.name,
        district: "", // Library doesn't provide districts well
        state: State.getStateByCodeAndCountry(c.stateCode, "IN")?.name || "",
      }));

    setSuggestions(localFiltered);
    setShowDropdown(true);

    // 3. Search API (Detailed: provides District)
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/postoffice/${input}`);
      const data = (await response.json()) as PostOfficeResponse[];

      if (data[0]?.Status === "Success" && data[0].PostOffice) {
        const apiResults = data[0].PostOffice.map((p) => ({
          city: p.Name,
          district: p.District,
          state: p.State,
        }));

        setSuggestions((prev) => {
          const combined = [...prev, ...apiResults];
          // Unique by city and district
          return combined
            .filter((v, i, a) => 
              a.findIndex((t) => t.city === v.city && t.district === v.district) === i
            )
            .slice(0, 10);
        });
      }
    } catch (err) {
      console.warn("API Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: Omit<CityStateValue, "userInput">) => {
    onChange({
      ...item,
      userInput: `${item.city}, ${item.district ? item.district + ", " : ""}${item.state}`,
    });
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      <label className="block mb-1 text-sm text-gray-400">Location Details</label>

      <div className="relative">
        <input
          value={value.userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.userInput.length >= 3 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search City or District..."
          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 outline-none transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-3.5 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-2 max-h-64 overflow-y-auto rounded-xl bg-gray-800 border border-gray-700 shadow-2xl divide-y divide-gray-700">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white flex flex-col"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{s.city}</span>
                <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded text-gray-400 uppercase">
                  {s.state}
                </span>
              </div>
              {s.district && (
                <span className="text-xs text-gray-400 mt-0.5">District: {s.district}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}