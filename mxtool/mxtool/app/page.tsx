"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface BlacklistResult {
  ip: string
  isBlacklisted: boolean
  blacklists: string[]
  error?: string
}

export default function IPBlacklistChecker() {
  const [ipList, setIpList] = useState("")
  const [results, setResults] = useState<BlacklistResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheck = async () => {
    if (!ipList.trim()) {
      setError("Please enter IP addresses to check")
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    const ips = ipList
      .split("\n")
      .map((ip) => ip.trim())
      .filter((ip) => ip && isValidIP(ip))

    if (ips.length === 0) {
      setError("No valid IP addresses found")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/check-blacklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ips }),
      })

      if (!response.ok) {
        throw new Error("Failed to check blacklists")
      }

      const data = await response.json()
      setResults(data.results)
    } catch {
      setError("Failed to check IP addresses. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isValidIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipRegex.test(ip)
  }

  const blacklistedResults = results.filter((result) => result.isBlacklisted)
  const cleanResults = results.filter((result) => !result.isBlacklisted && !result.error)

  const errorResults = results.filter((result) => result.error)
  const hasErrors = errorResults.length > 0

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IP Blacklist Checker</h1>
        <p className="text-muted-foreground">
          Check multiple IP addresses against various blacklists using MXToolbox API
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              IP Address Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter IP addresses (one per line)&#10;Example:&#10;8.8.8.8&#10;1.1.1.1&#10;192.168.1.1"
              value={ipList}
              onChange={(e) => setIpList(e.target.value)}
              rows={8}
              className="font-mono"
            />
            <Button onClick={handleCheck} disabled={loading || !ipList.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking IPs...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Blacklists
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{blacklistedResults.length}</div>
                  <p className="text-sm text-muted-foreground">Blacklisted IPs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{cleanResults.length}</div>
                  <p className="text-sm text-muted-foreground">Clean IPs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{results.length}</div>
                  <p className="text-sm text-muted-foreground">Total Checked</p>
                </CardContent>
              </Card>
            </div>

            {blacklistedResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    Blacklisted IP Addresses ({blacklistedResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blacklistedResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-lg">{result.ip}</span>
                          <Badge variant="destructive">Blacklisted</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.blacklists.map((blacklist, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {blacklist}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {cleanResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Clean IP Addresses ({cleanResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {cleanResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="font-mono text-sm">{result.ip}</span>
                        <Badge variant="secondary" className="text-xs">
                          Clean
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {hasErrors && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    API Issues ({errorResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {errorResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-semibold text-lg">{result.ip}</span>
                          <Badge variant="outline" className="bg-amber-50">
                            Error
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.error}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
