import { useState, useEffect, useRef } from 'react'
import { useFileManager } from '~/hooks/use-file-manager'
import {
  FiFolder,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiArchive,
  FiEye,
  FiTrash2,
  FiUpload,
  FiHome,
  FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
  FiMoreVertical,
  FiDownload,
  FiX
} from 'react-icons/fi'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '~/components/ui/dialog'
import { toast } from 'sonner'

export const handle = {
  name: 'My Files'
}

function MyFiles() {
  const fileManager = useFileManager()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteFileInfo, setDeleteFileInfo] = useState<{ id: string; name: string } | null>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const isInitialized = useRef(false)

  // Load initial contents on mount - chỉ chạy 1 lần
  useEffect(() => {
    if (isInitialized.current) return

    const initializeAndLoad = async () => {
      try {
        isInitialized.current = true
        // First ensure API key is available
        if (!fileManager.apiKeyReady) {
          await fileManager.initializeApiKey()
        }
        // Then load folder contents
        await fileManager.loadFolderContents('', 1)
      } catch (error) {
        console.error('❌ Failed to initialize:', error)
        isInitialized.current = false // Reset on error để có thể retry
      }
    }

    initializeAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty dependency để chỉ chạy 1 lần

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      const result = await fileManager.uploadFiles(selectedFiles, fileManager.currentPath || undefined)

      if (result.failed.length > 0) {
        toast.error(`Some uploads failed`, {
          description: result.failed.map((f) => `${f.fileName}: ${f.error}`).join('\n')
        })
      }

      if (result.success.length > 0) {
        toast.success(`Successfully uploaded ${result.success.length} files!`)
        setSelectedFiles([])
        setShowUploadModal(false) // Close modal after successful upload
      }
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message || 'Please try again.'
      })
    }
  }

  // Handle file delete
  const handleDelete = async (fileId: string, fileName: string) => {
    // remember currently focused element so we can restore focus after dialog closes
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    setDeleteFileInfo({ id: fileId, name: fileName })
    setDialogOpen(true)
  }

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!deleteFileInfo) return

    try {
      // close the dialog first to let Radix animate out
  setDialogOpen(false)
  // give Radix a short moment to finish its close animation and cleanup
  await new Promise((res) => setTimeout(res, 150))
  await fileManager.deleteFile(deleteFileInfo.id)
      toast.success('File deleted successfully!')
    } catch {
      toast.error('Failed to delete file. Please try again.')
    }
  }

  return (
    <div className='min-h-screen  px-3 '>
      <div className='w-full mx-auto space-y-4 md:space-y-6'>
        {/* Page Header */}
        <nav className='flex items-center space-x-2 text-sm  overflow-x-auto'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => fileManager.loadFolderContents('')}
            className='h-7 sm:h-8 px-2 text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--quinary)] whitespace-nowrap cursor-pointer'
          >
            <FiHome className='w-4 h-4 mr-1 mb-1' />
            <span className=''>Home</span>
          </Button>
          {fileManager.getBreadcrumbs().map((folder, index, arr) => {
            const path = arr.slice(0, index + 1).join('/')
            return (
              <div key={index} className='flex items-center'>
                <FiChevronRight className='w-2 h-2 sm:w-3 sm:h-3 mx-1 text-gray-400' />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => fileManager.loadFolderContents(path)}
                  className='h-7 sm:h-8 px-2 text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--quinary)] whitespace-nowrap max-w-24 sm:max-w-none cursor-pointer'
                >
                  <span className='truncate'>{folder}</span>
                </Button>
              </div>
            )
          })}
        </nav>

        {/* Upload Button - Fixed Position */}
        <div className='fixed bg-[var(--senary)] border border-primary w-10  aspect-square bottom-1 md:bottom-3 right-4 md:right-10 rounded-full z-50 '>
          <button className='w-full h-full flex__middle' onClick={() => setShowUploadModal(true)}>
            <FiUpload className='w-5 h-5 text-primary' />
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 h-screen'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
              <div className='flex items-center justify-between p-4 border-b'>
                <h3 className='text-lg font-semibold text-[var(--primary)]'>Upload Files</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <FiX className='w-5 h-5' />
                </button>
              </div>

              <div className='p-4 space-y-4'>
                <div className='space-y-3'>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className='w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--secondary)] file:text-white hover:file:bg-[var(--primary)] file:cursor-pointer'
                    disabled={fileManager.uploading}
                  />

                  {selectedFiles.length > 0 && (
                    <div className='bg-[var(--quinary)] p-3 rounded-md mt-2'>
                      <div className='flex items-start space-x-2 text-sm text-gray-600'>
                        <FiFile className='w-4 h-4 text-[var(--secondary)] mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='font-medium mb-1'>Selected files:</p>
                          <p className='break-all'>
                            {selectedFiles
                              .slice(0, 3)
                              .map((f) => f.name)
                              .join(', ')}
                            {selectedFiles.length > 3 && ` and ${selectedFiles.length - 3} more...`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex justify-end !space-x-3'>
                  <Button variant='outline' onClick={() => setShowUploadModal(false)} disabled={fileManager.uploading}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || fileManager.uploading}
                    className='bg-[var(--secondary)] hover:bg-[var(--primary)] text-white'
                  >
                    {fileManager.uploading ? (
                      <div className='flex items-center space-x-2'>
                        <FiRefreshCw className='w-4 h-4 animate-spin' />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <span>
                        Upload {selectedFiles.length || ''} file{selectedFiles.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(fileManager.loading || fileManager.apiKeyLoading) && (
          <Card className='border-[var(--quaternary)] bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6 sm:p-8'>
              <div className='flex flex-col items-center space-y-3 sm:space-y-4'>
                <FiRefreshCw className='w-6 h-6 sm:w-8 sm:h-8 text-[var(--secondary)] animate-spin' />
                <p className='text-sm sm:text-base text-gray-600'>
                  {fileManager.apiKeyLoading ? 'Initializing...' : 'Loading...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Key Error */}
        {fileManager.apiKeyError && (
          <Card className='border-red-200 bg-red-50/80 backdrop-blur-sm'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-start space-x-3'>
                <FiAlertCircle className='w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-red-800 mb-1 text-sm sm:text-base'>API Key Error</h3>
                  <p className='text-red-700 text-xs sm:text-sm mb-3 break-words'>{fileManager.apiKeyError}</p>
                  <Button
                    onClick={() => fileManager.initializeApiKey()}
                    size='sm'
                    className='bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm'
                  >
                    <FiRefreshCw className='w-3 h-3 mr-1' />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Folder Contents */}
        {!fileManager.loading &&
          !fileManager.apiKeyLoading &&
          fileManager.apiKeyReady &&
          fileManager.folderContents && (
            <div className='space-y-4 md:space-y-6'>
              {/* Subfolders */}
              {fileManager.folderContents.subfolders.length > 0 && (
                <div className=''>
                  <span className='text-primary font-bold text-sm'>
                    Folders ({fileManager.folderContents.subfolders.length})
                  </span>
                  <div className='mt-2 grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))]  gap-2'>
                    {fileManager.folderContents.subfolders.map((folder) => (
                      <Button
                        key={folder}
                        variant='outline'
                        onClick={() => fileManager.navigateToFolder(folder)}
                        className='w-full h-auto p-2 flex flex-col items-center space-y-2 hover:bg-[var(--quinary)] hover:border-[var(--secondary)] border-[var(--quaternary)] transition-all duration-200 max-h-[90px] max-w-[90px] aspect-square cursor-pointer'
                      >
                        <FiFolder className='text-[var(--secondary)]' />
                        <span className='text-sm font-medium text-center truncate w-full leading-tight' title={folder}>
                          {folder}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {fileManager.folderContents.files.length > 0 && (
                <div>
                  <span className='text-primary font-bold text-sm'>
                    Files ({fileManager.folderContents.pagination.total})
                  </span>

                  <div className='content'>
                    {(() => {
                      // Separate images from other files
                      const imageFiles = fileManager.folderContents.files.filter(
                        (file) => fileManager.getFileCategory(file.mimeType) === 'image'
                      )
                      const otherFiles = fileManager.folderContents.files.filter(
                        (file) => fileManager.getFileCategory(file.mimeType) !== 'image'
                      )

                      return (
                        <div className='space-y-6'>
                          {/* Image Gallery*/}
                          {imageFiles.length > 0 && (
                            <div>
                              <h4 className='flex items-center space-x-2 font-semibold text-[var(--primary)] my-2 text-sm ml-3'>
                                <FiImage className='w-4 h-4' />
                                <span>Images ({imageFiles.length})</span>
                              </h4>

                              {/* Individual image cards with dropdown menus - fallback for interaction */}
                              <div className='mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2'>
                                {imageFiles.map((file) => (
                                  <div
                                    key={`card-${file.id}`}
                                    className='relative group rounded-sm overflow-hidden bg-gray-50 border-8 border-gray-200 hover:border-gray-300 transition-colors max-w-[120px]'
                                  >
                                    <div className='aspect-square  relative'>
                                      <img
                                        src={file.url}
                                        alt={file.originalName}
                                        className='w-full h-full   object-cover'
                                        loading='lazy'
                                      />

                                      {/* Dropdown Menu */}
                                      <div className='absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity '>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              size='sm'
                                              variant='secondary'
                                              className='h-7 w-7 p-0 bg-white/90 hover:bg-white border border-gray-200 shadow-sm rounded-full cursor-pointer'
                                            >
                                              <FiMoreVertical className='w-4 h-4' />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align='end' className='w-40'>
                                            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                              <FiEye className='w-4 h-4 mr-2' />
                                              View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                              <FiDownload className='w-4 h-4 mr-2' />
                                              Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              className='text-red-600 focus:text-red-600'
                                              onClick={() => handleDelete(file.id, file.originalName)}
                                            >
                                              <FiTrash2 className='w-4 h-4 mr-2' />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>

                                      {/* File info overlay */}
                                      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <p className='text-white text-xs font-medium truncate'>{file.originalName}</p>
                                        <p className='text-white/80 text-xs'>{fileManager.formatFileSize(file.size)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Other Files List */}
                          {otherFiles.length > 0 && (
                            <div>
                              <h4 className='flex items-center space-x-2 font-semibold text-[var(--primary)] my-2 text-sm ml-3'>
                                <FiFile className='w-4 h-4' />
                                <span>Documents & Others ({otherFiles.length})</span>
                              </h4>

                              {/* Other files grid similar to images */}
                              <div className='mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2'>
                                {otherFiles.map((file) => {
                                  const category = fileManager.getFileCategory(file.mimeType)
                                  const iconMap = {
                                    video: FiVideo,
                                    audio: FiMusic,
                                    document: FiFileText,
                                    archive: FiArchive,
                                    file: FiFile
                                  }

                                  const IconComponent = iconMap[category as keyof typeof iconMap] || FiFile

                                  return (
                                    <div
                                      key={`card-${file.id}`}
                                      className='relative group rounded-sm overflow-hidden bg-gray-50 border-8 border-gray-200 hover:border-gray-300 transition-colors max-w-[120px]'
                                    >
                                      <div className='aspect-square relative flex flex-col items-center justify-center p-3'>
                                        <IconComponent className='w-8 h-8 text-[var(--secondary)] mb-2' />
                                        <span
                                          className='text-xs font-medium text-center text-[var(--primary)] truncate w-full leading-tight'
                                          title={file.originalName}
                                        >
                                          {file.originalName}
                                        </span>

                                        {/* Dropdown Menu */}
                                        <div className='absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                size='sm'
                                                variant='secondary'
                                                className='h-7 w-7 p-0 bg-white/90 hover:bg-white border border-gray-200 shadow-sm rounded-full cursor-pointer'
                                              >
                                                <FiMoreVertical className='w-4 h-4' />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end' className='w-40'>
                                              <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                                <FiEye className='w-4 h-4 mr-2' />
                                                View
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                                <FiDownload className='w-4 h-4 mr-2' />
                                                Download
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className='text-red-600 focus:text-red-600'
                                                onClick={() => handleDelete(file.id, file.originalName)}
                                              >
                                                <FiTrash2 className='w-4 h-4 mr-2' />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>

                                        {/* File info overlay */}
                                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                          <p className='text-white text-xs font-medium truncate'>{file.originalName}</p>
                                          <p className='text-white/80 text-xs'>
                                            {fileManager.formatFileSize(file.size)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Load More Button */}
                    {fileManager.hasMoreFiles && (
                      <div className='mt-6 text-center'>
                        <Button
                          onClick={fileManager.loadMoreFiles}
                          disabled={fileManager.loadingMore}
                          variant='outline'
                          className='bg-white hover:bg-[var(--quinary)] border-[var(--quaternary)] hover:border-[var(--secondary)] text-[var(--secondary)] hover:text-[var(--primary)] px-6 py-2 cursor-pointer'
                        >
                          {fileManager.loadingMore ? (
                            <div className='flex items-center space-x-2'>
                              <FiRefreshCw className='w-4 h-4 animate-spin' />
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <div className='flex items-center space-x-2'>
                              <span>Load More</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Empty State */}
        {!fileManager.loading &&
          !fileManager.apiKeyLoading &&
          fileManager.apiKeyReady &&
          fileManager.folderContents &&
          fileManager.folderContents.files.length === 0 &&
          fileManager.folderContents.subfolders.length === 0 && (
            <Card className='border-[var(--quaternary)] bg-white/80 backdrop-blur-sm'>
              <CardContent className='p-8 sm:p-12'>
                <div className='text-center'>
                  <FiFolder className='w-12 h-12 sm:w-16 sm:h-16 text-[var(--tertiary)] mx-auto mb-4' />
                  <h3 className='text-lg sm:text-xl font-semibold text-[var(--primary)] mb-2'>This folder is empty</h3>
                  <p className='text-sm sm:text-base text-gray-600 mb-4'>Upload some files to get started!</p>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className='bg-[var(--secondary)] hover:bg-[var(--primary)] text-white text-sm sm:text-base'
                  >
                    <FiUpload className='w-4 h-4 mr-2' />
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Delete Confirmation Dialog (shadcn Dialog) */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              // Delay clearing state until after Radix finishes its close animation
              setTimeout(() => {
                try {
                  lastFocusedRef.current?.focus()
                } catch {
                  // ignore focus errors
                }
                setDeleteFileInfo(null)
              }, 120)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete "{deleteFileInfo?.name}" from the server.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className='flex justify-end gap-x-2'>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button onClick={confirmDelete} className='bg-red-600 hover:bg-red-700 text-white'>Delete</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default MyFiles
