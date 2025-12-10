"use client";

import React from "react";

interface RightSidebarProps {
  elements: EditorElement[];
  setElements: (elements: EditorElement[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  elements, 
  setElements, 
  selectedId,
  setSelectedId,
  backgroundUrl, 
  setBackgroundUrl 
}) => {
  const selectedElement = elements.find((el) => el.id === selectedId);

  const updateSelected = (updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) =>
        el.id === selectedElement?.id ? { ...el, ...updates } : el
      )
    );
  };

  const deleteSelected = () => {
    setElements(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">Properties</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Background Image URL</label>
          <input
            type="text"
            value={backgroundUrl || ''}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Properties</h2>
        <button
          onClick={deleteSelected}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">X Position</label>
          <input
            type="number"
            value={selectedElement.x}
            onChange={(e) => updateSelected({ x: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Y Position</label>
          <input
            type="number"
            value={selectedElement.y}
            onChange={(e) => updateSelected({ y: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Width</label>
          <input
            type="number"
            value={selectedElement.width}
            onChange={(e) => updateSelected({ width: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Height</label>
          <input
            type="number"
            value={selectedElement.height}
            onChange={(e) => updateSelected({ height: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Z Index</label>
          <input
            type="number"
            value={selectedElement.z_index}
            onChange={(e) => updateSelected({ z_index: parseInt(e.target.value) || 0 })}
            className="w-full border rounded p-2"
          />
        </div>

        {selectedElement.type === "text" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea
                value={selectedElement.text || ""}
                onChange={(e) => updateSelected({ text: e.target.value })}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="number"
                value={selectedElement.font_size || 16}
                onChange={(e) => updateSelected({ font_size: parseInt(e.target.value) || 16 })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <input
                type="text"
                value={selectedElement.font || "Arial"}
                onChange={(e) => updateSelected({ font: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <input
                type="color"
                value={selectedElement.text_color || "#000000"}
                onChange={(e) => updateSelected({ text_color: e.target.value })}
                className="w-full p-1 h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <input
                type="color"
                value={selectedElement.bg_color || "#ffffff"}
                onChange={(e) => updateSelected({ bg_color: e.target.value })}
                className="w-full p-1 h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Background Transparency</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElement.bg_transparency || 0}
                onChange={(e) => updateSelected({ bg_transparency: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-600">{selectedElement.bg_transparency || 0}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={selectedElement.alignment || "left"}
                onChange={(e) => updateSelected({ alignment: e.target.value as "left" | "center" | "right" | "justify" })}
                className="w-full border rounded p-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Line Height</label>
              <input
                type="number"
                step="0.1"
                value={selectedElement.line_height || 1.2}
                onChange={(e) => updateSelected({ line_height: parseFloat(e.target.value) || 1.2 })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedElement.text_wrap || false}
                  onChange={(e) => updateSelected({ text_wrap: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Text Wrap</span>
              </label>
            </div>
          </>
        )}

        {selectedElement.type === "image" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={selectedElement.image_url || ""}
                onChange={(e) => updateSelected({ image_url: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Object Fit</label>
              <select
                value={selectedElement.object_fit || "contain"}
                onChange={(e) => updateSelected({ object_fit: e.target.value as "contain" | "cover" | "fill" | "none" | "scale-down" })}
                className="w-full border rounded p-2"
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
                <option value="scale-down">Scale Down</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};