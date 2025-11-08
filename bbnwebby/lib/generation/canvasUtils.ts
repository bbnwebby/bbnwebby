// =======================================
// lib/generation/canvasUtils.ts
// Canvas Manipulation Utilities (Verbose Logging)
// -----------------------------------------------
// - Includes detailed console logs for each step.
// - No use of `any` (strict TypeScript compliance).
// - Optimized to prevent unnecessary blocking while debugging.
// =======================================

/**
 * Loads an image from a given URL with full debug logs.
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    console.log('🖼️ [loadImage] Loading image:', url);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('✅ [loadImage] Image loaded successfully:', url);
      resolve(img);
    };

    img.onerror = (error) => {
      console.error('❌ [loadImage] Failed to load image:', url, error);
      reject(error);
    };

    img.src = url;
  });

/**
 * Converts a canvas element to a File object (JPEG).
 * Provides logs for conversion progress and errors.
 */
export const canvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number = 0.95
): Promise<File> =>
  new Promise((resolve, reject) => {
    console.log('🧾 [canvasToFile] Starting canvas-to-file conversion:', filename);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('❌ [canvasToFile] Failed to convert canvas to Blob.');
          reject(new Error('Canvas conversion to Blob failed.'));
          return;
        }
        const file = new File([blob], filename, { type: 'image/jpeg' });
        console.log('✅ [canvasToFile] Canvas converted successfully:', file.name, file.size, 'bytes');
        resolve(file);
      },
      'image/jpeg',
      quality
    );
  });

/**
 * Converts a canvas to a Base64 string for quick preview or inline use.
 */
export const canvasToBase64 = (
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): string => {
  console.log('🎨 [canvasToBase64] Converting canvas to Base64...');
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  console.log('✅ [canvasToBase64] Base64 conversion complete. Length:', dataUrl.length);
  return dataUrl;
};

/**
 * Draws multi-line text with wrapping inside a given bounding box.
 * Logs each line drawn and position details.
 */
export const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void => {
  console.log('✏️ [drawWrappedText] Drawing wrapped text:', { x, y, maxWidth, lineHeight });
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      console.log('➡️ [drawWrappedText] New line due to width limit:', currentY);
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, currentY);
  console.log('✅ [drawWrappedText] Finished drawing wrapped text.');
};

/**
 * Calculates text X-coordinate based on alignment type.
 * Logs the calculated value for verification.
 */
export const getAlignedX = (
  ctx: CanvasRenderingContext2D,
  text: string,
  baseX: number,
  boxWidth: number,
  alignment: 'left' | 'center' | 'right'
): number => {
  const textWidth = ctx.measureText(text).width;
  let alignedX: number;

  switch (alignment) {
    case 'center':
      alignedX = baseX + (boxWidth - textWidth) / 2;
      console.log('↔️ [getAlignedX] Center alignment applied:', alignedX);
      break;
    case 'right':
      alignedX = baseX + boxWidth - textWidth;
      console.log('➡️ [getAlignedX] Right alignment applied:', alignedX);
      break;
    default:
      alignedX = baseX;
      console.log('↩️ [getAlignedX] Left alignment applied:', alignedX);
  }

  return alignedX;
};

/**
 * Replaces {{placeholders}} in text with actual runtime values.
 * Logs every replacement and warns for missing variables.
 */
export const replacePlaceholders = (
  text: string | null | undefined,
  replacements: Record<string, string>
): string => {
  console.log('🧠 [replacePlaceholders] Starting placeholder replacement...');
  if (!text) {
    console.warn('⚠️ [replacePlaceholders] Provided text is null or undefined.');
    return '';
  }

  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    if (!pattern.test(result)) {
      console.warn(`⚠️ [replacePlaceholders] Placeholder not found in text: {{${key}}}`);
    } else {
      console.log(`🔁 [replacePlaceholders] Replacing {{${key}}} → "${value}"`);
    }
    result = result.replace(pattern, value ?? '');
  }

  console.log('✅ [replacePlaceholders] Replacement complete. Final text:', result);
  return result;
};
