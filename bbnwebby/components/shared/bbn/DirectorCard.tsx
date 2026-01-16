"use client";

import React from "react";
import type { BBNDirector } from "./bbnTypes";
import { Phone, MapPin } from "lucide-react";

interface DirectorCardProps {
  director: BBNDirector;
}

export const DirectorCard: React.FC<DirectorCardProps> = ({ director }) => {
  return (
    <div
      className="
        bg-pink-300 border border-pink-400 rounded-2xl
        shadow-lg hover:shadow-xl transition-shadow
        overflow-hidden
      "
    >
      {/* Image */}
      <div className="w-full h-48 bg-pink-400 overflow-hidden">
        <img
          src={director.photo_url}
          alt={director.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-lg font-semibold text-black leading-tight">
          {director.name}
        </h3>

        {/* Phone */}
        <div className="flex items-center gap-2 text-black text-sm">
          <Phone className="w-4 h-4 text-black" />
          <span>{director.phone_number}</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-black text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-black" />
          <span>
            {director.city}, {director.state}
            {director.district && (
              <span className="text-black">
                {" "}
                • {director.district}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
