'use server'

import { Pool } from 'pg'

interface PostgresError extends Error {
  code?: string
  detail?: string
  hint?: string
  position?: string
  where?: string
}

// Log database configuration
const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not defined in environment variables')
  throw new Error('DATABASE_URL is required')
}

// Log sanitized connection string (without password)
const sanitizedUrl = dbUrl.replace(
  /(postgresql:\/\/[^:]+):([^@]+)@/,
  '$1:****@'
)
console.log('Attempting to connect with:', sanitizedUrl)

const pool = new Pool({
  connectionString: dbUrl,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

pool.on('connect', () => {
  console.log('New client connected to the pool')
})

pool.on('acquire', () => {
  console.log('Client checked out from the pool')
})

pool.on('remove', () => {
  console.log('Client removed from the pool')
})

export async function getPool() {
  try {
    // Test the connection
    const client = await pool.connect()
    console.log('Database connection successful')

    // Test a simple query
    const result = await client.query('SELECT version()')
    console.log('PostgreSQL version:', result.rows[0].version)

    client.release()
    return pool
  } catch (error) {
    const pgError = error as PostgresError
    console.error('Failed to connect to database. Error details:', {
      message: pgError.message,
      code: pgError.code,
      detail: pgError.detail,
      hint: pgError.hint,
      position: pgError.position,
      where: pgError.where,
    })
    throw error
  }
}

export async function query(text: string, params?: any[]) {
  console.log('Executing query:', text)
  console.log('Query parameters:', params)

  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    console.log('Query executed successfully')
    console.log('Number of rows returned:', result.rowCount)
    return result
  } catch (error) {
    const pgError = error as PostgresError
    console.error('Query execution failed. Error details:', {
      message: pgError.message,
      code: pgError.code,
      detail: pgError.detail,
      hint: pgError.hint,
      position: pgError.position,
      where: pgError.where,
    })
    throw error
  } finally {
    client.release()
  }
}

// Test function to verify connection
export async function testConnection() {
  try {
    console.log('Starting connection test...')
    const result = await query(
      'SELECT NOW() as current_time, version() as version'
    )
    console.log('Test query result:', result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error('Test connection failed. Full error:', error)
    throw error
  }
}
