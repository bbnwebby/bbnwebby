// =======================================
// types.tsx
// Strong, safe, and complete interfaces 
// for Supabase-driven template editor
// =======================================

/**
 * Represents a registered user profile.
 */
export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  whatsapp_number?: string | null;
  profile_photo_url?: string | null;
  location_url?: string | null;
  city?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Represents a makeup artist account.
 */
export interface MakeupArtist {
  id: string;
  user_profile_id: string;
  organisation?: string | null;
  designation?: string | null;
  instagram_handle?: string | null;
  username: string;
  status?: "pending" | "approved" | "rejected" | null;
  portfolio_pdf_url?: string | null;
  logo_url?: string | null;
  idcard_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Shared binding configuration for text or image elements.
 * Maps dynamic fields from user_profiles/makeup_artists into templates.
 */
export interface BindingConfig {
  source: "user_profiles" | "makeup_artists";
  field: string;
  fallback?: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
}

/**
 * Base positioning and sizing shared by all canvas elements.
 */
export interface BaseElement {
  id: string;
  template_id: string;
  x: number;      // position X
  y: number;      // position Y
  width: number;  // element width
  height: number; // element height
  z_index?: number;
  binding_config?: BindingConfig[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Text layer element (from Supabase table: text_elements).
 */
export interface TextElement extends BaseElement {
  type: "text";  // discriminated union
  alignment?: "left" | "center" | "right" | "justify" | null;
  text_wrap?: boolean;
  line_height?: number;
  font?: string;
  font_size?: number;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number; // 0.0 to 1.0 (validated by Supabase)
  static_text: string;
}

/**
 * Image layer element (from Supabase table: image_elements).
 */
export interface ImageElement extends BaseElement {
  type: "image"; // discriminated union
  image_url: string;
  object_fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * Reusable union for all canvas elements.
 */
export type TemplateElement = TextElement | ImageElement;

/**
 * Template base (certificate or ID card).
 */
export interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  text_elements?: TextElement[] | null;
  image_elements?: ImageElement[] | null;
}

/**
 * Map of Supabase tables to TypeScript models (optional).
 */
export interface DatabaseTables {
  user_profiles: UserProfile;
  makeup_artists: MakeupArtist;
  templates: Template;
  text_elements: TextElement;
  image_elements: ImageElement;
}

// =======================================
// Editor Types (used only inside the editor UI)
// =======================================

export type ElementType = "text" | "image";

/**
 * Base shape for elements inside the editor.
 * Mirrors DB values but adds `type` for runtime logic.
 */
export interface EditorElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;

  // TEXT FIELDS
  text?: string;
  font_size?: number;
  font?: string;
  text_color?: string;

  // IMAGE FIELDS
  image_url?: string;
}

/**
 * The full editor state shape used by Canvas, Sidebar, etc.
 */
export interface EditorState {
  elements: EditorElement[];
  setElements: (value: EditorElement[]) => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
}
