'use client';

import React, { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CloudinaryService } from '@/lib/cloudinaryService';

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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [organisation, setOrganisation] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');

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
    console.clear();
    console.group('📝 MAKEUP ARTIST REGISTRATION START');
    setMessage(null);
    setLoading(true);

    try {
      // 1️⃣ Upload files to Cloudinary
      console.log('📤 Uploading selected files to Cloudinary...');
      const uploaded = await uploadToCloudinary({
        profileImageFile,
        logoFile,
        portfolioPdfFile,
      });
      console.log('✅ All uploads complete:', uploaded);

      // 2️⃣ Create Supabase Auth user
      console.log('👤 Creating Supabase Auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`, // 👈 important
  },
});

      if (authError) {
        console.error('❌ Auth creation failed:', authError.message);
        throw new Error(authError.message);
      }

      const user = authData.user;
      if (!user) {
        console.warn('⚠️ No user returned — email verification required');
        setMessage({
          type: 'success',
          text: 'Registration successful! Please verify your email before logging in.',
        });
        setLoading(false);
        console.groupEnd();
        return;
      }

      // 3️⃣ Insert into user_profiles
      console.log('🗂️ Inserting new record into user_profiles...');
      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          auth_user_id: user.id,
          full_name: fullName,
          whatsapp_number: whatsappNumber || null,
          city: city || null,
          profile_photo_url: uploaded.profileImageUrl || null,
        },
      ]);

      if (profileError) {
        console.error('❌ user_profiles insert failed:', profileError.message);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // 4️⃣ Fetch profile ID
      console.log('🔍 Fetching created user_profile ID...');
      const { data: profileData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (fetchError || !profileData) {
        console.error('❌ Failed to fetch profile ID:', fetchError);
        throw new Error('Unable to retrieve user profile.');
      }

      console.log('✅ Profile ID fetched:', profileData.id);

      // 5️⃣ Build username & portfolio URL dynamically
      const clean = (s: string): string =>
        s?.trim().replace(/\s+/g, '_').toLowerCase() || 'unknown';
      const username = `${clean(fullName)}@${clean(designation)}@${clean(
        organisation
      )}@${clean(city)}`;

      console.log('👤 Generated username:', username);

      // 6️⃣ Insert into makeup_artists
      console.log('💄 Inserting artist record into makeup_artists...');
      const { error: artistError } = await supabase.from('makeup_artists').insert([
        {
          user_profile_id: profileData.id,
          organisation: organisation || null,
          designation: designation || null,
          instagram_handle: instagramHandle || null,
          username,
          portfolio_pdf_url: uploaded.portfolioPdfUrl || null,
          logo_url: uploaded.logoUrl || null,
          status: 'pending',
        },
      ]);

      if (artistError) {
        console.error('❌ makeup_artists insert failed:', artistError.message);
        throw new Error(`Artist save failed: ${artistError.message}`);
      }

      console.log('✅ Artist record successfully inserted!');

// 8️⃣ Fetch newly created artist ID
const { data: artistData, error: fetchArtistError } = await supabase
  .from('makeup_artists')
  .select('id')
  .eq('user_profile_id', profileData.id)
  .single();

if (fetchArtistError || !artistData) {
  throw new Error('Failed to fetch newly created artist record.');
}

const artistId: string = artistData.id;
console.log('🎨 Artist ID:', artistId);

// 9️⃣ Generate & upload the ID card automatically
try {
  console.log('🪪 Generating artist ID card...');

  // create a temporary off-screen canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = 1000; // adjust according to template aspect ratio
  canvas.height = 600;

  // your default ID card template ID from Supabase
  const templateId = 'e4b514f3-28df-4bde-a0fe-0ca9b47c9250'; 

  // dynamically import the generator to avoid SSR issues
  const { generateTemplateImage } = await import('@/lib/generation/generateTemplateImage');

  // generate and upload the card — returns the final Cloudinary URL
  const cardUrl: string = await generateTemplateImage('id_card', templateId, artistId, canvas);

  console.log('✅ ID Card generated and uploaded:', cardUrl);

  // 🔄 10️⃣ Save the Cloudinary URL into makeup_artists.idcard_url
  const { error: updateError } = await supabase
    .from('makeup_artists')
    .update({ idcard_url: cardUrl })
    .eq('id', artistId);

  if (updateError) {
    throw new Error(`Failed to update artist ID card URL: ${updateError.message}`);
  }

  console.log('💾 ID card URL successfully saved to makeup_artists table.');
} catch (cardError) {
  console.error('❌ Failed to generate or save ID card:', cardError);
}


      // 7️⃣ Reset all states
      console.log('🧹 Resetting form...');
      resetForm();

      console.groupEnd();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error occurred';
      console.error('❌ Registration Error:', msg);
      setMessage({ type: 'error', text: msg });
      console.groupEnd();
    } finally {
      setLoading(false);
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
