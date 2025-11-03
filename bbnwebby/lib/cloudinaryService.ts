/**
 * CloudinaryService handles direct client-side uploads (image/PDF) to Cloudinary.
 * It automatically detects file type and uploads directly using Cloudinary's unsigned upload endpoint.
 * PDFs are uploaded as 'image' type to support transformations and JPG conversion.
 */

export class CloudinaryService {
  /**
   * Uploads an image or PDF directly to Cloudinary (no API routes).
   * For PDFs, returns the download URL with fl_attachment transformation.
   * @param file File selected by the user
   * @param folder Cloudinary folder path (e.g., "user_uploads/profile_photos")
   * @returns The uploaded file's URL (for PDFs, returns download URL)
   */
  static async upload(
    file: File,
    folder: string
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
    // Note: PDFs must be uploaded as 'image' type to support JPG conversion
    const resourceType = 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    console.log(`[CloudinaryService] 🌐 Using Cloudinary endpoint: ${uploadUrl}`);

    // ================== EXECUTE UPLOAD ==================
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data: {
      secure_url?: string;
      error?: { message: string };
    } = await response.json();

    if (!response.ok || !data.secure_url) {
      console.error('[CloudinaryService] ❌ Upload failed:', data.error);
      throw new Error(data.error?.message || 'Unknown Cloudinary upload error.');
    }

    console.log('[CloudinaryService] ✅ File uploaded successfully:', data.secure_url);

    // ================== HANDLE PDF URLS ==================
    if (isPDF) {
      const baseUrl = data.secure_url;
      
      // Download URL: Add fl_attachment to force download when clicked
      const downloadUrl = baseUrl.replace('/upload/', '/upload/fl_attachment/');
      
      console.log(`[CloudinaryService] 📄 PDF uploaded as:`, baseUrl);
      console.log(`[CloudinaryService] 📥 PDF Download URL:`, downloadUrl);
      
      return downloadUrl;
    }

    // For images, return the URL directly
    return data.secure_url;
  }

  /**
   * Converts a canvas element to a File, then uploads it to Cloudinary.
   * @param canvas HTMLCanvasElement
   * @param filename Desired output filename (e.g., "badge.png")
   * @param folder Cloudinary folder path
   */
  static async uploadCanvas(
    canvas: HTMLCanvasElement,
    filename: string,
    folder: string
  ): Promise<string> {
    console.log('[CloudinaryService] 🖌️ Converting canvas to File...');
    const file = await this.canvasToFile(canvas, filename);
    console.log('[CloudinaryService] ✅ Canvas converted to File:', file.name);
    return this.upload(file, folder);
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