// lib/generation/renderTemplateToCanvas.ts
// Dynamic Canvas Renderer for templates
// Fully type-safe and compatible with new template editor

import {
  Template,
  TextElementRow,
  ImageElementRow,
  UserProfile,
  MakeupArtist,
  BindingConfig,
} from '@/modules/template_generation/types'
import {
  drawWrappedText,
  getAlignedX,
  loadImage,
} from '@/modules/template_generation/canvasUtils'
import {createQR} from "./createqr"

const FILE = 'lib/generation/renderTemplateToCanvas.ts'

type RecordStrNullable = Record<string, string | null>

/** Detects legacy template object { template: string } */
function isTemplateObject(obj: unknown): obj is { template: string } {
  return typeof obj === 'object' && obj !== null && 'template' in obj && typeof (obj as Record<string, unknown>).template === 'string'
}

/** Safely get a value from a flat table record */
function getValueFromPathRecord(record: RecordStrNullable | undefined, field: string | undefined): string {
  if (!record || !field) return ''
  const val = record[field]
  return typeof val === 'string' ? val : ''
}

/** Replaces {{table.field}} placeholders in text */
function replaceBindings(template: string, data: Record<string, RecordStrNullable>): string {
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

/** Converts profile objects to flat string | null records */
function toRecord(profile: UserProfile & Partial<MakeupArtist>): RecordStrNullable {
  const out: RecordStrNullable = {}
  Object.entries(profile).forEach(([k, v]) => {
    if (typeof v === 'string') out[k] = v
    else if (v === null || v === undefined) out[k] = null
    else out[k] = String(v)
  })
  return out
}

/** Normalize alignment to canvas-compatible values */
function normalizeAlignment(al?: TextElementRow['alignment']): 'left' | 'center' | 'right' {
  if (al === 'center') return 'center'
  if (al === 'right') return 'right'
  return 'left'
}

/** Draws a simple QR placeholder if qr_text is provided */
function drawQRPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#e0e0e0'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#555'
  const size = Math.min(w, h) / 5
  ctx.fillRect(x + size * 0, y + size * 0, size, size)
  ctx.fillRect(x + size * 3, y + size * 0, size, size)
  ctx.fillRect(x + size * 0, y + size * 3, size, size)
  ctx.fillRect(x + size * 2, y + size * 2, size, size)
  ctx.fillRect(x + size * 3, y + size * 3, size, size)
}

/** Main renderer */
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

  // ---------- Background ----------
  const background = preloadedBackground ? preloadedBackground : await loadImage(template.background_img_url || '')
  canvas.width = background.naturalWidth
  canvas.height = background.naturalHeight
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  // ---------- Data Map ----------
  const userData = toRecord(artistProfile)
  const dataMap: Record<string, RecordStrNullable> = {
    user_profiles: userData,
    makeup_artists: userData,
  }

  // ---------- Image Elements ----------
  for (const imgEl of imageElements) {
    const x = Number(imgEl.x)
    const y = Number(imgEl.y)
    const width = Number(imgEl.width)
    const height = Number(imgEl.height)

    try {
      if (imgEl.qr_text?.trim()) {
        drawQRPlaceholder(ctx, x, y, width, height)
        continue
      }

      let imageUrl = imgEl.image_url
      if (Array.isArray(imgEl.binding_config) && imgEl.binding_config.length > 0) {
        const binding = imgEl.binding_config[0]
        const table = dataMap[binding.source]
        const boundUrl = getValueFromPathRecord(table, binding.field)
        if (boundUrl) imageUrl = boundUrl
      }

      if (preloadedProfileImage && imgEl.binding_config?.some(b => b.field === 'profile_photo_url')) {
        ctx.drawImage(preloadedProfileImage, x, y, width, height)
      } else {
        const img = await loadImage(imageUrl)
        ctx.drawImage(img, x, y, width, height)
      }
    } catch (err) {
      console.warn(`Failed to draw image: ${imgEl.image_url} | Error:`, err)
    }
  }

  // ---------- Text Elements ----------
  for (const txtEl of textElements) {
    const x = Number(txtEl.x)
    const y = Number(txtEl.y)
    const width = Number(txtEl.width)
    const height = Number(txtEl.height)
    const font = txtEl.font || 'Poppins'
    const font_size = txtEl.font_size ?? 16
    const line_height = txtEl.line_height ?? 1.3
    const alignment = normalizeAlignment(txtEl.alignment ?? undefined)
    const text_wrap = txtEl.text_wrap ?? false
    const text_color = txtEl.text_color ?? '#000000'
    const bg_color = txtEl.bg_color
    const bg_transparency = txtEl.bg_transparency ?? 0

    let textTemplate = ''

// --- Determine text from binding_config or static_text ---
const bc = txtEl.binding_config

if (Array.isArray(bc)) {
  // CASE 1: Empty array → use static_text
  if (bc.length === 0) {
    textTemplate = txtEl.static_text || ''
  
  // CASE 2: One item + isTemplateObject
  } else if (bc.length === 1 && isTemplateObject(bc[0])) {
    textTemplate = bc[0].template
  
  // CASE 3: Multiple normal binding items
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
  // CASE 4: Single object binding with template
  textTemplate = (bc as { template: string }).template

} else {
  // CASE 5: Final fallback → static text
  textTemplate = txtEl.static_text || ''
}



    const resolvedText = replaceBindings(textTemplate, dataMap)

    ctx.save()
    ctx.font = `${font_size}px ${font}`
    ctx.fillStyle = text_color
    ctx.textBaseline = 'top'

    if (bg_color && bg_transparency > 0) {
      const alpha = 1 - Math.min(Math.max(bg_transparency, 0), 1)
      if (alpha > 0) {
        ctx.globalAlpha = alpha
        ctx.fillStyle = bg_color
        ctx.fillRect(x, y, width, height)
        ctx.globalAlpha = 1
        ctx.fillStyle = text_color
      }
    }

    const alignedX = getAlignedX(ctx, resolvedText, x, width, alignment)
    const lines = resolvedText.split('\n')
    let currentY = y
    const lineHeightPx = font_size * line_height

    for (const line of lines) {
      if (text_wrap && line.length > 0) drawWrappedText(ctx, line, alignedX, currentY, width, lineHeightPx)
      else ctx.fillText(line, alignedX, currentY)
      currentY += lineHeightPx
    }

    ctx.restore()
  }

  return canvas
}
