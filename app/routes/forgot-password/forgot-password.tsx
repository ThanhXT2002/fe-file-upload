import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router'
import InputCommon from '~/components/inputCommon/inputCommon'
import { supabase } from '~/api/supabaseClient'
import { toast } from 'react-toastify'
import { useAuth } from '~/context/auth'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ForgotSchema = z.object({ email: z.string().email({ message: 'Invalid email' }) })
type FormValues = z.infer<typeof ForgotSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { session, loading: authLoading } = useAuth()
  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true })
  }, [authLoading, session, navigate])
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(ForgotSchema),
    defaultValues: { email: '' }
  })

  async function onSubmit(values: FormValues) {
    setGlobalError(null)
  setSubmitting(true)
    try {
  // send reset link, redirect back to reset-password page
  const redirectTo = `${window.location.origin}/reset-password`
      const resp = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo })
  if (resp.error) {
    setGlobalError(resp.error.message ?? 'Request failed')
    toast.error(resp.error.message ?? 'Request failed')
        return
      }
  toast.success('Password reset email sent. Please check your inbox.')
  // navigate to a dedicated check-email page to improve UX
  navigate('/check-email', { state: { email: values.email } })
    } catch (err: any) {
      setGlobalError(err?.message ?? 'Error sending request')
      toast.error(err?.message ?? 'Error sending request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-fit  border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Forgot Password</h1>

          <form onSubmit={handleSubmit(onSubmit)} className='w-full space-y-6'>
            <div className='w-full mb-6'>
              <InputCommon {...register('email')} name='email' type='email' placeholder='Enter your email' isRequired showLabel={false} error={errors.email?.message?.toString() ?? null} />
            </div>

            {globalError && <div className='text-sm text-center text-red-400 mb-2'>{globalError}</div>}

            <button type='submit' disabled={submitting} className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 disabled:opacity-60'>
              {submitting ? 'Sending...' : 'Send request'}
            </button>
          </form>
          <div className='mt-5 w-full flex__between'>
            <NavLink to='/login' className='text-sm text-center text-blue-500 '>
              Already have an account? <span className='font-semibold'>Login</span>
            </NavLink>
            <NavLink to='/register' className='text-sm text-center text-blue-500 '>
              Don't have an account? <span className='font-semibold'>Register</span>
            </NavLink>

          </div>
        </div>
      </div>
    </div>
  )
}

// client-side guard implemented via Auth context
