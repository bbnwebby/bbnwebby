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

  // ==================== Files ====================
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [portfolioPdfFile, setPortfolioPdfFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // ==================== UI State ====================
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

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

  logDebug.startTimer("handleSubmit_called", { file: FILE, fn: FUNC }); // Start main timer

  // ---------------------- Step 0: Reset UI ----------------------
  resetUI();

  try {
    // ---------------------- Step 1: Upload files ----------------------
    // Upload profile image, logo, and portfolio PDF in parallel
    const uploadedFiles = await uploadAllFiles();

    // ---------------------- Step 2: Create Supabase Auth User ----------------------
    // Registers the user with Supabase Authentication
    const user = await createSupabaseUser();

    // If user not returned, stop here but inform user
    if (!user) {
      setMessage({
        type: "success",
        text: "Registration successful! Please verify your email.",
      });
      setLoading(false);
      return;
    }

    // ---------------------- Step 3: Insert into user_profiles ----------------------
    // Stores additional profile info in Supabase table `user_profiles`
    const profileId = await insertUserProfile(user.id, uploadedFiles.profileImageUrl);

    // ---------------------- Step 4: Generate username ----------------------
    // Builds a unique username based on fullName, designation, organisation, city
    const username = generateUsername();

    // ---------------------- Step 5: Insert into makeup_artists ----------------------
    // Stores artist-specific information, portfolio and logo links
    const artistId = await insertMakeupArtist(profileId, username, uploadedFiles);

    // ---------------------- Step 6: Generate and Upload ID Card ----------------------
    // Generates an ID card image, uploads it, and saves URL to database
    await generateAndUploadIdCard(artistId, uploadedFiles.profileImageFile);

    // ---------------------- Step 7: Reset form ----------------------
    // Clears the form fields for next registration
    resetForm();
  } catch (err: unknown) {
    // ---------------------- Error Handling ----------------------
    handleError(err);
  } finally {
    // ---------------------- Step 8: Stop loading ----------------------
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
  async function convertToJpeg(file: File | Blob, quality = 0.9): Promise<File> {
    logDebug.startTimer("convertToJpeg", { file: FILE, fn: FUNC });

    // Load the file into an <img> element
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    // Draw the image into a canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0);

    // Convert canvas to JPEG file
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

    logDebug.stopTimer("convertToJpeg", { file: FILE, fn: FUNC });
    logDebug.info("JPEG conversion complete", { file: FILE, fn: FUNC });

    return jpegFile;
  }

  // ---------------------- Parallel File Uploads ----------------------
  async function uploadAllFiles() {
    logDebug.startTimer("parallelUploads", { file: FILE, fn: FUNC });
    logDebug.info("Uploading files in parallel...", { file: FILE, fn: FUNC });

    // Upload all files in parallel, convert images to JPEG first
    const [profileImageUrl, logoUrl, portfolioPdfUrl] = await Promise.all([
      profileImageFile
        ? convertToJpeg(profileImageFile).then((file) =>
            CloudinaryService.upload(file, "profile_images")
          )
        : Promise.resolve(null),

      logoFile
        ? convertToJpeg(logoFile).then((file) =>
            CloudinaryService.upload(file, "logos")
          )
        : Promise.resolve(null),

      portfolioPdfFile
        ? CloudinaryService.upload(portfolioPdfFile, "portfolios")
        : Promise.resolve(null),
    ]);

    logDebug.stopTimer("parallelUploads", { file: FILE, fn: FUNC });
    logDebug.info({ message: "Uploads completed", profileImageUrl, logoUrl, portfolioPdfUrl }, { file: FILE, fn: FUNC });

    // Return uploaded URLs and original profile image for ID card
    return { profileImageUrl, logoUrl, portfolioPdfUrl, profileImageFile };
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
  async function insertUserProfile(userId: string, profileImageUrl: string | null) {
    logDebug.startTimer("insert_user_profiles", { file: FILE, fn: FUNC });
    logDebug.info("Inserting into user_profiles...", { file: FILE, fn: FUNC });

    const { error } = await supabase.from("user_profiles").insert([
      {
        auth_user_id: userId,
        full_name: fullName,
        whatsapp_number: whatsappNumber || null,
        city: city || null,
        profile_photo_url: profileImageUrl || null,
      },
    ]);

    logDebug.stopTimer("insert_user_profiles", { file: FILE, fn: FUNC });
    if (error) throw new Error(`Profile creation failed: ${error.message}`);

    // Fetch the inserted profile's ID
    const { data: profileData, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (fetchError || !profileData) throw new Error("Unable to retrieve profile ID");
    return profileData.id;
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
// Define a strict type for the uploaded files
interface UploadedFiles {
  profileImageUrl: string | null;
  logoUrl: string | null;
  portfolioPdfUrl: string | null;
  profileImageFile: File | null;
}

// ---------------------- Insert into Makeup Artists ----------------------
async function insertMakeupArtist(
  profileId: string,
  username: string,
  files: UploadedFiles
): Promise<string> {
  logDebug.startTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
  logDebug.info("Inserting into makeup_artists...", { file: FILE, fn: FUNC });

  // Insert artist data into Supabase table
  const { error } = await supabase.from("makeup_artists").insert([
    {
      user_profile_id: profileId,
      organisation: organisation || null,
      designation: designation || null,
      instagram_handle: instagramHandle || null,
      username,
      portfolio_pdf_url: files.portfolioPdfUrl || null,
      logo_url: files.logoUrl || null,
      status: "pending",
    },
  ]);

  logDebug.stopTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
  if (error) throw new Error(`Artist save failed: ${error.message}`);

  // Fetch the inserted artist's ID
  const { data: artistData, error: fetchError } = await supabase
    .from("makeup_artists")
    .select("id")
    .eq("user_profile_id", profileId)
    .single();

  if (fetchError || !artistData) throw new Error("Failed to fetch artist record");

  logDebug.info(`Artist ID: ${artistData.id}`, { file: FILE, fn: FUNC });

  return artistData.id; // Return the artist ID
}


  // ---------------------- Generate & Upload ID Card ----------------------
  async function generateAndUploadIdCard(artistId: string, profileImageFile: File | null) {
    try {
      logDebug.startTimer("id_card_generation", { file: FILE, fn: FUNC });
      logDebug.info("Generating ID Card...", { file: FILE, fn: FUNC });

      const templateId = "e4b514f3-28df-4bde-a0fe-0ca9b47c9250";
      const bgImage = await loadImage("/images/templates/base_id_bg.jpg");
      const profileImageHtml = profileImageFile ? await loadImageFile(profileImageFile) : null;

      const { generateTemplateImage } = await import(
        "@/modules/template_generation/generateTemplateImage"
      );

      const cardUrl: string = await generateTemplateImage(
        "id_card",
        templateId,
        artistId,
        bgImage,
        profileImageHtml
      );

      logDebug.stopTimer("id_card_generation", { file: FILE, fn: FUNC });
      logDebug.info("ID card generated & uploaded", { file: FILE, fn: FUNC });

      await saveIdCardUrl(artistId, cardUrl);
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

  /**
   * Helper: Upload selected files to Cloudinary using CloudinaryService
   */
  const uploadToCloudinary = async ({
    profileImageFile,
    logoFile,
    portfolioPdfFile,
  }: {
    profileImageFile: File | null;
    logoFile: File | null;
    portfolioPdfFile: File | null;
  }): Promise<{
    profileImageUrl: string | null;
    logoUrl: string | null;
    portfolioPdfUrl: string | null;
  }> => {
    const result = {
      profileImageUrl: null as string | null,
      logoUrl: null as string | null,
      portfolioPdfUrl: null as string | null,
    };

    try {
      if (profileImageFile) {
        console.log('📸 Uploading profile image...');
        result.profileImageUrl = await CloudinaryService.upload(profileImageFile, 'profile_images');
      }
      if (logoFile) {
        console.log('🏷️ Uploading logo...');
        result.logoUrl = await CloudinaryService.upload(logoFile, 'logos');
      }
      if (portfolioPdfFile) {
        console.log('📚 Uploading portfolio PDF...');
        result.portfolioPdfUrl = await CloudinaryService.upload(portfolioPdfFile, 'portfolios');
      }
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }

    return result;
  };

  // ==================== UI ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Makeup Artist Registration
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join our creative community and showcase your artistry.
        </p>

        {message && (
          <div
            className={`mb-6 p-4 text-sm font-medium rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-4">
            <InputField label="Email" required value={email} onChange={setEmail} type="email" />
            <InputField label="Password" required value={password} onChange={setPassword} type="password" />
            <InputField label="Full Name" required value={fullName} onChange={setFullName} />
            <InputField label="WhatsApp Number" required value={whatsappNumber} onChange={setWhatsappNumber} />
            <InputField label="City" required value={city} onChange={setCity} />

            <div>
              <label className="block font-semibold mb-1">Profile Image</label>
              <input required type="file" accept="image/*" onChange={(e) => handleProfileChange(e.target.files)} />
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="mt-2 rounded-lg w-32 h-32 object-cover border"
                />
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <InputField required label="Organisation" value={organisation} onChange={setOrganisation} />
            <InputField required label="Designation" value={designation} onChange={setDesignation} />
            <InputField required label="Instagram Handle" value={instagramHandle} onChange={setInstagramHandle} />

            <div>
              <label className="block font-semibold mb-1">Logo</label>
              <input
                required
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setLogoFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                }
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Portfolio PDF</label>
              <input
                required
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setPortfolioPdfFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                }
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="md:col-span-2 text-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
            >
              {loading ? 'Registering...' : 'Register'}
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
