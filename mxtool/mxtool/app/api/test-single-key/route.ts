import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ success: false, error: "Invalid API key provided" }, { status: 400 })
    }

    // Test the API key with a known good IP
    const testIp = "8.8.8.8"
    const endpoints = [
      `https://mxtoolbox.com/api/v1/Lookup/blacklist/${testIp}`,
      `https://mxtoolbox.com/api/v1/lookup/blacklist/${testIp}`,
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          return NextResponse.json({
            success: false,
            error: "Invalid API key - please check your MXToolbox API key",
          })
        }

        if (response.status === 403) {
          return NextResponse.json({
            success: false,
            error: "API key doesn't have permission for blacklist lookups",
          })
        }

        if (response.status === 429) {
          return NextResponse.json({
            success: false,
            error: "Rate limit exceeded - please wait before testing again",
          })
        }

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            message: "API key is valid and working",
            keyPreview: apiKey.substring(0, 8) + "...",
            testIp,
            hasData: !!data,
          })
        }
      } catch (error) {
        console.error("Error testing API key:", error)
        continue
      }
    }

    return NextResponse.json({
      success: false,
      error: "Unable to verify API key - all endpoints failed",
    })
  } catch (error) {
    console.error("Error in test-single-key:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
