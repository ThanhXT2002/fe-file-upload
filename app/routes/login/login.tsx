import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router'
import InputCommon from '~/components/inputCommon/inputCommon'
import { supabase } from '~/api/supabaseClient'
import { toast } from 'react-toastify'
import { useAuth } from '~/context/auth'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function Login() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const location = useLocation()
  const from = (location as any)?.state?.from as string | undefined

  useEffect(() => {
    if (!authLoading && session) {
      // if navigated here from a protected route, go back there
      if (from) navigate(from, { replace: true })
      else navigate('/', { replace: true })
    }
  }, [authLoading, session, navigate, from])
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const LoginSchema = z.object({
    email: z.string().email({ message: 'Email is not in correct format' }),
    password: z.string().min(1, { message: 'Password is required' })
  })

  type FormValues = z.infer<typeof LoginSchema>

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' }
  })

  async function onSubmit(values: FormValues) {
  setGlobalError(null)
  setSubmitting(true)
    try {
      const resp = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
      if (resp.error) {
        // Supabase returns generic message; map to field if possible
        const msg = resp.error.message || 'Login failed'
        // Try to detect common cases
        if (/password/i.test(msg)) setError('password', { message: msg })
        else if (/email/i.test(msg)) setError('email', { message: msg })
        else setGlobalError(msg)
        setSubmitting(false)
        return
      }
  toast.success('Login success')
  if (from) navigate(from)
  else navigate('/')
    } catch (err: any) {
      setGlobalError(err?.message ?? 'Login error')
      toast.error(err?.message ?? 'Login error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[500px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
            <div className='input-group relative mb-6'>
              <InputCommon {...register('email')} type='email' placeholder='Enter your email' error={errors.email?.message?.toString() ?? null} showLabel={false} isRequired />
            </div>
            <div className='input-group relative mb-6'>
              <InputCommon {...register('password')} type='password' placeholder='Enter your password' error={errors.password?.message?.toString() ?? null} showLabel={false} isRequired />
            </div>

            {globalError && <div className='text-sm text-center text-red-400 mb-2'>{globalError}</div>}

            <button
              type='submit'
              disabled={submitting}
              className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 disabled:opacity-60'
            >
              {submitting ? 'Đang đăng nhập...' : 'Login'}
            </button>
            <NavLink
              to='/forgot-password'
              className='text-[var(--secondary)] hover:text-[var(--tertiary)] transition-colors mt-3 block text-center'
            >
              Forgot password?
            </NavLink>
          </form>
          <div className='text-center mt-6'>
            <p className=' text-opacity-80  text-[var(--secondary)]'>
              You don't have an account?{' '}
              <NavLink
                to='/register'
                className='text-[var(--secondary)] hover:text-[var(--tertiary)] font-semibold transition-colors cursor-pointer'
                end
              >
                Register now
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// client-side guard implemented via Auth context
