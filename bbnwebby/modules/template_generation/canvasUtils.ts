// =======================================
// lib/generation/canvasUtils.ts
// Canvas Manipulation Utilities (Verbose Logging)
// -----------------------------------------------
// - Every console log includes file + function name.
// - Strict TypeScript compliance, no `any`.
// =======================================

const FILE = 'canvasUtils.ts';

/**
 * Loads an image from a given URL with full debug logs.
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const startTime = performance.now();
    console.log(`🖼️ [${FILE} -> loadImage] Loading image:`, url);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const endTime = performance.now();
      console.log(
        `✅ [${FILE} -> loadImage] Image loaded successfully in ${(endTime - startTime).toFixed(
          2
        )}ms:`,
        url
      );
      resolve(img);
    };

    img.onerror = (error) => {
      const endTime = performance.now();
      console.error(
        `❌ [${FILE} -> loadImage] Failed to load image in ${(endTime - startTime).toFixed(
          2
        )}ms:`,
        url,
        error
      );
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
    const startTime = performance.now();
    console.log(`🧾 [${FILE} -> canvasToFile] Starting canvas-to-file conversion:`, filename);

    canvas.toBlob(
      (blob) => {
        const endTime = performance.now();

        if (!blob) {
          console.error(
            `❌ [${FILE} -> canvasToFile] Conversion failed after ${(endTime - startTime).toFixed(
              2
            )}ms`
          );
          reject(new Error('Canvas conversion to Blob failed.'));
          return;
        }

        const file = new File([blob], filename, { type: 'image/jpeg' });

        console.log(
          `✅ [${FILE} -> canvasToFile] Successfully converted in ${(endTime - startTime).toFixed(
            2
          )}ms → ${file.name}, ${file.size} bytes`
        );
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
  const startTime = performance.now();
  console.log(`🎨 [${FILE} -> canvasToBase64] Converting canvas to Base64...`);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  const endTime = performance.now();
  console.log(
    `✅ [${FILE} -> canvasToBase64] Base64 conversion complete in ${(endTime - startTime).toFixed(
      2
    )}ms. Length:`,
    dataUrl.length
  );

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
  const startTime = performance.now();
  console.log(`✏️ [${FILE} -> drawWrappedText] Drawing wrapped text:`, {
    x,
    y,
    maxWidth,
    lineHeight
  });

  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      console.log(`➡️ [${FILE} -> drawWrappedText] New line due to width limit:`, currentY);
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, currentY);

  const endTime = performance.now();
  console.log(
    `✅ [${FILE} -> drawWrappedText] Finished drawing wrapped text in ${(endTime - startTime).toFixed(
      2
    )}ms`
  );
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
  const startTime = performance.now();

  const textWidth = ctx.measureText(text).width;
  let alignedX: number;

  switch (alignment) {
    case 'center':
      alignedX = baseX + (boxWidth - textWidth) / 2;
      console.log(
        `↔️ [${FILE} -> getAlignedX] Center alignment applied in ${(performance.now() - startTime).toFixed(
          2
        )}ms:`,
        alignedX
      );
      break;

    case 'right':
      alignedX = baseX + boxWidth - textWidth;
      console.log(
        `➡️ [${FILE} -> getAlignedX] Right alignment applied in ${(performance.now() - startTime).toFixed(
          2
        )}ms:`,
        alignedX
      );
      break;

    default:
      alignedX = baseX;
      console.log(
        `↩️ [${FILE} -> getAlignedX] Left alignment applied in ${(performance.now() - startTime).toFixed(
          2
        )}ms:`,
        alignedX
      );
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
  const startTime = performance.now();
  console.log(`🧠 [${FILE} -> replacePlaceholders] Starting placeholder replacement...`);

  if (!text) {
    console.warn(`⚠️ [${FILE} -> replacePlaceholders] Provided text is null or undefined.`);
    return '';
  }

  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');

    if (!pattern.test(result)) {
      console.warn(`⚠️ [${FILE} -> replacePlaceholders] Placeholder not found: {{${key}}}`);
    } else {
      console.log(`🔁 [${FILE} -> replacePlaceholders] {{${key}}} → "${value}"`);
    }

    result = result.replace(pattern, value ?? '');
  }

  const endTime = performance.now();
  console.log(
    `✅ [${FILE} -> replacePlaceholders] Replacement complete in ${(endTime - startTime).toFixed(
      2
    )}ms. Final text:`,
    result
  );

  return result;
};
