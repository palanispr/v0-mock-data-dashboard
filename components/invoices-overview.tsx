'use client'

import { useInvoices } from '@/lib/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'

export function InvoicesOverview() {
  const { data, isLoading, error } = useInvoices()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="text-red-500 p-4">Error loading invoices</div>
    )
  }

  const recentInvoices = data.data.slice(0, 5)

  return (
    <div className="space-y-2">
      {recentInvoices.map((invoice) => (
        <Card key={invoice.file_id} className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{invoice.file_name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      {invoice.client_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {invoice.page_count} pages
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {invoice.statusCounts.approved > 0 && (
                  <Badge variant="outline" className="border-green-500 text-green-600 text-xs whitespace-nowrap">
                    {invoice.statusCounts.approved} approved
                  </Badge>
                )}
                {invoice.statusCounts.hold > 0 && (
                  <Badge variant="destructive" className="text-xs whitespace-nowrap">
                    {invoice.statusCounts.hold} hold
                  </Badge>
                )}
                {invoice.statusCounts.duplicate > 0 && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs whitespace-nowrap">
                    {invoice.statusCounts.duplicate} dup
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
