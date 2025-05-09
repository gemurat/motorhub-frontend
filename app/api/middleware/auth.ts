import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

export const withAuth = (handler: Function) => async (req: Request) => {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, session.user)
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
