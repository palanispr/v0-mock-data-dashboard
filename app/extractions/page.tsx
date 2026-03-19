'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useInvoices, useInvoiceCounts, useProfile } from '@/lib/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Eye } from 'lucide-react'

export default function ExtractionsPage() {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()
  const { data: counts, isLoading: countsLoading } = useInvoiceCounts()
  const { data: profile } = useProfile()
  const [activeTab, setActiveTab] = useState('ai-results')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInvoices = invoices?.data?.filter((inv) =>
    inv.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

  const tabs = [
    { id: 'ai-results', label: 'AI Results', count: counts?.aiResults ?? 0 },
    { id: 'hold', label: 'Hold', count: counts?.hold ?? 0 },
    { id: 'duplicate', label: 'Duplicate', count: counts?.duplicate ?? 0 },
    { id: 'approved', label: 'Approved', count: counts?.approved ?? 0 },
  ]

  if (!profile) {
    return null
  }

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
                View and manage extracted invoice data
              </p>
            </div>

            {/* Organization Label */}
            {profile.subscription_tier === 'Teams' && (
              <div className="px-4 py-2 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Organization:
                  </span>
                  <Badge variant="outline" className="font-semibold">
                    {profile.org_name}
                  </Badge>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg border">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                  <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="relative rounded-none border-b-2 border-transparent bg-transparent px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        <span className="flex items-center gap-2">
                          {tab.label}
                          <Badge className="bg-red-600 text-white rounded-full px-2 text-xs">
                            {countsLoading ? '…' : tab.count}
                          </Badge>
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="p-6">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by file name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {tab.id === 'approved' && (
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      )}
                    </div>

                    {/* Invoice List */}
                    <div className="space-y-2">
                      {invoicesLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))
                      ) : filteredInvoices.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No invoices found</p>
                        </div>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <Card key={invoice.file_id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{invoice.file_name}</h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap text-sm">
                                      <span className="text-muted-foreground">{invoice.client_name}</span>
                                      <span className="text-muted-foreground">
                                        {format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {invoice.page_count} pages
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 ml-4">
                                    {invoice.statusCounts.approved > 0 && (
                                      <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                                        {invoice.statusCounts.approved} ✓
                                      </Badge>
                                    )}
                                    {invoice.statusCounts.hold > 0 && (
                                      <Badge variant="destructive" className="text-xs">
                                        {invoice.statusCounts.hold} ⏸
                                      </Badge>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
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
