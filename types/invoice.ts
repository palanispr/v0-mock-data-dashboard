export interface LineItem {
  id?: string
  [key: string]: any
  isNewRow?: boolean
  isAddButton?: boolean
}

export interface HeadersMap {
  [key: string]: any
}

export interface InvoiceDocument {
  id: string
  file_path: string
}

export interface InvoicePage {
  id: string
  file_name: string
  file_path: string
  page_number: number
  invoice_lineitems?: LineItem[] | string[]
  invoice_headers?: HeadersMap
  status: 'hold' | 'duplicate' | 'approved' | null
  created_at: string
  user_id: string
  client_id: string
  client_name: string
  invoice_document?: InvoiceDocument
}

export interface GroupedInvoice {
  id: string
  file_name: string
  created_at: string
  client_name: string
  user_name?: string
  page_count: number
  status: 'hold' | 'duplicate' | 'approved' | null
  statusCounts: {
    pending: number
    approved: number
    hold: number
    duplicate: number
  }
  pages: InvoicePage[]
}

export interface FieldHeader {
  name: string
  description: string
}

export interface FieldData {
  headers?: FieldHeader[]
  lineitem_headers?: FieldHeader[]
}
