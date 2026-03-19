export async function getTotal(): Promise<number> {
  try {
    console.log('[v0] Fetching total storage usage')
    // Mock: return 100 MB of storage used out of 1 GB
    await new Promise(resolve => setTimeout(resolve, 200))
    return 104857600 // 100 MB in bytes
  } catch (error) {
    console.error('Error fetching total size:', error)
    throw error
  }
}
