import { useApiKey } from '~/hooks/use-api-key'

interface ApiKeyStatusProps {
  className?: string
}

export function ApiKeyStatus({ className = '' }: ApiKeyStatusProps) {
  const apiKey = useApiKey()

  if (apiKey.isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
        <span className='text-sm text-gray-600'>Initializing API key...</span>
      </div>
    )
  }

  if (apiKey.error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className='text-red-600'>⚠️</span>
        <span className='text-sm text-red-600'>API Key Error</span>
        <button
          onClick={() => apiKey.initialize()}
          className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200'
        >
          Retry
        </button>
      </div>
    )
  }

  if (apiKey.hasKey) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className='text-green-600'>✅</span>
        <span className='text-sm text-green-600'>API Key Ready</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className='text-yellow-600'>⚠️</span>
      <span className='text-sm text-yellow-600'>No API Key</span>
      <button
        onClick={() => apiKey.initialize()}
        className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200'
      >
        Initialize
      </button>
    </div>
  )
}
