"use client";

import React, { useState, useRef } from "react";
import { EditorState, EditorElement } from "../types";

interface CanvasProps {
  state: EditorState;
}

export default function Canvas({ state }: CanvasProps) {
  const {
    elements,
    setElements,
    selectedId,
    setSelectedId,
    backgroundUrl,
  } = state;

  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleMouseDown = (e: React.MouseEvent, el: EditorElement) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setDragging(el.id);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: el.x,
      elementY: el.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, el: EditorElement) => {
    e.stopPropagation();
    setResizing(el.id);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: el.width,
      height: el.height,
      elementX: el.x,
      elementY: el.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      updateElement(dragging, {
        x: Math.max(0, Math.min(800 - 50, dragStart.current.elementX + dx)),
        y: Math.max(0, Math.min(600 - 50, dragStart.current.elementY + dy)),
      });
    }

    if (resizing) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      
      updateElement(resizing, {
        width: Math.max(50, resizeStart.current.width + dx),
        height: Math.max(50, resizeStart.current.height + dy),
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const renderElement = (el: EditorElement) => {
    if (el.type === "text") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white/50 text-black p-2 pointer-events-none">
          {el.text}
        </div>
      );
    }
    
    if (el.type === "image" && el.image_url) {
      return (
        <img
          src={el.image_url}
          className="w-full h-full object-contain pointer-events-none"
          alt="element"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="relative bg-gray-200 flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: 800,
          height: 600,
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el)}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              zIndex: el.z_index,
              border: el.id === selectedId ? "2px solid #4F46E5" : "1px solid transparent",
              cursor: dragging === el.id ? "grabbing" : "grab",
            }}
          >
            {renderElement(el)}
            
            {/* Resize handle */}
            {el.id === selectedId && (
              <div
                onMouseDown={(e) => handleResizeMouseDown(e, el)}
                style={{
                  position: "absolute",
                  right: -6,
                  bottom: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: "#4F46E5",
                  cursor: "nwse-resize",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}