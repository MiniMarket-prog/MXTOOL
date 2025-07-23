"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Info,
  ExternalLink,
  Key,
  CheckCircle,
  Plus,
  Trash2,
  TestTube,
  Loader2,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"

interface StoredApiKey {
  id: string
  key: string
  preview: string
  isValid?: boolean
  lastTested?: string
}

export default function SetupPage() {
  const [apiKeys, setApiKeys] = useState<StoredApiKey[]>([])
  const [newApiKey, setNewApiKey] = useState("")
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [addingKey, setAddingKey] = useState(false)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("mxtoolbox_api_keys")
    if (stored) {
      try {
        const keys = JSON.parse(stored)
        setApiKeys(keys)
      } catch (error) {
        console.error("Error loading stored API keys:", error)
      }
    }
  }, [])

  // Save API keys to localStorage
  const saveApiKeys = (keys: StoredApiKey[]) => {
    localStorage.setItem("mxtoolbox_api_keys", JSON.stringify(keys))
    setApiKeys(keys)
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const testApiKey = async (apiKey: string) => {
    setTestingKey(apiKey)
    setMessage(null)

    try {
      const response = await fetch("/api/test-single-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "API key is valid and working!" })
        return true
      } else {
        setMessage({ type: "error", text: data.error || "API key test failed" })
        return false
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to test API key" })
      return false
    } finally {
      setTestingKey(null)
    }
  }

  const addApiKey = async () => {
    if (!newApiKey.trim()) {
      setMessage({ type: "error", text: "Please enter an API key" })
      return
    }

    // Check if key already exists
    if (apiKeys.some((k) => k.key === newApiKey.trim())) {
      setMessage({ type: "error", text: "This API key already exists" })
      return
    }

    setAddingKey(true)
    setMessage(null)

    // Test the key first
    const isValid = await testApiKey(newApiKey.trim())

    if (isValid) {
      const newKey: StoredApiKey = {
        id: generateId(),
        key: newApiKey.trim(),
        preview: newApiKey.trim().substring(0, 8) + "..." + newApiKey.trim().slice(-4),
        isValid: true,
        lastTested: new Date().toISOString(),
      }

      const updatedKeys = [...apiKeys, newKey]
      saveApiKeys(updatedKeys)
      setNewApiKey("")
      setMessage({ type: "success", text: `API key added successfully! You now have ${updatedKeys.length} keys.` })
    }

    setAddingKey(false)
  }

  const deleteApiKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      const updatedKeys = apiKeys.filter((k) => k.id !== id)
      saveApiKeys(updatedKeys)
      setMessage({ type: "success", text: "API key deleted successfully" })
    }
  }

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard!" })
  }

  const generateEnvConfig = () => {
    const envConfig = apiKeys.map((key, index) => `MXTOOLBOX_API_KEY_${index + 1}=${key.key}`).join("\n")

    return envConfig
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MXToolbox API Setup</h1>
        <p className="text-muted-foreground">
          Configure your MXToolbox API keys for IP blacklist checking with automatic rotation
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          {message.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Get API Key Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Step 1: Get Your MXToolbox API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Visit{" "}
                <a
                  href="https://mxtoolbox.com/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  MXToolbox API page <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Sign up for an account or log in to your existing account</li>
              <li>Choose a subscription plan that includes blacklist lookups</li>
              <li>Navigate to your API dashboard to get your API key(s)</li>
              <li>
                <strong>Pro Tip:</strong> Get multiple API keys for better performance!
              </li>
            </ol>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Multiple API Keys = Better Performance</AlertTitle>
              <AlertDescription>
                Each MXToolbox API key allows ~50 requests per minute. With 4 keys, you get ~200 requests per minute!
                The system automatically rotates between keys to avoid rate limits.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Add API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Step 2: Add Your API Keys ({apiKeys.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="newApiKey">MXToolbox API Key</Label>
                <Input
                  id="newApiKey"
                  type="password"
                  placeholder="Enter your MXToolbox API key"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addApiKey()}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => testApiKey(newApiKey)}
                  variant="outline"
                  disabled={!newApiKey.trim() || testingKey === newApiKey}
                >
                  {testingKey === newApiKey ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test
                </Button>
                <Button onClick={addApiKey} disabled={!newApiKey.trim() || addingKey}>
                  {addingKey ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Key
                </Button>
              </div>
            </div>

            {apiKeys.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Your API Keys:</h4>
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4" />
                      <div>
                        <div className="font-mono text-sm">{showKeys[key.id] ? key.key : key.preview}</div>
                        {key.lastTested && (
                          <div className="text-xs text-muted-foreground">
                            Last tested: {new Date(key.lastTested).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={key.isValid ? "default" : "secondary"}>
                        {key.isValid ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {key.isValid ? "Valid" : "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleShowKey(key.id)}>
                        {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(key.key)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiKey(key.key)}
                        disabled={testingKey === key.key}
                      >
                        {testingKey === key.key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteApiKey(key.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Configuration */}
        {apiKeys.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Step 3: Environment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>For production deployment, add these environment variables:</p>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Environment Variables:</p>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateEnvConfig())}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                <Textarea
                  value={generateEnvConfig()}
                  readOnly
                  rows={Math.min(apiKeys.length, 6)}
                  className="font-mono text-sm"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>For Vercel:</strong> Go to your project settings → Environment Variables → Add each key
                  separately
                  <br />
                  <strong>For local development:</strong> Add these to your .env.local file
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Benefits of Multiple API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">✅ Higher Throughput</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>1 key = ~50 requests/minute</li>
                  <li>4 keys = ~200 requests/minute</li>
                  <li>10 keys = ~500 requests/minute</li>
                  <li>Perfect for large IP lists</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚡ Smart Rotation</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Automatic key switching</li>
                  <li>Rate limit protection</li>
                  <li>Failover if keys fail</li>
                  <li>No manual management needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Add your API keys above</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Test each key to ensure they work</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Copy environment variables for deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Visit{" "}
                  <a href="/api-test" className="text-blue-600 hover:underline">
                    API Test page
                  </a>{" "}
                  to verify everything works
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Start checking IP addresses on the{" "}
                  <a href="/" className="text-blue-600 hover:underline">
                    main page
                  </a>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
