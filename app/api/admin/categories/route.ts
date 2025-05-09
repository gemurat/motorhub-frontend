import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface Category {
  id: string
  name: string
  created_at: Date
  updated_at: Date
  _count: {
    Products: number
  }
}

export async function GET() {
  try {
    const categories = await prisma.productCategories.findMany({
      include: {
        _count: {
          select: {
            Products: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    const formattedCategories = categories.map((category: Category) => ({
      id: category.id,
      name: category.name,
      productCount: category._count.Products,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error fetching categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const category = await prisma.productCategories.create({
      data: {
        name: data.name,
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
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error creating category' },
      { status: 500 }
    )
  }
}
