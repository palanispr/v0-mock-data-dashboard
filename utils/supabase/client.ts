export async function fetchUserUsage(userId: string): Promise<{ data: { uploads_used: number; extractions_used: number } | null; error: null } | { data: null; error: { message: string } }> {
  try {
    console.log(`[v0] Fetching user usage for: ${userId}`)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock data: user has uploaded 45 documents and done 120 extractions
    return {
      data: {
        uploads_used: 45,
        extractions_used: 120,
      },
      error: null,
    }
  } catch (error) {
    console.error('Error fetching user usage:', error)
    return {
      data: null,
      error: { message: 'Failed to fetch user usage' },
    }
  }
}
