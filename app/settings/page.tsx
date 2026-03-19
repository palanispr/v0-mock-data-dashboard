'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useProfile } from '@/lib/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Building2, Zap } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your profile details and email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : profile ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <div className="mt-1 text-base font-medium">{profile.name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="mt-1 text-base font-medium">{profile.email}</div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Organization Settings */}
            {profile?.subscription_tier === 'Teams' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization
                  </CardTitle>
                  <CardDescription>
                    Your organization and team settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : profile ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                        <div className="mt-1 text-base font-medium">{profile.org_name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-base font-medium">{profile.role}</span>
                          <Badge variant="secondary" className="text-xs">
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Subscription Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Subscription Plan
                </CardTitle>
                <CardDescription>
                  Your current plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : profile ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Plan Type</label>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-medium">{profile.subscription_tier}</span>
                        <Badge className="bg-blue-600">Active</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Upload Limit</label>
                        <div className="mt-1 text-base font-medium">{profile.uploads_limit}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Extraction Limit</label>
                        <div className="mt-1 text-base font-medium">{profile.extractions_limit}</div>
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline">Save Changes</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
