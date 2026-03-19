export interface InvoicePage {
  id: string
  file_path: string
  file_name: string
  page_number: number
  user_id: string
  status: 'hold' | 'duplicate' | 'approved' | null
  client_id?: string
  client_name: string
  created_at: string
  invoice_headers?: Record<string, any>
  invoice_lineitems?: any[]
  invoice_document?: {
    id: string
  }
}

export interface GroupedInvoice {
  file_id: string
  file_name: string
  created_at: string
  client_name: string
  page_count: number
  pages: InvoicePage[]
  statusCounts: {
    approved: number
    hold: number
    duplicate: number
  }
}

export interface UsageStats {
  uploads_used: number
  extractions_used: number
  uploads_limit: number
  extractions_limit: number
}

export const generateMockInvoices = (count: number = 15): GroupedInvoice[] => {
  const clients = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Digital Co', 'Innovation Labs']
  const statuses: (InvoicePage['status'])[] = ['approved', 'hold', 'duplicate', null]
  const invoices: GroupedInvoice[] = []

  for (let i = 0; i < count; i++) {
    const pageCount = Math.floor(Math.random() * 4) + 1
    const fileId = `file_${i + 1}`
    const clientName = clients[Math.floor(Math.random() * clients.length)]
    const pages: InvoicePage[] = []
    const statusCounts = { approved: 0, hold: 0, duplicate: 0 }

    for (let j = 0; j < pageCount; j++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      if (status === 'approved') statusCounts.approved++
      else if (status === 'hold') statusCounts.hold++
      else if (status === 'duplicate') statusCounts.duplicate++

      pages.push({
        id: `${fileId}_page_${j + 1}`,
        file_path: `documents/${fileId}_page_${j + 1}.png`,
        file_name: `Invoice_${i + 1}.pdf`,
        page_number: j + 1,
        user_id: 'mock_user',
        status,
        client_id: `client_${i}`,
        client_name: clientName,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        invoice_headers: {
          invoice_number: `INV-${String(i + 1).padStart(4, '0')}`,
          invoice_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          total: Math.floor(Math.random() * 50000) + 1000,
          vendor_name: clientName,
        },
        invoice_lineitems: [
          {
            description: `Service/Product ${j + 1}`,
            quantity: Math.floor(Math.random() * 10) + 1,
            unit_price: Math.floor(Math.random() * 1000) + 100,
            amount: Math.floor(Math.random() * 5000) + 500,
          },
        ],
        invoice_document: {
          id: `doc_${fileId}_${j}`,
        },
      })
    }

    invoices.push({
      file_id: fileId,
      file_name: `Invoice_${i + 1}.pdf`,
      created_at: pages[0].created_at,
      client_name: clientName,
      page_count: pageCount,
      pages,
      statusCounts,
    })
  }

  return invoices
}

export const generateMockUsageStats = (): UsageStats => {
  return {
    uploads_used: 42,
    extractions_used: 38,
    uploads_limit: 100,
    extractions_limit: 100,
  }
}

export const mockProfile = {
  id: 'mock_user',
  name: 'John Doe',
  email: 'john@example.com',
  subscription_tier: 'Teams' as const,
  uploads_limit: 100,
  extractions_limit: 100,
  org_name: 'Acme Corporation',
  org_id: 'org_123',
  role: 'Manager',
}
