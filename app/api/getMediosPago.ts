import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '../../db'

export async function getMediosPago() {
  try {
    const result = await query('SELECT * FROM "PaymentMethods"')
    const data = result.rows.map((row: { id: number; name: string }) => ({
      id: row.id,
      name: row.name,
    }))
    return data
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error)
    throw new Error('Internal Server Error')
  }
}
