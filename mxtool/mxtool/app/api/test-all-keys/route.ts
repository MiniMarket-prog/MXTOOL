import { NextResponse } from "next/server"
import { mxtoolboxManager } from "@/lib/mxtoolbox-manager"

export async function GET() {
  try {
    // Check if we have any API keys configured
    if (mxtoolboxManager.getTotalKeys() === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No MXToolbox API keys configured",
        },
        { status: 500 },
      )
    }

    console.log(`Testing all ${mxtoolboxManager.getTotalKeys()} MXToolbox API keys`)

    // Test multiple IPs to force key rotation
    const testIPs = ["8.8.8.8", "1.1.1.1", "208.67.222.222", "9.9.9.9"]
    const results = []

    for (const ip of testIPs) {
      try {
        const result = await mxtoolboxManager.makeRequest(ip)
        results.push({
          ip,
          success: true,
          usedKey: result.usedKey,
          hasData: !!result.data,
        })

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        results.push({
          ip,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const keyStats = mxtoolboxManager.getKeyStatistics()
    const usedKeys = new Set(results.filter((r) => r.success).map((r) => r.usedKey))

    return NextResponse.json({
      success: true,
      message: `Successfully tested ${results.filter((r) => r.success).length}/${testIPs.length} requests`,
      totalKeys: mxtoolboxManager.getTotalKeys(),
      availableKeys: mxtoolboxManager.getAvailableKeys(),
      keysUsedInTest: usedKeys.size,
      testResults: results,
      keyStatistics: keyStats,
      summary: {
        totalRequests: keyStats.reduce((sum, key) => sum + key.requestCount, 0),
        activeKeys: keyStats.filter((key) => !key.isBlocked).length,
        keysWithUsage: keyStats.filter((key) => key.requestCount > 0).length,
      },
    })
  } catch (error) {
    console.error("Error testing all keys:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
