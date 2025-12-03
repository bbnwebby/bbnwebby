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
import { logDebug } from '@/utils/Debugger'

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

/**
 * Safely retrieves a value from a nested object using dot notation.
 */
function getValueFromPath<T extends Record<string, unknown>>(
  obj: T,
  path: string | undefined
): string {
  const FN = 'getValueFromPath'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('getValueFromPath', ctx)

  if (!path) {
    logDebug.warn(`⚠️ Invalid or missing path received: ${String(path)}`, ctx)
    logDebug.stopTimer('getValueFromPath', ctx)
    return ''
  }

  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      logDebug.warn(`⚠️ Broken path at key "${key}". Current: ${String(current)}`, ctx)
      logDebug.stopTimer('getValueFromPath', ctx)
      return ''
    }
    current = (current as Record<string, unknown>)[key]
  }

  const result = typeof current === 'string' ? current : ''
  logDebug.info(`Retrieved value for path "${path}": ${String(result)}`, ctx)
  logDebug.stopTimer('getValueFromPath', ctx)
  return result
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
  const FN = 'replaceBindings'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('replaceBindings', ctx)

  const result = template.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const [source, field] = rawPath.trim().split('.')
    const value =
      data[source as 'user_profiles' | 'makeup_artists']?.[field] ?? ''
    return value ? String(value) : ''
  })

  logDebug.info(`Processed bindings result: ${result}`, ctx)
  logDebug.stopTimer('replaceBindings', ctx)
  return result
}

/**
 * Converts a combined user + artist profile into a record of string/null values.
 */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): Record<string, string | null> {
  const FN = 'toRecord'
  const ctx = { file: FILE, fn: FN }
  logDebug.startTimer('toRecord', ctx)

  const record: Record<string, string | null> = {}
  Object.entries(profile).forEach(([key, val]) => {
    record[key] = typeof val === 'string' ? val : val ?? null
  })

  logDebug.info(
    `Converted profile to record with ${Object.keys(record).length} fields`,
    ctx
  )
  logDebug.stopTimer('toRecord', ctx)
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
  // Use preloaded background if provided
  const background = preloadedBackground
    ? preloadedBackground
    : await loadImage(template.background_img_url || '')

  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
  logDebug.info(
    `Background drawn | URL: ${template.background_img_url} | Preloaded Used: ${!!preloadedBackground}`,
    ctxLog
  )
  logDebug.stopTimer('backgroundDraw', ctxLog)

  const userData = toRecord(artistProfile)
  const dataMap = {
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
      let usingProfileProp = false

      // Check if the image element has a binding config
      if (Array.isArray(imgEl.binding_config) && imgEl.binding_config.length > 0) {
        const binding = imgEl.binding_config[0] as BindingConfig
        const boundUrl = getValueFromPath(dataMap[binding.source], binding.field)

        // Use provided preloadedProfileImage prop if field matches "profile_photo_url"
        if (preloadedProfileImage && binding.field === 'profile_photo_url') {
          ctx.drawImage(preloadedProfileImage, imgEl.x, imgEl.y, imgEl.width, imgEl.height)
          usingProfileProp = true
          logDebug.info(
            `Profile image drawn from prop | Field: ${binding.field}`,
            ctxLog
          )
          logDebug.stopTimer(imgTimerLabel, ctxLog)
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

      logDebug.info(
        `Image drawn | URL: ${imageUrl} ${usingProfileProp ? '(used preloadedProfileImage prop)' : ''}`,
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
      logDebug.warn('Unrecognized binding_config format', ctxLog)
      logDebug.stopTimer(txtTimerLabel, ctxLog)
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

    logDebug.info(`Text drawn | Value: "${resolvedText}"`, ctxLog)
    logDebug.stopTimer(txtTimerLabel, ctxLog)
  }
  logDebug.stopTimer('textBlock', ctxLog)

  logDebug.info('Text block complete', ctxLog)
  logDebug.stopTimer('renderTemplateToCanvas', ctxLog)
  logDebug.info('✅ Rendering complete', ctxLog)

  return canvas
}
