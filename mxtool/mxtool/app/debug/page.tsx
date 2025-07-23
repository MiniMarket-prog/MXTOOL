"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bug, CheckCircle, AlertTriangle, Info } from "lucide-react"

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)

    try {
      // Test API endpoint
      const apiResponse = await fetch("/api/test-api")
      const apiData = await apiResponse.json()

      // Test a sample IP check
      const ipResponse = await fetch("/api/check-blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips: ["8.8.8.8"] }),
      })
      const ipData = await ipResponse.json()

      setDebugInfo({
        timestamp: new Date().toISOString(),
        environment: {
          isProduction: process.env.NODE_ENV === "production",
          hasApiKey: !!process.env.NEXT_PUBLIC_VERCEL_ENV,
          vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
        },
        apiTest: {
          status: apiResponse.status,
          success: apiData.success,
          data: apiData,
        },
        ipTest: {
          status: ipResponse.status,
          data: ipData,
        },
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug Information</h1>
        <p className="text-muted-foreground">Diagnostic information to help troubleshoot deployment issues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            System Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>

          {debugInfo && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Environment Information</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Environment:</span>
                      <Badge variant={debugInfo.environment?.isProduction ? "default" : "secondary"}>
                        {debugInfo.environment?.vercelEnv || "development"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Timestamp:</span>
                      <span className="text-sm">{debugInfo.timestamp}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {debugInfo.apiTest && (
                <Alert variant={debugInfo.apiTest.success ? "default" : "destructive"}>
                  {debugInfo.apiTest.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>API Test Results</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Status:</span>
                        <Badge variant={debugInfo.apiTest.success ? "default" : "destructive"}>
                          {debugInfo.apiTest.status}
                        </Badge>
                      </div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(debugInfo.apiTest.data, null, 2)}
                      </pre>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {debugInfo.ipTest && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>IP Check Test Results</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Status:</span>
                        <Badge>{debugInfo.ipTest.status}</Badge>
                      </div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(debugInfo.ipTest.data, null, 2)}
                      </pre>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {debugInfo.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{debugInfo.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Common Deployment Issues:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Environment variables not set in Vercel dashboard</li>
              <li>API key format incorrect or expired</li>
              <li>API key doesn't have required permissions</li>
              <li>Rate limiting from the API provider</li>
              <li>Network connectivity issues in production</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
