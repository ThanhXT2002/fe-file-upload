import { createClient } from '@supabase/supabase-js'
import type { AxiosInstance } from 'axios'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Wire Supabase auth session to an Axios instance so requests include
// the latest access token and headers update automatically on session change.
export function setupSupabaseAuth(axiosInstance: AxiosInstance) {
  // set header from current session (if any)
  void supabase.auth.getSession().then((r: any) => {
    const session = (r as any)?.data?.session
    if (session?.access_token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
    }
  })

  // subscribe to auth state changes and update axios header
  supabase.auth.onAuthStateChange((_event: any, session: any) => {
    if (session?.access_token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
    } else {
      delete axiosInstance.defaults.headers.common['Authorization']
    }
  })
}

export default supabase
