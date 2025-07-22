"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react"

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApiConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-api")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test API connection")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApiConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MXToolbox API Test</h1>
        <p className="text-muted-foreground">Test your MXToolbox API connection to ensure it's working correctly</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            API Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApiConnection} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Test API Connection
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Connection Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <Alert variant="success" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">API Connection Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your MXToolbox API key is configured correctly and working.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Connection Failed</AlertTitle>
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">API Response Details:</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium">Troubleshooting Tips:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Make sure your MXToolbox API key is correctly set in the .env.local file</li>
              <li>Verify that you're using the correct authentication method (Basic Auth)</li>
              <li>Check if your API key has the necessary permissions for blacklist lookups</li>
              <li>Ensure your API key is active and hasn't expired</li>
              <li>
                <a
                  href="https://mxtoolbox.com/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit MXToolbox API documentation
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
