"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Key, CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react"

interface KeyDetail {
  keyPreview: string
  requestCount: number
  lastUsed: string
  isBlocked: boolean
  blockUntil: string | null
}

interface MXToolboxStats {
  totalKeys: number
  availableKeys: number
  blockedKeys: number
  keyDetails: KeyDetail[]
  summary: {
    totalRequests: number
    activeKeys: number
    rateLimitedKeys: number
  }
}

export default function MXToolboxDashboard() {
  const [stats, setStats] = useState<MXToolboxStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mxtoolbox-stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch MXToolbox stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (isBlocked: boolean, requestCount: number) => {
    if (isBlocked) return "destructive"
    if (requestCount > 40) return "secondary"
    return "default"
  }

  const getStatusText = (isBlocked: boolean, requestCount: number) => {
    if (isBlocked) return "Rate Limited"
    if (requestCount > 40) return "Near Limit"
    return "Available"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">MXToolbox API Dashboard</h1>
          <p className="text-muted-foreground">Monitor your MXToolbox API key usage and rotation</p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalKeys}</div>
                <p className="text-sm text-muted-foreground">Total API Keys</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.availableKeys}</div>
                <p className="text-sm text-muted-foreground">Available Keys</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.blockedKeys}</div>
                <p className="text-sm text-muted-foreground">Rate Limited</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.summary.totalRequests}</div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
          </div>

          {stats.totalKeys === 0 && (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertTitle>No API Keys Configured</AlertTitle>
              <AlertDescription>
                Add multiple MXToolbox API keys to your environment variables:
                <br />
                MXTOOLBOX_API_KEY_1, MXTOOLBOX_API_KEY_2, MXTOOLBOX_API_KEY_3, etc.
              </AlertDescription>
            </Alert>
          )}

          {stats.availableKeys === 0 && stats.totalKeys > 0 && (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertTitle>All API Keys Rate Limited</AlertTitle>
              <AlertDescription>
                All your MXToolbox API keys are currently rate limited. Please wait a few minutes before making more
                requests.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Key Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.keyDetails.map((key, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          <span className="font-mono text-sm">{key.keyPreview}</span>
                        </div>
                        <Badge variant={getStatusColor(key.isBlocked, key.requestCount)}>
                          {key.isBlocked ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {getStatusText(key.isBlocked, key.requestCount)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{key.requestCount}/50 requests</div>
                          <Progress value={(key.requestCount / 50) * 100} className="w-24 h-2" />
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleTimeString() : "Never"}
                          </div>
                          {key.isBlocked && key.blockUntil && (
                            <div className="text-red-600 text-xs">
                              Blocked until {new Date(key.blockUntil).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Rotation Benefits:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Avoid rate limiting with multiple keys</li>
                      <li>Automatic failover when keys are blocked</li>
                      <li>Higher throughput for large IP lists</li>
                      <li>Better reliability for team usage</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Performance:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Active Keys:</span>
                        <span className="font-medium">{stats.summary.activeKeys}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate Limited:</span>
                        <span className="font-medium text-red-600">{stats.summary.rateLimitedKeys}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Requests:</span>
                        <span className="font-medium">{stats.summary.totalRequests}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
