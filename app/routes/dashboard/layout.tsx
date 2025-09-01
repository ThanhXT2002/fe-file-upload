import React, { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '~/context/auth'

export default function DashboardLayout() {
  const { session, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) navigate('/login', { replace: true })
  }, [loading, session, navigate])

  if (loading) return <div className='p-6'>Đang kiểm tra phiên...</div>

  return (
    <div className='min-h-screen bg-slate-50 text-black'>
      <header className='flex items-center justify-between p-4 shadow-sm bg-white'>
        <div className='flex items-center gap-4'>
          <h2 className='text-lg font-semibold'>My Dashboard</h2>
          <nav className='space-x-3'>
            <NavLink to='/' end className={({isActive})=> isActive ? 'font-bold' : ''}>Overview</NavLink>
            <NavLink to='settings' className={({isActive})=> isActive ? 'font-bold' : ''}>Settings</NavLink>
          </nav>
        </div>
        <div className='flex items-center gap-4'>
          <button onClick={async ()=>{ await signOut(); navigate('/login') }} className='px-3 py-1 bg-red-500 text-white rounded'>Sign out</button>
        </div>
      </header>

      <main className='p-6'>
        <Outlet />
      </main>
    </div>
  )
}
