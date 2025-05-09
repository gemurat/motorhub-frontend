'use server'

import { getPool } from '../../db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pool = await getPool()
    const result = await pool.query('SELECT * FROM "TblCat_Familias"')
    const processedResult = result.rows.map(
      (row: {
        Id: any
        Familia: any
        Porcentaje: any
        Prefijo: any
        Consecutivo: any
      }) => ({
        id: row.Id,
        name: row.Familia,
        consecutivo: row.Consecutivo,
      })
    )
    return NextResponse.json(processedResult)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
