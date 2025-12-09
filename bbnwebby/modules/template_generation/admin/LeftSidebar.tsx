"use client";

import React from "react";
import { EditorState } from "../types";
import { v4 as uuid } from "uuid";

interface SidebarProps {
  state: EditorState;
}

/**
 * Sidebar for adding new elements to the canvas.
 */
export default function LeftSidebar({ state }: SidebarProps) {
  const { elements, setElements } = state;

  const addText = () => {
    const newEl = {
      id: uuid(),
      type: "text" as const,
      text: "New Text",
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      z_index: elements.length + 1,
      font_size: 16,
      font: "Arial",
      text_color: "#000000",
    };

    setElements([...elements, newEl]);
  };

  const addImage = () => {
    const newEl = {
      id: uuid(),
      type: "image" as const,
      image_url: "https://placehold.co/200x200",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      z_index: elements.length + 1,
    };

    setElements([...elements, newEl]);
  };

  return (
    <div className="border-r p-4 bg-gray-50">
      <h2 className="font-bold mb-4">Add Elements</h2>

      <button
        onClick={addText}
        className="w-full mb-2 py-2 bg-blue-600 text-white rounded"
      >
        Add Text
      </button>

      <button
        onClick={addImage}
        className="w-full py-2 bg-green-600 text-white rounded"
      >
        Add Image
      </button>
    </div>
  );
}