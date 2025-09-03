import axiosClient from './axiosClient'
import { apiKeyManager } from './apiKeyManager'

// Types for File API
export interface FileData {
  id: string
  userId: string
  originalName: string
  fileName: string
  folderName: string
  fileType: string
  mimeType: string
  size: number
  url: string
  publicId: string
  cloudinaryFolder: string
  uploadedAt: string
  updatedAt: string
}

export interface UploadResult {
  success: FileData[]
  failed: Array<{
    fileName: string
    error: string
  }>
}

export interface FileListResponse {
  files: FileData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface BrowseFolderResponse {
  currentPath: string
  files: FileData[]
  subfolders: string[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StorageStats {
  totalFiles: number
  totalSize: number
  folderBreakdown: Array<{
    folderName: string
    fileCount: number
    totalSize: number
  }>
}

export interface FoldersResponse {
  folders: string[]
}

// File Service Class
export class FileService {
  // Ensure API key is available before making requests
  private async ensureApiKey(): Promise<void> {
    if (!apiKeyManager.hasKey()) {
      const key = await apiKeyManager.ensureKey()
      if (!key) {
        throw new Error('API key is required but not available. Please login first.')
      }
    }
  }

  // Upload multiple files
  async uploadFiles(files: File[], folderName?: string): Promise<UploadResult> {
    await this.ensureApiKey()

    const formData = new FormData()

    // Add files to FormData
    files.forEach((file) => {
      formData.append('files', file)
    })

    // Add folder name if provided
    if (folderName) {
      formData.append('folderName', folderName)
    }

    const response = await axiosClient.post<UploadResult>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000 // 5 minutes for large file uploads
    })

    return response.data
  }

  // Get user files with pagination and filtering
  async getUserFiles(params?: { folder?: string; page?: number; limit?: number }): Promise<FileListResponse> {
    await this.ensureApiKey()

    const queryParams = new URLSearchParams()

    if (params?.folder) queryParams.append('folder', params.folder)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await axiosClient.get<FileListResponse>(`/files?${queryParams.toString()}`)

    return response.data
  }

  // Browse folder contents (new endpoint)
  async browseFolderContents(params?: { path?: string; page?: number; limit?: number }): Promise<BrowseFolderResponse> {
    await this.ensureApiKey()

    const queryParams = new URLSearchParams()

    if (params?.path) queryParams.append('path', params.path)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await axiosClient.get<BrowseFolderResponse>(`/files/browse?${queryParams.toString()}`)

    return response.data
  }

  // Get user folders list
  async getUserFolders(): Promise<FoldersResponse> {
    await this.ensureApiKey()

    const response = await axiosClient.get<FoldersResponse>('/files/folders')
    return response.data
  }

  // Get storage statistics
  async getStorageStats(): Promise<StorageStats> {
    await this.ensureApiKey()

    const response = await axiosClient.get<StorageStats>('/files/stats')
    return response.data
  }

  // Get file by ID
  async getFileById(fileId: string): Promise<FileData> {
    await this.ensureApiKey()

    const response = await axiosClient.get<FileData>(`/files/${fileId}`)
    return response.data
  }

  // Update file (rename)
  async updateFile(fileId: string, updateData: { originalName?: string }): Promise<FileData> {
    await this.ensureApiKey()

    const response = await axiosClient.put<FileData>(`/files/${fileId}`, updateData)
    return response.data
  }

  // Delete file
  async deleteFile(fileId: string): Promise<{ message: string }> {
    await this.ensureApiKey()

    const response = await axiosClient.delete<{ message: string }>(`/files/${fileId}`)
    return response.data
  }

  // Utility methods for frontend

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file type icon/category
  static getFileCategory(mimeType: string): string {
    const type = mimeType.toLowerCase()

    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document'
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'archive'

    return 'file'
  }

  // Check if file type is supported for preview
  static canPreview(mimeType: string): boolean {
    const previewableTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]

    return previewableTypes.includes(mimeType.toLowerCase())
  }

  // Validate file before upload
  static validateFile(file: File, maxSize?: number): string | null {
    // Default max sizes (match backend)
    const defaultSizes = {
      image: 50 * 1024 * 1024, // 50MB
      document: 250 * 1024 * 1024, // 250MB
      video: 200 * 1024 * 1024, // 200MB
      audio: 200 * 1024 * 1024, // 200MB
      archive: 500 * 1024 * 1024, // 500MB
      default: 500 * 1024 * 1024 // 500MB
    }

    const category = this.getFileCategory(file.type)
    const sizeLimit = maxSize || defaultSizes[category as keyof typeof defaultSizes] || defaultSizes.default

    if (file.size > sizeLimit) {
      return `File "${file.name}" is too large: ${this.formatFileSize(file.size)}. Maximum allowed: ${this.formatFileSize(sizeLimit)}`
    }

    return null
  }

  // Batch validate files
  static validateFiles(files: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } {
    const valid: File[] = []
    const invalid: Array<{ file: File; error: string }> = []

    files.forEach((file) => {
      const error = this.validateFile(file)
      if (error) {
        invalid.push({ file, error })
      } else {
        valid.push(file)
      }
    })

    return { valid, invalid }
  }
}

// Export singleton instance
export const fileService = new FileService()
export default fileService
