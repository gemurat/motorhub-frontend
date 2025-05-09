import { NextResponse } from 'next/server'
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma'

export const GET = withApiAuthRequired(async function GET() {
  try {
    const session = await getSession()
    const user = session?.user

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('Session user:', user)

    // First, get the user's role from the database
    const dbUser = await prisma.users.findFirst({
      where: {
        email: user.email,
      },
      select: {
        role: true,
        store_id: true,
        cashbox_id: true,
      },
    })

    console.log('Database user:', dbUser)

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // For cashiers, get their assigned store and cashbox
    if (dbUser.role === 'CAJERO') {
      const userData = await prisma.users.findFirst({
        where: {
          email: user.email,
          role: 'CAJERO',
        },
        include: {
          Store: {
            select: {
              id: true,
              name: true,
            },
          },
          CashBoxes: {
            select: {
              id: true,
              local_name: true,
            },
          },
        },
      })

      console.log('User data with store and cashbox:', userData)

      if (!userData?.Store || !userData?.CashBoxes) {
        return NextResponse.json(
          { error: 'No se encontró una caja asignada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        storeId: userData.Store.id.toString(),
        storeName: userData.Store.name,
        cashboxId: userData.CashBoxes.id.toString(),
        cashboxName: userData.CashBoxes.local_name,
      })
    }

    // For administrators, return empty data (they'll select store/cashbox from UI)
    return NextResponse.json({
      storeId: '',
      storeName: '',
      cashboxId: '',
      cashboxName: '',
    })
  } catch (error) {
    console.error('Error fetching user cashbox:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user cashbox' },
      { status: 500 }
    )
  }
})
