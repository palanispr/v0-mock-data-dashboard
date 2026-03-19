export interface InvoiceFieldsData {
  standard_fields: Array<{ name: string; description: string }>
  custom_fields: Array<{ name: string; description: string }>
}

const mockFields: InvoiceFieldsData = {
  standard_fields: [
    { name: 'invoice_number', description: 'Unique invoice identifier' },
    { name: 'invoice_date', description: 'Date invoice was issued' },
    { name: 'due_date', description: 'Payment due date' },
    { name: 'total_amount', description: 'Total invoice amount' },
    { name: 'vendor_name', description: 'Name of the vendor/supplier' },
    { name: 'vendor_address', description: 'Vendor address' },
    { name: 'customer_name', description: 'Name of the customer' },
    { name: 'tax_amount', description: 'Tax amount charged' },
    { name: 'currency', description: 'Currency of the invoice' },
  ],
  custom_fields: [],
}

export async function getInvoiceFields(userId: string): Promise<InvoiceFieldsData | null> {
  try {
    console.log(`[v0] Fetching invoice fields for user: ${userId}`)
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockFields
  } catch (error) {
    console.error('Error fetching invoice fields:', error)
    return null
  }
}

export async function addCustomField(
  userId: string,
  field: { name: string; description: string },
  standardFields: any[],
  customFields: any[]
): Promise<boolean> {
  try {
    console.log(`[v0] Adding custom field for user ${userId}:`, field)
    await new Promise(resolve => setTimeout(resolve, 300))
    mockFields.custom_fields.push(field)
    return true
  } catch (error) {
    console.error('Error adding custom field:', error)
    return false
  }
}

export async function updateField(userId: string, standardFields: any[], customFields: any[]): Promise<boolean> {
  try {
    console.log(`[v0] Updating fields for user ${userId}`)
    await new Promise(resolve => setTimeout(resolve, 300))
    mockFields.standard_fields = standardFields
    mockFields.custom_fields = customFields
    return true
  } catch (error) {
    console.error('Error updating fields:', error)
    return false
  }
}
