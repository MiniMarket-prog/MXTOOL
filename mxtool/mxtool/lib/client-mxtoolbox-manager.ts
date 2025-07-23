// Client-side API key management
interface StoredApiKey {
  id: string
  key: string
  preview: string
  isValid?: boolean
  lastTested?: string
}

export class ClientMXToolboxManager {
  private static instance: ClientMXToolboxManager
  private apiKeys: StoredApiKey[] = []

  private constructor() {
    this.loadApiKeys()
  }

  public static getInstance(): ClientMXToolboxManager {
    if (!ClientMXToolboxManager.instance) {
      ClientMXToolboxManager.instance = new ClientMXToolboxManager()
    }
    return ClientMXToolboxManager.instance
  }

  private loadApiKeys() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mxtoolbox_api_keys")
      if (stored) {
        try {
          this.apiKeys = JSON.parse(stored)
        } catch (error) {
          console.error("Error loading stored API keys:", error)
          this.apiKeys = []
        }
      }
    }
  }

  public getApiKeys(): StoredApiKey[] {
    return this.apiKeys
  }

  public hasApiKeys(): boolean {
    return this.apiKeys.length > 0
  }

  public getApiKeysForRequest(): string[] {
    return this.apiKeys.map((key) => key.key)
  }

  public addApiKey(key: string): void {
    const newKey: StoredApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      key: key.trim(),
      preview: key.trim().substring(0, 8) + "..." + key.trim().slice(-4),
      isValid: true,
      lastTested: new Date().toISOString(),
    }

    this.apiKeys.push(newKey)
    this.saveApiKeys()
  }

  public removeApiKey(id: string): void {
    this.apiKeys = this.apiKeys.filter((key) => key.id !== id)
    this.saveApiKeys()
  }

  private saveApiKeys(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("mxtoolbox_api_keys", JSON.stringify(this.apiKeys))
    }
  }

  public clearAllKeys(): void {
    this.apiKeys = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("mxtoolbox_api_keys")
    }
  }
}

export const clientMXToolboxManager = ClientMXToolboxManager.getInstance()
