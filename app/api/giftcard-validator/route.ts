import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { GiftCards } from '@/lib/generated/prisma'

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url)
    const giftCardCode = url.searchParams.get('giftcardcode')

    if (!giftCardCode) {
      return NextResponse.json(
        { success: false, error: 'No code found' },
        { status: 400 }
      )
    }

    const giftCard = await prisma.giftCards.findFirst({
      where: {
        code: giftCardCode,
        status: 'ACTIVE',
      },
    })

    if (!giftCard) {
      return NextResponse.json(
        { success: false, error: 'No gift cards found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: giftCard }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
