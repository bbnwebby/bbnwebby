// =======================================
// lib/cloud/CloudinaryService.ts
// Direct Client-Side Upload Utility for Cloudinary
// -----------------------------------------------
// - Handles image and PDF uploads via unsigned preset
// - Uses "unsigned_preset" and folder "unsigned_bbn_preset"
// - PDFs uploaded as 'image' for Cloudinary transformations
// - Includes strict runtime validation + detailed logging
// =======================================

const FILE = 'CloudinaryService.ts';

export class CloudinaryService {
  /**
   * Uploads an image or PDF directly to Cloudinary (unsigned).
   * For PDFs, generates a downloadable "fl_attachment" link.
   * --------------------------------------------------------
   * @param file File object selected by the user
   * @param folder Cloudinary folder path (e.g., "user_uploads/id_cards")
   * @returns Secure Cloudinary URL (PDFs return downloadable version)
   */
  static async upload(file: File, folder: string): Promise<string> {
    const FN = 'upload';
    console.log(`📁 [${FILE} -> ${FN}] Starting upload process...`);
    console.log(`📄 [${FILE} -> ${FN}] File name: ${file.name}`);
    console.log(`📦 [${FILE} -> ${FN}] File type: ${file.type}`);

    // --- Check and log file extension ---
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log(`🧩 [${FILE} -> ${FN}] Detected file extension: .${fileExtension}`);

    // --- Validate file type ---
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    if (!isImage && !isPDF) {
      console.error(`❌ [${FILE} -> ${FN}] Unsupported file type: ${file.type}`);
      throw new Error('Only image and PDF uploads are supported.');
    }
    console.log(`✅ [${FILE} -> ${FN}] Detected type: ${isImage ? 'Image' : 'PDF'}`);

    // --- Prepare Cloudinary details ---
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error(`[${FILE} -> ${FN}] Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`);
    }

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';
    if (!uploadPreset) {
      throw new Error(`[${FILE} -> ${FN}] Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`);
    }

    console.log(`☁️ [${FILE} -> ${FN}] Using Cloudinary preset: ${uploadPreset}`);

    // --- Build FormData ---
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder || 'unsigned_bbn_preset'); // fallback folder

    // --- Upload endpoint ---
    const resourceType = 'image'; // PDFs uploaded as image type
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    console.log(`🌐 [${FILE} -> ${FN}] Upload endpoint: ${uploadUrl}`);

    // --- Execute upload ---
    console.log(`🚀 [${FILE} -> ${FN}] Uploading file: ${file.name} (${fileExtension})...`);
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data: {
      secure_url?: string;
      error?: { message: string };
    } = await response.json();

    // --- Handle errors ---
    if (!response.ok || !data.secure_url) {
      console.error(`❌ [${FILE} -> ${FN}] Upload failed:`, data.error);
      throw new Error(data.error?.message || 'Unknown Cloudinary upload error.');
    }

    console.log(`✅ [${FILE} -> ${FN}] Upload successful!`);
    console.log(`🔗 [${FILE} -> ${FN}] Uploaded file URL: ${data.secure_url}`);
    console.log(`📂 [${FILE} -> ${FN}] File extension verified: .${fileExtension}`);

    // --- Handle PDFs separately for downloadable link ---
    if (isPDF) {
      const baseUrl = data.secure_url;
      const downloadUrl = baseUrl.replace('/upload/', '/upload/fl_attachment/');
      console.log(`📄 [${FILE} -> ${FN}] PDF uploaded as: ${baseUrl}`);
      console.log(`📥 [${FILE} -> ${FN}] PDF download link: ${downloadUrl}`);
      return downloadUrl;
    }

    // --- Return image URL directly ---
    return data.secure_url;
  }

  /**
   * Converts a <canvas> to a File and uploads it to Cloudinary.
   * -----------------------------------------------------------
   * @param canvas Target HTMLCanvasElement
   * @param filename Desired output name (e.g., "card.png")
   * @param folder Cloudinary folder path
   */
  static async uploadCanvas(
    canvas: HTMLCanvasElement,
    filename: string,
    folder: string
  ): Promise<string> {
    const FN = 'uploadCanvas';
    console.log(`🖌️ [${FILE} -> ${FN}] Converting canvas to File...`);
    const file = await this.canvasToFile(canvas, filename);
    console.log(`✅ [${FILE} -> ${FN}] Canvas converted to File: ${file.name}`);
    return this.upload(file, folder);
  }

  /**
   * Converts a canvas to a File for uploading.
   * ------------------------------------------
   * @param canvas HTMLCanvasElement
   * @param filename Desired output filename (e.g., "preview.png")
   * @returns File instance (PNG)
   */
  private static async canvasToFile(
    canvas: HTMLCanvasElement,
    filename: string
  ): Promise<File> {
    const FN = 'canvasToFile';
    console.log(`🧾 [${FILE} -> ${FN}] Converting canvas to Blob...`);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error(`❌ [${FILE} -> ${FN}] Canvas conversion failed: Blob is null`);
          reject(new Error('Canvas conversion failed: Blob is null'));
          return;
        }

        const file = new File([blob], filename, { type: 'image/png' });
        console.log(`✅ [${FILE} -> ${FN}] Blob converted to File: ${file.name}`);
        resolve(file);
      }, 'image/png');
    });
  }
}
