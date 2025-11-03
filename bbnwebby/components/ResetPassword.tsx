'use client'

import { supabase } from '@/lib/supabaseClient'
import React, { Suspense, useState, useEffect, JSX } from 'react'
import { useRouter } from 'next/navigation'

/**
 * ResetPassword Component
 * ---------------------------------------------------
 * Handles the Supabase password recovery process.
 * 1. Waits for a valid recovery session.
 * 2. Prompts user to set a new password.
 * 3. Updates password in Supabase.
 * 4. Signs the user out.
 * 5. Redirects to the sign-in page.
 */
export default function ResetPassword(): JSX.Element {
  const router = useRouter()

  // Component state variables
  const [password, setPassword] = useState<string>('') // New password input
  const [confirm, setConfirm] = useState<string>('') // Confirm password input
  const [error, setError] = useState<string | null>(null) // Error message display
  const [message, setMessage] = useState<string>('Validating reset link…') // Status message
  const [loading, setLoading] = useState<boolean>(false) // Loading state for button/UI
  const [sessionReady, setSessionReady] = useState<boolean>(false) // Tracks if Supabase session is active

  /**
   * ✅ Step 1: Check if password recovery session is ready.
   * This listens to Supabase's auth state events and validates the link.
   */
  useEffect(() => {
    let mounted = true

    const checkSession = async (): Promise<void> => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // allow AuthProvider to settle
        if (!mounted) return

        const { data: sessionData } = await supabase.auth.getSession()
        console.log('Session check:', sessionData)

        if (sessionData.session) {
          console.log('✅ Session ready')
          setSessionReady(true)
          setMessage('Please enter your new password')
        } else {
          console.warn('⚠️ No session found')
          setMessage('Invalid or expired link')
        }
      } catch (err) {
        console.error('❌ Session check error:', err)
        setMessage('Invalid or expired link')
      }
    }// Supabase auth listener for PASSWORD_RECOVERY and USER_UPDATED
const { data: authListener } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event, 'Session:', !!session);

    // ✅ Case 1: Password recovery link opened
    if (event === 'PASSWORD_RECOVERY' && session) {
      setSessionReady(true);
      setMessage('Please enter your new password');
    }

    // ✅ Case 2: Password successfully updated
    if (event === 'USER_UPDATED') {
      console.log('🔁 Detected USER_UPDATED event — signing out and redirecting...');
      setMessage('✅ Password updated successfully. Redirecting to sign in...');

      // Fire-and-forget sign out — no await (avoids stuck state)
      supabase.auth.signOut().catch((err: unknown) => {
        console.error('⚠️ Sign-out error after update:', err);
      });

      // Always redirect regardless of sign-out result
      setTimeout(() => {
        console.log('➡️ Forcing redirect to /signin...');
        window.location.replace('/login'); // safer than href (stops back nav)
      }, 1200);
    }
  }
);


    checkSession()

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  /**
   * ✅ Step 2: Handle password update and redirect user.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!sessionReady) return

    // Basic input validation
    if (!password || password !== confirm) {
      setError('Passwords do not match or are empty!')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Updating password...')
      const { data, error } = await supabase.auth.updateUser({ password })
      console.log('📦 Update result:', { data, error })

      if (error) {
        console.error('❌ Password update failed:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('✅ Password updated successfully')
      setMessage('✅ Password updated successfully. Redirecting to sign in...')

      // Wait briefly for Supabase propagation
      await new Promise(resolve => setTimeout(resolve, 700))

      console.log('🚪 Signing out...')
      await supabase.auth.signOut()

      console.log('➡️ Redirecting to /signin...')
      // Reliable redirect (force reload)
      window.location.href = '/login'

      // Optional backup: ensure redirect even if above is blocked
      setTimeout(() => {
        router.replace('/login')
      }, 2000)
    } catch (err) {
      console.error('❌ Error during password reset:', err)
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setLoading(false)
    }
  }

  /**
   * ✅ Step 3: Render UI
   */
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md bg-[rgba(10,10,10,0.95)] backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Reset Password</h2>
            <p className="text-gray-300 mt-2">{message}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 text-red-300 p-4 rounded-xl text-sm border border-red-800">
              {error}
            </div>
          )}

          {/* Password Reset Form */}
          {sessionReady && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  disabled={loading}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Suspense>
  )
}
