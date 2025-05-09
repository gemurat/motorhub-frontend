import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const brand = await prisma.productBrands.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        name: data.name,
      },
    })
    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Error updating brand' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.productBrands.delete({
      where: {
        id: parseInt(params.id),
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Error deleting brand' }, { status: 500 })
  }
}
