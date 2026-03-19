import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { generateMockInvoices, generateMockUsageStats, mockProfile, type GroupedInvoice, type UsageStats } from './mock-data'

export function useInvoices(): UseQueryResult<{ data: GroupedInvoice[]; total: number }, Error> {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      const data = generateMockInvoices(15)
      return {
        data,
        total: data.length * 2, // Mock total
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUsageStats(): UseQueryResult<UsageStats, Error> {
  return useQuery({
    queryKey: ['usageStats'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return generateMockUsageStats()
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockProfile
    },
    staleTime: Infinity,
  })
}

export function useInvoiceCounts() {
  return useQuery({
    queryKey: ['invoiceCounts'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const invoices = generateMockInvoices(15)
      return {
        aiResults: invoices.length,
        hold: Math.floor(invoices.length * 0.2),
        duplicate: Math.floor(invoices.length * 0.15),
        approved: Math.floor(invoices.length * 0.4),
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
