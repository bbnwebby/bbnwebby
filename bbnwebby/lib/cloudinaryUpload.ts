"use server";
import { v2 as cloudinary } from "cloudinary";

/* ============================================================
   CLOUDINARY CONFIGURATION
   ============================================================ */
console.log(`[Cloudinary] Initializing config at ${new Date().toISOString()}`);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

console.log(`[Cloudinary] Configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

/* ============================================================
   UPLOAD TO CLOUDINARY (BUFFER)
   ============================================================ */
/**
 * Uploads a file buffer directly to Cloudinary and returns the secure URL.
 * @param buffer - File buffer to upload
 * @param folder - Optional Cloudinary folder name (defaults to "uploads")
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder = "uploads"
): Promise<string> {
  console.log(`[Cloudinary] Upload initiated → Folder: ${folder}, Size: ${buffer.length} bytes`);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error(`[Cloudinary:upload] ❌ Upload failed:`, error);
          return reject(error);
        }
        if (!result?.secure_url) {
          console.error(`[Cloudinary:upload] ❌ No secure URL returned in result:`, result);
          return reject(new Error("No URL returned from Cloudinary"));
        }
        console.log(`[Cloudinary:upload] ✅ Upload successful → URL: ${result.secure_url}`);
        resolve(result.secure_url);
      }
    );

    stream.on("error", (err) => {
      console.error(`[Cloudinary:upload] ❌ Stream error during upload:`, err);
      reject(err);
    });

    stream.end(buffer);
  });
}

/* ============================================================
   HELPER: EXTRACT PUBLIC_ID FROM CLOUDINARY URL
   ============================================================ */
/**
 * Extracts Cloudinary public_id from a given image URL.
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    console.log(`[Cloudinary:extract] Extracting public_id from URL: ${url}`);

    if (!url.includes("res.cloudinary.com")) {
      console.warn(`[Cloudinary:extract] ⚠️ Not a Cloudinary URL: ${url}`);
      return null;
    }

    const match = url.match(/upload\/(?:v\d+\/)?([^/.]+(?:\/[^/.]+)*)\.[a-z0-9]+$/i);
    const publicId = match ? match[1] : null;

    console.log(`[Cloudinary:extract] Extracted public_id: ${publicId}`);
    return publicId;
  } catch (err) {
    console.error(`[Cloudinary:extract] ❌ Failed to extract public_id:`, err);
    return null;
  }
}

/* ============================================================
   1️⃣ DELETE A SINGLE TICKET
   ============================================================ */
export async function deleteTicketFromCloudinary(ticketUrl: string): Promise<void> {
  console.log(`\n[Cloudinary:ticket] Attempting to delete ticket: ${ticketUrl}`);

  try {
    const publicId = extractPublicIdFromUrl(ticketUrl);
    if (!publicId) {
      console.warn(`[Cloudinary:ticket] ⚠️ No valid public_id found for ticket → Skipping: ${ticketUrl}`);
      return;
    }

    console.log(`[Cloudinary:ticket] Deleting resource with public_id: ${publicId}`);

    const response = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary:ticket] ✅ Delete response:`, response);
  } catch (err) {
    console.error(`[Cloudinary:ticket] ❌ Failed to delete ticket:`, err);
  }
}

/* ============================================================
   2️⃣ DELETE MULTIPLE CERTIFICATES
   ============================================================ */
export async function deleteCertificatesFromCloudinary(
  certificateUrls: string[]
): Promise<void> {
  console.log(`\n[Cloudinary:certificates] Received ${certificateUrls.length} certificate URLs for deletion.`);

  if (certificateUrls.length === 0) {
    console.warn(`[Cloudinary:certificates] ⚠️ No certificate URLs provided.`);
    return;
  }

  try {
    const publicIds: string[] = certificateUrls
      .map((url) => extractPublicIdFromUrl(url))
      .filter((id): id is string => id !== null);

    console.log(`[Cloudinary:certificates] Extracted ${publicIds.length} valid public_ids →`, publicIds);

    if (publicIds.length === 0) {
      console.warn(`[Cloudinary:certificates] ⚠️ No valid Cloudinary public_ids found in URLs.`);
      return;
    }

    console.log(`[Cloudinary:certificates] Starting parallel deletion...`);
    const results = await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));

    console.log(`[Cloudinary:certificates] ✅ Completed deletion for ${results.length} certificate(s). Results:`, results);
  } catch (err) {
    console.error(`[Cloudinary:certificates] ❌ Failed to delete certificates:`, err);
  }
}

/* ============================================================
   3️⃣ DELETE BOTH TICKET AND CERTIFICATE
   ============================================================ */
export async function deleteTicketAndCertificateFromCloudinary(
  ticketUrl?: string | null,
  certificateUrl?: string | null
): Promise<void> {
  console.log(`\n[Cloudinary:combo] Preparing to delete ticket and certificate...`);
  console.log(`[Cloudinary:combo] Ticket URL: ${ticketUrl}`);
  console.log(`[Cloudinary:combo] Certificate URL: ${certificateUrl}`);

  try {
    const deletions: Promise<void>[] = [];

    if (ticketUrl) {
      console.log(`[Cloudinary:combo] Scheduling ticket deletion.`);
      deletions.push(deleteTicketFromCloudinary(ticketUrl));
    } else {
      console.log(`[Cloudinary:combo] No ticket URL provided → skipping.`);
    }

    if (certificateUrl) {
      console.log(`[Cloudinary:combo] Scheduling certificate deletion.`);
      deletions.push(deleteCertificatesFromCloudinary([certificateUrl]));
    } else {
      console.log(`[Cloudinary:combo] No certificate URL provided → skipping.`);
    }

    if (deletions.length === 0) {
      console.warn(`[Cloudinary:combo] ⚠️ No Cloudinary resources found to delete for this registration.`);
      return;
    }

    console.log(`[Cloudinary:combo] Awaiting all deletion tasks...`);
    await Promise.allSettled(deletions);

    console.log(`[Cloudinary:combo] ✅ All Cloudinary deletions completed for this registration.`);
  } catch (err) {
    console.error(`[Cloudinary:combo] ❌ Failed to delete ticket and certificate:`, err);
  }
}
