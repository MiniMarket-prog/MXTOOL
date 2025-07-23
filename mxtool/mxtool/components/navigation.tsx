"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Shield, Settings, Menu, BarChart3, Eye, TestTube, Key, Globe, Code, Zap, Activity } from "lucide-react"

export function Navigation() {
  const [hasApiKeys, setHasApiKeys] = useState(false)

  useEffect(() => {
    // Check if user has API keys in localStorage
    const checkApiKeys = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mxtoolbox_api_keys")
        if (stored) {
          try {
            const keys = JSON.parse(stored)
            setHasApiKeys(keys.length > 0)
          } catch {
            setHasApiKeys(false)
          }
        }
      }
    }

    checkApiKeys()

    // Listen for storage changes to update the state
    const handleStorageChange = () => {
      checkApiKeys()
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check periodically in case keys are added in the same tab
    const interval = setInterval(checkApiKeys, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">IP Blacklist Checker Pro</span>
            <Badge variant="secondary" className="text-xs">
              Enterprise
            </Badge>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/overview"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Eye className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Shield className="h-4 w-4" />
              <span>IP Checker</span>
            </Link>
            <Link
              href="/mxtoolbox-dashboard"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/setup"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              <span>Setup</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  <span>Tools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/api-test" className="flex items-center">
                    <TestTube className="mr-2 h-4 w-4" />
                    API Testing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/providers" className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    Providers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/concurrent-test" className="flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    Load Testing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/debug" className="flex items-center">
                    <Code className="mr-2 h-4 w-4" />
                    Debug Console
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/overview" className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Overview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  IP Checker
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/mxtoolbox-dashboard" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/setup" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Setup
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/api-test" className="flex items-center">
                  <TestTube className="mr-2 h-4 w-4" />
                  API Testing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/providers" className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Providers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/concurrent-test" className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Load Testing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/debug" className="flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  Debug Console
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* API Keys Status */}
          <div className="flex items-center space-x-2">
            {hasApiKeys ? (
              <Badge variant="default" className="text-xs bg-green-600">
                <Key className="w-3 h-3 mr-1" />
                Personal API
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-blue-600">
                <Zap className="w-3 h-3 mr-1" />
                Shared API
              </Badge>
            )}

            <Button asChild variant="default">
              <Link href="/">Start Checking</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
