"use client";

import React from "react";
import LeftSidebar from "./LeftSidebar";
import Canvas from "./Canvas";
import RightSidebar from "./RightSidebar";
import { EditorState } from "../types";

interface EditorProps {
  state: EditorState;
}

/**
 * High-level 3-column editor layout.
 * Left Sidebar | Canvas | Right Sidebar
 */
export default function Editor({ state }: EditorProps) {
  return (
    <div className="w-full h-screen grid grid-cols-[260px_1fr_320px]">
      <LeftSidebar state={state} />
      <Canvas state={state} />
      <RightSidebar state={state} />
    </div>
  );
}