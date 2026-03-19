'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { InvoicesTable } from '@/components/invoices-table'

export default function ExtractionsPage() {
  const [activeTab, setActiveTab] = useState(null)

  // Mock user data for demo
  const userId = 'user-demo-123'
  const currentOrg = 'Demo Organization'
  const subscriptionTier = 'Professional'
  const isTeamsManager = false

  const tabs = [
    { id: 'ai-results', label: 'AI Results', status: null },
    { id: 'hold', label: 'Hold', status: 'hold' },
    { id: 'duplicate', label: 'Duplicate', status: 'duplicate' },
    { id: 'approved', label: 'Approved', status: 'approved' },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Extractions</h1>
              <p className="text-muted-foreground mt-1">
                View and manage extracted invoice data with ag-grid table and inline viewer
              </p>
            </div>

            {/* Organization Label */}
            <div className="px-4 py-2 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Organization:
                </span>
                <Badge variant="outline" className="font-semibold">
                  {currentOrg}
                </Badge>
              </div>
            </div>

            {/* Tabs with AG Grid Table */}
            <div className="bg-white rounded-lg border">
              <Tabs value={activeTab || tabs[0].id} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                  <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="relative rounded-none border-b-2 border-transparent bg-transparent px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="p-0">
                    <InvoicesTable
                      userId={userId}
                      tab={tab.id}
                      status={tab.status}
                      dateRange={{ from: new Date('2024-01-01'), to: new Date() }}
                      searchTerm=""
                      selectedClient=""
                      currentOrg={currentOrg}
                      subscriptionTier={subscriptionTier}
                      isTeamsManager={isTeamsManager}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
