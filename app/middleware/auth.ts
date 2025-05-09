import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { CashBoxService } from '../services/cashBoxService'

export async function withAuth(handler: Function) {
  return async (req: Request) => {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const user = await CashBoxService.getUserCashBox(session.user.email)

      // Create a new request with the user's sub in the headers
      const newReq = new Request(req.url, {
        method: req.method,
        headers: {
          ...Object.fromEntries(req.headers),
          'x-user-sub': session.user.sub,
        },
        body: req.body,
      })

      return handler(newReq, user)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Authentication error',
        },
        { status: 500 }
      )
    }
  }
}
