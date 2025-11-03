'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { UserProfile } from '@/types/types'

/**
 * Auth Callback Page
 * ---------------------------------------------------
 * 1. Detects `access_token` in URL after email verification.
 * 2. Exchanges token for Supabase session (auto-login).
 * 3. Checks if user has an existing profile.
 * 4. Redirects accordingly (dashboard or profile completion).
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthRedirect = async (): Promise<void> => {
      try {
        // Step 1: Extract tokens from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')

        if (!access_token || !refresh_token) {
          console.error('Missing tokens in redirect URL.')
          router.replace('/login')
          return
        }

        // Step 2: Set Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError || !sessionData?.user) {
          console.error('Session error:', sessionError)
          router.replace('/login')
          return
        }

        // Optional: remove tokens from the URL
        window.history.replaceState({}, document.title, window.location.pathname)

        const user = sessionData.user

        // Step 3: Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .single<UserProfile>()

        if (profileError && !profile) {
          console.warn('No profile found, redirecting to completion.')
          router.replace('/complete-profile')
          return
        }

        // Step 4: Redirect based on profile existence
        if (profile) {
          router.replace('/dashboard')
        } else {
          router.replace('/complete-profile')
        }
      } catch (err) {
        console.error('Auth callback failed:', err)
        router.replace('/login')
      }
    }

    handleAuthRedirect()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Verifying your account...</p>
    </div>
  )
}
