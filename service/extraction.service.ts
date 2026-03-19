import { useQuery } from "@tanstack/react-query"
import type { GroupedInvoice, InvoicePage } from "@/types/invoice"

// Mock data generator
const generateMockInvoices = (count: number): GroupedInvoice[] => {
  const statuses: Array<'hold' | 'duplicate' | 'approved' | null> = [
    'approved',
    'hold',
    'duplicate',
    null,
  ]
  const clients = [
    'Acme Corp',
    'Tech Solutions Inc',
    'Global Enterprises',
    'Innovation Labs',
    'Future Systems',
  ]
  const users = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams']

  return Array.from({ length: count }, (_, i) => {
    const pageCount = Math.floor(Math.random() * 3) + 1
    const pages: InvoicePage[] = Array.from({ length: pageCount }, (_, p) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      return {
        id: `invoice-${i}-page-${p}`,
        file_name: `Invoice_${i + 1}_Document.pdf`,
        file_path: `/invoices/sample-${i}.pdf`,
        page_number: p + 1,
        status,
        created_at: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        user_id: `user-${Math.floor(Math.random() * users.length)}`,
        client_id: `client-${i}`,
        client_name: clients[Math.floor(Math.random() * clients.length)],
        invoice_document: {
          id: `doc-${i}`,
          file_path: `/invoices/sample-${i}.pdf`,
        },
        invoice_headers: {
          invoice_number: `INV-${String(i + 1).padStart(5, '0')}`,
          invoice_date: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          due_date: new Date(
            Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          total_amount: (Math.random() * 10000 + 1000).toFixed(2),
        },
        invoice_lineitems: [
          {
            description: 'Professional Services',
            quantity: Math.floor(Math.random() * 10) + 1,
            unit_price: (Math.random() * 500 + 100).toFixed(2),
            amount: (Math.random() * 5000 + 500).toFixed(2),
          },
          {
            description: 'Software License',
            quantity: 1,
            unit_price: (Math.random() * 1000 + 200).toFixed(2),
            amount: (Math.random() * 5000 + 500).toFixed(2),
          },
        ],
      }
    })

    const statusCounts = pages.reduce(
      (acc, p) => {
        if (p.status === 'approved') acc.approved++
        else if (p.status === 'hold') acc.hold++
        else if (p.status === 'duplicate') acc.duplicate++
        else acc.pending++
        return acc
      },
      { pending: 0, approved: 0, hold: 0, duplicate: 0 }
    )

    return {
      id: `group-${i}`,
      file_name: `Invoice_${i + 1}_Document.pdf`,
      created_at: pages[0]?.created_at || new Date().toISOString(),
      client_name: pages[0]?.client_name || 'Unknown',
      user_name: users[Math.floor(Math.random() * users.length)],
      page_count: pageCount,
      status: pages[0]?.status || null,
      statusCounts,
      pages,
    }
  })
}

interface UseInvoicesOptions {
  userId: string
  status?: string | null
  dateRange?: { from: Date; to: Date }
  searchTerm?: string
  selectedClient?: string
  page?: number
  pageSize?: number
  isTeamsManager?: boolean
}

export function useInvoices({
  userId,
  status,
  dateRange,
  searchTerm,
  selectedClient,
  page = 1,
  pageSize = 25,
  isTeamsManager,
}: UseInvoicesOptions) {
  return useQuery({
    queryKey: [
      'invoices',
      userId,
      status,
      dateRange,
      searchTerm,
      selectedClient,
      page,
      pageSize,
      isTeamsManager,
    ],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockInvoices = generateMockInvoices(75)

      // Apply filters
      let filtered = mockInvoices

      if (searchTerm) {
        filtered = filtered.filter((inv) =>
          inv.file_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (selectedClient) {
        filtered = filtered.filter((inv) =>
          inv.client_name.toLowerCase().includes(selectedClient.toLowerCase())
        )
      }

      if (status) {
        filtered = filtered.filter((inv) => {
          if (status === 'pending') {
            return inv.pages.some((p) => p.status === null)
          }
          return inv.pages.some((p) => p.status === status)
        })
      }

      if (dateRange) {
        filtered = filtered.filter((inv) => {
          const invDate = new Date(inv.created_at)
          return invDate >= dateRange.from && invDate <= dateRange.to
        })
      }

      const total = filtered.length
      const paginatedData = filtered.slice(
        (page - 1) * pageSize,
        page * pageSize
      )

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export type { GroupedInvoice }
