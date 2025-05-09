import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { id } = params

    // If only status is being updated, allow it without other fields
    if (Object.keys(data).length === 1 && data.status) {
      const product = await prisma.products.update({
        where: { id: parseInt(id) },
        data: {
          status: data.status,
        },
      })
      return NextResponse.json(product)
    }

    // For other updates, require internal_code and description
    if (!id || !data.internal_code || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update product
    const product = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        internal_code: data.internal_code,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        error: 'Error updating product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Soft delete by updating status to INACTIVE
    const product = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        status: 'INACTIVE',
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error soft deleting product:', error)
    return NextResponse.json(
      {
        error: 'Error soft deleting product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
