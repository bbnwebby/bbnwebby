// =======================================
// lib/generation/uploadGeneratedCard.ts
// Uploads rendered ID card to Cloudinary & saves URL in Supabase
// ---------------------------------------
// - Converts <canvas> → File
// - Uploads file to Cloudinary (via API route or SDK)
// - Updates artist record with returned image URL
// =======================================

import { canvasToFile } from '@/lib/generation/canvasUtils'
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

  console.log(`[${FILE} -> ${FUNC}] Starting upload for artist ID: ${artistId}`)

  try {
    // Step 1: Convert canvas to File
    console.log(`[${FILE} -> ${FUNC}] Converting canvas to file...`)
    const file = await canvasToFile(canvas, `id_card_${artistId}.png`)
    console.log(`[${FILE} -> ${FUNC}] Canvas converted to file:`, file.name)

    // Step 2: Upload to Cloudinary (folder: id_cards)
    console.log(`[${FILE} -> ${FUNC}] Uploading file to Cloudinary...`)
    const url = await CloudinaryService.upload(file, 'id_cards')
    console.log(`[${FILE} -> ${FUNC}] File uploaded successfully to Cloudinary:`, url)

    // Step 3: Save URL in Supabase table
    console.log(`[${FILE} -> ${FUNC}] Saving Cloudinary URL to Supabase...`)
    const { error } = await supabase
      .from('makeup_artists')
      .update({ idcard_url: url })
      .eq('id', artistId)

    if (error) {
      console.error(`[${FILE} -> ${FUNC}] ❌ Supabase update failed:`, error.message)
      throw new Error(`Failed to update Supabase: ${error.message}`)
    }

    console.log(`[${FILE} -> ${FUNC}] ✅ ID card uploaded and saved successfully:`, url)
    return url
  } catch (err) {
    console.error(`[${FILE} -> ${FUNC}] ⚠️ Upload process failed:`, err)
    throw err
  }
}
