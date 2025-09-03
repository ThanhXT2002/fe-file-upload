import { getProfile } from './authService'
import { setApiKey, clearApiKey } from './axiosClient'

class ApiKeyManager {
  private static instance: ApiKeyManager
  private apiKey: string | null = null
  private isInitialized = false
  private initializePromise: Promise<string | null> | null = null

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager()
    }
    return ApiKeyManager.instance
  }

  // Initialize API key from profile
  async initialize(): Promise<string | null> {
    // If already initializing, return the same promise
    if (this.initializePromise) {
      return this.initializePromise
    }

    // If already initialized, return cached result
    if (this.isInitialized && this.apiKey) {
      return this.apiKey
    }


    // Create and cache the promise
    this.initializePromise = this._doInitialize()

    try {
      const result = await this.initializePromise
      return result
    } finally {
      // Clear the promise when done
      this.initializePromise = null
    }
  }

  private async _doInitialize(): Promise<string | null> {
    try {
      const response = await getProfile()
      const userProfile = response.data

      if (userProfile?.key) {
        this.apiKey = userProfile.key
        setApiKey(this.apiKey)
        this.isInitialized = true
        return this.apiKey
      } else {
        console.warn('No API key found in user profile')
        return null
      }
    } catch (error) {
      console.error('Failed to initialize API key:', error)
      return null
    }
  }

  // Set API key manually
  setKey(key: string): void {
    this.apiKey = key
    setApiKey(key)
    this.isInitialized = true
  }

  // Get current API key
  getKey(): string | null {
    return this.apiKey
  }

  // Clear API key
  clear(): void {
    this.apiKey = null
    this.isInitialized = false
    this.initializePromise = null
    clearApiKey()
  }

  // Check if API key is available
  hasKey(): boolean {
    return !!this.apiKey
  }

  // Ensure API key is available (initialize if needed)
  async ensureKey(): Promise<string | null> {
    if (this.hasKey()) {
      return this.apiKey
    }
    return await this.initialize()
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance()
export default apiKeyManager
