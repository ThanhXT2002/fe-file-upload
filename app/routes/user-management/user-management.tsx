import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { userService, type User } from '~/api/userService'

// Export handle for route title
export const handle = {
  name: 'User Management'
}

import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { 
  IconTrash, 
  IconSearch
} from '@tabler/icons-react'
import { PermissionGuard } from '~/components/permission-guard'
import { useAuth } from '~/context/auth'

function UserManager() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Load users and statistics
  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await userService.getAllUsers()
      
      if (!usersData || !usersData.users) {
        throw new Error('Invalid response structure: users data not found')
      }
      
      setUsers(usersData.users)
      
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadUsers()
  }, [])

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await userService.deleteUser(userId)
      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Error deleting user:', error)
    }
  }

  // Handle search users
  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      loadUsers() // Reset to all users
      return
    }

    try {
      setLoading(true)
      const searchResult = await userService.searchUsers(query)
      setUsers(searchResult.users)
    } catch (error) {
      toast.error('Search failed')
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter by role
  const handleRoleFilter = async (role: string) => {
    if (role === 'all') {
      loadUsers()
      return
    }

    try {
      setLoading(true)
      const roleResult = await userService.getUsersByRole(role)
      setUsers(roleResult.users)
    } catch (error) {
      toast.error('Failed to filter users by role')
      console.error('Error filtering users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle toggle user status
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.updateUser(userId, { active: !currentStatus })
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, active: !currentStatus } : user
      ))
      toast.success('User status updated successfully')
    } catch (error) {
      toast.error('Failed to update user status')
      console.error('Update error:', error)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading users...</div>
          <div className="text-sm text-muted-foreground">Please wait a moment</div>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard role="ADMIN">
      <div className="container mx-auto space-y-6 max-w-7xl px-3">

        {/* Search and Filters */}
        <Card>
          <CardContent className="">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by email, name, or role..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      if (e.target.value.length >= 2) {
                        handleSearch(e.target.value)
                      } else if (e.target.value.length === 0) {
                        loadUsers()
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <Select value={roleFilter} onValueChange={(value) => {
                  setRoleFilter(value)
                  handleRoleFilter(value)
                }}>
                  <SelectTrigger id="role-filter" className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={loadUsers} disabled={loading}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <div className='rounded-lg overflow-hidden'>
           <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">User</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Created</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <div className="text-lg font-medium text-gray-700">No users found</div>
                        <div className="text-sm text-gray-500">
                          {searchTerm ? 'Try adjusting your search criteria' : 'No users available'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                        <td className="py-3 px-6 text-left">
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-800">{user.name || 'No name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left">
                           {user.role}
                        </td>
                        <td className="py-3 px-6 text-left">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              className="peer sr-only opacity-0" 
                              id={`toggle-${user.id}`}
                              checked={user.active}
                              onChange={() => handleToggleStatus(user.id, user.active)}
                              disabled={user.id === userProfile?.id}
                            />
                            <label 
                              htmlFor={`toggle-${user.id}`} 
                              className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 outline-gray-400 transition-colors before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform before:duration-300 peer-checked:bg-green-500 peer-checked:before:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-400 peer-checked:peer-focus-visible:outline-green-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                            >
                            </label>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left text-gray-700">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === userProfile?.id}
                            title="Delete user"
                            className="w-8 h-8 p-1 transform hover:text-red-500 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IconTrash className="h-full w-full" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>

      </div>
    </PermissionGuard>
  )
}

export default UserManager
