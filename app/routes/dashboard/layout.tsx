import { AppSidebar } from '~/components/app-sidebar'
import { SiteHeader } from '~/components/site-header'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { useAuth } from '~/context/auth'

export default function DashboardLayout() {
  const { session, loading, userProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !session) {
      const from = `${location.pathname}${location.search}${location.hash}`
      navigate('/login', { replace: true, state: { from } })
    }
  }, [loading, session, navigate, location])

  if (loading) return <div className='p-6'>Checking session...</div>

  // Show loading if user profile is not loaded yet
  if (session && !userProfile) {
    return <div className='p-6'>Loading user profile...</div>
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              {/* child pages render here */}
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
