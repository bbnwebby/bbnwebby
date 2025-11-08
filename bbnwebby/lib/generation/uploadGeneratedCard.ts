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
  // Step 1: Convert canvas to File
  const file = await canvasToFile(canvas, `id_card_${artistId}.png`)

  // Step 2: Upload to Cloudinary (folder: id_cards)
  const url = await CloudinaryService.upload(file, 'id_cards')

  // Step 3: Save URL in Supabase table
  const { error } = await supabase
    .from('makeup_artists')
    .update({ idcard_url: url })
    .eq('id', artistId)

  if (error) throw new Error(`Failed to update Supabase: ${error.message}`)

  console.log('✅ ID card uploaded and saved:', url)
  return url
}
