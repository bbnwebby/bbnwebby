"use client";

import React from "react";
import * as Rnd from "react-rnd";
import { EditorState, EditorElement } from "../types";

/**
 * react-rnd direction values
 */
type ResizeDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

/**
 * Drag callback data type
 */
type RndDragData = {
  x: number;
  y: number;
};

/**
 * Resize delta type from react-rnd
 */
type RndResizeDelta = {
  width: number;
  height: number;
};

/**
 * Resize position type
 */
type RndResizePosition = {
  x: number;
  y: number;
};

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

  /**
   * Cleanly update one element
   */
  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const renderElement = (el: EditorElement) => {
    if (el.type === "text") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white/50 text-black">
          {el.text}
        </div>
      );
    }
    
    if (el.type === "image" && el.image_url) {
      return (
        <img
          src={el.image_url}
          className="w-full h-full object-contain"
          alt="element"
        />
      );
    }
    
    return null;
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
        {elements.map((el) => {
          const RndComponent = Rnd as unknown as React.ComponentType<{
            bounds: string;
            size: { width: number; height: number };
            position: { x: number; y: number };
            onDragStop: (e: MouseEvent | TouchEvent, data: RndDragData) => void;
            onResizeStop: (
              e: MouseEvent | TouchEvent,
              dir: ResizeDirection,
              ref: HTMLElement,
              delta: RndResizeDelta,
              pos: RndResizePosition
            ) => void;
            onClick: (e: React.MouseEvent) => void;
            style: React.CSSProperties;
            children: React.ReactNode;
          }>;

          return (
            <RndComponent
              key={el.id}
              bounds="parent"
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(
                e: MouseEvent | TouchEvent,
                data: RndDragData
              ) => {
                updateElement(el.id, { x: data.x, y: data.y });
              }}
              onResizeStop={(
                e: MouseEvent | TouchEvent,
                dir: ResizeDirection,
                ref: HTMLElement,
                delta: RndResizeDelta,
                pos: RndResizePosition
              ) => {
                updateElement(el.id, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  x: pos.x,
                  y: pos.y,
                });
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setSelectedId(el.id);
              }}
              style={{
                zIndex: el.z_index,
                border: el.id === selectedId ? "2px solid #4F46E5" : "none",
              }}
            >
              {renderElement(el)}
            </RndComponent>
          );
        })}
      </div>
    </div>
  );
}