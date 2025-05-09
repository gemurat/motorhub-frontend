import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface CategoryWithCount {
  _count: {
    Products: number
  }
}

export async function GET() {
  try {
    // Get total categories
    const totalCategories = await prisma.productCategories.count()

    // Get categories with products
    const categoriesWithProducts = await prisma.productCategories.count({
      where: {
        Products: {
          some: {},
        },
      },
    })

    // Calculate average products per category
    const categoriesWithCounts = await prisma.productCategories.findMany({
      include: {
        _count: {
          select: {
            Products: true,
          },
        },
      },
    })

    const totalProducts = categoriesWithCounts.reduce(
      (sum: number, category: CategoryWithCount) =>
        sum + category._count.Products,
      0
    )

    const averageProducts =
      totalCategories > 0
        ? Number((totalProducts / totalCategories).toFixed(1))
        : 0

    return NextResponse.json({
      totalCategories,
      activeCategories: totalCategories, // For now, all categories are considered active
      categoriesWithProducts,
      averageProductsPerCategory: averageProducts,
    })
  } catch (error) {
    console.error('Error fetching category stats:', error)
    return NextResponse.json(
      { error: 'Error fetching category statistics' },
      { status: 500 }
    )
  }
}
