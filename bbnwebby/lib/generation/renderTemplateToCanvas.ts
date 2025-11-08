// =======================================
// lib/generation/renderTemplateToCanvas.ts
// Dynamic Canvas Renderer
// ---------------------------------------
// - Renders full ID card or certificate to <canvas>
// - Automatically sizes canvas based on background
// - Draws both images and bound text elements
// - Uses strict typing and includes detailed comments
// =======================================

import {
  Template,
  TextElement,
  ImageElement,
  UserProfile,
  MakeupArtist,
  BindingConfig,
} from '@/types/types'
import { drawWrappedText, getAlignedX, replacePlaceholders, loadImage } from '@/lib/generation/canvasUtils'

/**
 * Dynamically renders a template (ID card or certificate) onto a canvas.
 * ---------------------------------------------------
 * @param canvas - The target <canvas> element
 * @param template - Template data (background, type, etc.)
 * @param textElements - All text layers associated with this template
 * @param imageElements - All image layers associated with this template
 * @param artistProfile - Combined artist/user profile for placeholder bindings
 * @returns The rendered <canvas> element
 */
export async function renderTemplateToCanvas(
  canvas: HTMLCanvasElement,
  template: Template,
  textElements: TextElement[],
  imageElements: ImageElement[],
  artistProfile: UserProfile & Partial<MakeupArtist>
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas rendering context not available')

  // --- Step 1: Load Background and Match Canvas Dimensions ---
  const background = await loadImage(template.background_img_url || '')
  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
  console.log('🖼️ [renderTemplateToCanvas] Background drawn:', template.background_img_url)

  // --- Step 2: Draw Image Elements ---
  for (const imgEl of imageElements) {
    try {
      const img = await loadImage(imgEl.image_url)
      ctx.drawImage(img, Number(imgEl.x), Number(imgEl.y), Number(imgEl.width), Number(imgEl.height))
      console.log('🧩 [renderTemplateToCanvas] Image element drawn:', imgEl.image_url)
    } catch (err) {
      console.warn('⚠️ [renderTemplateToCanvas] Failed to load image:', imgEl.image_url, err)
    }
  }

  // --- Step 3: Draw Text Elements ---
  for (const txtEl of textElements) {
    const {
      x,
      y,
      width,
      height,
      alignment = 'left',
      text_wrap = false,
      line_height = 1.2,
      font = 'Poppins',
      font_size = 14,
      text_color = '#000000',
      bg_color = '#ffffff00',
      bg_transparency = 0.0,
      binding_config,
    } = txtEl

    // Skip invalid bindings
    if (!binding_config || binding_config.length === 0) continue

    // --- Build replacement data from user and artist ---
    const replacements: Record<string, string> = {}
    const fullData = { ...artistProfile }

    for (const binding of binding_config as BindingConfig[]) {
      const { source, field, fallback, transform } = binding
      const value = (fullData as Record<string, unknown>)[field]

      let textValue = typeof value === 'string' ? value : fallback ?? ''
      if (transform === 'uppercase') textValue = textValue.toUpperCase()
      if (transform === 'lowercase') textValue = textValue.toLowerCase()
      if (transform === 'capitalize') textValue = textValue.replace(/\b\w/g, (c) => c.toUpperCase())

      replacements[field] = textValue
    }

    // --- Replace placeholders like {{full_name}} ---
    const mergedText = replacePlaceholders(Object.keys(replacements).join(' '), replacements)

    // --- Apply styles ---
    ctx.save()
    ctx.font = `${font_size}px ${font}`
    ctx.fillStyle = text_color
    ctx.textBaseline = 'top'

    // Optional background fill (with transparency)
    if (bg_transparency < 1 && bg_color !== '#ffffff00') {
      ctx.globalAlpha = 1 - bg_transparency
      ctx.fillStyle = bg_color
      ctx.fillRect(x, y, width, height)
      ctx.globalAlpha = 1
      ctx.fillStyle = text_color
    }

    // --- Handle alignment ---
    const alignedX = getAlignedX(ctx, mergedText, x, width, alignment as 'left' | 'center' | 'right')

    // --- Draw text (wrapped or single line) ---
    if (text_wrap) {
      drawWrappedText(ctx, mergedText, alignedX, y, width, line_height * font_size)
    } else {
      ctx.fillText(mergedText, alignedX, y)
    }

    ctx.restore()
    console.log('✏️ [renderTemplateToCanvas] Text drawn:', mergedText)
  }

  console.log('✅ [renderTemplateToCanvas] Rendering complete.')
  return canvas
}
