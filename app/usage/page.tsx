'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { UsageStats } from '@/components/usage-stats'
import { useUsageStats } from '@/lib/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function UsagePage() {
  const { data: stats, isLoading } = useUsageStats()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usage & Limits</h1>
              <p className="text-muted-foreground mt-1">
                Monitor your document upload and extraction quotas
              </p>
            </div>

            {/* Usage Stats Cards */}
            <UsageStats />

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Upload Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </>
                  ) : stats ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Uploads</span>
                        <span className="text-sm font-semibold">{stats.uploads_used} files</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Limit</span>
                        <span className="text-sm font-semibold">{stats.uploads_limit} files</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Remaining</span>
                        <span className="text-sm font-semibold text-green-600">
                          {stats.uploads_limit - stats.uploads_used} files
                        </span>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Extraction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </>
                  ) : stats ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Extractions</span>
                        <span className="text-sm font-semibold">{stats.extractions_used} docs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Limit</span>
                        <span className="text-sm font-semibold">{stats.extractions_limit} docs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Remaining</span>
                        <span className="text-sm font-semibold text-green-600">
                          {stats.extractions_limit - stats.extractions_used} docs
                        </span>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">Need More Capacity?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Contact our sales team to upgrade your plan and increase your monthly quota.
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
