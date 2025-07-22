"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ExternalLink, Key, CheckCircle } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MXToolbox API Setup Guide</h1>
        <p className="text-muted-foreground">
          Follow these steps to configure your MXToolbox API key for IP blacklist checking
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Step 1: Get Your MXToolbox API Key
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
              <li>Navigate to your API dashboard to get your API key</li>
              <li>Copy your API key (it should look like a long string of characters)</li>
            </ol>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>API Key Format</AlertTitle>
              <AlertDescription>
                Your MXToolbox API key should be a string that looks something like:
                <code className="bg-gray-100 px-2 py-1 rounded text-sm ml-2">9c515ee0-9e7c-4d23-8bcf-bf084784f65c</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Step 2: Configure Your Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Add your API key to your environment variables:</p>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">In your .env.local file:</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
                MXTOOLBOX_API_KEY=your_actual_api_key_here
              </code>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Make sure to replace <code>your_actual_api_key_here</code> with your real API key from MXToolbox. Do not
                include quotes around the key.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Step 3: Test Your Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3">
              <li>Save your .env.local file</li>
              <li>Restart your development server</li>
              <li>
                Visit the{" "}
                <a href="/api-test" className="text-blue-600 hover:underline">
                  API Test page
                </a>{" "}
                to verify your connection
              </li>
              <li>If successful, you can start using the IP blacklist checker</li>
            </ol>

            <Alert>
              <Info className="h4 w-4" />
              <AlertTitle>Troubleshooting</AlertTitle>
              <AlertDescription>
                If you&apos;re getting a 400 Bad Request error, it usually means:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The API key format is incorrect</li>
                  <li>The API key doesn&apos;t have the right permissions</li>
                  <li>The API endpoint has changed</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Blacklist APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">If MXToolbox doesn&apos;t work, consider these alternatives:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  href="https://www.abuseipdb.com/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  AbuseIPDB API <ExternalLink className="w-3 h-3 inline" />
                </a>{" "}
                - Free tier available
              </li>
              <li>
                <a
                  href="https://www.virustotal.com/gui/join-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  VirusTotal API <ExternalLink className="w-3 h-3 inline" />
                </a>{" "}
                - Free tier available
              </li>
              <li>
                <a
                  href="https://www.spamhaus.org/zen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Spamhaus ZEN <ExternalLink className="w-3 h-3 inline" />
                </a>{" "}
                - DNS-based queries
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
