// =======================================
// lib/generation/renderTemplateToCanvas.ts
// Dynamic Canvas Renderer (Type-safe, no TS errors)
// ---------------------------------------
// - Renders full ID card or certificate to <canvas>
// - Strongly typed (no "any")
// - Supports image + text bindings
// - Handles {{user_profiles.field}} and {{makeup_artists.field}}
// =======================================

import {
  Template,
  TextElement,
  ImageElement,
  UserProfile,
  MakeupArtist,
  BindingConfig,
} from '@/modules/template_generation/types'
import {
  drawWrappedText,
  getAlignedX,
  loadImage,
} from '@/modules/template_generation/canvasUtils'
import { logDebug } from '@/modules/template_generation/Debugger'

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

/**
 * Helper: Safe table record shape used in bindings.
 */
type RecordStrNullable = Record<string, string | null>

/**
 * Type-guard: detect an object that carries a `template: string` property.
 */
function isTemplateObject(obj: unknown): obj is { template: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'template' in obj &&
    typeof (obj as Record<string, unknown>).template === 'string'
  )
}

/**
 * Safely retrieves a single field value from a table record.
 * We assume flat table records (no nested dot paths for table fields).
 */
function getValueFromPathRecord(
  record: RecordStrNullable | undefined,
  field: string | undefined
): string {
  const FN = 'getValueFromPathRecord'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('getValueFromPathRecord', ctx)

  if (!record || !field) {
    logDebug.stopTimer('getValueFromPathRecord', ctx)
    return ''
  }

  const val = record[field]
  const result = typeof val === 'string' ? val : ''
  logDebug.info(`Resolved field "${field}" → "${result}"`, ctx)
  logDebug.stopTimer('getValueFromPathRecord', ctx)
  return result
}

/**
 * Replaces placeholders (e.g. {{user_profiles.full_name}}) inside text templates.
 * Accepts a dataMap object keyed by table name.
 */
function replaceBindings(
  template: string,
  data: Record<string, RecordStrNullable>
): string {
  const FN = 'replaceBindings'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('replaceBindings', ctx)

  const result = template.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const [sourceRaw, fieldRaw] = rawPath.trim().split('.')
    const source = sourceRaw?.trim()
    const field = fieldRaw?.trim()
    if (!source || !field) return ''

    const table = data[source]
    if (!table) return ''

    const v = table[field]
    return v ? String(v) : ''
  })

  logDebug.info(`Processed bindings result: ${result}`, ctx)
  logDebug.stopTimer('replaceBindings', ctx)
  return result
}

/**
 * Convert a profile (UserProfile & Partial<MakeupArtist>) into a flat record
 * of string | null so bindings can read from it.
 */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): RecordStrNullable {
  const FN = 'toRecord'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('toRecord', ctx)

  const out: RecordStrNullable = {}
  Object.entries(profile).forEach(([k, v]) => {
    if (typeof v === 'string') out[k] = v
    else if (v === null || v === undefined) out[k] = null
    else out[k] = String(v)
  })

  logDebug.info(`Converted profile to record with ${Object.keys(out).length} keys`, ctx)
  logDebug.stopTimer('toRecord', ctx)
  return out
}

/**
 * Map alignment values (including 'justify') to the subset expected by getAlignedX.
 */
function normalizeAlignment(al?: TextElement['alignment']): 'left' | 'center' | 'right' {
  if (al === 'center') return 'center'
  if (al === 'right') return 'right'
  // treat 'justify' and any other/undefined as 'left'
  return 'left'
}

/**
 * Main renderer: draws background, images, and text bindings on canvas.
 *
 * Note: this version still accepts artistProfile and builds a simple dataMap
 * mapping both 'user_profiles' and 'makeup_artists' to the same record for
 * backward compatibility with existing templates.
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
  const FN = 'renderTemplateToCanvas'
  const ctxLog = { file: FILE, fn: FN }

  logDebug.startTimer('renderTemplateToCanvas', ctxLog)
  logDebug.info(`Rendering started | Template ID: ${template.id}`, ctxLog)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    logDebug.error('Canvas rendering context not available', ctxLog)
    throw new Error('Canvas rendering context not available')
  }

  // ---------- Step 1: Draw Background ----------
  logDebug.startTimer('backgroundDraw', ctxLog)
  const background = preloadedBackground
    ? preloadedBackground
    : await loadImage(template.background_img_url || '')

  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight

  // drawImage accepts (image, dx, dy, dWidth, dHeight) — use full canvas
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  logDebug.info(
    `Background drawn | URL: ${template.background_img_url} | Preloaded Used: ${!!preloadedBackground}`,
    ctxLog
  )
  logDebug.stopTimer('backgroundDraw', ctxLog)

  // Build dataMap from provided artistProfile (backwards-compatible)
  const userData = toRecord(artistProfile)
  const dataMap: Record<string, RecordStrNullable> = {
    user_profiles: userData,
    makeup_artists: userData,
  }

  // ---------- Step 2: Image Elements ----------
  logDebug.startTimer('imageBlock', ctxLog)
  for (let i = 0; i < imageElements.length; i++) {
    const imgEl = imageElements[i]
    const imgTimerLabel = `image_${i}`
    logDebug.startTimer(imgTimerLabel, ctxLog)

    try {
      let imageUrl = imgEl.image_url
      let usedPreloaded = false

      const bindingConfigUnknown = imgEl.binding_config as unknown

      if (Array.isArray(bindingConfigUnknown) && bindingConfigUnknown.length > 0) {
        // The declared type is BindingConfig[], so safely cast and use fields:
        const binding = bindingConfigUnknown[0] as BindingConfig
        const table = dataMap[binding.source]
        const boundUrl = getValueFromPathRecord(table, binding.field)

        if (preloadedProfileImage && binding.field === 'profile_photo_url') {
          ctx.drawImage(preloadedProfileImage, imgEl.x, imgEl.y, imgEl.width, imgEl.height)
          usedPreloaded = true
          logDebug.info(`Profile image drawn from prop | Field: ${binding.field}`, ctxLog)
          logDebug.stopTimer(imgTimerLabel, ctxLog)
          continue
        }

        if (boundUrl) {
          imageUrl = boundUrl
        }
      }

      const img = await loadImage(imageUrl)
      ctx.drawImage(img, imgEl.x, imgEl.y, imgEl.width, imgEl.height)

      logDebug.info(
        `Image drawn | URL: ${imageUrl} ${usedPreloaded ? '(preloaded)' : ''}`,
        ctxLog
      )
    } catch (err) {
      logDebug.warn(`Failed to load image element: ${imgEl.image_url} — ${String(err)}`, ctxLog)
    } finally {
      logDebug.stopTimer(imgTimerLabel, ctxLog)
    }
  }
  logDebug.stopTimer('imageBlock', ctxLog)

  // ---------- Step 3: Text Elements ----------
  logDebug.startTimer('textBlock', ctxLog)
  for (let tIndex = 0; tIndex < textElements.length; tIndex++) {
    const txtEl = textElements[tIndex]
    const txtTimerLabel = `text_${tIndex}`
    logDebug.startTimer(txtTimerLabel, ctxLog)
    logDebug.info(`Processing text element: index=${tIndex}`, ctxLog)

    // Deconstruct safely
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
    } = txtEl

    // Treat binding_config as `unknown` so we can detect template objects at runtime
    const bindingConfigUnknown = (txtEl.binding_config as unknown)

    let textTemplate = ''

    // Case A: binding_config is an array and its first entry is a { template: string } object
    if (Array.isArray(bindingConfigUnknown) && bindingConfigUnknown.length === 1 && isTemplateObject(bindingConfigUnknown[0])) {
      textTemplate = bindingConfigUnknown[0].template
    }
    // Case B: binding_config itself is a template object (legacy shape)
    else if (!Array.isArray(bindingConfigUnknown) && isTemplateObject(bindingConfigUnknown)) {
      textTemplate = bindingConfigUnknown.template
    }
    // Case C: binding_config is an array of BindingConfig items (field/source/fallback)
    else if (Array.isArray(bindingConfigUnknown)) {
      const lines: string[] = []
      for (const bRaw of bindingConfigUnknown) {
        // defensive: ensure this item looks like BindingConfig
        if (bRaw && typeof bRaw === 'object') {
          const b = bRaw as BindingConfig
          const table = dataMap[b.source]
          let val = getValueFromPathRecord(table, b.field)
          if (!val && typeof b.fallback === 'string') val = b.fallback
          lines.push(val)
        } else {
          lines.push('')
        }
      }
      textTemplate = lines.join('\n')
    } else {
      // No recognized binding_config shape — leave textTemplate empty
      logDebug.warn('Unrecognized binding_config format', ctxLog)
      logDebug.stopTimer(txtTimerLabel, ctxLog)
      continue
    }

    const resolvedText = replaceBindings(textTemplate, dataMap)

    // Drawing
    ctx.save()

    const safeFont = font && font.trim().length > 0 ? font : 'Poppins'
    const safeFontSize = (font_size ?? 16) as number
    const safeLineHeightFactor = (line_height ?? 1.3) as number
    const safeColor = text_color ?? '#000000'
    const safeAlignment = normalizeAlignment(alignment)

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
    const lineHeightPx = safeFontSize * safeLineHeightFactor

    for (const line of lines) {
      if (text_wrap && line.length > 0) {
        drawWrappedText(ctx, line, alignedX, currentY, width, lineHeightPx)
        currentY += lineHeightPx
      } else {
        ctx.fillText(line, alignedX, currentY)
        currentY += lineHeightPx
      }
    }

    ctx.restore()

    logDebug.info(`Text drawn | Value: "${resolvedText}"`, ctxLog)
    logDebug.stopTimer(txtTimerLabel, ctxLog)
  }

  logDebug.stopTimer('textBlock', ctxLog)
  logDebug.info('Text block complete', ctxLog)
  logDebug.stopTimer('renderTemplateToCanvas', ctxLog)
  logDebug.info('✅ Rendering complete', ctxLog)

  return canvas
}
