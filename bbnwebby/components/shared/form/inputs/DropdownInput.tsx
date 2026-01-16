"use client";

import React from "react";

interface DropdownInputProps<T extends string> {
  label?: string;
  value?: T; // allow empty / undefined for placeholder
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  placeholder?: string; // 👈 new prop
}

export function DropdownInput<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select from dropdown",
}: DropdownInputProps<T>) {
  return (
    <div className="space-y-1 bg-gray-700 rounded-md">
      {label && <label className="text-sm font-medium">{label}</label>}

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg bg-gray-700 p-3 w-full text-white"
      >
        {/* Placeholder option */}
        <option value="" disabled hidden>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
