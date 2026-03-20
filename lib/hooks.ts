'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceCounts,
} from '@/app/actions/invoices'
import {
  createInvoiceDocument,
  updateInvoiceHeaders,
  updateInvoiceLineItems,
} from '@/app/actions/uploads'
import { getFieldDefinitions, createCustomField, updateField } from '@/app/actions/fields'
import { getUserProfile, getUserUsage } from '@/app/actions/users'

// Invoice Hooks
export function useInvoices(userId: string, status?: string) {
  return useQuery({
    queryKey: ['invoices', userId, status],
    queryFn: () => getInvoices(userId, status),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvoiceCounts(userId: string) {
  return useQuery({
    queryKey: ['invoice-counts', userId],
    queryFn: () => getInvoiceCounts(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string; status: string }) =>
      updateInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-counts'] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: string) => deleteInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-counts'] })
    },
  })
}

// Upload Hooks
export function useCreateInvoiceDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: any) => createInvoiceDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-counts'] })
    },
  })
}

export function useUpdateInvoiceHeaders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invoiceId,
      headers,
    }: {
      invoiceId: string
      headers: Record<string, string>
    }) => updateInvoiceHeaders(invoiceId, headers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
    },
  })
}

export function useUpdateInvoiceLineItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invoiceId,
      lineItems,
    }: {
      invoiceId: string
      lineItems: Array<Record<string, any>>
    }) => updateInvoiceLineItems(invoiceId, lineItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
    },
  })
}

// Field Hooks
export function useFieldDefinitions() {
  return useQuery({
    queryKey: ['field-definitions'],
    queryFn: () => getFieldDefinitions(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateCustomField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      name,
      description,
      type,
    }: {
      name: string
      description: string
      type?: string
    }) => createCustomField(name, description, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-definitions'] })
    },
  })
}

export function useUpdateField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      fieldId,
      description,
    }: {
      fieldId: string
      description: string
    }) => updateField(fieldId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-definitions'] })
    },
  })
}

// User Hooks
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useUserUsage(userId: string) {
  return useQuery({
    queryKey: ['user-usage', userId],
    queryFn: () => getUserUsage(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
