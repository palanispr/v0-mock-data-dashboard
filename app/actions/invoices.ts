'use server'

import { prisma } from '@/lib/prisma'

export async function getInvoices(userId: string, status?: string) {
  try {
    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const invoices = await prisma.invoiceDocument.findMany({
      where,
      include: {
        pages: true,
        headers: true,
        lineItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { data: invoices, error: null }
  } catch (error) {
    console.error('[Server Action] getInvoices error:', error)
    return { data: null, error: 'Failed to fetch invoices' }
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const invoice = await prisma.invoiceDocument.findUnique({
      where: { id: invoiceId },
      include: {
        pages: true,
        headers: true,
        lineItems: true,
      },
    })

    if (!invoice) {
      return { data: null, error: 'Invoice not found' }
    }

    return { data: invoice, error: null }
  } catch (error) {
    console.error('[Server Action] getInvoiceById error:', error)
    return { data: null, error: 'Failed to fetch invoice' }
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const invoice = await prisma.invoiceDocument.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        pages: true,
        headers: true,
        lineItems: true,
      },
    })

    return { data: invoice, error: null }
  } catch (error) {
    console.error('[Server Action] updateInvoiceStatus error:', error)
    return { data: null, error: 'Failed to update invoice status' }
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const invoice = await prisma.invoiceDocument.delete({
      where: { id: invoiceId },
    })

    return { data: invoice, error: null }
  } catch (error) {
    console.error('[Server Action] deleteInvoice error:', error)
    return { data: null, error: 'Failed to delete invoice' }
  }
}

export async function getInvoiceCounts(userId: string) {
  try {
    const [aiResults, hold, duplicate, approved] = await Promise.all([
      prisma.invoiceDocument.count({
        where: { userId, status: 'ai-results' },
      }),
      prisma.invoiceDocument.count({
        where: { userId, status: 'hold' },
      }),
      prisma.invoiceDocument.count({
        where: { userId, status: 'duplicate' },
      }),
      prisma.invoiceDocument.count({
        where: { userId, status: 'approved' },
      }),
    ])

    return {
      data: { aiResults, hold, duplicate, approved },
      error: null,
    }
  } catch (error) {
    console.error('[Server Action] getInvoiceCounts error:', error)
    return {
      data: null,
      error: 'Failed to fetch invoice counts',
    }
  }
}
