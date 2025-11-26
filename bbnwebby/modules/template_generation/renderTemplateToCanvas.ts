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
} from '@/modules/template_generation/canvasUtils'

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

/**
 * Safely retrieves a value from a nested object using dot notation.
 */
function getValueFromPath<T extends Record<string, unknown>>(
  obj: T,
  path: string | undefined
): string {
  const FUNC = 'getValueFromPath'
  const start = performance.now()
  console.log(`[${FILE} -> ${FUNC}] Started at: ${start.toFixed(2)}ms | Path: ${path}`)

  if (!path) {
    console.warn(`[${FILE} -> ${FUNC}] ⚠️ Invalid or missing path received:`, path)
    return ''
  }

  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      console.warn(`[${FILE} -> ${FUNC}] ⚠️ Broken path at key "${key}". Current:`, current)
      return ''
    }
    current = (current as Record<string, unknown>)[key]
  }

  const end = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] Completed in ${(end - start).toFixed(
      2
    )}ms | Retrieved: ${String(current)}`
  )
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
  const start = performance.now()

  const result = template.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const [source, field] = rawPath.trim().split('.')
    const value =
      data[source as 'user_profiles' | 'makeup_artists']?.[field] ?? ''
    return value ? String(value) : ''
  })

  const end = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] Processed bindings in ${(end - start).toFixed(
      2
    )}ms | Result: ${result}`
  )
  return result
}

/**
 * Converts a combined user + artist profile into a record of string/null values.
 */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): Record<string, string | null> {
  const FUNC = 'toRecord'
  const start = performance.now()

  const record: Record<string, string | null> = {}
  Object.entries(profile).forEach(([key, val]) => {
    record[key] = typeof val === 'string' ? val : val ?? null
  })

  const end = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] Converted profile to record with ${
      Object.keys(record).length
    } fields in ${(end - start).toFixed(2)}ms`
  )
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
  artistProfile: UserProfile & Partial<MakeupArtist>,
  preloadedBackground?: HTMLImageElement | null,
  preloadedProfileImage?: HTMLImageElement | null  
): Promise<HTMLCanvasElement> {
  const FUNC = 'renderTemplateToCanvas'
  const renderStart = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] Rendering started at: ${renderStart.toFixed(
      2
    )}ms | Template ID: ${template.id}`
  )

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas rendering context not available')

  // ---------- Step 1: Draw Background ----------
  const bgStart = performance.now()

  // ⭐ NEW: If provided → use preloaded image, else load normally
  const background = preloadedBackground
    ? preloadedBackground
    : await loadImage(template.background_img_url || '')

  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  const bgEnd = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] 🖼️ Background drawn in ${(bgEnd - bgStart).toFixed(
      2
    )}ms | URL: ${template.background_img_url} | Preloaded Used: ${!!preloadedBackground}`  // ⭐ NEW (no change to structure)
  )

  const userData = toRecord(artistProfile)
  const dataMap = {
    user_profiles: userData,
    makeup_artists: userData,
  }

// ---------- Step 2: Image Elements ----------
const imagesStart = performance.now()

for (const imgEl of imageElements) {
  const imgStart = performance.now()
  try {
    let imageUrl = imgEl.image_url
    let usingProfileProp = false

    // Check if the image element has a binding config
    if (Array.isArray(imgEl.binding_config) && imgEl.binding_config.length > 0) {
      const binding = imgEl.binding_config[0] as BindingConfig
      const boundUrl = getValueFromPath(dataMap[binding.source], binding.field)

      // ⭐ Use provided preloadedProfileImage prop if field matches "profile_photo_url"
      if (preloadedProfileImage && binding.field === 'profile_photo_url') {
        ctx.drawImage(preloadedProfileImage, imgEl.x, imgEl.y, imgEl.width, imgEl.height)
        usingProfileProp = true
        const imgEnd = performance.now()
        console.log(
          `[${FILE} -> ${FUNC}] 🧩 Profile image drawn from prop in ${(imgEnd - imgStart).toFixed(
            2
          )}ms | Field: ${binding.field}`
        )
        continue
      }

      // Fallback to Supabase-bound URL if exists
      if (boundUrl) {
        imageUrl = boundUrl
      }
    }

    // Load the image and draw on canvas
    const img = await loadImage(imageUrl)
    ctx.drawImage(img, imgEl.x, imgEl.y, imgEl.width, imgEl.height)

    const imgEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] 🧩 Image drawn in ${(imgEnd - imgStart).toFixed(
        2
      )}ms | URL: ${imageUrl} ${usingProfileProp ? '(used preloadedProfileImage prop)' : ''}`
    )
  } catch (err) {
    console.warn(
      `[${FILE} -> ${FUNC}] ⚠️ Failed to load image element: ${imgEl.image_url}`,
      err
    )
  }
}

const imagesEnd = performance.now()
console.log(
  `[${FILE} -> ${FUNC}] Image block complete in ${(imagesEnd - imagesStart).toFixed(2)}ms`
)


  // ---------- Step 3: Text Elements ----------
  const textStart = performance.now()
  for (const txtEl of textElements) {
    const txtBlockStart = performance.now()

    console.log(`[${FILE} -> ${FUNC}] Processing text element:`, txtEl)

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

    if (
      Array.isArray(binding_config) &&
      binding_config.length === 1 &&
      typeof binding_config[0] === 'object' &&
      binding_config[0] !== null &&
      'template' in binding_config[0] &&
      typeof (binding_config[0] as Record<string, unknown>).template === 'string'
    ) {
      textTemplate = (binding_config[0] as { template: string }).template
    } else if (
      binding_config &&
      !Array.isArray(binding_config) &&
      typeof binding_config === 'object' &&
      'template' in binding_config &&
      typeof (binding_config as Record<string, unknown>).template === 'string'
    ) {
      textTemplate = (binding_config as { template: string }).template
    } else if (Array.isArray(binding_config)) {
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
      textTemplate = lines.join('\n')
    } else {
      console.warn(
        `[${FILE} -> ${FUNC}] ⚠️ Unrecognized binding_config format:`,
        binding_config
      )
      continue
    }

    const resolvedText = replaceBindings(textTemplate, dataMap)

    ctx.save()

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

    const alignedX = getAlignedX(ctx, resolvedText, x, width, safeAlignment)

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

    const txtBlockEnd = performance.now()
    console.log(
      `[${FILE} -> ${FUNC}] ✏️ Text drawn in ${(txtBlockEnd - txtBlockStart).toFixed(
        2
      )}ms | Value: "${resolvedText}"`
    )
  }
  const textEnd = performance.now()

  console.log(`[${FILE} -> ${FUNC}] Text block complete in ${(textEnd - textStart).toFixed(2)}ms`)

  const renderEnd = performance.now()
  console.log(
    `[${FILE} -> ${FUNC}] ✅ Rendering complete in ${(renderEnd - renderStart).toFixed(2)}ms`
  )

  return canvas
}
