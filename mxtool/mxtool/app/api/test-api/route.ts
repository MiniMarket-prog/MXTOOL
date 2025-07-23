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
          troubleshooting: {
            steps: [
              "1. Add MXTOOLBOX_API_KEY_1=your_first_key to environment variables",
              "2. Add MXTOOLBOX_API_KEY_2=your_second_key for better performance",
              "3. You can add up to 10+ keys (MXTOOLBOX_API_KEY_3, etc.)",
              "4. Redeploy your application",
              "5. Each key allows ~50 requests per minute",
            ],
          },
        },
        { status: 500 },
      )
    }

    console.log(`Testing MXToolbox API with ${mxtoolboxManager.getTotalKeys()} keys`)

    // Test with a known good IP
    const testIp = "8.8.8.8"
    const result = await mxtoolboxManager.makeRequest(testIp)

    console.log("API test successful:", result)

    return NextResponse.json({
      success: true,
      message: "API connection successful with key rotation",
      totalKeys: mxtoolboxManager.getTotalKeys(),
      availableKeys: mxtoolboxManager.getAvailableKeys(),
      usedKey: result.usedKey,
      testIp,
      keyStatistics: mxtoolboxManager.getKeyStatistics(),
      sampleData: {
        commandType: result.data.CommandType,
        hasInformation: !!result.data.Information,
        informationCount: result.data.Information ? result.data.Information.length : 0,
        hasPassed: !!result.data.Passed,
        passedCount: result.data.Passed ? result.data.Passed.length : 0,
        hasFailed: !!result.data.Failed,
        failedCount: result.data.Failed ? result.data.Failed.length : 0,
      },
    })
  } catch (error) {
    console.error("Error testing API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        totalKeys: mxtoolboxManager.getTotalKeys(),
        availableKeys: mxtoolboxManager.getAvailableKeys(),
        troubleshooting: {
          possibleIssues: [
            "One or more API keys might be invalid",
            "API keys might not have blacklist lookup permissions",
            "All keys might be rate limited",
            "Network connectivity issues",
          ],
          nextSteps: [
            "1. Verify all your API keys are correct",
            "2. Check your MXToolbox subscription includes blacklist lookups",
            "3. Try again in a few minutes if rate limited",
            "4. Add more API keys for better performance",
          ],
        },
      },
      { status: 500 },
    )
  }
}
