'use client';

import React, { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CloudinaryService } from '@/lib/cloudinaryService';
import { logDebug } from '@/utils/Debugger';

/**
 * MakeupArtistSignUpForm
 * Handles full registration flow with Cloudinary + Supabase.
 * Includes extensive console logs for debugging.
 */

type MessageType = 'success' | 'error';
interface Message {
  type: MessageType;
  text: string;
}

export default function MakeupArtistSignUpForm(): JSX.Element {
  // ==================== Form fields ====================
  const [email, setEmail] = useState<string>('bbnwebby@gmail.com');
  const [password, setPassword] = useState<string>('password');
  const [fullName, setFullName] = useState<string>('joe k');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('91919191919');
  const [city, setCity] = useState<string>('hyderabad');
  const [organisation, setOrganisation] = useState<string>('beyond beauty network');
  const [designation, setDesignation] = useState<string>('webdev');
  const [instagramHandle, setInstagramHandle] = useState<string>('insta weeb');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ==================== Files ====================
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [portfolioPdfFile, setPortfolioPdfFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // ==================== UI State ====================
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ==================== File Handlers ====================
  const handleProfileChange = (files: FileList | null): void => {
    if (!files || files.length === 0) {
      console.log('⚠️ No profile image selected');
      setProfileImageFile(null);
      setProfilePreview(null);
      return;
    }
    const file = files[0];
    setProfileImageFile(file);
    console.log('🖼️ Selected profile image:', file.name, file.type, file.size);

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      console.log('🔗 Generated preview URL:', previewUrl);
      setProfilePreview(previewUrl);
    }
  };

// ==================== Submit Handler ====================
const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault(); // Prevent default form submission

  const FILE = "SignUp.tsx";
  const FUNC = "handleSubmit";
  
    // ---- PREVENT DOUBLE SUBMISSION ----
  if (isSubmitting) {
    console.log("⛔ Prevented double submission");
    return;
  }
  setIsSubmitting(true);


  logDebug.startTimer("handleSubmit_called", { file: FILE, fn: FUNC }); // Start main timer

  // ---------------------- Step 0: Reset UI ----------------------
  resetUI();

try {
  // ---------------------- Step 1: Start uploads + auth in parallel ----------------------
  logDebug.startTimer("parallelUploadsAndAuth", { file: FILE, fn: FUNC });
  logDebug.info("Starting parallel uploads and auth...", { file: FILE, fn: FUNC });

  const imageUploadPromise = uploadImagesOnly();
  const userCreationPromise = createSupabaseUser();

  // Wait for both to finish
  const [uploadedImages, user] = await Promise.all([imageUploadPromise, userCreationPromise]);
  logDebug.stopTimer("parallelUploadsAndAuth", { file: FILE, fn: FUNC });

  // ---------------------- Step 2: Check user ----------------------
  logDebug.startTimer("checkUser", { file: FILE, fn: FUNC });
  if (!user) {
    setMessage({
      type: "success",
      text: "Registration successful! Please verify your email.",
    });
    setLoading(false);
    setIsSubmitting(false);
    logDebug.stopTimer("checkUser", { file: FILE, fn: FUNC });
    return;
  }
  logDebug.stopTimer("checkUser", { file: FILE, fn: FUNC });

  // ---------------------- Step 3: Insert into user_profiles ----------------------
  logDebug.startTimer("insertUserProfile", { file: FILE, fn: FUNC });
  const profileId = await insertUserProfile(user.id, uploadedImages.profileImageUrl);
  logDebug.stopTimer("insertUserProfile", { file: FILE, fn: FUNC });

  // ---------------------- Step 4: Generate username ----------------------
  logDebug.startTimer("generateUsername", { file: FILE, fn: FUNC });
  const username = generateUsername();
  logDebug.stopTimer("generateUsername", { file: FILE, fn: FUNC });

  // ---------------------- Step 5: Insert into makeup_artists ----------------------
  logDebug.startTimer("insertMakeupArtist", { file: FILE, fn: FUNC });
  const artistId = await insertMakeupArtist(profileId, username, {
    profileImageUrl: uploadedImages.profileImageUrl,
    logoUrl: uploadedImages.logoUrl,
  });
  logDebug.stopTimer("insertMakeupArtist", { file: FILE, fn: FUNC });

  // ---------------------- Step 6: Background PDF upload (non-blocking) ----------------------
  if (portfolioPdfFile) {
    logDebug.startTimer("uploadPortfolioPdf_background", { file: FILE, fn: FUNC });
    uploadPortfolioPdfInBackground(artistId, portfolioPdfFile)
      .finally(() => logDebug.stopTimer("uploadPortfolioPdf_background", { file: FILE, fn: FUNC }));
  }

  // ---------------------- Step 7: Generate and upload ID card ----------------------
  logDebug.startTimer("generateAndUploadIdCard", { file: FILE, fn: FUNC });
  await generateAndUploadIdCard(artistId, uploadedImages.profileImageFile);
  logDebug.stopTimer("generateAndUploadIdCard", { file: FILE, fn: FUNC });

  // ---------------------- Step 8: Reset form ----------------------
  logDebug.startTimer("resetForm", { file: FILE, fn: FUNC });
  resetForm();
  logDebug.stopTimer("resetForm", { file: FILE, fn: FUNC });

} catch (err: unknown) {
  handleError(err);
} finally {
  setLoading(false);
}



  logDebug.stopTimer("handleSubmit_called", { file: FILE, fn: FUNC }); // Stop main timer

  // ======================= Sub-Functions =======================

  // ---------------------- UI Reset ----------------------
  function resetUI() {
    logDebug.info("📝 MAKEUP ARTIST REGISTRATION START", { file: FILE, fn: FUNC });
    setMessage(null); // Clear previous messages
    setLoading(true); // Show loading spinner
  }

  // ---------------------- File Conversion to JPEG ----------------------
// ---------------------- File Conversion to JPEG (with Downscaling) ----------------------
async function convertToJpeg(
  file: File | Blob,
  quality: number = 0.9,
  maxWidth: number = 1080,
  maxHeight: number = 720
): Promise<File> {

  logDebug.startTimer("convertToJpeg", { file: FILE, fn: FUNC });
  const file_size = file.size
  console.log("initial file size: ", file_size)
  // Load the input file into an <img> element
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = URL.createObjectURL(file);
  });

  // ---------------------- Determine New Dimensions (Preserve Aspect Ratio) ----------------------
  const originalWidth: number = img.naturalWidth;
  const originalHeight: number = img.naturalHeight;

  let targetWidth: number = originalWidth;
  let targetHeight: number = originalHeight;

  // Downscale only if the image exceeds the maximum allowed resolution
  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    const widthRatio: number = maxWidth / originalWidth;
    const heightRatio: number = maxHeight / originalHeight;
    const scaleFactor: number = Math.min(widthRatio, heightRatio); // keep aspect ratio

    targetWidth = Math.floor(originalWidth * scaleFactor);
    targetHeight = Math.floor(originalHeight * scaleFactor);
  }

  // ---------------------- Draw into Canvas ----------------------
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // ---------------------- Convert Canvas to JPEG ----------------------
  const jpegFile = await new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error("JPEG conversion failed");

        const name =
          file instanceof File ? file.name.replace(/\.\w+$/, ".jpg") : "converted.jpg";

        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality
    );
  });

  console.log("JPEG output size:", {
    fileSizeBytes: jpegFile.size,
    fileSizeKB: (jpegFile.size / 1024).toFixed(2)
  });

  logDebug.stopTimer("convertToJpeg", { file: FILE, fn: FUNC });
  logDebug.info("JPEG conversion complete", { file: FILE, fn: FUNC });

  return jpegFile;
}


// ---------------------- Upload Only Images (Profile + Logo) ----------------------
async function uploadImagesOnly(): Promise<{
  profileImageUrl: string | null;
  logoUrl: string | null;
  profileImageFile: File | null;
}> {
  logDebug.startTimer("parallelImageUploads", { file: FILE, fn: FUNC });
  logDebug.info("Uploading profile + logo images in parallel...", { file: FILE, fn: FUNC });

  const timeUpload = async (
    label: string,
    action: () => Promise<string | null>
  ): Promise<string | null> => {
    logDebug.startTimer(label, { file: FILE, fn: FUNC });
    const result = await action();
    logDebug.stopTimer(label, { file: FILE, fn: FUNC });
    return result;
  };

  const [profileImageUrl, logoUrl] = await Promise.all([
    profileImageFile
      ? timeUpload("uploadProfileImage", async () => {
          const jpegFile = await convertToJpeg(profileImageFile, 0.8);
          return CloudinaryService.upload(jpegFile, "profile_images");
        })
      : Promise.resolve(null),

    logoFile
      ? timeUpload("uploadLogo", async () => {
          const jpegFile = await convertToJpeg(logoFile, 0.8);
          return CloudinaryService.upload(jpegFile, "logos");
        })
      : Promise.resolve(null),
  ]);

  logDebug.stopTimer("parallelImageUploads", { file: FILE, fn: FUNC });
  logDebug.info(
    { profileImageUrl, logoUrl },
    { file: FILE, fn: FUNC }
  );

  return { profileImageUrl, logoUrl, profileImageFile };
}

  // ---------------------- Background PDF Upload (Non-blocking) ----------------------
async function uploadPortfolioPdfInBackground(
  artistId: string,
  pdfFile: File
): Promise<void> {
  try {
    logDebug.startTimer("uploadPortfolioPdf_background", { file: FILE, fn: FUNC });
    logDebug.info("Background PDF upload started...", { file: FILE, fn: FUNC });

    // Upload PDF to Cloudinary
    const pdfUrl = await CloudinaryService.upload(pdfFile, "portfolios");

    logDebug.info("Background PDF upload completed", { file: FILE, fn: FUNC });

    // Update DB with the new PDF URL
    try {
      const { data, error } = await supabase
        .from("makeup_artists")
        .update({ portfolio_pdf_url: pdfUrl })
        .eq("id", artistId);

      if (error) {
        logDebug.error("Failed saving portfolio PDF URL", { file: FILE, fn: FUNC });
        logDebug.error(error, { file: FILE, fn: FUNC });
      } else {
        logDebug.stopTimer("uploadPortfolioPdf_background", { file: FILE, fn: FUNC });
        logDebug.info("Portfolio PDF saved to DB", { file: FILE, fn: FUNC });
      }
    } catch (dbErr: unknown) {
      // Unexpected DB errors
      logDebug.error("Unexpected error during DB update", { file: FILE, fn: FUNC });
      logDebug.error(dbErr, { file: FILE, fn: FUNC });
    }

  } catch (err: unknown) {
    logDebug.error("Background PDF upload failed", { file: FILE, fn: FUNC });
    logDebug.error(err, { file: FILE, fn: FUNC });
  }
}



  // ---------------------- Supabase Auth Signup ----------------------
  async function createSupabaseUser() {
    logDebug.startTimer("authSignup", { file: FILE, fn: FUNC });
    logDebug.info("Creating Supabase Auth user...", { file: FILE, fn: FUNC });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    logDebug.stopTimer("authSignup", { file: FILE, fn: FUNC });

    if (authError) throw new Error(authError.message);
    return authData.user || null; // Return null if no user
  }

  // ---------------------- Insert User Profile ----------------------
// ---------------------- Insert User Profile (Fixed Version) ----------------------
async function insertUserProfile(
  userId: string,
  profileImageUrl: string | null
): Promise<string> {
  logDebug.startTimer("insert_user_profiles", { file: FILE, fn: FUNC });
  logDebug.info("Inserting into user_profiles...", { file: FILE, fn: FUNC });

  // ---------------------------------------------------------
  // Insert the profile and ask Supabase to RETURN the ID
  // This avoids the second SELECT that fails due to RLS
  // ---------------------------------------------------------
  const { data, error } = await supabase
    .from("user_profiles")
    .insert([
      {
        auth_user_id: userId,
        full_name: fullName,
        whatsapp_number: whatsappNumber || null,
        city: city || null,
        profile_photo_url: profileImageUrl || null,
      },
    ])
    .select("id") // <-- returns the UUID directly from the INSERT
    .single();    // <-- ensure exact one row returned

  logDebug.stopTimer("insert_user_profiles", { file: FILE, fn: FUNC });

  if (error) {
    throw new Error(`Profile creation failed: ${error.message}`);
  }

  // ---------------------------------------------------------
  // Return the ID directly from the INSERT result (NO RLS HIT)
  // ---------------------------------------------------------
  return data.id;
}

  // ---------------------- Generate Username ----------------------
  function generateUsername() {
    const clean = (s: string) => s?.trim().replace(/\s+/g, "_").toLowerCase() || "unknown";
    const username = `${clean(fullName)}@${clean(designation)}@${clean(
      organisation
    )}@${clean(city)}`;
    logDebug.info(`Generated username: ${username}`, { file: FILE, fn: FUNC });
    return username;
  }

  // ---------------------- Insert into Makeup Artists ----------------------


// ---------------------- Insert into Makeup Artists ----------------------
// ---------------------- Insert into Makeup Artists ----------------------
async function insertMakeupArtist(
  profileId: string,
  username: string,
  files: { profileImageUrl: string | null; logoUrl: string | null }
): Promise<string> {
  logDebug.startTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
  logDebug.info("Inserting into makeup_artists...", { file: FILE, fn: FUNC });

  const { error } = await supabase.from("makeup_artists").insert([
    {
      user_profile_id: profileId,
      organisation: organisation || null,
      designation: designation || null,
      instagram_handle: instagramHandle || null,
      username,
      portfolio_pdf_url: null, // <-- PDF uploaded later
      logo_url: files.logoUrl || null,
      status: "pending",
    },
  ]);

  logDebug.stopTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
  if (error) throw new Error(`Artist save failed: ${error.message}`);

  const { data: artistData, error: fetchError } = await supabase
    .from("makeup_artists")
    .select("id")
    .eq("user_profile_id", profileId)
    .single();

  if (fetchError || !artistData) throw new Error("Failed to fetch artist record");

  logDebug.info(`Artist ID: ${artistData.id}`, { file: FILE, fn: FUNC });

  return artistData.id;
}



// ---------------------- Generate & Upload ID Card ----------------------
async function generateAndUploadIdCard(
  artistId: string,
  profileImageFile: File | null
): Promise<void> {
  try {
    logDebug.startTimer("id_card_generation", { file: FILE, fn: FUNC });
    logDebug.info("Generating ID Card...", { file: FILE, fn: FUNC });

    // ---------------------------------------------------------------------------
    // Load template & profile image
    // ---------------------------------------------------------------------------
    const templateId: string = "fc6f575e-d4a2-4a7c-8206-78b7c18f755b"  //"e4b514f3-28df-4bde-a0fe-0ca9b47c9250";
    const bgImage: HTMLImageElement = await loadImage("/images/templates/base_id_bg.jpg");

    const profileImageHtml: HTMLImageElement | null =
      profileImageFile ? await loadImageFile(profileImageFile) : null;

    // ---------------------------------------------------------------------------
    // Generate the template image
    // (Now handles downscaling + compression + upload internally)
    // ---------------------------------------------------------------------------
    const { generateTemplateImage } = await import(
      "@/modules/template_generation/generateTemplateImage"
    );

    const idCardUrl: string = await generateTemplateImage(
      "id_card",
      templateId,
      artistId,
      //bgImage, // this one
      //profileImageHtml //this is what the user submited. when this is givenn without the bgImage it is mistaken for the bgImage
    );

    logDebug.stopTimer("id_card_generation", { file: FILE, fn: FUNC });
    logDebug.info(`ID card generated & uploaded: ${idCardUrl}`, {
      file: FILE,
      fn: FUNC
    });

  } catch (cardError) {
    logDebug.error("Failed to generate/save ID card", { file: FILE, fn: FUNC });
    logDebug.error(cardError, { file: FILE, fn: FUNC });
  }
}


  // ---------------------- Load Image from URL ----------------------
  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ---------------------- Load Image from File ----------------------
  async function loadImageFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ---------------------- Save ID Card URL ----------------------
  async function saveIdCardUrl(artistId: string, cardUrl: string) {
    logDebug.startTimer("update_idcard_url", { file: FILE, fn: FUNC });
    const { error } = await supabase
      .from("makeup_artists")
      .update({ idcard_url: cardUrl })
      .eq("id", artistId);
    logDebug.stopTimer("update_idcard_url", { file: FILE, fn: FUNC });
    if (error) throw new Error(`Failed to save card URL: ${error.message}`);
    logDebug.info("ID card URL saved successfully", { file: FILE, fn: FUNC });
  }

  // ---------------------- Error Handling ----------------------
  function handleError(err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error occurred";
    logDebug.error(`Registration Error: ${msg}`, { file: FILE, fn: FUNC });
    setMessage({ type: "error", text: msg });
  }
};


  /** Reset the form cleanly after success */
  const resetForm = (): void => {
    setEmail('');
    setPassword('');
    setFullName('');
    setWhatsappNumber('');
    setCity('');
    setOrganisation('');
    setDesignation('');
    setInstagramHandle('');
    setProfileImageFile(null);
    setLogoFile(null);
    setPortfolioPdfFile(null);
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
      setProfilePreview(null);
    }
  };



  // ==================== UI ====================
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-blue-200/30">
    {/* Glass container */}
    <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl shadow-2xl p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-pink-500 mb-2">
          Join Beyond Beauty Network
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
          Makeup Artist Registration
        </h2>
        <p className="text-gray-600">
          Join our creative community and showcase your artistry.
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-8 px-5 py-4 text-sm rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <InputField label="Email" required value={email} onChange={setEmail} type="email" />
          <InputField label="Password" required value={password} onChange={setPassword} type="password" />
          <InputField label="Full Name" required value={fullName} onChange={setFullName} />
          <InputField label="WhatsApp Number" required value={whatsappNumber} onChange={setWhatsappNumber} />
          <InputField label="City" required value={city} onChange={setCity} />

          {/* Profile image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Profile Image
            </label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileChange(e.target.files)}
              className="block w-full text-sm text-gray-600
                         file:mr-4 file:rounded-full file:border-0
                         file:bg-pink-100 file:px-5 file:py-2
                         file:text-pink-700 hover:file:bg-pink-200"
            />

            {/* Profile preview */}
            {profilePreview && (
              <img
                src={profilePreview}
                alt="Profile Preview"
                className="mt-4 w-32 h-32 rounded-2xl object-cover border border-pink-200 shadow-sm"
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          <InputField label="Organisation" required value={organisation} onChange={setOrganisation} />
          <InputField label="Designation" required value={designation} onChange={setDesignation} />
          <InputField label="Instagram Handle" required value={instagramHandle} onChange={setInstagramHandle} />

          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Brand Logo
            </label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file: File | null =
                  e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setLogoFile(file);

                if (file) {
                  const reader: FileReader = new FileReader();
                  reader.onload = () => setLogoPreview(reader.result as string);
                  reader.readAsDataURL(file);
                } else {
                  setLogoPreview(null);
                }
              }}
              className="block w-full text-sm text-gray-600
                         file:mr-4 file:rounded-full file:border-0
                         file:bg-pink-100 file:px-5 file:py-2
                         file:text-pink-700 hover:file:bg-pink-200"
            />

            {/* Logo preview */}
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mt-4 w-32 h-32 rounded-2xl object-contain bg-white border border-pink-200 shadow-sm p-3"
              />
            )}
          </div>

          {/* Portfolio PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Portfolio (PDF)
            </label>
            <input
              required
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setPortfolioPdfFile(
                  e.target.files && e.target.files[0] ? e.target.files[0] : null
                )
              }
              className="lock w-full text-sm text-gray-600
                         file:mr-4 file:rounded-full file:border-0
                         file:bg-pink-100 file:px-5 file:py-2
                         file:text-pink-700 hover:file:bg-pink-200"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="md:col-span-2 text-center mt-10">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center h-12 px-10 rounded-full
                       bg-pink-400 hover:bg-pink-500 text-white font-medium
                       tracking-wide transition-transform duration-300
                       hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}

/** Small reusable input component for consistent styling */
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
}

function InputField({ label, value, onChange, required = false, type = 'text' }: InputFieldProps): JSX.Element {
  return (
    <div>
      <label className="block font-semibold mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
}
