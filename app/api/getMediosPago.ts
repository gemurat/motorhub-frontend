'use server'

import { getPool } from '../../db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getPool()
    const result = await pool.query('SELECT * FROM "PaymentMethods"')
    const data = result.rows.map((row: { id: number; name: string }) => ({
      id: row.id,
      name: row.name,
    }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
