'use server'

import { prisma } from '@/lib/prisma'

interface CreateInvoiceDocumentInput {
  userId: string
  fileName: string
  clientName: string
  pageCount: number
  pages: Array<{
    pageNumber: number
    imageUrl: string
  }>
  headers: Record<string, string>
  lineItems: Array<Record<string, any>>
}

export async function createInvoiceDocument(input: CreateInvoiceDocumentInput) {
  try {
    const invoice = await prisma.invoiceDocument.create({
      data: {
        userId: input.userId,
        fileName: input.fileName,
        clientName: input.clientName,
        pageCount: input.pageCount,
        status: 'ai-results',
        pages: {
          create: input.pages,
        },
        headers: {
          create: Object.entries(input.headers).map(([fieldName, fieldValue]) => ({
            fieldName,
            fieldValue,
          })),
        },
        lineItems: {
          create: input.lineItems.map((item) => ({
            data: item,
          })),
        },
      },
      include: {
        pages: true,
        headers: true,
        lineItems: true,
      },
    })

    return { data: invoice, error: null }
  } catch (error) {
    console.error('[Server Action] createInvoiceDocument error:', error)
    return { data: null, error: 'Failed to create invoice document' }
  }
}

export async function updateInvoiceHeaders(
  invoiceId: string,
  headers: Record<string, string>
) {
  try {
    // Delete existing headers
    await prisma.invoiceHeader.deleteMany({
      where: { invoiceId },
    })

    // Create new headers
    const newHeaders = await prisma.invoiceHeader.createMany({
      data: Object.entries(headers).map(([fieldName, fieldValue]) => ({
        invoiceId,
        fieldName,
        fieldValue,
      })),
    })

    return { data: newHeaders, error: null }
  } catch (error) {
    console.error('[Server Action] updateInvoiceHeaders error:', error)
    return { data: null, error: 'Failed to update invoice headers' }
  }
}

export async function updateInvoiceLineItems(
  invoiceId: string,
  lineItems: Array<Record<string, any>>
) {
  try {
    // Delete existing line items
    await prisma.invoiceLineItem.deleteMany({
      where: { invoiceId },
    })

    // Create new line items
    const newLineItems = await prisma.invoiceLineItem.createMany({
      data: lineItems.map((item) => ({
        invoiceId,
        data: item,
      })),
    })

    return { data: newLineItems, error: null }
  } catch (error) {
    console.error('[Server Action] updateInvoiceLineItems error:', error)
    return { data: null, error: 'Failed to update invoice line items' }
  }
}
