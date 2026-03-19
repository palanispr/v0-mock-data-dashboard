'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUsageStats } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'

export function UsageStats() {
  const { data: stats, isLoading, error } = useUsageStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-24 mt-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-red-500 p-4">Error loading usage stats</div>
    )
  }

  const uploadPercent = Math.round((stats.uploads_used / stats.uploads_limit) * 100)
  const extractionPercent = Math.round((stats.extractions_used / stats.extractions_limit) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Uploads</CardTitle>
          <CardDescription>
            {stats.uploads_used} of {stats.uploads_limit} used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={uploadPercent} className="h-2" />
          <div className="flex justify-between text-xs mt-3">
            <span>{uploadPercent}% used</span>
            <span>{stats.uploads_limit - stats.uploads_used} remaining</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extractions</CardTitle>
          <CardDescription>
            {stats.extractions_used} of {stats.extractions_limit} used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={extractionPercent} className="h-2" />
          <div className="flex justify-between text-xs mt-3">
            <span>{extractionPercent}% used</span>
            <span>{stats.extractions_limit - stats.extractions_used} remaining</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
