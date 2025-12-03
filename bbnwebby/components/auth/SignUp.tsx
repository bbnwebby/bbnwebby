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
  e.preventDefault();

  const FILE = "SignUp.tsx";
  const FUNC = "handleSubmit";
  logDebug.startTimer("handleSubmit_called", { file: FILE, fn: FUNC });

  // Reset UI & start debug logs
  logDebug.info("📝 MAKEUP ARTIST REGISTRATION START", { file: FILE, fn: FUNC });
  setMessage(null);
  setLoading(true);

  // ========== Utility: Convert File/Blob → JPEG File ==========
  const convertToJpeg = async (file: File | Blob, quality = 0.9): Promise<File> => {
    logDebug.startTimer("convertToJpeg", { file: FILE, fn: FUNC });

    // Load file as <img>
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });

    // Draw into canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.drawImage(img, 0, 0);

    // Convert to JPEG blob
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
  };

  try {
    // ======================================================
    // 1️⃣ Upload files in parallel
    // ======================================================
    logDebug.startTimer("parallelUploads", { file: FILE, fn: FUNC });
    logDebug.info("Uploading files in parallel...", { file: FILE, fn: FUNC });

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
    logDebug.info(
      {
        message: "Uploads completed",
        profileImageUrl,
        logoUrl,
        portfolioPdfUrl,
      },
      { file: FILE, fn: FUNC }
    );

    // ======================================================
    // 2️⃣ Create Supabase Auth user
    // ======================================================
    logDebug.startTimer("authSignup", { file: FILE, fn: FUNC });
    logDebug.info("Creating Supabase Auth user...", { file: FILE, fn: FUNC });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    logDebug.stopTimer("authSignup", { file: FILE, fn: FUNC });

    if (authError) throw new Error(authError.message);

    const user = authData.user;
    if (!user) {
      setMessage({
        type: "success",
        text: "Registration successful! Please verify your email.",
      });
      setLoading(false);
      return;
    }

    // ======================================================
    // 3️⃣ Insert into user_profiles
    // ======================================================
    logDebug.startTimer("insert_user_profiles", { file: FILE, fn: FUNC });
    logDebug.info("Inserting into user_profiles...", { file: FILE, fn: FUNC });

    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        auth_user_id: user.id,
        full_name: fullName,
        whatsapp_number: whatsappNumber || null,
        city: city || null,
        profile_photo_url: profileImageUrl || null,
      },
    ]);

    logDebug.stopTimer("insert_user_profiles", { file: FILE, fn: FUNC });
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

    // ======================================================
    // 4️⃣ Fetch profile ID
    // ======================================================
    logDebug.startTimer("fetch_profile_id", { file: FILE, fn: FUNC });
    logDebug.info("Fetching user_profile ID...", { file: FILE, fn: FUNC });

    const { data: profileData, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    logDebug.stopTimer("fetch_profile_id", { file: FILE, fn: FUNC });

    if (fetchError || !profileData) throw new Error("Unable to retrieve profile ID");

    logDebug.info(`Profile ID: ${profileData.id}`, { file: FILE, fn: FUNC });

    // ======================================================
    // 5️⃣ Build username
    // ======================================================
    const clean = (s: string) =>
      s?.trim().replace(/\s+/g, "_").toLowerCase() || "unknown";

    const username = `${clean(fullName)}@${clean(designation)}@${clean(
      organisation
    )}@${clean(city)}`;

    logDebug.info(`Generated username: ${username}`, { file: FILE, fn: FUNC });

    // ======================================================
    // 6️⃣ Insert into makeup_artists
    // ======================================================
    logDebug.startTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
    logDebug.info("Inserting into makeup_artists...", { file: FILE, fn: FUNC });

    const { error: artistError } = await supabase.from("makeup_artists").insert([
      {
        user_profile_id: profileData.id,
        organisation: organisation || null,
        designation: designation || null,
        instagram_handle: instagramHandle || null,
        username,
        portfolio_pdf_url: portfolioPdfUrl || null,
        logo_url: logoUrl || null,
        status: "pending",
      },
    ]);

    logDebug.stopTimer("insert_makeup_artists", { file: FILE, fn: FUNC });
    if (artistError) throw new Error(`Artist save failed: ${artistError.message}`);

    // ======================================================
    // 7️⃣ Fetch artist ID
    // ======================================================
    logDebug.info("Fetching artist ID...", { file: FILE, fn: FUNC });

    const { data: artistData, error: fetchArtistError } = await supabase
      .from("makeup_artists")
      .select("id")
      .eq("user_profile_id", profileData.id)
      .single();

    if (fetchArtistError || !artistData)
      throw new Error("Failed to fetch artist record");

    const artistId: string = artistData.id;

    logDebug.info(`Artist ID: ${artistId}`, { file: FILE, fn: FUNC });

    // ======================================================
    // 8️⃣ Generate & Upload ID Card
    // ======================================================
    try {
      logDebug.startTimer("id_card_generation", { file: FILE, fn: FUNC });
      logDebug.info("Generating ID Card...", { file: FILE, fn: FUNC });

      const templateId = "e4b514f3-28df-4bde-a0fe-0ca9b47c9250";

      const bgImage = new Image();
      bgImage.src = "/images/templates/base_id_bg.jpg";

      await new Promise<void>((resolve, reject) => {
        bgImage.onload = () => resolve();
        bgImage.onerror = () => reject();
      });

      const { generateTemplateImage } = await import(
        "@/modules/template_generation/generateTemplateImage"
      );

      let profileImageHtml: HTMLImageElement | null = null;

      if (profileImageFile) {
        profileImageHtml = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(profileImageFile);
        });
      }

      const cardUrl: string = await generateTemplateImage(
        "id_card",
        templateId,
        artistId,
        bgImage,
        profileImageHtml
      );

      logDebug.stopTimer("id_card_generation", { file: FILE, fn: FUNC });
      logDebug.info("ID card generated & uploaded", { file: FILE, fn: FUNC });

      // Save card URL
      logDebug.startTimer("update_idcard_url", { file: FILE, fn: FUNC });

      const { error: updateError } = await supabase
        .from("makeup_artists")
        .update({ idcard_url: cardUrl })
        .eq("id", artistId);

      logDebug.stopTimer("update_idcard_url", { file: FILE, fn: FUNC });

      if (updateError)
        throw new Error(`Failed to save card URL: ${updateError.message}`);

      logDebug.info("ID card URL saved successfully", { file: FILE, fn: FUNC });
    } catch (cardError) {
      logDebug.error("Failed to generate/save ID card", { file: FILE, fn: FUNC });
      logDebug.error(cardError, { file: FILE, fn: FUNC });
    }

    // ======================================================
    // 9️⃣ Reset form
    // ======================================================
    logDebug.info("Resetting form...", { file: FILE, fn: FUNC });
    resetForm();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error occurred";
    logDebug.error(`Registration Error: ${msg}`, { file: FILE, fn: FUNC });
    setMessage({ type: "error", text: msg });
  } finally {
    setLoading(false);
  }
  logDebug.stopTimer("handleSubmit_called", { file: FILE, fn: FUNC });
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
