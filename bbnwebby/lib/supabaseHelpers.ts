// =======================================
// lib/supabaseHelpers.ts
// Utilities for interacting with Supabase (Auth, Profiles, Artists)
// =======================================

import { supabase } from "@/lib/supabaseClient"
import type { UserProfile, MakeupArtist } from "@/types/types"

// ==================== USER PROFILE FUNCTIONS ====================

/**
 * 🟢 Fetches the currently logged-in user's profile from Supabase.
 *
 * 💬 Logic:
 *  - Retrieves the active Supabase Auth user.
 *  - Finds the corresponding `user_profiles` row via `auth_user_id`.
 *  - Returns the **complete** user profile record.
 *
 * 📤 Returns: Promise<UserProfile | null>
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  console.log("[getUserProfile] Fetching current user...")

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error("[getUserProfile] ❌ No active user:", error?.message)
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    // selecting all expet for password hash
    .select("id, auth_user_id, full_name, whatsapp_number, profile_photo_url, location_url, city, created_at, updated_at")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("[getUserProfile] ❌ Error fetching profile:", profileError.message)
    return null
  }

  console.log("[getUserProfile] ✅ Profile fetched:", profile)
  return profile as UserProfile | null
}

/**
 * 🟢 Fetches a user profile by its database ID.
 *
 * 💬 Logic:
 *  - Queries `user_profiles` by `id` column.
 *  - Returns the full record if found.
 *
 * 📤 Returns: Promise<UserProfile | null>
 */
export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
  console.log("[getUserProfileById] Fetching profile for:", userId)

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("[getUserProfileById] ❌", error.message)
    return null
  }

  return data as UserProfile
}

/**
 * 🟢 Creates or updates a user profile for the logged-in user.
 *
 * 💬 Logic:
 *  - Ensures there's an active Supabase user.
 *  - Performs `.upsert()` using `auth_user_id` to insert or update.
 *  - Returns the **full updated record**.
 *
 * 📤 Returns: Promise<UserProfile | null>
 */
export const createOrUpdateUserProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  console.log("[createOrUpdateUserProfile] profileData:", profileData)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.warn("[createOrUpdateUserProfile] ⚠️ No user logged in.")
    return null
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      ...profileData,
      auth_user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single()

  if (error) {
    console.error("[createOrUpdateUserProfile] ❌", error.message)
    return null
  }

  console.log("[createOrUpdateUserProfile] ✅ Profile saved:", data)
  return data as UserProfile
}

// ==================== MAKEUP ARTIST FUNCTIONS ====================

/**
 * 🟢 Creates a new makeup artist and links it to the current user profile.
 *
 * 💬 Logic:
 *  1️⃣ Ensures a valid `user_profile` exists (creates if not).
 *  2️⃣ Inserts a new `makeup_artists` record linked to it.
 *  3️⃣ Returns both the artist and profile records.
 *
 * 📤 Returns: Promise<{ artist: MakeupArtist; profile: UserProfile } | null>
 */
export const createMakeupArtist = async (
  artistData: Omit<MakeupArtist, "id" | "user_profile_id" | "created_at" | "updated_at">
): Promise<{ artist: MakeupArtist; profile: UserProfile } | null> => {
  console.log("[createMakeupArtist] 🚀 Creating artist...")

  // Step 1️⃣: Ensure user profile exists
  let userProfile = await getUserProfile()

  if (!userProfile) {
    console.log("[createMakeupArtist] 🧱 No profile found — creating new one.")
    userProfile = await createOrUpdateUserProfile({
      full_name: artistData.username,
      password_hash: "TEMP_HASH", // Replace with your real hash logic if using custom auth
    })
  }

  if (!userProfile) {
    console.error("[createMakeupArtist] ❌ Failed to ensure user profile.")
    return null
  }

  // Step 2️⃣: Create artist record
  const { data: newArtist, error: artistError } = await supabase
    .from("makeup_artists")
    .insert({
      ...artistData,
      user_profile_id: userProfile.id,
    })
    .select("*")
    .single()

  if (artistError) {
    console.error("[createMakeupArtist] ❌ Error creating artist:", artistError.message)
    return null
  }

  console.log("[createMakeupArtist] ✅ Artist created:", newArtist)
  return { artist: newArtist as MakeupArtist, profile: userProfile }
}

/**
 * 🟢 Fetches the makeup artist record linked to a specific user profile.
 *
 * 💬 Logic:
 *  - Looks up `makeup_artists` by `user_profile_id`.
 *  - Returns full artist row if it exists.
 *
 * 📤 Returns: Promise<MakeupArtist | null>
 */
export const getMakeupArtistByProfile = async (
  profileId: string
): Promise<MakeupArtist | null> => {
  console.log("[getMakeupArtistByProfile] Fetching artist for profile:", profileId)

  const { data, error } = await supabase
    .from("makeup_artists")
    .select("*")
    .eq("user_profile_id", profileId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("[getMakeupArtistByProfile] ❌", error.message)
    return null
  }

  return data as MakeupArtist | null
}

/**
 * 🟢 Creates a new user profile directly (used during sign-up).
 *
 * 💬 Logic:
 *  - Inserts a new record into `user_profiles`.
 *  - Returns the **complete inserted record**.
 *
 * 📤 Returns: Promise<UserProfile | null>
 */
export const createUserProfile = async (
  profileData: Omit<UserProfile, "id" | "created_at" | "updated_at">
): Promise<UserProfile | null> => {
  console.log("[createUserProfile] Creating new profile...")

  const { data, error } = await supabase
    .from("user_profiles")
    .insert(profileData)
    .select("*")
    .single()

  if (error) {
    console.error("[createUserProfile] ❌", error.message)
    return null
  }

  console.log("[createUserProfile] ✅ Profile created:", data)
  return data as UserProfile
}
