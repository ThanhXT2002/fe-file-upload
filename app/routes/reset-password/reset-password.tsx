import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import InputCommon from '~/components/inputCommon/inputCommon'
import { supabase } from '~/api/supabaseClient'
import { toast } from 'react-toastify'
import { useAuth } from '~/context/auth'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ResetSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    passwordConfirm: z.string().min(8, { message: 'Please confirm your password' })
  })
  .refine((d) => d.password === d.passwordConfirm, { path: ['passwordConfirm'], message: 'Passwords do not match' })

type FormValues = z.infer<typeof ResetSchema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { session, loading: authLoading } = useAuth()
  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true })
  }, [authLoading, session, navigate])
  const [initialized, setInitialized] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { password: '', passwordConfirm: '' }
  })

  useEffect(() => {
    // Supabase client may set session automatically when redirect includes access_token.
    // Check current session to ensure link was valid.
    ;(async () => {
      try {
        await supabase.auth.getSession()
        setInitialized(true)
      } catch {
        setGlobalError('Invalid or expired link')
        setInitialized(true)
      }
    })()
  }, [])

  async function onSubmit(values: FormValues) {
    setGlobalError(null)
    setSubmitting(true)
    try {
      // Update user password via Supabase client
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) {
        setGlobalError(error.message ?? 'Could not set password')
        toast.error(error.message ?? 'Could not set password')
        return
      }
      toast.success('Password updated. You will be logged in automatically.')
      navigate('/')
    } catch (err: any) {
      setGlobalError(err?.message ?? 'Error setting password')
      toast.error(err?.message ?? 'Error setting password')
    } finally {
      setSubmitting(false)
    }
  }

  if (!initialized) {
    return <div className='p-6'>Processing...</div>
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[500px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Set new password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
            <div className='input-group relative mb-6'>
              <InputCommon
                {...register('password')}
                type='password'
                placeholder='Enter new password'
                error={errors.password?.message?.toString() ?? null}
                showLabel={false}
                isRequired
              />
            </div>
            <div className='input-group relative mb-6'>
              <InputCommon
                {...register('passwordConfirm')}
                type='password'
                placeholder='Repeat new password'
                error={errors.passwordConfirm?.message?.toString() ?? null}
                showLabel={false}
                isRequired
              />
            </div>
            {globalError && <div className='text-sm text-center text-red-400 mb-2'>{globalError}</div>}
            <button
              type='submit'
              disabled={submitting}
              className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 disabled:opacity-60'
            >
              {submitting ? 'Saving...' : 'Save new password'}
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
