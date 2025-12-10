"use client";

import React, { useState, useRef } from "react";

interface EditorElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  text?: string;
  font_size?: number;
  font?: string;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number;
  alignment?: "left" | "center" | "right" | "justify";
  text_wrap?: boolean;
  line_height?: number;
  image_url?: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

interface CanvasProps {
  elements: EditorElement[];
  setElements: (elements: EditorElement[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundUrl: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  elements, 
  setElements, 
  selectedId, 
  setSelectedId, 
  backgroundUrl,
  canvasWidth,
  canvasHeight 
}) => {
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

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
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      updateElement(dragging, {
        x: Math.max(0, Math.min(canvasWidth - 50, dragStart.current.elementX + dx)),
        y: Math.max(0, Math.min(canvasHeight - 50, dragStart.current.elementY + dy)),
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
    // Keep the element selected after dragging/resizing
    setDragging(null);
    setResizing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on elements
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const renderElement = (el: EditorElement) => {
    if (el.type === "text") {
      return (
        <div 
          className="w-full h-full flex p-2 pointer-events-none"
          style={{
            fontSize: `${el.font_size || 16}px`,
            fontFamily: el.font || 'Arial',
            color: el.text_color || '#000000',
            backgroundColor: el.bg_color || 'transparent',
            textAlign: el.alignment || 'left',
            lineHeight: el.line_height || 1.2,
            whiteSpace: el.text_wrap ? 'normal' : 'nowrap',
            wordWrap: el.text_wrap ? 'break-word' : 'normal',
            overflowWrap: el.text_wrap ? 'break-word' : 'normal',
            alignItems: 'flex-start',
            justifyContent: el.alignment === 'center' ? 'center' : el.alignment === 'right' ? 'flex-end' : 'flex-start',
            opacity: el.bg_transparency !== undefined ? 1 - el.bg_transparency : 1
          }}
        >
          <span style={{ opacity: 1 }}>
            {el.text || 'Text'}
          </span>
        </div>
      );
    }
    
    if (el.type === "image" && el.image_url) {
      return (
        <img
          src={el.image_url}
          className="w-full h-full pointer-events-none"
          style={{ objectFit: el.object_fit || 'contain' }}
          alt="element"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex-1 bg-gray-200 overflow-auto">
      <div className="min-h-full flex items-start justify-center p-8">
        <div
          ref={canvasRef}
          className="relative"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundColor: backgroundUrl ? undefined : '#ffffff',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        >
          {[...elements]
            .sort((a, b) => (a.z_index || 0) - (b.z_index || 0))
            .map((el) => (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el)}
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  border: el.id === selectedId ? "2px solid #4F46E5" : "1px solid rgba(0,0,0,0.1)",
                  cursor: dragging === el.id ? "grabbing" : "grab",
                }}
              >
                {renderElement(el)}
                
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
    </div>
  );
};