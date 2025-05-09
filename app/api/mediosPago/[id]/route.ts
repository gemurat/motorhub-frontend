import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, requires_approval, affects_cashbox } = await request.json()
    const id = parseInt(params.id)

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const medioPago = await prisma.paymentMethods.update({
      where: { id },
      data: {
        name,
        requires_approval: requires_approval ?? false,
        affects_cashbox: affects_cashbox ?? true,
      },
    })

    return NextResponse.json(medioPago)
  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.paymentMethods.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}
