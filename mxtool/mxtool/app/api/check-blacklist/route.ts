import { type NextRequest, NextResponse } from "next/server"
import { mxtoolboxManager } from "@/lib/mxtoolbox-manager"

interface BlacklistResult {
  ip: string
  isBlacklisted: boolean
  blacklists: string[]
  error?: string
  usedApiKey?: string
}

interface MXToolboxItem {
  Name?: string
  Hostname?: string
  IsError?: boolean
  Status?: string
  IsBlackListed?: boolean
}

interface MXToolboxResponse {
  CommandType?: string
  Information?: MXToolboxItem[]
  Failed?: MXToolboxItem[]
  Passed?: MXToolboxItem[]
}

async function checkIPBlacklist(ip: string): Promise<BlacklistResult> {
  try {
    const result = await mxtoolboxManager.makeRequest(ip)
    const data = result.data as MXToolboxResponse

    console.log(`MXToolbox response for ${ip}:`, JSON.stringify(data, null, 2))

    // Parse MXToolbox response
    const blacklists: string[] = []
    let isBlacklisted = false

    // Check the Information array for blacklist results
    if (data.Information && Array.isArray(data.Information)) {
      data.Information.forEach((item: MXToolboxItem) => {
        if (item.IsError || item.Status === "Error" || item.IsBlackListed) {
          blacklists.push(item.Name || item.Hostname || "Unknown Blacklist")
          isBlacklisted = true
        }
      })
    }

    // Also check the Failed array if it exists
    if (data.Failed && Array.isArray(data.Failed)) {
      data.Failed.forEach((item: MXToolboxItem) => {
        blacklists.push(item.Name || item.Hostname || "Unknown Blacklist")
        isBlacklisted = true
      })
    }

    return {
      ip,
      isBlacklisted,
      blacklists,
      usedApiKey: result.usedKey,
    }
  } catch (error) {
    console.error(`Error checking IP ${ip}:`, error)
    return await checkWithAlternativeAPI(ip, error instanceof Error ? error.message : "Unknown error")
  }
}

async function checkWithAlternativeAPI(ip: string, originalError?: string): Promise<BlacklistResult> {
  try {
    console.log(`Using alternative method for ${ip}`)

    // Known problematic IPs for demonstration
    const knownBadIPs = [
      "185.220.101.1",
      "185.220.102.1",
      "198.98.51.1",
      "23.129.64.1",
      "89.248.165.1",
      "192.42.116.1",
      "104.244.72.1",
      "45.129.14.1",
    ]

    const commonBlacklists = [
      "Spamhaus SBL",
      "Spamhaus CSS",
      "SURBL",
      "Barracuda",
      "SpamCop",
      "UCEPROTECT",
      "SORBS",
      "Spamrats",
    ]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const isBlacklisted = knownBadIPs.includes(ip)

    return {
      ip,
      isBlacklisted,
      blacklists: isBlacklisted ? [commonBlacklists[Math.floor(Math.random() * commonBlacklists.length)]] : [],
      error: originalError ? `MXToolbox API failed: ${originalError}. Using demo data.` : undefined,
    }
  } catch {
    return {
      ip,
      isBlacklisted: false,
      blacklists: [],
      error: "Unable to check this IP address",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ips } = await request.json()

    if (!ips || !Array.isArray(ips)) {
      return NextResponse.json({ error: "Invalid IP list provided" }, { status: 400 })
    }

    // Check if we have any API keys configured
    if (mxtoolboxManager.getTotalKeys() === 0) {
      return NextResponse.json(
        {
          error: "No MXToolbox API keys configured. Please add MXTOOLBOX_API_KEY_1, MXTOOLBOX_API_KEY_2, etc.",
          results: ips.map((ip: string) => ({
            ip,
            isBlacklisted: false,
            blacklists: [],
            error: "No API keys configured",
          })),
        },
        { status: 500 },
      )
    }

    console.log(`Processing ${ips.length} IPs with ${mxtoolboxManager.getTotalKeys()} API keys`)

    const results: BlacklistResult[] = []

    // Process IPs with automatic key rotation
    for (const ip of ips) {
      try {
        const result = await checkIPBlacklist(ip)
        results.push(result)

        // Small delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch {
        results.push({
          ip,
          isBlacklisted: false,
          blacklists: [],
          error: "Failed to check this IP",
        })
      }
    }

    return NextResponse.json({
      results,
      apiKeyStats: {
        totalKeys: mxtoolboxManager.getTotalKeys(),
        availableKeys: mxtoolboxManager.getAvailableKeys(),
      },
    })
  } catch (error) {
    console.error("Error checking blacklists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
