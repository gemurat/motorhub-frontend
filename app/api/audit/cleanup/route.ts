import { NextResponse } from 'next/server'
import { cleanupOldAuditRecords } from '@/app/services/audit-cleanup'

export async function POST() {
  try {
    const result = await cleanupOldAuditRecords()

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in audit cleanup endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
