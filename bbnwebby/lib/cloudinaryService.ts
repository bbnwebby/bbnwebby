/**
 * CloudinaryService handles direct client-side uploads (image/PDF) to Cloudinary.
 * It automatically detects file type and uploads directly using Cloudinary’s unsigned upload endpoint.
 * Images go to the image endpoint, PDFs go to the raw endpoint for correct MIME handling.
 */

export class CloudinaryService {
  /**
   * Uploads an image or PDF directly to Cloudinary (no API routes).
   * @param file File selected by the user
   * @param folder Cloudinary folder path (e.g., "user_uploads/profile_photos")
   * @param viewMode 'inline' (default) for browser preview or 'download' for forced download
   * @returns The uploaded file’s Cloudinary secure URL
   */
  static async upload(
    file: File,
    folder: string,
    viewMode: 'inline' | 'download' = 'inline'
  ): Promise<string> {
    console.log('[CloudinaryService] 📁 Starting upload process...');
    console.log(`[CloudinaryService] File name: ${file.name}`);
    console.log(`[CloudinaryService] File type: ${file.type}`);

    // ================== VALIDATE FILE TYPE ==================
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      console.error('[CloudinaryService] ❌ Unsupported file type:', file.type);
      throw new Error('Only image and PDF uploads are supported.');
    }

    console.log('[CloudinaryService] ✅ Detected file type:', isImage ? 'Image' : 'PDF');

    // ================== PREPARE FORM DATA ==================
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', folder);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');

    // ================== SELECT ENDPOINT ==================
    const resourceType = isPDF ? 'raw' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    console.log(`[CloudinaryService] 🌐 Using Cloudinary endpoint: ${uploadUrl}`);

    // ================== EXECUTE UPLOAD ==================
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data: {
      secure_url?: string;
      public_id?: string;
      version?: string | number;
      error?: { message: string };
    } = await response.json();

    if (!response.ok || !data.secure_url) {
      console.error('[CloudinaryService] ❌ Upload failed:', data.error);
      throw new Error(data.error?.message || 'Unknown Cloudinary upload error.');
    }

    console.log('[CloudinaryService] ✅ File uploaded successfully:', data.secure_url);

    // ================== NORMALIZE PDF URL ==================
    let finalUrl = data.secure_url;

    if (isPDF) {
      const deliveryType = viewMode === 'download' ? 'fl_attachment' : 'fl_inline';
      const baseUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${deliveryType}`;
      if (data.public_id && data.version) {
        finalUrl = `${baseUrl}/v${data.version}/${data.public_id}.pdf`;
      } else if (!finalUrl.endsWith('.pdf')) {
        finalUrl += '.pdf';
      }
      console.log(`[CloudinaryService] 📄 PDF ${viewMode} URL:`, finalUrl);
    }

    return finalUrl;
  }

  /**
   * Converts a canvas element to a File, then uploads it to Cloudinary.
   * @param canvas HTMLCanvasElement
   * @param filename Desired output filename (e.g., "badge.png")
   * @param folder Cloudinary folder path
   * @param viewMode 'inline' | 'download'
   */
  static async uploadCanvas(
    canvas: HTMLCanvasElement,
    filename: string,
    folder: string,
    viewMode: 'inline' | 'download' = 'inline'
  ): Promise<string> {
    console.log('[CloudinaryService] 🖌️ Converting canvas to File...');
    const file = await this.canvasToFile(canvas, filename);
    console.log('[CloudinaryService] ✅ Canvas converted to File:', file.name);
    return this.upload(file, folder, viewMode);
  }

  /**
   * Converts a canvas element to a File object for upload.
   * @param canvas HTMLCanvasElement
   * @param filename File name (e.g., "image.png")
   * @returns File instance
   */
  private static async canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas conversion failed: Blob is null'));
          return;
        }
        const file = new File([blob], filename, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  }
}
