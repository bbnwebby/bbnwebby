// lib/generation/renderTemplateToCanvas.ts
// Dynamic Canvas Renderer for templates
// Fully type-safe and compatible with new template editor

import {
  Template,
  TextElementRow,
  ImageElementRow,
  UserProfile,
  MakeupArtist,
} from '@/modules/template_generation/types'

import {
  drawWrappedText,
  getAlignedX,
  loadImage,
} from '@/modules/template_generation/canvasUtils'

import { createQR } from './createqr'

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

/**
 * Flat record used for binding resolution
 */
type RecordStrNullable = Record<string, string | null>

/**
 * Detect legacy binding object: { template: string }
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
 * Safely read a value from a flat record
 */
function getValueFromPathRecord(
  record: RecordStrNullable | undefined,
  field: string | undefined
): string {
  if (!record || !field) return ''
  const val = record[field]
  return typeof val === 'string' ? val : ''
}

/**
 * Replace {{table.field}} placeholders
 */
function replaceBindings(
  template: string,
  data: Record<string, RecordStrNullable>
): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const [sourceRaw, fieldRaw] = rawPath.trim().split('.')
    const source = sourceRaw?.trim()
    const field = fieldRaw?.trim()
    if (!source || !field) return ''
    const table = data[source]
    if (!table) return ''
    const v = table[field]
    return v ? String(v) : ''
  })
}

/**
 * Convert merged profile object into flat string map
 */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): RecordStrNullable {
  const out: RecordStrNullable = {}
  Object.entries(profile).forEach(([key, value]) => {
    if (typeof value === 'string') out[key] = value
    else if (value === null || value === undefined) out[key] = null
    else out[key] = String(value)
  })
  return out
}

/**
 * Normalize alignment
 */
function normalizeAlignment(
  al?: TextElementRow['alignment']
): 'left' | 'center' | 'right' {
  if (al === 'center') return 'center'
  if (al === 'right') return 'right'
  return 'left'
}

/**
 * ------------------------------------------------------
 * MAIN RENDERER
 * ------------------------------------------------------
 */
export async function renderTemplateToCanvas(
  canvas: HTMLCanvasElement,
  template: Template,
  textElements: TextElementRow[],
  imageElements: ImageElementRow[],
  artistProfile: UserProfile & Partial<MakeupArtist>,
  preloadedBackground?: HTMLImageElement | null,
  preloadedProfileImage?: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas rendering context not available')

  /**
   * -------------------------------
   * BACKGROUND
   * -------------------------------
   */
  const background = preloadedBackground
    ? preloadedBackground
    : await loadImage(template.background_img_url || '')

  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  /**
   * -------------------------------
   * DATA MAP
   * -------------------------------
   * SAME merged object exposed under BOTH namespaces
   */
  const mergedRecord: RecordStrNullable = toRecord(artistProfile)

  const dataMap: Record<string, RecordStrNullable> = {
    user_profiles: mergedRecord,
    makeup_artists: mergedRecord,
  }

  /**
   * -------------------------------
   * IMAGE ELEMENTS
   * -------------------------------
   */
  for (const imgEl of imageElements) {
    const x = Number(imgEl.x)
    const y = Number(imgEl.y)
    const width = Number(imgEl.width)
    const height = Number(imgEl.height)

    try {
      /**
       * -------------------------------
       * QR CODE HANDLING
       * -------------------------------
       */
      if (imgEl.qr_text && imgEl.qr_text.trim().length > 0) {
        /**
         * IMPORTANT:
         * Resolve real user-profile fields from merged object
         */
        const qrImage = await createQR(
          {
            name:
              mergedRecord['full_name'] ??
              null,

            number:
              mergedRecord['whatsapp_number'] ??
              null,

            city: mergedRecord['city'],
          },
          { width, height }
        )

        ctx.drawImage(qrImage, x, y, width, height)
        continue
      }

      /**
       * -------------------------------
       * NORMAL IMAGE HANDLING
       * -------------------------------
       */
      let imageUrl = imgEl.image_url

      if (Array.isArray(imgEl.binding_config) && imgEl.binding_config.length > 0) {
        const binding = imgEl.binding_config[0]
        const table = dataMap[binding.source]
        const boundUrl = getValueFromPathRecord(table, binding.field)
        if (boundUrl) imageUrl = boundUrl
      }

      if (
        preloadedProfileImage &&
        imgEl.binding_config?.some(b => b.field === 'profile_photo_url')
      ) {
        ctx.drawImage(preloadedProfileImage, x, y, width, height)
      } else {
        const img = await loadImage(imageUrl)
        ctx.drawImage(img, x, y, width, height)
      }
    } catch (err) {
      console.warn(`[${FILE}] Failed to draw image element`, err)
    }
  }

  /**
   * -------------------------------
   * TEXT ELEMENTS
   * -------------------------------
   */
  for (const txtEl of textElements) {
    const x = Number(txtEl.x)
    const y = Number(txtEl.y)
    const width = Number(txtEl.width)
    const height = Number(txtEl.height)

    const font = txtEl.font || 'Poppins'
    const fontSize = txtEl.font_size ?? 16
    const lineHeight = txtEl.line_height ?? 1.3
    const alignment = normalizeAlignment(txtEl.alignment)
    const wrap = txtEl.text_wrap ?? false
    const textColor = txtEl.text_color ?? '#000000'
    const bgColor = txtEl.bg_color
    const bgTransparency = txtEl.bg_transparency ?? 0

    let textTemplate = ''

    const bc = txtEl.binding_config

    if (Array.isArray(bc)) {
      if (bc.length === 0) {
        textTemplate = txtEl.static_text || ''
      } else if (bc.length === 1 && isTemplateObject(bc[0])) {
        textTemplate = bc[0].template
      } else {
        const lines: string[] = []
        for (const b of bc) {
          const table = dataMap[b.source]
          let val = getValueFromPathRecord(table, b.field)
          if (!val && b.fallback) val = b.fallback
          lines.push(val)
        }
        textTemplate = lines.join('\n')
      }
    } else if (bc && typeof bc === 'object' && 'template' in bc) {
      textTemplate = (bc as { template: string }).template
    } else {
      textTemplate = txtEl.static_text || ''
    }

    const resolvedText = replaceBindings(textTemplate, dataMap)

    ctx.save()
    ctx.font = `${fontSize}px ${font}`
    ctx.fillStyle = textColor
    ctx.textBaseline = 'top'

    if (bgColor && bgTransparency > 0) {
      const alpha = 1 - Math.min(Math.max(bgTransparency, 0), 1)
      if (alpha > 0) {
        ctx.globalAlpha = alpha
        ctx.fillStyle = bgColor
        ctx.fillRect(x, y, width, height)
        ctx.globalAlpha = 1
        ctx.fillStyle = textColor
      }
    }

    const alignedX = getAlignedX(ctx, resolvedText, x, width, alignment)
    const lines = resolvedText.split('\n')
    let currentY = y
    const lineHeightPx = fontSize * lineHeight

    for (const line of lines) {
      if (wrap && line.length > 0) {
        drawWrappedText(ctx, line, alignedX, currentY, width, lineHeightPx)
      } else {
        ctx.fillText(line, alignedX, currentY)
      }
      currentY += lineHeightPx
    }

    ctx.restore()
  }

  return canvas
}
