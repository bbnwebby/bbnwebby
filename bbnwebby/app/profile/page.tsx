'use client'

import React from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/auth/AuthProvider'

// ========================================================
// 🧾 Profile Page
// Displays user profile + makeup artist details
// Styled to match BBN glass / luxury aesthetic
// ========================================================
const ProfilePage: React.FC = () => {
  const { profile, makeupArtist, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-blue-200/30">
        <p className="text-gray-700 font-medium">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No profile found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-blue-200/30 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ============================= */}
        {/* User Profile Card */}
        {/* ============================= */}
        <div className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            {profile.profile_photo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  width={160}
                  height={160}
                  className="rounded-2xl object-cover border border-pink-200"
                />
              </div>
            )}

            {/* Profile Details */}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-pink-500 mb-1">
                User Profile
              </p>
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                {profile.full_name}
              </h1>

              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                {profile.city && <div><strong>City:</strong> {profile.city}</div>}
                {profile.whatsapp_number && (
                  <div><strong>WhatsApp:</strong> {profile.whatsapp_number}</div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* Makeup Artist Card */}
        {/* ============================= */}
        {makeupArtist && (
          <div className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl shadow-xl p-8">
            <p className="text-xs uppercase tracking-widest text-pink-500 mb-1">
              Makeup Artist Profile
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              @{makeupArtist.username}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Artist Info */}
              <div className="space-y-3 text-sm text-gray-700">
                {makeupArtist.organisation && (
                  <div><strong>Organisation:</strong> {makeupArtist.organisation}</div>
                )}
                {makeupArtist.designation && (
                  <div><strong>Designation:</strong> {makeupArtist.designation}</div>
                )}
                {makeupArtist.instagram_handle && (
                  <div>
                    <strong>Instagram:</strong>{' '}
                    <a
                      href={`https://instagram.com/${makeupArtist.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:underline"
                    >
                      @{makeupArtist.instagram_handle}
                    </a>
                  </div>
                )}
                <div><strong>Status:</strong> {makeupArtist.status}</div>
              </div>

              {/* Assets */}
              <div className="space-y-5">
                {/* Logo */}
                {makeupArtist.logo_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">Brand Logo</p>
                    <Image
                      src={makeupArtist.logo_url}
                      alt="Brand Logo"
                      width={160}
                      height={160}
                      className="rounded-2xl object-contain bg-white border border-pink-200 p-4"
                    />
                  </div>
                )}

                {/* ID Card */}
                {makeupArtist.idcard_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">ID Card</p>
                    <Image
                      src={makeupArtist.idcard_url}
                      alt="ID Card"
                      width={240}
                      height={160}
                      className="rounded-2xl object-cover border border-pink-200"
                    />
                  </div>
                )}

                {/* Portfolio */}
                {makeupArtist.portfolio_pdf_url && (
                  <a
                    href={makeupArtist.portfolio_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-medium transition-transform hover:scale-105"
                  >
                    View Portfolio PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
