import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { supabase } from '~/api/supabaseClient'
import { toast } from 'react-toastify'

export default function CheckEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  // email may be passed via navigate state from forgot-password
  const email = (location as any)?.state?.email as string | undefined

  async function handleResend() {
    if (!email) return
    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const resp = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (resp.error) {
        toast.error(resp.error.message ?? 'Resend failed')
        return
      }
      toast.success('Email đã được gửi lại. Vui lòng kiểm tra hộp thư.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Resend error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[300px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Check your email</h1>
          <p className='text-center text-[var(--secondary)] my-4'>
            Chúng tôi đã gửi link đặt lại mật khẩu tới địa chỉ email của bạn.{email ? <>{' '}Bạn: <strong>{email}</strong></> : null}
          </p>
          <div className='w-full gap-x-5 flex__middle'>
            <button onClick={() => navigate('/login')} className='w-full py-3 rounded-xl text-white font-semibold bg-[var(--primary)] '>
              Quay về đăng nhập
            </button>
            {email && (
              <button onClick={handleResend} disabled={loading} className='w-full py-3 rounded-xl text-white font-semibold bg-[var(--tertiary)] disabled:opacity-60 '>
                {loading ? 'Đang gửi lại...' : 'Gửi lại email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
