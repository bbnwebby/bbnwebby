"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

export interface ImageValue {
  file: File | null;
  url: string;
}

interface ImageInputProps {
  label: string;
  value: ImageValue | null;
  onChange: (value: ImageValue) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Handles a valid image file and updates the parent state
   */
  const handleFile = useCallback((file: File): void => {
    if (!file.type.startsWith("image/")) return;

    onChange({
      file,
      url: URL.createObjectURL(file),
    });
  }, [onChange]);

  /**
   * Handle drag over event
   */
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  /**
   * Handle dropped files
   */
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    const file: File | undefined = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /**
   * Handle paste events (Ctrl/Cmd + V)
   */
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent): void => {
      const items: DataTransferItemList | null = event.clipboardData?.items ?? null;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file: File | null = item.getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col sm:flex-row items-center justify-center sm:justify-start m-4 p-6 border-2 border-dashed rounded-xl gap-6 cursor-pointer transition-all
        ${
          isDragging
            ? "border-blue-500 bg-gray-700"
            : "border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-750"
        }
      `}
    >
      {/* Hidden file input (click upload) */}
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const file: File | undefined = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Image Preview */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-900 border border-gray-600 group-hover:border-blue-500 rounded-lg flex items-center justify-center overflow-hidden shrink-0 transition-colors">
        {value ? (
          <img
            src={value.url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="text-gray-500 group-hover:text-blue-500" />
        )}
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center gap-2 text-white font-medium mb-1">
          <Upload className="w-5 h-5 text-blue-500" />
          <span>{value ? "Change Photo" : label}</span>
        </div>
        <p className="text-xs text-gray-400">
          {value
            ? "Click, paste, or drop to replace"
            : "Click, paste, or drag & drop an image"}
        </p>
      </div>
    </label>
  );
};
