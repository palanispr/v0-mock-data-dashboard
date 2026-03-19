'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Brain, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      label: 'Extractions',
      href: '/extractions',
      icon: Brain,
    },
    {
      label: 'Usage',
      href: '/usage',
      icon: Activity,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">InvoiceFlow</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton asChild isActive={isActive(href)}>
                <Link href={href}>
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
