// lib/generation/createqr.ts

import QRCode from "qrcode"

/**
 * Allowed QR error correction levels
 */
export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H"

/**
 * Structured data allowed inside QR
 * This prevents silent payload loss
 */
export interface QRPayload {
  name?: string | null
  number?: string | null
  city?: string | null
}

/**
 * Options for QR generation
 */
export interface QRCreateOptions {
  /** Final rendered width in pixels */
  width: number

  /** Final rendered height in pixels */
  height: number

  /** QR error correction level */
  errorCorrectionLevel?: QRErrorCorrectionLevel
}

/**
 * Convert structured payload into a SINGLE-LINE QR string
 * Format:
 * {Name:Joe, Number:123, City:Hyderabad}
 */
function serializeQRPayload(payload: QRPayload): string {
  const parts: string[] = []

  if (payload.name) {
    parts.push(`Name:${payload.name}`)
  }

  if (payload.number) {
    parts.push(`Number:${payload.number}`)
  }

  if (payload.city) {
    parts.push(`City:${payload.city}`)
  }

  const result: string = `{${parts.join(", ")}}`

  if (parts.length === 0) {
    throw new Error("QR payload has no valid fields")
  }

  return result
}

/**
 * Generates a QR code as an HTMLImageElement.
 * Designed for direct usage with canvas ctx.drawImage().
 */
export async function createQR(
  payload: QRPayload,
  options: QRCreateOptions
): Promise<HTMLImageElement> {
  // ---------- Serialize payload ----------
  const serializedPayload: string = serializeQRPayload(payload)

  console.debug("[createQR] 📦 Serialized payload:", serializedPayload)
  console.debug("[createQR] 📦 Payload length:", serializedPayload.length)

  // ---------- Normalize size (QR must be square) ----------
  const size: number = Math.min(options.width, options.height)

  console.debug("[createQR] 📐 QR size:", size)

  // ---------- Generate QR as PNG ----------
  const dataUrl: string = await QRCode.toDataURL(serializedPayload, {
    width: size,
    errorCorrectionLevel: options.errorCorrectionLevel ?? "M",

    // Remove large white border
    margin: 0,

    // Sharp output (important for print)
    scale: 1,
  })

  console.debug("[createQR] 🖼️ QR data URL generated")

  // ---------- Convert to Image ----------
  const img: HTMLImageElement = new Image()
  img.src = dataUrl

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      console.debug("[createQR] ✅ QR image loaded")
      resolve()
    }

    img.onerror = () => {
      reject(new Error("QR image failed to load"))
    }
  })

  return img
}

/**
 * Generate QR as SVG markup string.
 */
export interface QRSVGOptions {
  errorCorrectionLevel?: QRErrorCorrectionLevel
}

export async function createQRSVG(
  payload: QRPayload,
  options?: QRSVGOptions
): Promise<string> {
  const serializedPayload: string = serializeQRPayload(payload)

  console.debug("[createQRSVG] 📦 Serialized payload:", serializedPayload)

  return QRCode.toString(serializedPayload, {
    type: "svg",
    errorCorrectionLevel: options?.errorCorrectionLevel ?? "M",
    margin: 0,
  })
}
