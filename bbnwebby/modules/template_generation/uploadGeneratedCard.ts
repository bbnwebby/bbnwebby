// =======================================
// lib/generation/uploadGeneratedCard.ts
// Uploads rendered ID card → Cloudinary → saves URL in Supabase
// ---------------------------------------
// - Converts <canvas> → File
// - Uploads file to Cloudinary
// - Updates artist record with the generated image URL
// =======================================

import { canvasToDownscaledJpeg, canvasToFile } from '@/modules/template_generation/canvasUtils'
import { CloudinaryService } from '@/lib/cloudinaryService'
import { supabase } from '@/lib/supabaseClient'
import { logDebug } from '@/modules/template_generation/Debugger'

/**
 * Converts a rendered canvas into a JPEG file, uploads it to Cloudinary,
 * then stores the returned public URL inside Supabase under the artist record.
 *
 * @param canvas - Rendered HTMLCanvasElement containing the ID card
 * @param artistId - Database ID of the makeup artist record to update
 * @returns Public Cloudinary URL of the uploaded image
 */
export async function uploadGeneratedCard(
  canvas: HTMLCanvasElement,
  artistId: string
): Promise<string> {
  const FILE = 'lib/generation/uploadGeneratedCard.ts'
  const FUNC = 'uploadGeneratedCard'

  // Start total timer for the whole process
  logDebug.startTimer('uploadGeneratedCard_total', { file: FILE, fn: FUNC })
  logDebug.info(`Starting upload for artist ID: ${artistId}`, { file: FILE, fn: FUNC })

  try {
    // ------------------------------------------------------------
    // STEP 1 — Convert Canvas → File
    // ------------------------------------------------------------
    logDebug.startTimer('convertCanvas', { file: FILE, fn: FUNC })
    logDebug.info('Converting canvas to file...', { file: FILE, fn: FUNC })

    const file = await canvasToDownscaledJpeg(canvas, `id_card_${artistId}.jpg`, 0.9)

    logDebug.stopTimer('convertCanvas', { file: FILE, fn: FUNC })
    logDebug.info(`Canvas converted to file (${file.name})`, { file: FILE, fn: FUNC })

    // ------------------------------------------------------------
    // STEP 2 — Upload to Cloudinary
    // ------------------------------------------------------------
    logDebug.startTimer('cloudinaryUpload', { file: FILE, fn: FUNC })
    logDebug.info('Uploading file to Cloudinary...', { file: FILE, fn: FUNC })

    const url = await CloudinaryService.upload(file, 'id_cards')

    logDebug.stopTimer('cloudinaryUpload', { file: FILE, fn: FUNC })
    logDebug.info(`File uploaded to Cloudinary: ${url}`, { file: FILE, fn: FUNC })

    // ------------------------------------------------------------
    // STEP 3 — Update Supabase record
    // ------------------------------------------------------------
    logDebug.startTimer('supabaseUpdate', { file: FILE, fn: FUNC })
    logDebug.info('Saving Cloudinary URL to Supabase...', { file: FILE, fn: FUNC })

    const { error } = await supabase
      .from('makeup_artists')
      .update({ idcard_url: url })
      .eq('id', artistId)

    logDebug.stopTimer('supabaseUpdate', { file: FILE, fn: FUNC })

    if (error) {
      logDebug.error(`Supabase update failed: ${error.message}`, { file: FILE, fn: FUNC })
      throw new Error(`Failed to update Supabase: ${error.message}`)
    }

    // ------------------------------------------------------------
    // STEP 4 — Complete total process
    // ------------------------------------------------------------
    logDebug.stopTimer('uploadGeneratedCard_total', { file: FILE, fn: FUNC })
    logDebug.info(`ID card uploaded and saved successfully: ${url}`, {
      file: FILE,
      fn: FUNC,
    })

    return url
  } catch (err) {
    // Stop timer on failure
    logDebug.stopTimer('uploadGeneratedCard_total', { file: FILE, fn: FUNC })

    logDebug.error('Upload process failed:', { file: FILE, fn: FUNC })
    logDebug.error(err, { file: FILE, fn: FUNC })

    throw err
  }
}
