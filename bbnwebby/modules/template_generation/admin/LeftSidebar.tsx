// modules\template_generation\admin\LeftSidebar.tsx
"use client";

import React from "react";
import { v4 as uuid } from "uuid";
import * as Types from "../types";


interface LeftSidebarProps {
  elements: Types.EditorElement[];
  setElements: (elements: Types.EditorElement[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  elements, 
  setElements,
  selectedId,
  setSelectedId
}) => {
  const addText = () => {
    const newEl: Types.EditorElement = {
      id: uuid(),
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      z_index: elements.length,
      font_size: 16,
      font: "Arial",
      text_color: "#000000",
      bg_color: "#ffffff",
      bg_transparency: 0,
      alignment: "left",
      text_wrap: false,
      line_height: 1.2
    };

    setElements([...elements, newEl]);
  };

  const addImage = () => {
    const newEl: Types.EditorElement = {
      id: crypto.randomUUID(),
      type: "image",
      image_url: "https://via.placeholder.com/200",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      z_index: elements.length,
      object_fit: "contain"
    };

    setElements([...elements, newEl]);
  };

  const handleLayerClick = (elementId: string) => {
    setSelectedId(elementId);
  };

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="font-bold mb-4 text-lg">Add Elements</h2>

      <button
        onClick={addText}
        className="w-full mb-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Add Text
      </button>

      <button
        onClick={addImage}
        className="w-full mb-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Image
      </button>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-2">Layers ({elements.length})</h3>
        <div className="space-y-1">
          {[...elements]
            .sort((a, b) => (b.z_index || 0) - (a.z_index || 0))
            .map((el) => (
              <div
                key={el.id}
                onClick={() => handleLayerClick(el.id)}
                className={`p-2 rounded text-sm cursor-pointer ${
                  el.id === selectedId 
                    ? 'bg-blue-100 border border-blue-500' 
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {el.type === 'text' ? '📝' : '🖼️'} {el.type} - {el.id.slice(0, 8)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};