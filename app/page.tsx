'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { UsageStats } from '@/components/usage-stats'
import { UploadBox } from '@/components/upload-box'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  // Mock profile for demo
  const mockProfile = {
    id: 'user-demo-123',
    uploads_limit: 500,
    email: 'demo@example.com'
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Upload and process your invoices. Drag & drop PDF or image files to get started.
              </p>
            </div>

            {/* Usage Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Usage Overview</h2>
              <UsageStats />
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12 this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Extraction accuracy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Upload Box */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Invoices</h2>
              <UploadBox {...mockProfile} />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
