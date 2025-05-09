'use server'

import { getPool } from '../../db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getPool()
    const result = await pool.query('SELECT * FROM "TblCat_Modelos"')
    const processedResult = result.rows.map(
      (row: { Id: any; Marca: any; Modelo: any }) => ({
        id: row.Id,
        brand: row.Marca,
        name: row.Modelo,
      })
    )
    return NextResponse.json(processedResult)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
