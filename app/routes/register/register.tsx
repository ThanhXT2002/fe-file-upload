import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router'
import axios from 'axios'
import InputCommon from '~/components/inputCommon/inputCommon'
import { register as registerService } from '~/api/authService'
import type { ApiResponseError } from '~/type/apiTypes'
import type { RegisterPayload } from '~/type/authType'
import { validateRegister } from '~/utils/validation'
import { toast } from 'react-toastify'

export default function Register() {
  const [errors, setErrors] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload: RegisterPayload = {
      email: String(fd.get('email') || ''),
      password: String(fd.get('password') || ''),
      passwordConfirm: String(fd.get('passwordConfirm') || '')
    }

    console.log(payload)

    // client-side validation
    const clientErr = validateRegister(payload)
    if (clientErr) {
      setErrors(clientErr)
      setLoading(false)
      return
    }

    try {
      // backend only expects email and password
      await registerService({ email: payload.email, password: payload.password })
      toast.success('Đăng ký thành công')
      navigate('/login')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const api = (err as any).api as ApiResponseError | undefined
        if (api) {
          if (typeof api.errors === 'object' && api.errors !== null && !Array.isArray(api.errors)) {
            setErrors(api.errors as Record<string, string>)
          } else {
            setErrors({ _global: String(api.errors ?? api.message) })
          }
        } else {
          // Try to extract message from backend generic error payload (e.g. { statusCode, message, code })
          const respData = (err as any).response?.data
          if (respData) {
            // message may be a string or an object/array; normalize to string
            const beMessage =
              typeof respData.message === 'string' ? respData.message : JSON.stringify(respData.message ?? respData)
            setErrors({ _global: beMessage })
            toast.error(beMessage)
          } else {
            setErrors({ _global: err.message ?? 'Đăng ký thất bại' })
          }
        }
      } else {
        setErrors({ _global: String(err) })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen px-3'>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[500px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Register</h1>

          <form onSubmit={handleSubmit} className='w-full space-y-6'>
            <div className='w-full mb-6'>
              <InputCommon
                name='email'
                type='email'
                label='Email'
                showLabel={false}
                placeholder='Enter your email'
                isRequired
                error={errors?.email ?? null}
              />
            </div>
            <div className='w-full mb-6'>
              <InputCommon
                name='password'
                type='password'
                label='Password'
                showLabel={false}
                placeholder='Enter your password'
                isRequired
                error={errors?.password ?? null}
              />
            </div>

            <div className='w-full mb-6'>
              <InputCommon
                name='passwordConfirm'
                id='passwordConfirm'
                type='password'
                showLabel={false}
                label='Repeat password'
                placeholder='Enter repeat password'
                isRequired
                error={errors?.passwordConfirm ?? null}
              />
            </div>

            {errors?._global && <div className='text-sm text-center text-red-400 mb-2'>{errors._global}</div>}

            <button
              type='submit'
              className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'loading...' : 'Register'}
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
