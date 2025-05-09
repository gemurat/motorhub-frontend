import { NextResponse } from 'next/server'
import { testConnection } from '@/db'

export async function GET() {
  try {
    const result = await testConnection()
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
