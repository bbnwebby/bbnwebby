"use client";

import React from "react";

interface DateTimeInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className=" rounded-lg bg-gray-700 p-3 w-full"
      />
    </div>
  );
};
