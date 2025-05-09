import { NextResponse } from 'next/server'
import { withApiAuthRequired } from '@auth0/nextjs-auth0'

export const GET = withApiAuthRequired(async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual database query
    const cashboxes = [
      { id: '1', name: 'Caja 1', storeId: '1' },
      { id: '2', name: 'Caja 2', storeId: '1' },
      { id: '3', name: 'Caja 1', storeId: '2' },
      { id: '4', name: 'Caja 2', storeId: '2' },
      { id: '5', name: 'Caja 1', storeId: '3' },
      { id: '6', name: 'Caja 2', storeId: '3' },
    ].filter((cashbox) => cashbox.storeId === storeId)

    return NextResponse.json(cashboxes)
  } catch (error) {
    console.error('Error fetching cashboxes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cashboxes' },
      { status: 500 }
    )
  }
})
