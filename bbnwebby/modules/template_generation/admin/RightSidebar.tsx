"use client";

import React from "react";
import { EditorState, EditorElement } from "../types";

interface RightSidebarProps {
  state: EditorState;
}

/**
 * Right sidebar: shows editable properties of the selected element
 */
export default function RightSidebar({ state }: RightSidebarProps) {
  const { elements, selectedId, setElements } = state;

  const selectedElement = elements.find((el) => el.id === selectedId);

  if (!selectedElement) {
    return (
      <div className="p-4 text-gray-500">
        <p>No element selected</p>
      </div>
    );
  }

  /**
   * Update the selected element with new values
   */
  const updateSelected = (updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) =>
        el.id === selectedElement.id ? { ...el, ...updates } : el
      )
    );
  };

  /**
   * Generic number input change handler
   */
  const handleNumberChange = (
    key: keyof EditorElement,
    value: string
  ) => {
    const num = parseFloat(value);
    if (!isNaN(num)) updateSelected({ [key]: num } as Partial<EditorElement>);
  };

  /**
   * Generic string input change handler
   */
  const handleStringChange = (
    key: keyof EditorElement,
    value: string
  ) => {
    updateSelected({ [key]: value } as Partial<EditorElement>);
  };

  return (
    <div className="p-4 border-l border-gray-300 overflow-y-auto h-full">
      <h2 className="font-semibold mb-4">Element Properties</h2>

      {/* Common properties */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">X</label>
        <input
          type="number"
          value={selectedElement.x}
          onChange={(e) => handleNumberChange("x", e.target.value)}
          className="w-full border rounded p-1"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Y</label>
        <input
          type="number"
          value={selectedElement.y}
          onChange={(e) => handleNumberChange("y", e.target.value)}
          className="w-full border rounded p-1"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Width</label>
        <input
          type="number"
          value={selectedElement.width}
          onChange={(e) => handleNumberChange("width", e.target.value)}
          className="w-full border rounded p-1"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Height</label>
        <input
          type="number"
          value={selectedElement.height}
          onChange={(e) => handleNumberChange("height", e.target.value)}
          className="w-full border rounded p-1"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Z Index</label>
        <input
          type="number"
          value={selectedElement.z_index}
          onChange={(e) => handleNumberChange("z_index", e.target.value)}
          className="w-full border rounded p-1"
        />
      </div>

      {/* Conditional: text element properties */}
      {selectedElement.type === "text" && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Text</label>
            <textarea
              value={selectedElement.text ?? ""}
              onChange={(e) => handleStringChange("text", e.target.value)}
              className="w-full border rounded p-1"
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Font Size</label>
            <input
              type="number"
              value={selectedElement.font_size ?? 16}
              onChange={(e) => handleNumberChange("font_size", e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Font Family</label>
            <input
              type="text"
              value={selectedElement.font ?? "Arial"}
              onChange={(e) => handleStringChange("font", e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={selectedElement.text_color ?? "#000000"}
              onChange={(e) => handleStringChange("text_color", e.target.value)}
              className="w-full p-1"
            />
          </div>
        </>
      )}

      {/* Conditional: image element properties */}
      {selectedElement.type === "image" && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={selectedElement.image_url ?? ""}
              onChange={(e) => handleStringChange("image_url", e.target.value)}
              className="w-full border rounded p-1"
            />
          </div>
        </>
      )}
    </div>
  );
}