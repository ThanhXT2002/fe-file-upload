import axiosClient from './axiosClient'

export interface User {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'EDITOR' | 'USER'
  active: boolean
  createdAt: string
  avatarUrl?: string
  key?: string
}

export interface UserStatistics {
  total: number
  active: number
  inactive: number
  recent: number
  byRole: {
    admin: number
    editor: number
    user: number
    other: number
  }
}

export interface UsersResponse {
  users: User[]
  statistics: {
    total: number
    active: number
    inactive: number
  }
}

export interface SearchUsersResponse {
  users: User[]
  count: number
  query: string
}

export interface UsersByRoleResponse {
  users: User[]
  count: number
  role: string
}

export const userService = {
  // Get all users with statistics
  async getAllUsers(): Promise<UsersResponse> {
    const response = await axiosClient.get('/users')
    // Backend trả về response.data trực tiếp, không có response.data.data
    return response.data
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await axiosClient.get(`/users/${id}`)
    return response.data
  },

  // Update user
  async updateUser(
    id: string,
    data: {
      name?: string
      role?: string
      active?: boolean
    }
  ): Promise<User> {
    const response = await axiosClient.put(`/users/${id}`, data)
    return response.data
  },

  // Deactivate user (soft delete)
  async deactivateUser(id: string): Promise<{ message: string }> {
    const response = await axiosClient.put(`/users/${id}/deactivate`)
    return response.data
  },

  // Activate user
  async activateUser(id: string): Promise<User> {
    const response = await axiosClient.put(`/users/${id}/activate`)
    return response.data
  },

  // Delete user permanently
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/users/${id}`)
    return response.data
  },

  // Search users
  async searchUsers(query: string): Promise<SearchUsersResponse> {
    const response = await axiosClient.get(`/users/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<UsersByRoleResponse> {
    const response = await axiosClient.get(`/users/role/${role}`)
    return response.data
  },

  // Get user statistics
  async getUserStatistics(): Promise<UserStatistics> {
    const response = await axiosClient.get('/users/statistics')
    return response.data
  }
}
