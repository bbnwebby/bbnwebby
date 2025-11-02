'use client';

import { supabase } from '@/lib/supabaseClient';
import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPassword from '@/components/auth/ForgotPassword';

// Main component for the sign-in form
export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors

    console.log('Attempting sign-in with:', { email, password });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      setError(error.message); // Set the error message
    } else {
      console.log("User signed in successfully:", data.user);
      router.push('/'); // Redirect the user to the home page
    }
    
    setLoading(false); // Stop loading regardless of the outcome
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div id='signIn' >
      {/* Updated card for dark theme consistency */}
      <div className="w-full max-w-md bg-[rgba(10,10,10,0.95)] backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>

        {/* Conditionally rendered error message */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-300 p-4 rounded-xl text-sm border border-red-800">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-900 text-gray-100 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <ForgotPassword></ForgotPassword>
            <a href='/signup' className='text-right'>Dont have an account? Sign Up</a>
            
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Suspense>
  );
}

