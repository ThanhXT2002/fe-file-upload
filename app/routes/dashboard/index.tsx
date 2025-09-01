// Export handle for route title
export const handle = {
  name: 'Dashboard'
}

import { ChartAreaInteractive } from '~/components/chart-area-interactive'
import { SectionCards } from '~/components/section-cards'
import { PermissionGuard, UserRoleBadge } from '~/components/permission-guard'
import { usePermissions } from '~/hooks/use-permissions'

export default function DashboardIndex() {
  const { userProfile } = usePermissions()

  return (
    <div>
      <div className='px-4 lg:px-6 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Welcome, {userProfile?.name || userProfile?.email}</h1>
            <p className='text-muted-foreground'>This is your dashboard</p>
          </div>
          <UserRoleBadge />
        </div>
      </div>

      <SectionCards />

      <div className='px-4 lg:px-6 mt-5'>
        <ChartAreaInteractive />
      </div>

      {/* Admin-only content */}
      <PermissionGuard role='ADMIN'>
        <div className='px-4 lg:px-6 mt-5'>
          <div className='bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800'>
            <h3 className='text-lg font-semibold text-red-800 dark:text-red-200'>Admin Panel</h3>
            <p className='text-red-600 dark:text-red-300'>Only Admins can see this content</p>
          </div>
        </div>
      </PermissionGuard>

      {/* Editor-only content */}
      <PermissionGuard role='EDITOR'>
        <div className='px-4 lg:px-6 mt-5'>
          <div className='bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
            <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-200'>Editor Tools</h3>
            <p className='text-blue-600 dark:text-blue-300'>Only Editors and Admins can see this content</p>
          </div>
        </div>
      </PermissionGuard>

      {/* Permission-based content */}
      <PermissionGuard permission='WRITE'>
        <div className='px-4 lg:px-6 mt-5'>
          <div className='bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800'>
            <h3 className='text-lg font-semibold text-green-800 dark:text-green-200'>Write Access</h3>
            <p className='text-green-600 dark:text-green-300'>You have permission to edit content</p>
          </div>
        </div>
      </PermissionGuard>
    </div>
  )
}
