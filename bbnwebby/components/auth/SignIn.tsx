'use client';

import React, { useState, FormEvent, JSX } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

/**
 * MakeupArtistSignInForm
 * Styled like the MakeupArtistSignUpForm, but only for login.
 */
export default function MakeupArtistSignInForm(): JSX.Element {
  // ==================== State ====================
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ==================== Handle Submit ====================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.group('🔐 SIGN-IN START');
    console.log('Email:', email);

    try {
      // Supabase email + password authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign-in failed:', signInError.message);
        throw new Error(signInError.message);
      }

      console.log('✅ Signed in user:', data.user);
      router.push('/'); // Redirect to home after login
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(msg);
      console.error('Sign-in Error:', msg);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // ==================== UI ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to continue to your dashboard.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <a href="/forgot-password" className="text-purple-600 hover:underline">
              Forgot password?
            </a>
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
      </div>
    </div>
  );
}

/** Reusable input field (same as in sign-up form) */
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
