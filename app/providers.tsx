'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlobalStateProvider } from '@/context/GlobalState'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStateProvider>
        {children}
      </GlobalStateProvider>
    </QueryClientProvider>
  )
}
