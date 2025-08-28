import React, { useRef } from 'react'
import { NavLink } from 'react-router'

export default function Login() {
  const formRef = useRef<HTMLFormElement>(null)

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // const form = formRef.current;
    // if (!form) return;
    // const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    // const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    // const button = form.querySelector("button[type='submit']") as HTMLButtonElement;
    // if (email && password && button) {
    //   const originalText = button.textContent;
    //   button.textContent = "Đang đăng nhập...";
    //   button.disabled = true;
    //   setTimeout(() => {
    //     alert("Đăng nhập thành công! (Demo)");
    //     button.textContent = originalText;
    //     button.disabled = false;
    //   }, 2000);
    // }
  }

  return (
    <div className='bg-[var(--primary)]/60 h-screen '>
      <div className='flex__middle h-full w-full max-w-md mx-auto py-10'>
        <div className='w-full h-full max-h-[500px] border border-gray-300 rounded-2xl bg-[var(--quinary)] py-8 px-3 flex__between flex-col'>
          <h1 className='text-center font-semibold uppercase text-[var(--primary)]'>Login</h1>
          <form ref={formRef} onSubmit={handleSubmit} className='w-full'>
            <div className='input-group relative mb-6'>
              <input
                type='email'
                name='email'
                className='input-field w-full py-4 px-5 bg-white bg-opacity-10 border-2 border-white border-opacity-20 rounded-xl text-gray-800 text-base transition-all duration-300 backdrop-blur-md focus:outline-none focus:border-[var(--tertiary)] focus:bg-white focus:bg-opacity-20 focus:translate-y-[-2px] focus:shadow-lg placeholder:text-gray-600 placeholder:text-opacity-70'
                placeholder='Enter your email'
                required
              />
            </div>
            <div className='input-group relative mb-6'>
              <input
                type='password'
                name='password'
                className='input-field w-full py-4 px-5 bg-white bg-opacity-10 border-2 border-white border-opacity-20 rounded-xl text-gray-800 text-base transition-all duration-300 backdrop-blur-md focus:outline-none focus:border-[var(--tertiary)] focus:bg-white focus:bg-opacity-20 focus:translate-y-[-2px] focus:shadow-lg placeholder:text-gray-600 placeholder:text-opacity-70'
                placeholder='Enter your password'
                required
              />
            </div>
            <button
              type='submit'
              className='login-btn w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--tertiary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'
            >
              Login
            </button>
            <a
              href='#'
              className='text-[var(--secondary)] hover:text-[var(--tertiary)] transition-colors mt-3 block text-center'
            >
              Forgot password?
            </a>
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
