'use client';

import React, { useState, FormEvent, JSX } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

/**
 * MakeupArtistSignInForm
 * Styled like the MakeupArtistSignUpForm with built-in reset password mode.
 */
export default function MakeupArtistSignInForm(): JSX.Element {
  // ==================== State ====================
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState<boolean>(false); // true = show reset password view
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // ==================== Handle Sign In ====================
  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error(signInError.message);

      console.log('✅ Signed in user:', data.user);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Handle Password Reset ====================
  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // page user visits after reset
      });

      if (resetError) throw new Error(resetError.message);

      setMessage('✅ Password reset link has been sent to your email.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== UI ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {resetMode ? 'Reset Your Password' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {resetMode
            ? 'Enter your registered email to receive a password reset link.'
            : 'Sign in to continue to your dashboard.'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 text-sm font-medium rounded-lg bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {/* Conditional Rendering: Reset or Sign In Form */}
        {!resetMode ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <InputField
              label="Email"
              required
              type="email"
              value={email}
              onChange={setEmail}
            />

            <InputField
              label="Password"
              required
              type="password"
              value={password}
              onChange={setPassword}
            />

            {/* Forgot Password & Sign Up link */}
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-purple-600 hover:underline"
              >
                Forgot password?
              </button>
              <a href="/signup" className="text-purple-600 hover:underline">
                Don’t have an account? Sign up
              </a>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <InputField
              label="Email"
              required
              type="email"
              value={email}
              onChange={setEmail}
            />

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setResetMode(false);
                  setMessage(null);
                  setError(null);
                }}
                className="text-purple-600 hover:underline"
              >
                Back to Sign In
              </button>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** Reusable input field (same style as sign-up form) */
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
}

function InputField({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
}: InputFieldProps): JSX.Element {
  return (
    <div>
      <label className="block font-semibold mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
}
