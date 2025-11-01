// lib/supabaseHelpers.ts
import { supabase } from "@/lib/supabaseClient"
import * as types from "@/types/types"



// ==================== USER PROFILE FUNCTIONS ====================

/**
 * 🟢 Fetches the currently logged-in user's profile from Supabase.
 *
 * 💬 Detailed explanation:
 *  - Retrieves the active user from Supabase Auth.
 *  - Uses the user's `supabase_auth_id` to find their corresponding record
 *    in the `user_profiles` table.
 *  - Returns the full user profile object if found; otherwise returns `null`.
 * 
 * ⚙️ Parameters: None
 * 📤 Returns: `Promise<UserProfile | null>`
 * 🧭 Use case: Called on dashboard load or protected pages to get current user data.
 */
export const getUserProfile = async (): Promise<types.UserProfile | null> => {
  console.log("[getUserProfile] Fetching current user...");
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("[getUserProfile] No user logged in:", error?.message);
    return null;
  }

  console.log("[getUserProfile] Logged in user:", user);

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("supabase_auth_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[getUserProfile] Error fetching profile:", profileError.message);
    return null;
  }

  console.log("[getUserProfile] Profile fetched:", profile);
  return profile as types.UserProfile | null;
};

/**
 * 🟢 Fetches a user profile by its database ID.
 *
 * 💬 Detailed explanation:
 *  - Queries the `user_profiles` table using the provided `userId`.
 *  - Returns a single profile record or `null` if no match is found.
 * 
 * ⚙️ Parameters:
 *  - `userId: string` → UUID of the user (from `user_profiles.id`)
 * 📤 Returns: `Promise<UserProfile | null>`
 * 🧭 Use case: Admins or backend logic needing to access another user’s profile.
 */
export const getUserProfileById = async (userId: string): Promise<types.UserProfile | null> => {
  console.log("[getUserProfileById] Fetching profile for userId:", userId);
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[getUserProfileById] Error fetching user profile:", error.message);
    return null;
  }

  console.log("[getUserProfileById] Profile fetched:", data);
  return data as types.UserProfile;
};

/**
 * 🟢 Creates or updates a user profile record for the currently logged-in user.
 *
 * 💬 Detailed explanation:
 *  - Fetches the logged-in user from Supabase Auth.
 *  - Uses `.upsert()` to insert or update their `user_profiles` record.
 *  - Automatically sets `supabase_auth_id` and updates `updated_at`.
 *  - Returns the updated user profile record.
 * 
 * ⚙️ Parameters:
 *  - `profileData: Partial<UserProfile>` → Any subset of user profile fields to be updated.
 * 📤 Returns: `Promise<UserProfile | null>`
 * 🧭 Use case: Profile update pages, onboarding forms, or registration flows.
 */
export const createOrUpdateUserProfile = async (
  profileData: Partial<types.UserProfile>
): Promise<types.UserProfile | null> => {
  console.log("[createOrUpdateUserProfile] profileData:", profileData);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn("[createOrUpdateUserProfile] No user logged in");
    return null;
  }

  console.log("[createOrUpdateUserProfile] Current user:", user);

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      ...profileData,
      supabase_auth_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[createOrUpdateUserProfile] Error upserting profile:", error.message);
    return null;
  }

  console.log("[createOrUpdateUserProfile] Profile upserted:", data);
  return data as types.UserProfile;
};


// =======================================
// Makeup Artist Functions
// =======================================


/**
 * 🟢 Creates a new makeup artist and their linked user profile.
 *
 * 💬 Logic:
 *  1️⃣ Fetches or creates the logged-in user’s profile using `createOrUpdateUserProfile`.
 *  2️⃣ Inserts a new record into the `makeup_artists` table using that `user_profile_id`.
 *  3️⃣ Returns the complete artist record (with related profile fields).
 *
 * ⚙️ Parameters:
 *  - `artistData: Omit<MakeupArtist, "id" | "user_profile_id" | "created_at" | "updated_at">`
 *    → All artist fields except those auto-managed by Supabase.
 *
 * 📤 Returns: `Promise<{ artist: MakeupArtist; profile: UserProfile } | null>`
 */
export const createMakeupArtist = async (
  artistData: Omit<types.MakeupArtist, "id" | "user_profile_id" | "created_at" | "updated_at">
): Promise<{ artist: types.MakeupArtist; profile: types.UserProfile } | null> => {
  console.log("[createMakeupArtist] Starting artist creation...");

  // Step 1️⃣: Get or create the user profile
  const profile = await getUserProfile();

  let userProfile: types.UserProfile | null = profile;

  if (!userProfile) {
    console.log("[createMakeupArtist] No user profile found — creating new one.");
    userProfile = await createOrUpdateUserProfile({
      full_name: artistData.username, // Default to username if full name not yet set
      password_hash: "TEMPORARY_HASH", // Replace with real hash logic if custom auth
    });

    if (!userProfile) {
      console.error("[createMakeupArtist] Failed to create user profile.");
      return null;
    }
  }

  console.log("[createMakeupArtist] Using user_profile_id:", userProfile.id);

  // Step 2️⃣: Create the makeup artist record
  const { data: newArtist, error: artistError } = await supabase
    .from("makeup_artists")
    .insert([
      {
        ...artistData,
        user_profile_id: userProfile.id,
      },
    ])
    .select()
    .single();

  if (artistError) {
    console.error("[createMakeupArtist] Error creating artist:", artistError.message);
    return null;
  }

  console.log("[createMakeupArtist] Artist created successfully:", newArtist);

  // Step 3️⃣: Return both profile + artist for convenience
  return {
    artist: newArtist as types.MakeupArtist,
    profile: userProfile,
  };
};


// Fetch profile by auth user id


// Fetch makeup artist by profile id
export async function getMakeupArtistByProfile(profileId: string) {
  const { data, error } = await supabase
    .from('makeup_artists')
    .select('*')
    .eq('user_profile_id', profileId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('getMakeupArtistByProfile error:', error)
  }

  return data ?? null
}

// Create new user profile
export async function createUserProfile(
  profileData: Omit<types.UserProfile, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profileData)
    .select('*')
    .single()

  if (error) {
    console.error('createUserProfile error:', error)
    return null
  }
  return data
}

