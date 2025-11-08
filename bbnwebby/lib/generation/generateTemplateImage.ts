// =======================================
// lib/generation/generateTemplateImage.ts
// Template-Based Image Generation Orchestrator
// ---------------------------------------------
// - Fetches a template and its design elements from Supabase
// - Renders it onto a provided <canvas>
// - Uploads the rendered image to Cloudinary
// - Updates Supabase record with the generated image URL
// - Returns the uploaded URL
// =======================================

import { fetchTemplateDataById } from '@/lib/generation/fetchTemplateData'
import { renderTemplateToCanvas } from '@/lib/generation/renderTemplateToCanvas'
import { uploadGeneratedCard } from '@/lib/generation/uploadGeneratedCard'
import { supabase } from '@/lib/supabaseClient'
import type { UserProfile, MakeupArtist } from '@/types/types'

/**
 * End-to-end image generation and upload workflow.
 * ------------------------------------------------
 * Fetches a saved template layout, fills it with artist data,
 * renders it onto the given <canvas>, uploads the rendered
 * image to Cloudinary, updates Supabase, and returns the link.
 *
 * @param templateType - Template category (e.g. "id_card", "certificate")
 * @param templateId - Supabase template record ID
 * @param artistId - Associated makeup artist record ID
 * @param canvas - Target HTMLCanvasElement for rendering
 * @returns Promise<string> - Uploaded Cloudinary image URL
 */
export async function generateTemplateImage(
  templateType: 'id_card' | 'certificate',
  templateId: string,
  artistId: string,
  canvas: HTMLCanvasElement
): Promise<string> {
  const FILE = 'lib/generation/generateTemplateImage.ts'
  const FUNC = 'generateTemplateImage'
  console.log(`[${FILE} -> ${FUNC}] 🎨 Starting generation for template type: ${templateType}, ID: ${templateId}`)

  try {
    // 1️⃣ Fetch artist and linked user profile
    console.log(`[${FILE} -> ${FUNC}] Fetching artist and user profile for artist ID: ${artistId}`)
    const { data: artist, error: artistError } = await supabase
      .from('makeup_artists')
      .select('*, user_profiles(*)')
      .eq('id', artistId)
      .single()

    if (artistError || !artist) {
      console.error(`[${FILE} -> ${FUNC}] ❌ Failed to fetch artist:`, artistError)
      throw new Error(artistError?.message || 'Artist not found in database.')
    }

    const userProfile: UserProfile = artist.user_profiles
    const artistProfile: MakeupArtist = { ...artist, user_profile_id: artist.user_profile_id }
    console.log(`[${FILE} -> ${FUNC}] ✅ Artist and user profile fetched successfully.`)

    // 2️⃣ Fetch template and its elements
    console.log(`[${FILE} -> ${FUNC}] Fetching template and elements for template ID: ${templateId}`)
    const { template, textElements, imageElements } = await fetchTemplateDataById(templateType, templateId)

    if (!template) {
      throw new Error(`Template not found for ID: ${templateId}`)
    }

    console.log(`[${FILE} -> ${FUNC}] ✅ Template and elements fetched successfully.`)

    // 3️⃣ Merge artist and user data (with correct types)
    console.log(`[${FILE} -> ${FUNC}] Merging artist and user profile data...`)
    const mergedData: UserProfile & Partial<MakeupArtist> = {
      ...userProfile,
      ...artistProfile,
    }

    // 4️⃣ Render template onto provided canvas
    console.log(`[${FILE} -> ${FUNC}] Rendering template onto canvas...`)
    await renderTemplateToCanvas(canvas, template, textElements, imageElements, mergedData)
    console.log(`[${FILE} -> ${FUNC}] 🖼️ Template rendered successfully.`)

    // 5️⃣ Upload rendered canvas image to Cloudinary
    console.log(`[${FILE} -> ${FUNC}] Uploading rendered image to Cloudinary...`)
    const uploadedUrl: string = await uploadGeneratedCard(canvas, artistId)

    if (!uploadedUrl) {
      throw new Error('Rendered image upload failed — no Cloudinary URL returned.')
    }

    console.log(`[${FILE} -> ${FUNC}] ☁️ Uploaded to Cloudinary successfully: ${uploadedUrl}`)

    // 6️⃣ Update Supabase record with generated image URL
    console.log(`[${FILE} -> ${FUNC}] Updating Supabase record with generated image URL...`)
    const updateField =
      templateType === 'id_card'
        ? { idcard_url: uploadedUrl }
        : { certificate_url: uploadedUrl }

    const { error: updateError } = await supabase
      .from('makeup_artists')
      .update(updateField)
      .eq('id', artistId)

    if (updateError) {
      console.error(`[${FILE} -> ${FUNC}] ❌ Failed to update Supabase record:`, updateError.message)
      throw new Error(updateError.message)
    }

    console.log(`[${FILE} -> ${FUNC}] ✅ Supabase record updated successfully.`)

    // 7️⃣ Return the final uploaded URL
    console.log(`[${FILE} -> ${FUNC}] ✅ Generation completed successfully. Returning uploaded URL...`)
    return uploadedUrl
  } catch (err) {
    console.error(`[${FILE} -> ${FUNC}] ⚠️ Generation process failed:`, err)
    throw err
  }
}
