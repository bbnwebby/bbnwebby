'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPassword() {
  const [showBox, setShowBox] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendResetLink = async () => {
    setMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // where user sets new password
      })

      if (error) throw error
      setMessage('✅ Password reset email sent! Please check your inbox.')
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? `❌ ${err.message}` : '❌ Failed to send reset email.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!showBox ? (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setShowBox(true)
          }}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Forgot Password?
        </a>
      ) : (
        <div className="w-full max-w-md p-4 rounded-xl shadow-md mt-4">
          <h1 className="text-lg font-semibold mb-2">Reset Password</h1>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleSendResetLink}
              disabled={loading}
              className="w-full disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-center">{message}</p>}
        </div>
      )}
    </div>
  )
}
