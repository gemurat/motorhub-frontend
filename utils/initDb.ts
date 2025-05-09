import { updatePrismaDatabaseUrl } from './dbConfig'
import pool from '@/db/connection'

export async function initializeDatabase() {
  try {
    // Update Prisma database URL
    updatePrismaDatabaseUrl()

    // Test the connection
    const client = await pool.connect()
    console.log('Successfully connected to database')
    client.release()
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
