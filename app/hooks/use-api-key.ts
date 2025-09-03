import { useEffect, useState } from 'react'
import { apiKeyManager } from '~/api/apiKeyManager'

export function useApiKey() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize API key
  const initialize = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const key = await apiKeyManager.initialize()
      setHasKey(!!key)
      return key
    } catch (err: any) {
      setError(err.message || 'Failed to initialize API key')
      setHasKey(false)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Clear API key
  const clear = () => {
    apiKeyManager.clear()
    setHasKey(false)
    setError(null)
  }

  // Check if API key is available
  useEffect(() => {
    setHasKey(apiKeyManager.hasKey())
  }, [])

  return {
    hasKey,
    isLoading,
    error,
    initialize,
    clear,
    ensureKey: apiKeyManager.ensureKey.bind(apiKeyManager),
    getKey: apiKeyManager.getKey.bind(apiKeyManager)
  }
}
