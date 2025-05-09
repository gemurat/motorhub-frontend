import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { GiftCards } from '@/lib/generated/prisma'

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customerId')
    let result: GiftCards[]

    if (customerId) {
      result = await prisma.giftCards.findMany({
        where: {
          customer_id: {
            contains: customerId,
          },
          status: 'ACTIVE',
        },
        orderBy: {
          issue_date: 'desc',
        },
      })

      if (result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No gift cards found' },
          { status: 404 }
        )
      }
    } else {
      result = await prisma.giftCards.findMany()
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const { code, customerId, balance, issueDate, expiryDate, status } = body

    if (!code || !balance || !issueDate || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if client exists, if not create it
    if (customerId) {
      await prisma.clients.upsert({
        where: { id: customerId },
        update: {},
        create: { id: customerId },
      })
    }

    // Check if gift card already exists
    const existingGiftCard = await prisma.giftCards.findUnique({
      where: { code },
    })

    if (existingGiftCard) {
      return NextResponse.json(
        { success: false, error: 'Gift card already exists' },
        { status: 400 }
      )
    }

    // Create gift card
    await prisma.giftCards.create({
      data: {
        code,
        customer_id: customerId,
        balance,
        issue_date: new Date(issueDate),
        expiry_date: expiryDate ? new Date(expiryDate) : null,
        status,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
