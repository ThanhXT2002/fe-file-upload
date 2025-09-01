import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '~/api/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const s = (data as any)?.session ?? null
        if (!mounted) return
        setSession(s)
        setUser(s?.user ?? null)
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      const sess = s ?? null
      setSession(sess)
      setUser((sess as any)?.user ?? null)
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
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signInWithPassword,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
