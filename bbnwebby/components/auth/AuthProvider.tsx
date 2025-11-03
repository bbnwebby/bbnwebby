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
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [makeupArtist, setMakeupArtist] = useState<MakeupArtist | null>(null)
  const [loadingUser, setLoadingUser] = useState<boolean>(true)
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true)

  const loading: boolean = loadingUser || loadingProfile

  const clearAuth = (): void => {
    console.log('[AuthProvider:clearAuth] 🧹 Clearing all auth-related states...')
    setUser(null)
    setProfile(null)
    setMakeupArtist(null)
  }

  /**
   * 🔁 Load session, profile, and artist info
   */
  const loadSession = useCallback(async (): Promise<void> => {
    console.log('[AuthProvider:loadSession] 🔄 Loading session...')
    setLoadingUser(true)
    setLoadingProfile(true)

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const sessionUser = data?.session?.user ?? null
      if (!sessionUser) {
        console.warn('[AuthProvider:loadSession] ❌ No active session.')
        clearAuth()
        return
      }

      console.log('[AuthProvider:loadSession] ✅ User found:', {
        id: sessionUser.id,
        email: sessionUser.email,
      })

      setUser(sessionUser)

      const userProfile = await getUserProfile()
      console.log('[AuthProvider:loadSession] 🧾 Profile fetched:', userProfile)
      setProfile(userProfile)

      if (userProfile) {
        const artistData = await getMakeupArtistByProfile(userProfile.id)
        console.log('[AuthProvider:loadSession] 💄 Artist data fetched:', artistData)
        setMakeupArtist(artistData)
      } else {
        console.log('[AuthProvider:loadSession] ⚠️ No profile found for user.')
        setMakeupArtist(null)
      }
    } catch (err) {
      console.error('[AuthProvider:loadSession] ❌ Session load error:', err)
      clearAuth()
    } finally {
      setLoadingUser(false)
      setLoadingProfile(false)
      console.log('[AuthProvider:loadSession] ⏹️ Session load complete.')
    }
  }, [])

  /**
   * 👂 Auth State Change Listener
   */
  useEffect(() => {
    console.log('[AuthProvider:useEffect] 🧠 Initializing auth state listener...')
    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthProvider:onAuthChange] 🔔 Event detected: ${event}`)

      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        console.log('[AuthProvider:onAuthChange] 🚪 User signed out.')
        clearAuth()
        setLoadingUser(false)
        setLoadingProfile(false)
        return
      }

      console.log('[AuthProvider:onAuthChange] ✅ Active user:', {
        id: sessionUser.id,
        email: sessionUser.email,
      })
      setUser(sessionUser)

      try {
        const fetchedProfile = await getUserProfile()
        console.log('[AuthProvider:onAuthChange] 🧾 Loaded profile:', fetchedProfile)
        setProfile(fetchedProfile)

        if (fetchedProfile) {
          const artist = await getMakeupArtistByProfile(fetchedProfile.id)
          console.log('[AuthProvider:onAuthChange] 💄 Loaded artist data:', artist)
          setMakeupArtist(artist)
        } else {
          console.log('[AuthProvider:onAuthChange] ⚠️ No linked artist record.')
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
      console.log('[AuthProvider:useEffect] 🧹 Cleaning up listener...')
      listener?.subscription?.unsubscribe()
    }
  }, [loadSession])

  /**
   * 🚪 Logout handler
   */
  const logout = async (): Promise<void> => {
    console.log('[AuthProvider:logout] 🚪 Attempting logout...')
    try {
      await supabase.auth.signOut()
      clearAuth()
      console.log('[AuthProvider:logout] ✅ Logged out successfully.')
    } catch (err) {
      console.error('[AuthProvider:logout] ❌ Logout failed:', err)
    }
  }

  /**
   * 🔄 Refresh user session
   */
  const refreshSession = async (): Promise<void> => {
    console.log('[AuthProvider:refreshSession] 🔄 Refreshing session...')
    await loadSession()
  }

  /**
   * 🧍 Sign-up Flow
   */
  const signUp: AuthContextType['signUp'] = async (data) => {
    console.log('[AuthProvider:signUp] 🧾 Sign-up initiated with data:', {
      email: data.email,
      fullName: data.fullName,
      city: data.city,
      isMakeupArtist: data.isMakeupArtist,
    })

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      })
      if (authError) throw new Error(authError.message)

      const newUser = authData.user ?? authData.session?.user
      if (!newUser) throw new Error('No user returned from Supabase sign-up.')

      console.log('[AuthProvider:signUp] ✅ Supabase user created:', {
        id: newUser.id,
        email: newUser.email,
      })

      const newProfile = await createUserProfile({
        auth_user_id: newUser.id,
        full_name: data.fullName,
        whatsapp_number: data.whatsappNumber ?? null,
        profile_photo_url: data.profilePhotoUrl ?? null,
        location_url: data.locationUrl ?? null,
        city: data.city ?? null,
      })

      console.log('[AuthProvider:signUp] 🧾 User profile created:', newProfile)
      setUser(newUser)
      setProfile(newProfile)

      if (data.isMakeupArtist && data.artistUsername) {
        console.log('[AuthProvider:signUp] 💄 Creating makeup artist record...')
        const artistRecord = await createMakeupArtist({
          username: data.artistUsername,
          organisation: data.organisation ?? null,
          designation: data.designation ?? null,
          instagram_handle: data.instagramHandle ?? null,
          portfolio_pdf_url: null,
          status: 'pending',
        })

        console.log('[AuthProvider:signUp] ✅ Artist record created:', artistRecord)
        if (artistRecord) setMakeupArtist(artistRecord.artist)
      }

      console.log('[AuthProvider:signUp] 🎉 Sign-up completed successfully.')
      return {}
    } catch (err) {
      console.error('[AuthProvider:signUp] ❌ Sign-up failed:', err)
      const msg = err instanceof Error ? err.message : 'Unknown sign-up error.'
      return { error: msg }
    }
  }

  /**
   * 🧾 Update profile info
   */
  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!profile) {
      console.warn('[AuthProvider:updateProfile] ⚠️ No profile to update.')
      return { error: 'No active profile found.' }
    }

    console.log('[AuthProvider:updateProfile] ✏️ Updating profile with:', updates)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw new Error(error.message)

      const refreshedProfile = await getUserProfile()
      setProfile(refreshedProfile)
      console.log('[AuthProvider:updateProfile] ✅ Profile updated:', refreshedProfile)
      return {}
    } catch (err) {
      console.error('[AuthProvider:updateProfile] ❌ Update failed:', err)
      const msg = err instanceof Error ? err.message : 'Unknown update failure.'
      return { error: msg }
    }
  }

  // =======================================
  // 🎯 Context Return
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
// =======================================
export const useAuth = (): AuthContextType => useContext(AuthContext)
