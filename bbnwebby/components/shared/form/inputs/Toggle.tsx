"use client";

import React from "react";
import { Check } from "lucide-react"; // Using Lucide for the checkmark

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-2">
      <div className="relative flex items-center justify-center">
        {/* Hidden Native Checkbox */}
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        
        {/* Custom Checkbox Box */}
        <div
          className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
            checked 
              ? "bg-blue-600 border-blue-600" 
              : "bg-transparent border-gray-400 group-hover:border-gray-300"
          }`}
        >
          {/* Animated Checkmark */}
          <Check 
            className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
              checked ? "scale-100" : "scale-0"
            }`} 
            strokeWidth={4}
          />
        </div>
      </div>

      {/* Label Text */}
      <span className="text-sm text-gray-200 font-medium select-none">
        {label}
      </span>
    </label>
  );
};