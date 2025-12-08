// =======================================
// lib/generation/canvasUtils.ts
// Canvas Manipulation Utilities (LogDebug Version)
// -----------------------------------------------
// - Every log uses logDebug.info / warn / error
// - No raw console logs
// - Strong TypeScript compliance
// =======================================

import { logDebug } from '@/modules/template_generation/Debugger';

const FILE = 'lib/generation/canvasUtils.ts';

/**
 * Loads an image from a given URL with debug-wrapped logs.
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const FN = 'loadImage';
    const ctx = { file: FILE, fn: FN };
    logDebug.startTimer(FN, ctx);

    logDebug.info(`🖼️ Loading image: ${url}`, ctx);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      logDebug.stopTimer(FN, ctx);
      logDebug.info(`✅ Image loaded successfully: ${url}`, ctx);
      resolve(img);
    };

    img.onerror = (error) => {
      logDebug.stopTimer(FN, ctx);
      logDebug.error(`❌ Failed to load image: ${url}`, ctx);
      logDebug.error(String(error), ctx);
      reject(error);
    };

    img.src = url;
  });

/**
 * Converts a canvas element into a File object (JPEG format).
 */
export const canvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number = 0.9
): Promise<File> =>
  new Promise((resolve, reject) => {
    const FN = 'canvasToFile';
    const ctx = { file: FILE, fn: FN };
    logDebug.startTimer(FN, ctx);

    logDebug.info(`🧾 Starting canvas-to-file conversion: ${filename}`, ctx);

    canvas.toBlob(
      (blob) => {
        logDebug.stopTimer(FN, ctx);

        if (!blob) {
          logDebug.error(
            `❌ Conversion to Blob failed for "${filename}"`,
            ctx
          );
          reject(new Error('Canvas conversion to Blob failed.'));
          return;
        }

        const file = new File([blob], filename, { type: 'image/jpeg' });

        logDebug.info(
          `✅ Canvas converted → ${file.name} (${file.size} bytes)`,
          ctx
        );
        resolve(file);
      },
      'image/jpeg',
      quality
    );
  });

/**
 * Converts a canvas to a Base64 string.
 */
export const canvasToBase64 = (
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): string => {
  const FN = 'canvasToBase64';
  const ctx = { file: FILE, fn: FN };
  logDebug.startTimer(FN, ctx);

  logDebug.info('🎨 Converting canvas to Base64...', ctx);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  logDebug.stopTimer(FN, ctx);
  logDebug.info(`✅ Base64 conversion complete. Length: ${dataUrl.length}`, ctx);

  return dataUrl;
};

/**
 * Draws wrapped text inside a bounding box.
 */
export const drawWrappedText = (
  ctxCanvas: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void => {
  const FN = 'drawWrappedText';
  const ctx = { file: FILE, fn: FN };
  logDebug.startTimer(FN, ctx);

  logDebug.info('✏️ Drawing wrapped text', { file: FILE, fn: FN });
  logDebug.info(`params: x=${x}, y=${y}, maxWidth=${maxWidth}, lineHeight=${lineHeight}`, ctx);

  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const test = `${line}${word} `;
    const metrics = ctxCanvas.measureText(test);

    if (metrics.width > maxWidth && line !== '') {
      logDebug.info(`➡️ New line due to width at y=${currentY}`, ctx);
      ctxCanvas.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }

  ctxCanvas.fillText(line.trim(), x, currentY);

  logDebug.stopTimer(FN, ctx);
  logDebug.info(`✅ Wrapped text drawn`, ctx);
};

/**
 * Computes X position based on alignment.
 */
export const getAlignedX = (
  ctxCanvas: CanvasRenderingContext2D,
  text: string,
  baseX: number,
  boxWidth: number,
  alignment: 'left' | 'center' | 'right'
): number => {
  const FN = 'getAlignedX';
  const ctx = { file: FILE, fn: FN };
  logDebug.startTimer(FN, ctx);

  const textWidth = ctxCanvas.measureText(text).width;
  let alignedX = baseX;

  switch (alignment) {
    case 'center':
      alignedX = baseX + (boxWidth - textWidth) / 2;
      break;
    case 'right':
      alignedX = baseX + boxWidth - textWidth;
      break;
    default:
      alignedX = baseX;
  }

  logDebug.stopTimer(FN, ctx);
  logDebug.info(`↔️ Alignment computed: ${alignment} -> x=${alignedX}`, ctx);
  return alignedX;
};

/**
 * Replaces {{placeholders}} in text.
 */
export const replacePlaceholders = (
  text: string | null | undefined,
  replacements: Record<string, string>
): string => {
  const FN = 'replacePlaceholders';
  const ctx = { file: FILE, fn: FN };
  logDebug.startTimer(FN, ctx);

  logDebug.info('🧠 Starting placeholder replacement', ctx);

  if (!text) {
    logDebug.warn('⚠️ Provided text is null or undefined', ctx);
    logDebug.stopTimer(FN, ctx);
    return '';
  }

  let result = text;

  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');

    if (!pattern.test(result)) {
      logDebug.warn(`⚠️ Placeholder not found: {{${key}}}`, ctx);
    } else {
      logDebug.info(`🔁 Replaced {{${key}}} → "${value}"`, ctx);
    }

    result = result.replace(pattern, value ?? '');
  }

  logDebug.stopTimer(FN, ctx);
  logDebug.info('✅ Replacement complete', ctx);
  return result;
};


/**
 * Converts a canvas to a downscaled JPEG file.
 * Preserves aspect ratio and applies quality compression.
 */
export const canvasToDownscaledJpeg = (
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number = 0.9,
  maxWidth: number = 1080,
  maxHeight: number = 1080
): Promise<File> =>
  new Promise((resolve, reject) => {
    const FN = 'canvasToDownscaledJpeg';
    const ctx = { file: FILE, fn: FN };
    logDebug.startTimer(FN, ctx);

    logDebug.info(`🧾 Starting canvas downscaling: ${filename}`, ctx);
    logDebug.info(`Original size: ${canvas.width}x${canvas.height}`, ctx);

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // Calculate downscaled dimensions (preserve aspect ratio)
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      const scaleFactor = Math.min(widthRatio, heightRatio);

      targetWidth = Math.floor(originalWidth * scaleFactor);
      targetHeight = Math.floor(originalHeight * scaleFactor);

      logDebug.info(`📐 Downscaling to: ${targetWidth}x${targetHeight} (scale: ${scaleFactor.toFixed(2)})`, ctx);
    } else {
      logDebug.info('✅ No downscaling needed (within limits)', ctx);
    }

    // Create new canvas with target dimensions
    const downscaledCanvas = document.createElement('canvas');
    downscaledCanvas.width = targetWidth;
    downscaledCanvas.height = targetHeight;

    const context = downscaledCanvas.getContext('2d');
    if (!context) {
      logDebug.stopTimer(FN, ctx);
      logDebug.error('❌ Canvas context not available', ctx);
      reject(new Error('Canvas context not available'));
      return;
    }

    // Draw downscaled image
    context.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    // Convert to JPEG blob
    downscaledCanvas.toBlob(
      (blob) => {
        logDebug.stopTimer(FN, ctx);

        if (!blob) {
          logDebug.error(`❌ Conversion to Blob failed for "${filename}"`, ctx);
          reject(new Error('Canvas conversion to Blob failed.'));
          return;
        }

        const file = new File([blob], filename, { type: 'image/jpeg' });

        logDebug.info(
          `✅ Canvas downscaled & converted → ${file.name} (${(file.size / 1024).toFixed(2)}KB)`,
          ctx
        );
        resolve(file);
      },
      'image/jpeg',
      quality
    );
  });