// =======================================
// lib/generation/uploadGeneratedCard.ts
// Uploads rendered ID card to Cloudinary & saves URL in Supabase
// ---------------------------------------
// - Converts <canvas> → File
// - Uploads file to Cloudinary (via API route or SDK)
// - Updates artist record with returned image URL
// =======================================

import { canvasToFile } from '@/modules/template_generation/canvasUtils'
import { CloudinaryService } from '@/lib/cloudinaryService'
import { supabase } from '@/lib/supabaseClient'

/**
 * Converts a rendered canvas into an image, uploads it to Cloudinary,
 * and stores the resulting public URL in the artist's Supabase record.
 *
 * @param canvas - HTMLCanvasElement containing the rendered ID card
 * @param artistId - ID of the makeup artist record to update
 * @returns The public Cloudinary image URL
 */
export async function uploadGeneratedCard(
  canvas: HTMLCanvasElement,
  artistId: string
): Promise<string> {
  const FILE = 'lib/generation/uploadGeneratedCard.ts'
  const FUNC = 'uploadGeneratedCard'

  const totalStart = performance.now()
  console.log(`[${FILE} -> ${FUNC}] Starting upload for artist ID: ${artistId}`)

  try {
    // Step 1: Convert canvas to File
    const convertStart = performance.now()
    console.log(`[${FILE} -> ${FUNC}] Converting canvas to file...`)
    const file = await canvasToFile(canvas, `id_card_${artistId}.jpg`, 0.9)
    const convertEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] Canvas converted to file (${file.name}) in ${(convertEnd - convertStart).toFixed(2)}ms`
    )

    // Step 2: Upload to Cloudinary (folder: id_cards)
    const uploadStart = performance.now()
    console.log(`[${FILE} -> ${FUNC}] Uploading file to Cloudinary...`)
    const url = await CloudinaryService.upload(file, 'id_cards')
    const uploadEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] File uploaded to Cloudinary in ${(uploadEnd - uploadStart).toFixed(2)}ms: ${url}`
    )

    // Step 3: Save URL in Supabase table
    const supabaseStart = performance.now()
    console.log(`[${FILE} -> ${FUNC}] Saving Cloudinary URL to Supabase...`)
    const { error } = await supabase
      .from('makeup_artists')
      .update({ idcard_url: url })
      .eq('id', artistId)

    const supabaseEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] Supabase update completed in ${(supabaseEnd - supabaseStart).toFixed(2)}ms`
    )

    if (error) {
      console.error(`[${FILE} -> ${FUNC}] ❌ Supabase update failed:`, error.message)
      throw new Error(`Failed to update Supabase: ${error.message}`)
    }

    const totalEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] ✅ Total time: ${(totalEnd - totalStart).toFixed(2)}ms — ID card uploaded and saved successfully: ${url}`
    )

    return url
  } catch (err) {
    const totalEnd = performance.now()
    console.error(
      `[${FILE} -> ${FUNC}] ⚠️ Upload process failed after ${(totalEnd - totalStart).toFixed(
        2
      )}ms:`,
      err
    )
    throw err
  }
}
