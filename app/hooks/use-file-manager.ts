import { useState, useCallback, useRef } from 'react'
import { fileService, FileService, type BrowseFolderResponse, type UploadResult } from '~/api/fileService'
import { useApiKey } from './use-api-key'

export function useFileManager() {
  const [folderContents, setFolderContents] = useState<BrowseFolderResponse | null>(null)
  const [currentPath, setCurrentPath] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const apiKey = useApiKey()
  const apiKeyRef = useRef(apiKey)
  apiKeyRef.current = apiKey

  // Load folder contents
  const loadFolderContents = useCallback(async (path: string = '', page: number = 1, limit: number = 20) => {
    setLoading(true)
    try {
  // Ensure API key is available. Race against a short timeout to avoid indefinite hang
  // if apiKey initialization stalls (e.g., due to visibility/refresh issues).
  const ensureKeyPromise = apiKeyRef.current.ensureKey()
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('ensureKey timeout')), 3000))
  await Promise.race([ensureKeyPromise, timeout])

      const contents = await fileService.browseFolderContents({
        path: path || undefined,
        page,
        limit
      })
      setFolderContents(contents)
      setCurrentPath(path)
      setCurrentPage(page)
      return contents
    } catch (error) {
      console.error('Failed to load folder contents:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency để tránh infinite loop

  // Load more files (append to existing)
  const loadMoreFiles = useCallback(async () => {
    if (!folderContents || loadingMore) return

    const nextPage = currentPage + 1
    setLoadingMore(true)

    try {
  // Ensure API key is available with a timeout guard
  const ensureKeyPromise = apiKeyRef.current.ensureKey()
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('ensureKey timeout')), 5000))
  await Promise.race([ensureKeyPromise, timeout])

      const moreContents = await fileService.browseFolderContents({
        path: currentPath || undefined,
        page: nextPage,
        limit: 20
      })

      // Append new files to existing ones
      setFolderContents((prev) =>
        prev
          ? {
              ...moreContents,
              files: [...prev.files, ...moreContents.files]
            }
          : moreContents
      )

      setCurrentPage(nextPage)
      return moreContents
    } catch (error) {
      console.error('Failed to load more files:', error)
      throw error
    } finally {
      setLoadingMore(false)
    }
  }, [folderContents, currentPage, currentPath, loadingMore])

  // Check if there are more files to load
  const hasMoreFiles = folderContents ? folderContents.pagination.page < folderContents.pagination.totalPages : false

  // Navigate to folder
  const navigateToFolder = useCallback(
    (folderName: string) => {
      const newPath = currentPath ? `${currentPath}/${folderName}` : folderName
      setCurrentPage(1) // Reset page when navigating
      return loadFolderContents(newPath, 1)
    },
    [currentPath, loadFolderContents]
  )

  // Go back to parent folder
  const goBack = useCallback(() => {
    const pathParts = currentPath.split('/').filter(Boolean)
    pathParts.pop()
    const parentPath = pathParts.join('/')
    setCurrentPage(1) // Reset page when going back
    return loadFolderContents(parentPath, 1)
  }, [currentPath, loadFolderContents])

  // Upload files
  const uploadFiles = useCallback(
    async (files: File[], folderName?: string): Promise<UploadResult> => {
      setUploading(true)
      try {
        // Validate files first
        const validation = FileService.validateFiles(files)

        if (validation.invalid.length > 0) {
          const errorMessage = validation.invalid.map((v) => v.error).join('\n')
          throw new Error(`Some files are invalid:\n${errorMessage}`)
        }

        // Upload valid files
        const result = await fileService.uploadFiles(validation.valid, folderName)

        // Reload current folder after successful upload
        if (result.success.length > 0) {
          setCurrentPage(1) // Reset to first page
          await loadFolderContents(currentPath, 1)
        }

        return result
      } catch (error) {
        console.error(' Upload failed:', error)
        throw error
      } finally {
        setUploading(false)
      }
    },
    [currentPath, loadFolderContents]
  )

  // Delete file (optimistic local update)
  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        // Call delete API
        await fileService.deleteFile(fileId)

        // Optimistically update local folderContents to remove the deleted file
        setFolderContents((prev) => {
          if (!prev) return prev
          const newFiles = prev.files.filter((f) => f.id !== fileId)
          const newPagination = {
            ...prev.pagination,
            total: Math.max(0, prev.pagination.total - 1)
          }
          return {
            ...prev,
            files: newFiles,
            pagination: newPagination
          }
        })

        return true
      } catch (error) {
        console.error(' Delete failed:', error)
        throw error
      }
    },
    []
  )

  // Rename file
  const renameFile = useCallback(
    async (fileId: string, newName: string) => {
      try {
        await fileService.updateFile(fileId, { originalName: newName })
        // Reload current folder
        setCurrentPage(1) // Reset to first page
        await loadFolderContents(currentPath, 1)
        return true
      } catch (error) {
        console.error(' Rename failed:', error)
        throw error
      }
    },
    [currentPath, loadFolderContents]
  )

  // Get breadcrumb path
  const getBreadcrumbs = useCallback(() => {
    if (!currentPath) return []
    return currentPath.split('/').filter(Boolean)
  }, [currentPath])

  // Simple object return (không dùng useMemo để tránh phức tạp)
  return {
    // State
    folderContents,
    currentPath,
    loading,
    uploading,
    loadingMore,
    hasMoreFiles,

    // API Key state
    apiKeyReady: apiKey.hasKey,
    apiKeyLoading: apiKey.isLoading,
    apiKeyError: apiKey.error,

    // Actions
    loadFolderContents,
    loadMoreFiles,
    navigateToFolder,
    goBack,
    uploadFiles,
    deleteFile,
    renameFile,
    initializeApiKey: apiKey.initialize,

    // Helpers
    getBreadcrumbs,

    // Utils
    formatFileSize: FileService.formatFileSize,
    getFileCategory: FileService.getFileCategory,
    canPreview: FileService.canPreview,
    validateFile: FileService.validateFile
  }
}
