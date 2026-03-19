import { useQuery } from "@tanstack/react-query"
import type { FieldData } from "@/types/invoice"

// Mock image URL for all invoices
const MOCK_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f5f5f5' width='800' height='600'/%3E%3Ctext x='50' y='50' font-size='24' font-weight='bold'%3EINVOICE%3C/text%3E%3Ctext x='50' y='100' font-size='14'%3EInvoice Number: INV-12345%3C/text%3E%3Ctext x='50' y='130' font-size='14'%3EDate: 2024-01-15%3C/text%3E%3Ctext x='50' y='160' font-size='14'%3EClient: Acme Corp%3C/text%3E%3Cline x1='50' y1='200' x2='750' y2='200' stroke='%23ccc' stroke-width='1'/%3E%3Ctext x='50' y='230' font-size='12' font-weight='bold'%3EDescription%3C/text%3E%3Ctext x='300' y='230' font-size='12' font-weight='bold'%3EQuantity%3C/text%3E%3Ctext x='450' y='230' font-size='12' font-weight='bold'%3EUnit Price%3C/text%3E%3Ctext x='600' y='230' font-size='12' font-weight='bold'%3EAmount%3C/text%3E%3Ctext x='50' y='270' font-size='12'%3EProfessional Services%3C/text%3E%3Ctext x='300' y='270' font-size='12'%3E5%3C/text%3E%3Ctext x='450' y='270' font-size='12'%3E$500.00%3C/text%3E%3Ctext x='600' y='270' font-size='12'%3E$2,500.00%3C/text%3E%3Ctext x='50' y='300' font-size='12'%3ESoftware License%3C/text%3E%3Ctext x='300' y='300' font-size='12'%3E1%3C/text%3E%3Ctext x='450' y='300' font-size='12'%3E$1,200.00%3C/text%3E%3Ctext x='600' y='300' font-size='12'%3E$1,200.00%3C/text%3E%3Cline x1='50' y1='330' x2='750' y2='330' stroke='%23ccc' stroke-width='1'/%3E%3Ctext x='500' y='360' font-size='14' font-weight='bold'%3ETotal:%3C/text%3E%3Ctext x='600' y='360' font-size='14' font-weight='bold'%3E$3,700.00%3C/text%3E%3C/svg%3E"

export function useImagePublicUrl(filePath: string) {
  return useQuery({
    queryKey: ["image-url", filePath],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Return mock SVG image
      return MOCK_IMAGE_URL
    },
    staleTime: Infinity, // Image URLs don't change
  })
}

export function useFieldHeaders(fieldId: string) {
  return useQuery({
    queryKey: ["field-headers", fieldId],
    queryFn: async (): Promise<FieldData> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200))
      // Return mock field headers
      return {
        headers: [
          {
            name: "invoice_number",
            description: "Invoice number",
          },
          {
            name: "invoice_date",
            description: "Date of invoice",
          },
          {
            name: "due_date",
            description: "Due date for payment",
          },
          {
            name: "total_amount",
            description: "Total amount of invoice",
          },
        ],
        lineitem_headers: [
          {
            name: "description",
            description: "Description of the line item",
          },
          {
            name: "quantity",
            description: "Quantity of items",
          },
          {
            name: "unit_price",
            description: "Price per unit",
          },
          {
            name: "amount",
            description: "Total amount (quantity × unit price)",
          },
        ],
      }
    },
    staleTime: Infinity,
  })
}
