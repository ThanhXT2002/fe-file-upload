import { useAuth } from '~/context/auth'

type Permission = 'READ' | 'WRITE' | 'DELETE' | 'ADMIN'

// Define role permissions
const ROLE_PERMISSIONS = {
  ADMIN: ['READ', 'WRITE', 'DELETE', 'ADMIN'] as Permission[],
  EDITOR: ['READ', 'WRITE'] as Permission[],
  USER: ['READ'] as Permission[]
} as const

export function usePermissions() {
  const { userProfile } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile?.role) return false
    
    const userPermissions = ROLE_PERMISSIONS[userProfile.role] || []
    return userPermissions.includes(permission)
  }

  const hasRole = (role: 'ADMIN' | 'USER' | 'EDITOR'): boolean => {
    return userProfile?.role === role
  }

  const isAdmin = (): boolean => hasRole('ADMIN')
  const isEditor = (): boolean => hasRole('EDITOR') 
  const isUser = (): boolean => hasRole('USER')

  const canRead = (): boolean => hasPermission('READ')
  const canWrite = (): boolean => hasPermission('WRITE')
  const canDelete = (): boolean => hasPermission('DELETE')
  const canAdmin = (): boolean => hasPermission('ADMIN')

  return {
    userProfile,
    hasPermission,
    hasRole,
    isAdmin,
    isEditor,
    isUser,
    canRead,
    canWrite,
    canDelete,
    canAdmin
  }
}
