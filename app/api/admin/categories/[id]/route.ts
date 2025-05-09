import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json()
    const { id } = params

    const category = await prisma.productCategories.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
      },
      include: {
        _count: {
          select: {
            Products: true,
          },
        },
      },
    })

    const formattedCategory = {
      id: category.id,
      name: category.name,
      productCount: category._count.Products,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    }

    return NextResponse.json(formattedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Error updating category' },
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

    await prisma.productCategories.delete({
      where: {
        id: parseInt(id),
      },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error deleting category' },
      { status: 500 }
    )
  }
}
