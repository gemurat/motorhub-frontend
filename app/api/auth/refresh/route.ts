import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // The session will be automatically refreshed by Auth0
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
