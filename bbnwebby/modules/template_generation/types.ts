// ============================================
// TYPES
// ============================================

interface BindingConfig {
  source: "user_profiles" | "makeup_artists";
  field: string;
  fallback?: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
}

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
  binding_config?: BindingConfig[];
}

interface Template {
  id: string;
  name: string;
  type: "certificate" | "id_card";
  background_img_url: string | null;
}