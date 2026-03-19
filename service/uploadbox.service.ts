import { toast } from 'sonner'

export interface Profile {
  id: string
  uploads_limit: number
  email?: string
}

export async function uploadFile(storagePath: string, file: Blob | File): Promise<{ fullPath: string } | { message: string }> {
  try {
    // Mock file upload - simulate successful upload
    console.log(`[v0] Uploading file to: ${storagePath}`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      fullPath: `mock-uploads/${storagePath}`
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      message: 'Failed to upload file'
    }
  }
}

export interface InsertInvoiceDocumentParams {
  userId: string
  filePath: string
  standardFields: Array<{ name: string; description: string }>
  customFields: Array<{ name: string; description: string }>
  orgID: string | null
  clientID: string | null
  client_name: string | null
  file_name: string
  isPDF: boolean
  file_id: string
  page_count: number
}

export async function insertInvoiceDocument(params: InsertInvoiceDocumentParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[v0] Inserting invoice document:', params)
    
    // Mock database insert - simulate successful insert
    await new Promise(resolve => setTimeout(resolve, 300))
    
    toast.success('Invoice uploaded successfully', {
      description: `${params.file_name} has been added to your extractions.`
    })
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error inserting invoice document:', error)
    return {
      success: false,
      error: 'Failed to insert document record'
    }
  }
}
