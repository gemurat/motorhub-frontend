import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [brands, categories] = await Promise.all([
      prisma.productBrands.findMany(),
      prisma.productCategories.findMany(),
    ])

    return NextResponse.json({
      brands,
      categories,
    })
  } catch (error) {
    console.error('Error fetching product metadata:', error)
    return NextResponse.json(
      { error: 'Error fetching product metadata' },
      { status: 500 }
    )
  }
}
