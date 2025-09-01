import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '~/api/supabaseClient'
import { getProfile } from '~/api/authService'
import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from '~/type/authType'

type AuthContextValue = {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile from backend
  const fetchUserProfile = async (currentSession: Session | null) => {
    if (!currentSession?.access_token) {
      setUserProfile(null)
      return
    }

    try {
      const response = await getProfile()
      setUserProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const s = (data as any)?.session ?? null
        if (!mounted) return
        
        setSession(s)
        setUser(s?.user ?? null)
        
        // Fetch user profile if session exists
        if (s) {
          await fetchUserProfile(s)
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      const sess = s ?? null
      setSession(sess)
      setUser((sess as any)?.user ?? null)
      
      // Fetch user profile when auth state changes
      if (sess) {
        await fetchUserProfile(sess)
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      mounted = false
      try {
        ;(listener as any)?.subscription?.unsubscribe?.()
      } catch {
        // no-op
      }
    }
  }, [])

  async function signInWithPassword(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    
    // Fetch profile after successful login
    if (result.data?.session) {
      await fetchUserProfile(result.data.session)
    }
    
    return result
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
  }

  async function refreshProfile() {
    if (session) {
      await fetchUserProfile(session)
    }
  }

  const value: AuthContextValue = {
    user,
    userProfile,
    session,
    loading,
    signInWithPassword,
    signOut,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
