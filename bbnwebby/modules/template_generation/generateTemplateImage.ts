// =======================================
// lib/generation/generateTemplateImage.ts
// Template-Based Image Generation Orchestrator
// ---------------------------------------------
// - Fetches a template and its design elements from Supabase
// - Renders it onto a provided <canvas>
// - Uploads the rendered image to Cloudinary
// - Returns the uploaded URL
// =======================================

import { fetchTemplateDataById } from '@/modules/template_generation/fetchTemplateData'
import { renderTemplateToCanvas } from '@/modules/template_generation/renderTemplateToCanvas'
import { uploadGeneratedCard } from '@/modules/template_generation/uploadGeneratedCard'
import { supabase } from '@/lib/supabaseClient'
import type { UserProfile, MakeupArtist } from '@/modules/template_generation/types'
import { logDebug } from '@/modules/template_generation/Debugger'

// 🔒 Constant file identifier
const FILE = 'generateTemplateImage.ts'

/**
 * End-to-end image generation and upload workflow.
 */
export async function generateTemplateImage(
  templateType: 'id_card' | 'certificate',
  templateId: string,
  artistId: string,
  preloadedBackground?: HTMLImageElement | null,
  preloadedProfileImage?: HTMLImageElement | null
): Promise<string> {

  // 🔒 Function identifier declared at start of each function
  const FN = 'generateTemplateImage'
  const ctx = { file: FILE, fn: FN }

  logDebug.info(`🎨 Starting generation for template type: ${templateType}, ID: ${templateId}`, ctx)

  // create a temporary off-screen canvas for rendering
  const canvas = document.createElement('canvas')

  if (preloadedBackground) {
    canvas.width = preloadedBackground.naturalWidth
    canvas.height = preloadedBackground.naturalHeight
    logDebug.info(`🎨 Canvas size set from preloaded background: ${canvas.width}x${canvas.height}`, ctx)
  } else {
    canvas.width = 1000
    canvas.height = 600
    logDebug.info(`🎨 Canvas size set to default: ${canvas.width}x${canvas.height}`, ctx)
  }

  try {
    // 1️⃣ Fetch artist and linked user profile
    logDebug.startTimer('artistFetch', ctx)
    const { data: artist, error: artistError } = await supabase
      .from('makeup_artists')
      .select('*, user_profiles(*)')
      .eq('id', artistId)
      .single()
    logDebug.stopTimer('artistFetch', ctx)

    if (artistError || !artist) {
      logDebug.error('❌ Failed to fetch artist:', ctx)
      throw new Error(artistError?.message || 'Artist not found in database.')
    }

    const userProfile: UserProfile = artist.user_profiles
    const artistProfile: MakeupArtist = { ...artist, user_profile_id: artist.user_profile_id }
    logDebug.info('✅ Artist and user profile fetched successfully.', ctx)

    // 2️⃣ Fetch template and its elements
    logDebug.startTimer('templateFetch', ctx)
    const { template, textElements, imageElements } = await fetchTemplateDataById(templateType, templateId)
    logDebug.stopTimer('templateFetch', ctx)

    if (!template) throw new Error(`Template not found for ID: ${templateId}`)
    logDebug.info('✅ Template and elements fetched successfully.', ctx)

    // 3️⃣ Merge artist + user profile for binding
    logDebug.info('Merging artist and user profile data...', ctx)
    const mergedData: UserProfile & Partial<MakeupArtist> = {
      ...userProfile,
      ...artistProfile,
    }

    // 4️⃣ Render template onto canvas
    logDebug.startTimer('canvasRender', ctx)
    await renderTemplateToCanvas(
      canvas,
      template,
      textElements,
      imageElements,
      mergedData,
      preloadedBackground,
      preloadedProfileImage
    )
    logDebug.stopTimer('canvasRender', ctx)
    logDebug.info('🖼️ Template rendered successfully.', ctx)

    // 5️⃣ Upload rendered canvas to Cloudinary
    logDebug.startTimer('upload', ctx)
    const uploadedUrl: string = await uploadGeneratedCard(canvas, artistId)
    logDebug.stopTimer('upload', ctx)

    if (!uploadedUrl) throw new Error('Rendered image upload failed — no Cloudinary URL returned.')
    logDebug.info('☁️ Uploaded to Cloudinary successfully:', ctx)
    logDebug.info(uploadedUrl, ctx)

    
    logDebug.info('🎉 Done. Returning uploaded URL.', ctx)

    return uploadedUrl
  } catch (err) {
    logDebug.error('⚠️ Generation process failed:', ctx)
    logDebug.error(err, ctx)
    throw err
  }
}
