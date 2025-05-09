import { getSession } from '@auth0/nextjs-auth0'
import { userRole } from '@/actions/userRole'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const role = await userRole()
    return NextResponse.json({ role })
  } catch (error) {
    console.error('Error in role API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    )
  }
}
