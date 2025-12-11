// modules\template_generation\admin\types.tsx

import { Dispatch, SetStateAction } from "react";

export interface BindingConfig {
  source: string;
  field: string;
  fallback?: string;
}

export interface EditorElement {
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
  static_text?: string;
  text_wrap?: boolean;
  line_height?: number;
  image_url?: string;
  qr_text?: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  binding_config?: BindingConfig[];
}

export interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url: string | null;
}

// DB row types for mapping
export interface TextElementRow {
  id: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  z_index: number | null;
  static_text: string | null;
  font_size: number | null;
  font: string | null;
  text_color: string | null;
  bg_color: string | null;
  bg_transparency: number | null;
  alignment: "left" | "center" | "right" | "justify" | null;
  text_wrap: boolean | null;
  line_height: number | null;
  binding_config: BindingConfig[] | null;
}

export interface ImageElementRow {
  id: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  z_index: number | null;
  image_url: string;
  qr_text?: string;
  object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" | null;
  binding_config: BindingConfig[] | null;
}

export interface TableSchema {
  table_name: string;
  columns: string[];
}

/*

/*
 ===========================================
 EditorState
 ===========================================
*/
export interface EditorState {
  elements: EditorElement[];
  setElements: Dispatch<SetStateAction<EditorElement[]>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  backgroundUrl: string | null;
  setBackgroundUrl: Dispatch<SetStateAction<string | null>>;
}


