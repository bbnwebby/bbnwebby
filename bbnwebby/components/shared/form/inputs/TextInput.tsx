"use client";

import React from "react";

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  className,
}) => {
  return (
    <div className="space-y-1 bg-gray-700 rounded-md">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={` rounded-lg bg-gray-700 p-3 w-full ${className ?? ""}`}
      />
    </div>
  );
};
