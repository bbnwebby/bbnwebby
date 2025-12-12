// lib/generation/createqr.ts

import QRCode from 'qrcode'

/**
 * Generates a QR code for the given text.
 * @param text The text or URL to encode in the QR code
 * @param options Optional settings for the QR code (size, error correction, etc.)
 * @returns Promise resolving to a data URL of the QR code (PNG format)
 */
export async function createQR(text: string, options?: { width?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }) : Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 200,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
    })
    return dataUrl
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    throw err
  }
}

/**
 * Optional: generate QR code as SVG string instead of PNG data URL
 */
export async function createQRSVG(text: string, options?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }): Promise<string> {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
    })
    return svgString
  } catch (err) {
    console.error('Failed to generate QR SVG:', err)
    throw err
  }
}
