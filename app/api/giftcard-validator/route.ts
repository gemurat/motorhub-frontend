import { NextResponse } from 'next/server'
import { query } from '@/db'

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url)
    const giftCardCode = url.searchParams.get('giftcardcode')
    let result
    if (giftCardCode) {
      console.log('search by id:', giftCardCode)

      result = await query(
        `SELECT * FROM public."GiftCards" WHERE code = $1 AND status = 'ACTIVE'`,
        [`${giftCardCode}`]
      )
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No gift cards found' },
          { status: 404 }
        )
      } else {
        return NextResponse.json(
          { success: true, data: result.rows[0] },
          { status: 200 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'No code found' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
