"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle, Info, Key, Zap } from "lucide-react"

interface ApiTestResult {
  success?: boolean
  error?: string
  message?: string
  totalKeys?: number
  availableKeys?: number
  usedKey?: string
  keyStatistics?: Array<{
    keyPreview: string
    requestCount: number
    lastUsed: string
    isBlocked: boolean
  }>
  sampleData?: Record<string, unknown>
  details?: string
  troubleshooting?: {
    possibleIssues?: string[]
    steps?: string[]
  }
}

interface AllKeysTestResult {
  success: boolean
  message: string
  totalKeys: number
  availableKeys: number
  keysUsedInTest: number
  testResults: Array<{
    ip: string
    success: boolean
    usedKey?: string
    error?: string
  }>
  keyStatistics: Array<{
    keyPreview: string
    requestCount: number
    lastUsed: string
    isBlocked: boolean
  }>
  summary: {
    totalRequests: number
    activeKeys: number
    keysWithUsage: number
  }
}

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false)
  const [allKeysLoading, setAllKeysLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)
  const [allKeysResult, setAllKeysResult] = useState<AllKeysTestResult | null>(null)
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

  const testAllKeys = async () => {
    setAllKeysLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-all-keys")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test all keys")
      }

      setAllKeysResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setAllKeysResult(null)
    } finally {
      setAllKeysLoading(false)
    }
  }

  useEffect(() => {
    testApiConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MXToolbox API Test</h1>
        <p className="text-muted-foreground">Test your MXToolbox API connection and key rotation system</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Basic API Connection Test
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
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">API Connection Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {result.message} - Using key: {result.usedKey}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>API Connection Failed</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}

                {result.totalKeys && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold">{result.totalKeys}</div>
                      <div className="text-sm text-muted-foreground">Total Keys</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">{result.availableKeys}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold">
                        {result.keyStatistics?.reduce((sum, key) => sum + key.requestCount, 0) || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold">
                        {result.keyStatistics?.filter((key) => key.requestCount > 0).length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Keys Used</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Key Rotation Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Test Multiple Keys</p>
                <p className="text-sm text-muted-foreground">
                  This will make 4 requests to test key rotation and show which keys are being used
                </p>
              </div>
              <Button onClick={testAllKeys} disabled={allKeysLoading}>
                {allKeysLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Keys...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Test All Keys
                  </>
                )}
              </Button>
            </div>

            {allKeysResult && (
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Key Rotation Test Results</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    {allKeysResult.message} - Used {allKeysResult.keysUsedInTest} different keys
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{allKeysResult.totalKeys}</div>
                    <div className="text-sm text-muted-foreground">Total Keys</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">{allKeysResult.keysUsedInTest}</div>
                    <div className="text-sm text-muted-foreground">Keys Used</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{allKeysResult.summary.totalRequests}</div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{allKeysResult.summary.keysWithUsage}</div>
                    <div className="text-sm text-muted-foreground">Active Keys</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Results by IP:</h4>
                  {allKeysResult.testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{test.ip}</span>
                        <Badge variant={test.success ? "default" : "destructive"}>
                          {test.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {test.success ? `Key: ${test.usedKey}` : test.error}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Current Key Status:</h4>
                  {allKeysResult.keyStatistics.map((key, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        <span className="font-mono text-sm">{key.keyPreview}</span>
                        <Badge variant={key.isBlocked ? "destructive" : "default"}>
                          {key.isBlocked ? "Blocked" : "Available"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {key.requestCount} requests - Last used: {new Date(key.lastUsed).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Understanding Key Rotation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Why Only One Key Shows Usage Initially?</AlertTitle>
                <AlertDescription>
                  The system uses <strong>intelligent rotation</strong> - it only switches to the next key when:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Current key approaches its rate limit (40+ requests)</li>
                    <li>Current key gets rate limited (429 error)</li>
                    <li>Current key fails for any reason</li>
                  </ul>
                  This is more efficient than random rotation!
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">✅ How It Works:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Uses Key 1 until it hits 40+ requests</li>
                    <li>Automatically switches to Key 2</li>
                    <li>If Key 2 fails, tries Key 3, then Key 4</li>
                    <li>Blocked keys recover after 1 minute</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🚀 Benefits:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Maximum efficiency - no wasted requests</li>
                    <li>Automatic failover if keys fail</li>
                    <li>4 keys = 200 requests/minute capacity</li>
                    <li>Perfect for large IP lists</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
