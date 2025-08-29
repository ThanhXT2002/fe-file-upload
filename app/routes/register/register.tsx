import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router'
// ...existing imports
import { useAuth } from '~/context/auth'
import axios from 'axios'
import InputCommon from '~/components/inputCommon/inputCommon'
import { register as registerService } from '~/api/authService'
import type { ApiResponseError } from '~/type/apiTypes'
import { toast } from 'react-toastify'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const RegisterSchema = z
  .object({
    email: z.string().email({ message: 'Email is not in correct format' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    passwordConfirm: z.string().min(8, { message: 'Please confirm your password' })
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match'
  })

type FormValues = z.infer<typeof RegisterSchema>

export default function Register() {
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true })
  }, [authLoading, session, navigate])
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' }
  })

  async function onSubmit(values: FormValues) {
    setGlobalError(null)
  setSubmitting(true)
    try {
      await registerService({ email: values.email, password: values.password })
      toast.success('Registration successful')
      reset()
      navigate('/login')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const api = (err as any).api as ApiResponseError | undefined
        if (api) {
          if (typeof api.errors === 'object' && api.errors !== null && !Array.isArray(api.errors)) {
            for (const [k, v] of Object.entries(api.errors)) {
              // map field errors to form
              setError(k as any, { message: String(v) })
            }
          } else {
            setGlobalError(String(api.errors ?? api.message))
          }
        } else {
          const respData = (err as any).response?.data
          if (respData) {
            const beMessage =
              typeof respData.message === 'string' ? respData.message : JSON.stringify(respData.message ?? respData)
            setGlobalError(beMessage)
            toast.error(beMessage)
          } else {
            setGlobalError((err as any).message ?? 'Registration failed')
          }
        }
      } else {
        setGlobalError(String(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen px-3'>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[500px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Register</h1>

          <form onSubmit={handleSubmit(onSubmit)} className='w-full space-y-6'>
            <div className='w-full mb-6'>
              <InputCommon
                {...register('email')}
                name='email'
                type='email'
                label='Email'
                showLabel={false}
                placeholder='Enter your email'
                isRequired
                error={errors.email?.message?.toString() ?? null}
              />
            </div>

            <div className='w-full mb-6'>
              <InputCommon
                {...register('password')}
                name='password'
                type='password'
                label='Password'
                showLabel={false}
                placeholder='Enter your password'
                isRequired
                error={errors.password?.message?.toString() ?? null}
              />
            </div>

            <div className='w-full mb-6'>
              <InputCommon
                {...register('passwordConfirm')}
                name='passwordConfirm'
                id='passwordConfirm'
                type='password'
                showLabel={false}
                label='Repeat password'
                placeholder='Enter repeat password'
                isRequired
                error={errors.passwordConfirm?.message?.toString() ?? null}
              />
            </div>

            {globalError && <div className='text-sm text-center text-red-400 mb-2'>{globalError}</div>}

            <button
              type='submit'
              className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'loading...' : 'Register'}
            </button>
          </form>
          <div className='text-center mt-6 '>
            <p className='text-opacity-80  text-[var(--secondary)]'>
              Already have an account?{' '}
              <NavLink
                to='/login'
                className='text-[var(--secondary)] hover:text-[var(--tertiary)] font-semibold transition-colors cursor-pointer'
              >
                Login now
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// client-side guard implemented via Auth context
