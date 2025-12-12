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




/**
 * Represents a registered user profile in the system.
 */
export interface UserProfile {
  id: string; // Unique identifier (UUID)
  auth_user_id: string; // FK to Supabase auth.users.id
  full_name: string; // User's full name
  whatsapp_number?: string | null; // Optional WhatsApp contact
  profile_photo_url?: string | null; // Profile image URL
  location_url?: string | null; // Google Maps or custom location link
  city?: string | null; // City name
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
}


/**
 * Represents a makeup artist user.
 */
export interface MakeupArtist {
  id: string; // Unique identifier (UUID)
  user_profile_id: string; // FK to user_profiles.id
  organisation?: string | null; // Organization or brand name
  designation?: string | null; // Role or title
  instagram_handle?: string | null; // Instagram username
  username: string; // Display username (unique within app)
  status?: "pending" | "approved" | "rejected" | null; // Artist status (enum)
  portfolio_pdf_url?: string | null; // PDF portfolio link
  logo_url?: string | null
  idcard_url?: string | null
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
}


