'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getUserProfile } from '@/lib/supabaseHelpers'
import {UserProfile} from "@/lib/certificate_and_id/types"
// --------------------
// Types
// --------------------
type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  signUp: (data: {
    email: string
    password: string
    fullName: string
    number: string
    instaId?: string | null
    organisation?: string | null
    age?: number | null
    gender?: string | null
  }) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
}

// --------------------
// Context
// --------------------
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshSession: async () => {},
  signUp: async () => ({ error: 'Not implemented' }),
  updateProfile: async () => ({ error: 'Not implemented' }),
})

// --------------------
// Provider
// --------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const loading = loadingUser || loadingProfile

  // Clear auth state
  const clearAuth = () => {
    setUser(null)
    setProfile(null)
  }

  // Load user session and profile
  const loadSession = useCallback(async () => {
    setLoadingUser(true)
    setLoadingProfile(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        console.log('[AuthProvider] ❌ Invalid or missing session, clearing')
        clearAuth()
        return
      }

      console.log('[AuthProvider] ✅ Valid session, user:', session.user)
      setUser(session.user)

      try {
        const p = await getUserProfile()
        setProfile(p)
      } catch (err) {
        console.error('[AuthProvider] ❌ Failed to fetch profile:', err)
        setProfile(null)
      }
    } catch (err) {
      console.error('[AuthProvider] ❌ getSession error:', err)
      clearAuth()
    } finally {
      setLoadingUser(false)
      setLoadingProfile(false)
    }
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    loadSession() // run on mount

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          console.log('[AuthProvider:onAuthStateChange] ❌ Invalid session → clear')
          clearAuth()
          setLoadingUser(false)
          setLoadingProfile(false)
          return
        }

        console.log('[AuthProvider:onAuthStateChange] ✅ User updated:', session.user)
        setUser(session.user)

        try {
          const p = await getUserProfile()
          setProfile(p)
        } catch (err) {
          console.error('[AuthProvider:onAuthStateChange] ❌ Failed profile fetch:', err)
          setProfile(null)
        } finally {
          setLoadingProfile(false)
        }
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [loadSession])

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut()
    clearAuth()
  }

  // Refresh session
  const refreshSession = async () => {
    await loadSession()
  }

  // Sign-up new user
  const signUp: AuthContextType['signUp'] = async ({
    email, password, fullName, number, instaId, organisation, age, gender,
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) return { error: error.message }

      const newUser = data.user ?? data.session?.user
      if (!newUser) return { error: 'Sign-up failed: no user' }

      await supabase.from('user_profiles').insert({
        id: newUser.id,
        full_name: fullName,
        number,
        insta_id: instaId || null,
        organisation: organisation || null,
        age,
        gender: gender || null,
      })

      setUser(newUser)
      const p = await getUserProfile()
      setProfile(p)

      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign-up failed' }
    }
  }

  // Update user profile
  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return { error: 'Not signed in' }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) return { error: error.message }

      const p = await getUserProfile()
      setProfile(p)
      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logout, refreshSession, signUp, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => useContext(AuthContext)
