interface ApiKeyStatus {
  key: string
  requestCount: number
  lastUsed: number
  isBlocked: boolean
  blockUntil: number
}

interface MXToolboxResponse {
  CommandType?: string
  Information?: Array<{
    Name?: string
    Hostname?: string
    IsError?: boolean
    Status?: string
    IsBlackListed?: boolean
  }>
  Failed?: Array<{
    Name?: string
    Hostname?: string
    IsError?: boolean
    Status?: string
    IsBlackListed?: boolean
  }>
  Passed?: Array<{
    Name?: string
    Hostname?: string
    IsError?: boolean
    Status?: string
    IsBlackListed?: boolean
  }>
}

class MXToolboxManager {
  private apiKeys: string[] = []
  private keyStatus: Map<string, ApiKeyStatus> = new Map()
  private currentKeyIndex = 0

  constructor() {
    this.loadApiKeys()
    this.initializeKeyStatus()
  }

  private loadApiKeys() {
    // Load all MXToolbox API keys from environment
    const keys = []
    let i = 1
    while (true) {
      const key = process.env[`MXTOOLBOX_API_KEY_${i}`] || (i === 1 ? process.env.MXTOOLBOX_API_KEY : null)
      if (!key) break
      keys.push(key)
      i++
    }
    this.apiKeys = keys
    console.log(`Loaded ${this.apiKeys.length} MXToolbox API keys`)
  }

  private initializeKeyStatus() {
    this.keyStatus.clear()
    this.apiKeys.forEach((key) => {
      this.keyStatus.set(key, {
        key: key.substring(0, 8) + "...",
        requestCount: 0,
        lastUsed: 0,
        isBlocked: false,
        blockUntil: 0,
      })
    })
  }

  private getNextAvailableKey(): string | null {
    const now = Date.now()
    const maxRequestsPerKey = Number.parseInt(process.env.MXTOOLBOX_MAX_REQUESTS_PER_KEY || "50")

    // First, unblock any keys that have passed their block time
    this.keyStatus.forEach((status) => {
      if (status.isBlocked && now > status.blockUntil) {
        status.isBlocked = false
        status.requestCount = 0
        console.log(`Unblocked API key: ${status.key}`)
      }
    })

    // Try to find an available key starting from current index
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length
      const key = this.apiKeys[keyIndex]
      const status = this.keyStatus.get(key)

      if (status && !status.isBlocked && status.requestCount < maxRequestsPerKey) {
        this.currentKeyIndex = (keyIndex + 1) % this.apiKeys.length
        return key
      }
    }

    // If all keys are at limit, find the one with the oldest last used time
    let oldestKey = null
    let oldestTime = now

    this.keyStatus.forEach((status, key) => {
      if (!status.isBlocked && status.lastUsed < oldestTime) {
        oldestTime = status.lastUsed
        oldestKey = key
      }
    })

    return oldestKey
  }

  public async makeRequest(ip: string): Promise<{ data: MXToolboxResponse; usedKey: string }> {
    const apiKey = this.getNextAvailableKey()

    if (!apiKey) {
      throw new Error("All MXToolbox API keys are rate limited. Please wait before making more requests.")
    }

    const status = this.keyStatus.get(apiKey)!
    const endpoints = [
      `https://mxtoolbox.com/api/v1/Lookup/blacklist/${ip}`,
      `https://mxtoolbox.com/api/v1/lookup/blacklist/${ip}`,
      `https://api.mxtoolbox.com/api/v1/Lookup/blacklist/${ip}`,
    ]

    let lastError: Error | null = null

    for (const endpoint of endpoints) {
      try {
        console.log(`Using API key ${status.key} for ${ip} on ${endpoint}`)

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
            "User-Agent": "IP-Blacklist-Checker/1.0",
          },
        })

        // Update usage statistics
        status.requestCount++
        status.lastUsed = Date.now()

        if (response.status === 429) {
          // Rate limited - block this key temporarily
          status.isBlocked = true
          status.blockUntil = Date.now() + 60000 // Block for 1 minute
          console.log(`API key ${status.key} rate limited, blocking temporarily`)
          throw new Error("Rate limited")
        }

        if (response.status === 401) {
          throw new Error(`Invalid API key: ${status.key}`)
        }

        if (response.status === 403) {
          throw new Error(`API key ${status.key} doesn't have permission for blacklist lookups`)
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API error for ${ip}: ${response.status} ${response.statusText} - ${errorText}`)
          continue // Try next endpoint
        }

        const data = await response.json()
        console.log(`Success with API key ${status.key} for ${ip}`)
        return { data, usedKey: status.key }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error")
        console.error(`Error with endpoint ${endpoint} using key ${status.key}:`, error)
        continue
      }
    }

    throw lastError || new Error("All endpoints failed")
  }

  public getKeyStatistics() {
    return Array.from(this.keyStatus.entries()).map(([, status]) => ({
      keyPreview: status.key,
      requestCount: status.requestCount,
      lastUsed: new Date(status.lastUsed).toISOString(),
      isBlocked: status.isBlocked,
      blockUntil: status.isBlocked ? new Date(status.blockUntil).toISOString() : null,
    }))
  }

  public getTotalKeys() {
    return this.apiKeys.length
  }

  public getAvailableKeys() {
    const now = Date.now()
    const maxRequestsPerKey = Number.parseInt(process.env.MXTOOLBOX_MAX_REQUESTS_PER_KEY || "50")

    return Array.from(this.keyStatus.values()).filter(
      (status) => !status.isBlocked && status.requestCount < maxRequestsPerKey && now > status.blockUntil,
    ).length
  }
}

// Singleton instance
export const mxtoolboxManager = new MXToolboxManager()
