import { AppSidebar } from "~/components/app-sidebar"
import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { useAuth } from '~/context/auth'

export default function DashboardLayout() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !session) {
      const from = `${location.pathname}${location.search}${location.hash}`
      navigate('/login', { replace: true, state: { from } })
    }
  }, [loading, session, navigate, location])

  if (loading) return <div className='p-6'>Đang kiểm tra phiên...</div>

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* child pages render here */}
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}













// import React, { useEffect } from 'react'
// import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
// import { useAuth } from '~/context/auth'

// export default function DashboardLayout() {
//   const { session, loading, signOut } = useAuth()
//   const navigate = useNavigate()

//   const location = useLocation()
//   useEffect(() => {
//     if (!loading && !session) {
//       const from = `${location.pathname}${location.search}${location.hash}`
//       navigate('/login', { replace: true, state: { from } })
//     }
//   }, [loading, session, navigate, location])

//   if (loading) return <div className='p-6'>Đang kiểm tra phiên...</div>

//   return (
//     <div className='min-h-screen bg-slate-50 text-black'>
//       <header className='flex items-center justify-between p-4 shadow-sm bg-white'>
//         <div className='flex items-center gap-4'>
//           <h2 className='text-lg font-semibold'>My Dashboard</h2>
//           <nav className='space-x-3'>
//             <NavLink to='/' end className={({isActive})=> isActive ? 'font-bold' : ''}>Overview</NavLink>
//             <NavLink to='settings' className={({isActive})=> isActive ? 'font-bold' : ''}>Settings</NavLink>
//           </nav>
//         </div>
//         <div className='flex items-center gap-4'>
//           <button onClick={async ()=>{ await signOut(); navigate('/login') }} className='px-3 py-1 bg-red-500 text-white rounded'>Sign out</button>
//         </div>
//       </header>

//       <main className='p-6'>
//         <Outlet />
//       </main>
//     </div>
//   )
// }
