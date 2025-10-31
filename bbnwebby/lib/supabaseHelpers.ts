// lib/supabaseHelpers.ts
import { supabase } from "@/lib/supabaseClient"
import * as types from "@/lib/certificate_and_id/types"



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

