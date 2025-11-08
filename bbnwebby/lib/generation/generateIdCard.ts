// =======================================
// lib/generation/generateIdCard.ts
// ID Card Generation Orchestrator
// ---------------------------------------
// - Fetches template and elements from Supabase
// - Renders it to a <canvas>
// - Uploads the final card to Cloudinary
// - Updates Supabase record with final image URL
// =======================================

import { fetchTemplateDataById } from '@/lib/generation/fetchTemplateData'
import { renderTemplateToCanvas } from '@/lib/generation/renderTemplateToCanvas'
import { uploadGeneratedCard } from '@/lib/generation/uploadGeneratedCard'
import { supabase } from '@/lib/supabaseClient'
import type { UserProfile, MakeupArtist } from '@/types/types'

/**
 * Full end-to-end ID card generation flow.
 * --------------------------------------------------
 * 1. Fetch template (type: "id_card")
 * 2. Combine user and artist data
 * 3. Render template → <canvas>
 * 4. Upload to Cloudinary
 * 5. Save `idcard_url` to Supabase
 *
 * @param templateId - The template record ID from Supabase
 * @param artistId - The makeup artist record ID
 * @param canvas - The HTMLCanvasElement to render into
 * @returns The final Cloudinary image URL
 */
export async function generateIdCard(
  templateId: string,
  artistId: string,
  canvas: HTMLCanvasElement
): Promise<string> {
  console.log('🪪 [generateIdCard] Starting ID card generation...')

  // Step 1: Fetch artist and linked user profile
  const { data: artist, error: artistError } = await supabase
    .from('makeup_artists')
    .select('*, user_profiles(*)')
    .eq('id', artistId)
    .single()

  if (artistError || !artist) {
    throw new Error(artistError?.message || 'Artist not found')
  }

  const userProfile: UserProfile = artist.user_profiles
  const artistProfile: MakeupArtist = {
    ...artist,
    user_profile_id: artist.user_profile_id,
  }

  // Step 2: Fetch template + elements
  const { template, textElements, imageElements } = await fetchTemplateDataById('id_card', templateId)

  // Step 3: Merge artist and user profile for binding access
  const combinedProfile = { ...userProfile, ...artistProfile }

  // Step 4: Render onto canvas
  await renderTemplateToCanvas(canvas, template, textElements, imageElements, combinedProfile)

  // Step 5: Upload final image
  const uploadedUrl = await uploadGeneratedCard(canvas, artistId)

  console.log('✅ [generateIdCard] ID card successfully generated and uploaded:', uploadedUrl)
  return uploadedUrl
}
