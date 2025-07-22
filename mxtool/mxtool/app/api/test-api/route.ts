import { NextResponse } from "next/server"

// This endpoint helps test if the MXToolbox API key is working correctly
export async function GET() {
  try {
    const apiKey = process.env.MXTOOLBOX_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "MXTOOLBOX_API_KEY is not defined in environment variables" }, { status: 500 })
    }

    // Test IP to check
    const testIp = "8.8.8.8"
    const apiUrl = `https://mxtoolbox.com/api/v1/Lookup/blacklist/${testIp}`

    console.log("Testing MXToolbox API with URL:", apiUrl)
    console.log("API Key length:", apiKey.length)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response body:", errorText)

      return NextResponse.json(
        {
          error: `API returned ${response.status}: ${response.statusText}`,
          details: errorText,
          apiKeyLength: apiKey.length,
          apiKeyFirstChars: apiKey.substring(0, 8) + "...",
          troubleshooting: {
            possibleIssues: [
              "API key format might be incorrect",
              "API key might not have blacklist lookup permissions",
              "Rate limiting might be in effect",
              "API endpoint URL might have changed",
            ],
          },
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Success response:", data)

    return NextResponse.json({
      success: true,
      message: "API connection successful",
      apiKeyConfigured: true,
      sampleData: {
        commandType: data.CommandType,
        hasInformation: !!data.Information,
        informationCount: data.Information ? data.Information.length : 0,
        hasPassed: !!data.Passed,
        passedCount: data.Passed ? data.Passed.length : 0,
        hasFailed: !!data.Failed,
        failedCount: data.Failed ? data.Failed.length : 0,
        fullResponse: data,
      },
    })
  } catch (error) {
    console.error("Error testing API:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        troubleshooting: {
          steps: [
            "1. Verify your API key is correct",
            "2. Check if your API key has blacklist lookup permissions",
            "3. Try a different IP address",
            "4. Contact MXToolbox support if the issue persists",
          ],
        },
      },
      { status: 500 },
    )
  }
}
