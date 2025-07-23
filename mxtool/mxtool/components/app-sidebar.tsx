"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Eye,
  Settings,
  Activity,
  TestTube,
  Globe,
  Zap,
  Code,
  Key,
  Plus,
  CheckCircle,
  Sparkles,
} from "lucide-react"

// Menu data organized by categories
const menuData = {
  main: [
    {
      title: "IP Checker",
      url: "/",
      icon: Shield,
      description: "Check IP addresses against blacklists",
    },
    {
      title: "Overview",
      url: "/overview",
      icon: Eye,
      description: "Complete feature overview",
    },
  ],
  management: [
    {
      title: "API Setup",
      url: "/setup",
      icon: Settings,
      description: "Configure your API keys",
    },
    {
      title: "MXToolbox Dashboard",
      url: "/mxtoolbox-dashboard",
      icon: Activity,
      description: "Monitor API usage and rotation",
    },
  ],
  tools: [
    {
      title: "API Testing",
      url: "/api-test",
      icon: TestTube,
      description: "Test API connections and rotation",
    },
    
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [hasApiKeys, setHasApiKeys] = useState(false)
  const [apiKeyCount, setApiKeyCount] = useState(0)

  useEffect(() => {
    const checkApiKeys = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mxtoolbox_api_keys")
        if (stored) {
          try {
            const keys = JSON.parse(stored)
            setHasApiKeys(keys.length > 0)
            setApiKeyCount(keys.length)
          } catch {
            setHasApiKeys(false)
            setApiKeyCount(0)
          }
        }
      }
    }

    checkApiKeys()
    const interval = setInterval(checkApiKeys, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">IP Blacklist Checker</span>
                  <span className="truncate text-xs text-muted-foreground">Enterprise Pro</span>
                </div>
                <Sparkles className="size-4 text-yellow-500" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.management.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.url === "/setup" && !hasApiKeys && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Optional
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools & Testing Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools & Testing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2 p-2">
                <div className="flex items-center gap-2">
                  {hasApiKeys ? (
                    <>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <Key className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-green-700">Personal API</span>
                        <span className="truncate text-xs text-green-600">
                          {apiKeyCount} key{apiKeyCount !== 1 ? "s" : ""} active
                        </span>
                      </div>
                      <CheckCircle className="size-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Zap className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-blue-700">Shared API</span>
                        <span className="truncate text-xs text-blue-600">Ready to use</span>
                      </div>
                      <Link href="/setup">
                        <Plus className="size-4 text-blue-600 hover:text-blue-800" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
