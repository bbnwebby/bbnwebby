// =======================================
// lib/generation/renderTemplateToCanvas.ts
// Dynamic Canvas Renderer
// ---------------------------------------
// - Renders full ID card or certificate to <canvas>
// - Strongly typed (no "any" or unsafe casts)
// - Supports both image + text bindings
// - Handles {{user_profiles.field}} and {{makeup_artists.field}} replacements
// =======================================

import {
  Template,
  TextElement,
  ImageElement,
  UserProfile,
  MakeupArtist,
  BindingConfig,
} from '@/types/types'
import {
  drawWrappedText,
  getAlignedX,
  loadImage,
} from '@/lib/generation/canvasUtils'

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

/**
 * Safely retrieves a value from a nested object using dot notation.
 */
function getValueFromPath<T extends Record<string, unknown>>(
  obj: T,
  path: string | undefined
): string {
  const FUNC = 'getValueFromPath'
  console.log(`[${FILE} -> ${FUNC}] Called with path:`, path)

  if (!path) {
    console.warn(`[${FILE} -> ${FUNC}] ⚠️ Invalid or missing path received:`, path)
    return ''
  }

  const keys = path.split('.')
  console.log(`[${FILE} -> ${FUNC}] Splitting path "${path}" into keys:`, keys)

  let current: unknown = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      console.warn(`[${FILE} -> ${FUNC}] ⚠️ Broken path at key "${key}". Current:`, current)
      return ''
    }
    current = (current as Record<string, unknown>)[key]
  }

  console.log(`[${FILE} -> ${FUNC}] ✅ Retrieved value for path "${path}":`, current)
  return typeof current === 'string' ? current : ''
}

/**
 * Replaces placeholders (e.g. {{user_profiles.full_name}}) inside text templates.
 */
function replaceBindings(
  template: string,
  data: {
    user_profiles: Record<string, string | null>
    makeup_artists: Record<string, string | null>
  }
): string {
  const FUNC = 'replaceBindings'
  const result = template.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const [source, field] = rawPath.trim().split('.')
    const value =
      data[source as 'user_profiles' | 'makeup_artists']?.[field] ?? ''
    return value ? String(value) : ''
  })
  console.log(`[${FILE} -> ${FUNC}] Processed bindings in text:`, result)
  return result
}

/**
 * Converts a combined user + artist profile into a record of string/null values.
 */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): Record<string, string | null> {
  const FUNC = 'toRecord'
  const record: Record<string, string | null> = {}
  Object.entries(profile).forEach(([key, val]) => {
    record[key] = typeof val === 'string' ? val : val ?? null
  })
  console.log(`[${FILE} -> ${FUNC}] Converted profile to record with ${Object.keys(record).length} fields`)
  return record
}

/**
 * Main renderer: draws background, images, and text bindings on canvas.
 */
export async function renderTemplateToCanvas(
  canvas: HTMLCanvasElement,
  template: Template,
  textElements: TextElement[],
  imageElements: ImageElement[],
  artistProfile: UserProfile & Partial<MakeupArtist>
): Promise<HTMLCanvasElement> {
  const FUNC = 'renderTemplateToCanvas'
  console.log(`[${FILE} -> ${FUNC}] Rendering started for template:`, template.id)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas rendering context not available')

  // ---------- Step 1: Draw Background ----------
  const background = await loadImage(template.background_img_url || '')
  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
  console.log(`[${FILE} -> ${FUNC}] 🖼️ Background drawn:`, template.background_img_url)

  const userData = toRecord(artistProfile)
  const dataMap = {
    user_profiles: userData,
    makeup_artists: userData,
  }

  // ---------- Step 2: Image Elements ----------
  for (const imgEl of imageElements) {
    try {
      let imageUrl = imgEl.image_url
      console.log(`[${FILE} -> ${FUNC}] Processing image element:`, imgEl)

      if (Array.isArray(imgEl.binding_config) && imgEl.binding_config.length > 0) {
        const binding = imgEl.binding_config[0] as BindingConfig
        console.log(`[${FILE} -> ${FUNC}] Image binding:`, binding)
        const boundUrl = getValueFromPath(
          dataMap[binding.source],
          binding.field
        )
        if (boundUrl) imageUrl = boundUrl
      }

      const img = await loadImage(imageUrl)
      ctx.drawImage(img, imgEl.x, imgEl.y, imgEl.width, imgEl.height)
      console.log(`[${FILE} -> ${FUNC}] 🧩 Image drawn:`, imageUrl)
    } catch (err) {
      console.warn(`[${FILE} -> ${FUNC}] ⚠️ Failed to load image element: ${imgEl.image_url}`, err)
    }
  }

  // ---------- Step 3: Text Elements ----------
for (const txtEl of textElements) {
  console.log(`[${FILE} -> ${FUNC}] Processing text element:`, txtEl)

  // ✅ Use values directly from Supabase (each text element can have unique style)
  const {
    x,
    y,
    width,
    height,
    alignment,
    text_wrap,
    line_height,
    font,
    font_size,
    text_color,
    bg_color,
    bg_transparency,
    binding_config,
  } = txtEl

  let textTemplate = ''

  // ✅ Handles array containing single object with "template"
  if (
    Array.isArray(binding_config) &&
    binding_config.length === 1 &&
    typeof binding_config[0] === 'object' &&
    binding_config[0] !== null &&
    'template' in binding_config[0] &&
    typeof (binding_config[0] as Record<string, unknown>).template === 'string'
  ) {
    textTemplate = (binding_config[0] as { template: string }).template
  }

  // ✅ Handles direct object with template
  else if (
    binding_config &&
    !Array.isArray(binding_config) &&
    typeof binding_config === 'object' &&
    'template' in binding_config &&
    typeof (binding_config as Record<string, unknown>).template === 'string'
  ) {
    textTemplate = (binding_config as { template: string }).template
  }

  // 🧩 Fallback: legacy binding array with field/source/fallback
  else if (Array.isArray(binding_config)) {
    const lines: string[] = []
    for (const binding of binding_config) {
      if (
        binding &&
        typeof binding === 'object' &&
        'field' in binding &&
        'source' in binding
      ) {
        const b = binding as BindingConfig
        const val =
          getValueFromPath(dataMap[b.source], b.field) ||
          b.fallback ||
          ''
        lines.push(val)
      }
    }
    // Join lines with newline so each appears on its own line
    textTemplate = lines.join('\n')
  }

  // ⚠️ Unknown or invalid format
  else {
    console.warn(
      `[${FILE} -> ${FUNC}] ⚠️ Unrecognized binding_config format:`,
      binding_config
    )
    continue
  }

  // ✅ Replace placeholders with actual values
  const resolvedText = replaceBindings(textTemplate, dataMap)

  ctx.save()

  // 🧩 Style comes from Supabase — fallback only if missing
  const safeFont = font && font.trim().length > 0 ? font : 'Poppins'
  const safeFontSize = font_size || 16
  const safeLineHeight = line_height || 1.3
  const safeColor = text_color || '#000000'
  const safeAlignment: 'left' | 'center' | 'right' =
    alignment === 'center'
      ? 'center'
      : alignment === 'right'
      ? 'right'
      : 'left'

  ctx.font = `${safeFontSize}px ${safeFont}`
  ctx.fillStyle = safeColor
  ctx.textBaseline = 'top'

  // Optional background (if defined in Supabase)
  if (bg_color && bg_color !== '#ffffff00' && bg_transparency !== undefined) {
    const alpha = 1 - Math.min(Math.max(bg_transparency, 0), 1)
    if (alpha > 0) {
      ctx.globalAlpha = alpha
      ctx.fillStyle = bg_color
      ctx.fillRect(x, y, width, height)
      ctx.globalAlpha = 1
      ctx.fillStyle = safeColor
    }
  }

  // ✅ Compute X position for alignment
  const alignedX = getAlignedX(ctx, resolvedText, x, width, safeAlignment)

  // ✅ Draw multiline text properly
  const lines = resolvedText.split('\n')
  let currentY = y
  for (const line of lines) {
    if (text_wrap && line.length > 0) {
      drawWrappedText(ctx, line, alignedX, currentY, width, safeLineHeight * safeFontSize)
      currentY += safeFontSize * safeLineHeight
    } else {
      ctx.fillText(line, alignedX, currentY)
      currentY += safeFontSize * safeLineHeight
    }
  }

  ctx.restore()
  console.log(`[${FILE} -> ${FUNC}] ✏️ Text drawn:`, resolvedText)
}


  console.log(`[${FILE} -> ${FUNC}] ✅ Rendering complete.`)
  return canvas
}
