import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { supabase } from '~/api/supabaseClient'
import { useAuth } from '~/context/auth'
import { toast } from 'react-toastify'

export default function CheckEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const { session, loading: authLoading } = useAuth()
  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true })
  }, [authLoading, session, navigate])

  // email may be passed via navigate state from forgot-password
  const email = (location as any)?.state?.email as string | undefined

  async function handleResend() {
    if (!email) return
    setSubmitting(true)
    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const resp = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (resp.error) {
        toast.error(resp.error.message ?? 'Resend failed')
        return
      }
      toast.success('Verification email resent. Please check your inbox.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Resend error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[300px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Check your email</h1>
          <p className='text-center text-[var(--secondary)] my-4'>
            We sent a password reset link to your email address.
            {email ? (
              <>
                {' '}
                You: <strong>{email}</strong>
              </>
            ) : null}
          </p>
          <div className='w-full gap-x-5 flex__middle'>
            <button
              onClick={() => navigate('/login')}
              className='w-full py-3 rounded-xl text-white font-semibold bg-[var(--primary)] '
            >
              Back to login
            </button>
            {email && (
              <button
                onClick={handleResend}
                disabled={submitting}
                className='w-full py-3 rounded-xl text-white font-semibold bg-[var(--tertiary)] disabled:opacity-60 '
              >
                {submitting ? 'Resending...' : 'Resend email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// client-side guard implemented via Auth context
