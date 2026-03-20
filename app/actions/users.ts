'use server'

import { prisma } from '@/lib/prisma'

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { data: null, error: 'User not found' }
    }

    return { data: user, error: null }
  } catch (error) {
    console.error('[Server Action] getUserProfile error:', error)
    return { data: null, error: 'Failed to fetch user profile' }
  }
}

export async function getUserUsage(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { data: null, error: 'User not found' }
    }

    const invoiceCount = await prisma.invoiceDocument.count({
      where: { userId },
    })

    return {
      data: {
        uploads_limit: user.uploads_limit,
        uploads_used: invoiceCount,
        uploads_remaining: user.uploads_limit - invoiceCount,
      },
      error: null,
    }
  } catch (error) {
    console.error('[Server Action] getUserUsage error:', error)
    return { data: null, error: 'Failed to fetch user usage' }
  }
}

export async function createUser(email: string, name: string) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        uploads_limit: 500,
      },
    })

    return { data: user, error: null }
  } catch (error) {
    console.error('[Server Action] createUser error:', error)
    return { data: null, error: 'Failed to create user' }
  }
}
