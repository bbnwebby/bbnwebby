"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { EditorState, EditorElement } from "./types";

interface CanvasProps {
  state: EditorState;
}

/**
 * Central canvas area with draggable & resizable elements.
 */
export default function Canvas({ state }: CanvasProps) {
  const {
    elements,
    setElements,
    selectedId,
    setSelectedId,
    backgroundUrl,
  } = state;

  /**
   * Update a single element (drag/resize)
   */
  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const updated = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updated);
  };

  return (
    <div className="relative bg-gray-200 flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: 800,
          height: 600,
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {elements.map((el) => (
          <Rnd
            key={el.id}
            bounds="parent"
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) =>
              updateElement(el.id, { x: d.x, y: d.y })
            }
            onResizeStop={(e, dir, ref, delta, pos) =>
              updateElement(el.id, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: pos.x,
                y: pos.y,
              })
            }
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(el.id);
            }}
            style={{
              zIndex: el.z_index,
              border: el.id === selectedId ? "2px solid #4F46E5" : "none",
            }}
          >
            {/* TEXT ELEMENT */}
            {el.type === "text" && (
              <div className="w-full h-full flex items-center justify-center bg-white/50 text-black">
                {el.text}
              </div>
            )}

            {/* IMAGE ELEMENT */}
            {el.type === "image" && (
              <img
                src={el.image_url}
                className="w-full h-full object-contain"
                alt="element"
              />
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
}
