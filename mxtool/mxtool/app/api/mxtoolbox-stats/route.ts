import { NextResponse } from "next/server"
import { mxtoolboxManager } from "@/lib/mxtoolbox-manager"

export async function GET() {
  try {
    const stats = mxtoolboxManager.getKeyStatistics()
    const totalKeys = mxtoolboxManager.getTotalKeys()
    const availableKeys = mxtoolboxManager.getAvailableKeys()

    return NextResponse.json({
      totalKeys,
      availableKeys,
      blockedKeys: totalKeys - availableKeys,
      keyDetails: stats,
      summary: {
        totalRequests: stats.reduce((sum, key) => sum + key.requestCount, 0),
        activeKeys: stats.filter((key) => !key.isBlocked).length,
        rateLimitedKeys: stats.filter((key) => key.isBlocked).length,
      },
    })
  } catch (error) {
    console.error("Error getting MXToolbox stats:", error)
    return NextResponse.json({ error: "Failed to get statistics" }, { status: 500 })
  }
}
