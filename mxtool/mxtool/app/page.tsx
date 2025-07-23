"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Zap, Globe, Activity, Loader2 } from "lucide-react"

interface BlacklistResult {
  ip: string
  isBlacklisted: boolean
  blacklists: string[]
  error?: string
  usedApiKey?: string
}

interface ApiStatus {
  available: number
  blocked: number
  total: number
}

export default function IPChecker() {
  const [ips, setIps] = useState("")
  const [results, setResults] = useState<BlacklistResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ available: 0, blocked: 0, total: 0 })
  const [scanStats, setScanStats] = useState({
    total: 0,
    clean: 0,
    blacklisted: 0,
    errors: 0,
  })

  // Parse and count valid IPs
  const validIps = ips
    .split(/[\n,\s]+/)
    .filter((ip) => ip.trim())
    .filter((ip) => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip.trim()))
    .map((ip) => ip.trim())

  const estimatedTime = Math.ceil(validIps.length / 5) // Estimate 5 IPs per second

  // Fetch API status on component mount
  useEffect(() => {
    fetchApiStatus()
  }, [])

  // Update scan stats when results change
  useEffect(() => {
    const stats = results.reduce(
      (acc, result) => {
        acc.total++
        if (result.isBlacklisted) {
          acc.blacklisted++
        } else if (result.error) {
          acc.errors++
        } else {
          acc.clean++
        }
        return acc
      },
      { total: 0, clean: 0, blacklisted: 0, errors: 0 },
    )
    setScanStats(stats)
  }, [results])

  const fetchApiStatus = async () => {
    try {
      const response = await fetch("/api/mxtoolbox-stats")
      if (response.ok) {
        const data = await response.json()
        setApiStatus({
          available: data.availableKeys || 4,
          blocked: data.blockedKeys || 0,
          total: data.totalKeys || 4,
        })
      } else {
        // Fallback to environment keys
        setApiStatus({ available: 4, blocked: 0, total: 4 })
      }
    } catch (error) {
      console.error("Failed to fetch API status:", error)
      setApiStatus({ available: 4, blocked: 0, total: 4 })
    }
  }

  const checkIPs = async () => {
    if (!validIps.length) return

    setIsChecking(true)
    setResults([])
    setProgress(0)

    try {
      // Send all IPs at once to match the API expectation
      const response = await fetch("/api/check-blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips: validIps }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.results && Array.isArray(data.results)) {
        setResults(data.results)
      } else {
        throw new Error("Invalid response format")
      }

      setProgress(100)
    } catch (error) {
      console.error("Error checking IPs:", error)
      // Create error results for all IPs
      const errorResults: BlacklistResult[] = validIps.map((ip) => ({
        ip,
        isBlacklisted: false,
        blacklists: [],
        error: error instanceof Error ? error.message : "Network error",
      }))
      setResults(errorResults)
    } finally {
      setIsChecking(false)
    }
  }

  const getResultsByStatus = (status: string) => {
    switch (status) {
      case "all":
        return results
      case "blacklisted":
        return results.filter((r) => r.isBlacklisted)
      case "clean":
        return results.filter((r) => !r.isBlacklisted && !r.error)
      case "errors":
        return results.filter((r) => r.error)
      default:
        return results
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Shield className="h-12 w-12 text-blue-600" />
              <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Pro
                </Badge>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                IP Blacklist Checker
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Professional IP reputation scanning powered by MXToolbox
              </p>
            </div>
          </div>

          {/* API Status Bar */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${apiStatus.available > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-muted-foreground">
                API Status: {apiStatus.available}/{apiStatus.total} keys available
              </span>
            </div>
            {apiStatus.blocked > 0 && (
              <Badge variant="destructive" className="text-xs">
                {apiStatus.blocked} blocked
              </Badge>
            )}
          </div>
        </div>

        {/* Input Section */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              IP Address Input
            </CardTitle>
            <CardDescription>
              Enter IP addresses to check against blacklists. One per line or comma-separated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="192.168.1.1&#10;10.0.0.1&#10;8.8.8.8&#10;185.220.101.1"
              value={ips}
              onChange={(e) => setIps(e.target.value)}
              className="min-h-32 font-mono text-sm"
              disabled={isChecking}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {validIps.length} valid IPs
                </span>
                {validIps.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />~{estimatedTime}s estimated
                  </span>
                )}
              </div>

              <Button
                onClick={checkIPs}
                disabled={!validIps.length || isChecking}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Check IPs
                  </>
                )}
              </Button>
            </div>

            {isChecking && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">Scanning {validIps.length} IP addresses...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{scanStats.total}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Scanned</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{scanStats.clean}</span>
                </div>
                <p className="text-sm text-muted-foreground">Clean</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{scanStats.blacklisted}</span>
                </div>
                <p className="text-sm text-muted-foreground">Blacklisted</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{scanStats.errors}</span>
                </div>
                <p className="text-sm text-muted-foreground">Errors</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Scan Results
              </CardTitle>
              <CardDescription>Detailed results for each IP address scanned</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({scanStats.total})</TabsTrigger>
                  <TabsTrigger value="blacklisted">Blacklisted ({scanStats.blacklisted})</TabsTrigger>
                  <TabsTrigger value="clean">Clean ({scanStats.clean})</TabsTrigger>
                  <TabsTrigger value="errors">Errors ({scanStats.errors})</TabsTrigger>
                </TabsList>

                {["all", "blacklisted", "clean", "errors"].map((status) => (
                  <TabsContent key={status} value={status} className="mt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getResultsByStatus(status).map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            !result.isBlacklisted && !result.error
                              ? "bg-green-50 border-green-500 dark:bg-green-950"
                              : result.isBlacklisted
                                ? "bg-red-50 border-red-500 dark:bg-red-950"
                                : "bg-orange-50 border-orange-500 dark:bg-orange-950"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {!result.isBlacklisted && !result.error && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {result.isBlacklisted && <AlertTriangle className="h-5 w-5 text-red-600" />}
                              {result.error && <XCircle className="h-5 w-5 text-orange-600" />}
                              <span className="font-mono font-medium">{result.ip}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.usedApiKey && (
                                <Badge variant="outline" className="text-xs">
                                  API: {result.usedApiKey}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  !result.isBlacklisted && !result.error
                                    ? "default"
                                    : result.isBlacklisted
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {result.isBlacklisted ? "Blacklisted" : result.error ? "Error" : "Clean"}
                              </Badge>
                            </div>
                          </div>

                          {result.blacklists && result.blacklists.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-1">Found on blacklists:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.blacklists.map((blacklist, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {blacklist}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.error && <p className="text-sm text-muted-foreground mt-2">Error: {result.error}</p>}
                        </div>
                      ))}

                      {getResultsByStatus(status).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No {status === "all" ? "results" : status} found
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Guide - Only show when no results */}
        {results.length === 0 && !isChecking && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>Follow these simple steps to start checking IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Enter IP Addresses</h4>
                  <p className="text-sm text-muted-foreground">
                    Add the IP addresses you want to check in the input field above
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Start Scanning</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Check IPs" to scan against multiple blacklist databases
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Review Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Get detailed results with tabbed views for easy analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
