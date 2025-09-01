import React from 'react'
import { usePermissions } from '~/hooks/use-permissions'
import { Badge } from '~/components/ui/badge'

export function UserRoleBadge() {
  const { userProfile } = usePermissions()

  if (!userProfile?.role) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return <Badge className={getRoleColor(userProfile.role)}>{userProfile.role}</Badge>
}

// Component để kiểm tra và hiển thị UI dựa trên quyền
interface PermissionGuardProps {
  permission?: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN'
  role?: 'ADMIN' | 'USER' | 'EDITOR'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, role, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermissions()

  const hasAccess = () => {
    if (permission && !hasPermission(permission)) return false
    if (role && !hasRole(role)) return false
    return true
  }

  return hasAccess() ? <>{children}</> : <>{fallback}</>
}
