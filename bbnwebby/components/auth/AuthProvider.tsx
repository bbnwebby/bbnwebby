'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import type { UserProfile, MakeupArtist } from '@/types/types'
import {
  getUserProfile,
  getMakeupArtistByProfile,
  createUserProfile,
  createMakeupArtist,
} from '@/lib/supabaseHelpers'

// =======================================
// 🔒 Auth Context Type Definition
// =======================================
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  makeupArtist: MakeupArtist | null
  loading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  signUp: (data: {
    email: string
    password: string
    fullName: string
    whatsappNumber?: string | null
    city?: string | null
    locationUrl?: string | null
    profilePhotoUrl?: string | null
    passwordHash: string
    isMakeupArtist?: boolean
    artistUsername?: string | null
    organisation?: string | null
    designation?: string | null
    instagramHandle?: string | null
  }) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
}

// =======================================
// 🧱 Default Context Value
// =======================================
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  makeupArtist: null,
  loading: true,
  logout: async () => {},
  refreshSession: async () => {},
  signUp: async () => ({ error: 'Not implemented' }),
  updateProfile: async () => ({ error: 'Not implemented' }),
})

// =======================================
// 🧩 AuthProvider Component
// =======================================
export function AuthProvider({ children }: { children: ReactNode }) {
  // ---------- States ----------
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [makeupArtist, setMakeupArtist] = useState<MakeupArtist | null>(null)
  const [loadingUser, setLoadingUser] = useState<boolean>(true)
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true)

  // Combine loading states for a single flag
  const loading: boolean = loadingUser || loadingProfile

  /**
   * ✅ Clears all authentication and profile state
   */
  const clearAuth = (): void => {
    setUser(null)
    setProfile(null)
    setMakeupArtist(null)
  }

  /**
   * 🔁 Loads user session, profile, and artist data
   */
  const loadSession = useCallback(async (): Promise<void> => {
    setLoadingUser(true)
    setLoadingProfile(true)

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const sessionUser = data?.session?.user ?? null
      if (!sessionUser) {
        console.warn('[AuthProvider] ❌ No active session found.')
        clearAuth()
        return
      }

      console.log('[AuthProvider] ✅ Session user loaded:', sessionUser.id)
      setUser(sessionUser)

      // ✅ Fetch user profile by Supabase auth user ID
      const userProfile = await getUserProfile()
      setProfile(userProfile)

      // ✅ If profile exists, load linked artist data
      if (userProfile) {
        const artistData = await getMakeupArtistByProfile(userProfile.id)
        setMakeupArtist(artistData)
      } else {
        setMakeupArtist(null)
      }
    } catch (err) {
      console.error('[AuthProvider] ❌ Failed to load session:', err)
      clearAuth()
    } finally {
      setLoadingUser(false)
      setLoadingProfile(false)
    }
  }, [])

  /**
   * 👂 Listen for Supabase auth state changes
   * - Automatically updates user & profile when login/logout occurs.
   */
  useEffect(() => {
    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        console.log('[AuthProvider:onAuthChange] ❌ User signed out.')
        clearAuth()
        setLoadingUser(false)
        setLoadingProfile(false)
        return
      }

      console.log('[AuthProvider:onAuthChange] ✅ Auth user:', sessionUser.id)
      setUser(sessionUser)

      try {
        const fetchedProfile = await getUserProfile()
        setProfile(fetchedProfile)

        if (fetchedProfile) {
          const artist = await getMakeupArtistByProfile(fetchedProfile.id)
          setMakeupArtist(artist)
        } else {
          setMakeupArtist(null)
        }
      } catch (err) {
        console.error('[AuthProvider:onAuthChange] ❌ Error loading profile/artist:', err)
        setProfile(null)
        setMakeupArtist(null)
      } finally {
        setLoadingProfile(false)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [loadSession])

  /**
   * 🚪 Logs out the current user
   */
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      clearAuth()
      console.log('[AuthProvider] ✅ Logged out successfully.')
    } catch (err) {
      console.error('[AuthProvider] ❌ Logout failed:', err)
    }
  }

  /**
   * 🔄 Refreshes the current Supabase session and user data
   */
  const refreshSession = async (): Promise<void> => {
    await loadSession()
  }

  /**
   * 🧍 Handles sign-up flow: Auth → Profile → Optional Artist
   */
  const signUp: AuthContextType['signUp'] = async (data) => {
    const {
      email,
      password,
      fullName,
      whatsappNumber,
      city,
      locationUrl,
      profilePhotoUrl,
      passwordHash,
      isMakeupArtist,
      artistUsername,
      organisation,
      designation,
      instagramHandle,
    } = data

    try {
      // Step 1️⃣: Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (authError) throw new Error(authError.message)

      const newUser = authData.user ?? authData.session?.user
      if (!newUser) throw new Error('Sign-up failed: No user returned from Supabase.')

      // Step 2️⃣: Create user profile
      const newProfile = await createUserProfile({
        auth_user_id: newUser.id,
        full_name: fullName,
        whatsapp_number: whatsappNumber ?? null,
        password_hash: passwordHash,
        profile_photo_url: profilePhotoUrl ?? null,
        location_url: locationUrl ?? null,
        city: city ?? null,
      })

      if (!newProfile) throw new Error('Failed to create user profile.')

      setUser(newUser)
      setProfile(newProfile)

      // Step 3️⃣: Optionally create a makeup artist record
      if (isMakeupArtist && artistUsername) {
        const artistRecord = await createMakeupArtist({
          username: artistUsername,
          organisation: organisation ?? null,
          designation: designation ?? null,
          instagram_handle: instagramHandle ?? null,
          portfolio_pdf_url: null,
          status: 'pending',
        })

        if (artistRecord) {
          console.log('[AuthProvider] ✅ Makeup artist profile created.')
          setMakeupArtist(artistRecord.artist)
        }
      }

      return {}
    } catch (err) {
      console.error('[AuthProvider:signUp] ❌ Error during sign-up:', err)
      const msg = err instanceof Error ? err.message : 'Unknown sign-up failure.'
      return { error: msg }
    }
  }

  /**
   * 🧾 Updates profile information in Supabase
   */
  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!profile) return { error: 'No active profile found.' }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw new Error(error.message)

      const refreshedProfile = await getUserProfile()
      setProfile(refreshedProfile)
      console.log('[AuthProvider] ✅ Profile updated successfully.')
      return {}
    } catch (err) {
      console.error('[AuthProvider:updateProfile] ❌ Failed:', err)
      const msg = err instanceof Error ? err.message : 'Unknown update failure.'
      return { error: msg }
    }
  }

  // =======================================
  // 🎯 Return Context Provider
  // =======================================
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        makeupArtist,
        loading,
        logout,
        refreshSession,
        signUp,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// =======================================
// ⚡ Hook: useAuth()
// Provides easy access to Auth context
// =======================================
export const useAuth = (): AuthContextType => useContext(AuthContext)
