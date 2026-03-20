'use server'

import { prisma } from '@/lib/prisma'

export async function getFieldDefinitions() {
  try {
    const fields = await prisma.fieldDefinition.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    // Separate into headers and line item headers
    const headers = fields.filter((f) => !f.isCustom).slice(0, 4)
    const lineitem_headers = fields.filter((f) => !f.isCustom).slice(4)

    return {
      data: {
        headers: headers.map((f) => ({
          name: f.name,
          description: f.description,
        })),
        lineitem_headers: lineitem_headers.map((f) => ({
          name: f.name,
          description: f.description,
        })),
      },
      error: null,
    }
  } catch (error) {
    console.error('[Server Action] getFieldDefinitions error:', error)
    return { data: null, error: 'Failed to fetch field definitions' }
  }
}

export async function createCustomField(
  name: string,
  description: string,
  type: string = 'text'
) {
  try {
    const field = await prisma.fieldDefinition.create({
      data: {
        name,
        description,
        type,
        isCustom: true,
      },
    })

    return { data: field, error: null }
  } catch (error) {
    console.error('[Server Action] createCustomField error:', error)
    return { data: null, error: 'Failed to create custom field' }
  }
}

export async function updateField(
  fieldId: string,
  description: string
) {
  try {
    const field = await prisma.fieldDefinition.update({
      where: { id: fieldId },
      data: { description },
    })

    return { data: field, error: null }
  } catch (error) {
    console.error('[Server Action] updateField error:', error)
    return { data: null, error: 'Failed to update field' }
  }
}
