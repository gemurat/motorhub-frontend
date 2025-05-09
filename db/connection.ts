'use server'

import { Pool } from 'pg'
import { getDatabaseUrl } from '@/utils/dbConfig'

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test the connection on startup
pool.on('connect', () => {
  console.log('Connected to database:', process.env.DB_ENVIRONMENT)
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error executing query', { text, error })
    throw error
  }
}
