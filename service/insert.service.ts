import { useMutation } from "@tanstack/react-query"
import type { LineItem, HeadersMap } from "@/types/invoice"

interface UpdateInvoiceStatusPayload {
  extractionId: string
  invoiceDocumentId: string
  userId: string
  orgId: string
  clientId: string
  clientName: string
  filePath: string
  headers: HeadersMap
  lineItems: LineItem[]
  newStatus: 'hold' | 'duplicate' | 'approved' | null
}

export function useUpdateInvoiceStatus() {
  return useMutation({
    mutationFn: async (payload: UpdateInvoiceStatusPayload) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Validate payload
      if (!payload.invoiceDocumentId) {
        throw new Error("Invoice document ID is required")
      }

      // Log the payload (mock implementation)
      console.log("[v0] Updating invoice status with payload:", payload)

      // Return mock success response
      return {
        success: true,
        message: "Invoice updated successfully",
        data: payload,
      }
    },
    retry: 1,
    onError: (error) => {
      console.error("[v0] Error updating invoice:", error)
    },
  })
}
