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
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
}



/**
 * Represents a design template created by a makeup artist.
 */
export interface Template {
  id: string; // Unique identifier (UUID)
  artist_id: string; // FK to makeup_artists.id
  name: string; // Template display name
  type: string; // Template category/type (e.g., "certificate", "poster")
  background_img_url?: string | null; // Background image URL
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
}


/**
 * Represents a single image element associated with a template.
 */
export interface ImageElement {
  id: string; // Unique identifier (UUID)
  template_id: string; // Foreign key referencing templates.id
  x: number; // X position on the canvas
  y: number; // Y position on the canvas
  width: number; // Element width
  height: number; // Element height
  object_fit?: string | null; // CSS object-fit property (default: 'contain')
  image_url: string; // Cloudinary or hosted image URL
  z_index?: number | null; // Z-order stacking index (default: 0)
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
}




/**
 * Represents a text element placed on a template.
 */
export interface TextElement {
  id: string; // Unique identifier (UUID)
  template_id: string; // FK to templates.id
  text?: string | null; // Display text content
  text_wrap?: boolean | null; // If true, wraps text (default: false)
  line_height?: number | null; // Line height multiplier (default: 1.2)
  font?: string | null; // Font family (default: 'Poppins')
  font_size?: number | null; // Font size in px (default: 14)
  text_color?: string | null; // Text color in hex (default: '#000000')
  bg_color?: string | null; // Background color (default: transparent white)
  bg_transparency?: number | null; // Background opacity (0–1)
  x: number; // X coordinate
  y: number; // Y coordinate
  width: number; // Width of text box
  height: number; // Height of text box
  z_index?: number | null; // Stacking order (default: 0)
  created_at?: string | null; // Record creation timestamp
  updated_at?: string | null; // Record last update timestamp
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
