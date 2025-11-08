// =======================================
// types.tsx
// Strongly typed interfaces for Supabase tables
// =======================================


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




/**
 * Shared binding configuration for text/image elements.
 */
export interface BindingConfig {
  source: 'user_profiles' | 'makeup_artists';
  field: string;
  fallback?: string;
  transform?: 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Text layer element mapped to Supabase `text_elements`.
 */
export interface TextElement {
  id: string;
  template_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alignment?: 'left' | 'center' | 'right' | 'justify' | null;
  text_wrap?: boolean;
  line_height?: number;
  font?: string;
  font_size?: number;
  text_color?: string;
  bg_color?: string;
  bg_transparency?: number;
  z_index?: number;
  binding_config?: BindingConfig[] | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Image layer element mapped to Supabase `image_elements`.
 */
export interface ImageElement {
  id: string;
  template_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  object_fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  image_url: string;
  z_index?: number;
  binding_config?: BindingConfig[] | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Template base for certificates or ID cards.
 */
export interface Template {
  id: string;
  name: string;
  type: 'certificate' | 'id_card';
  background_img_url?: string | null;
  created_at?: string;
  updated_at?: string;
text_elements?: TextElement[] | null;
image_elements?: ImageElement[] | null;
}



// =======================================
// Optional Aggregated Type Maps
// =======================================

/**
 * Maps all table names to their corresponding TypeScript interfaces.
 */
export interface DatabaseTables {
  image_elements: ImageElement;
  makeup_artists: MakeupArtist;
  templates: Template;
  text_elements: TextElement;
  user_profiles: UserProfile;
}
