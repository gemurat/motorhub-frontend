import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface Brand {
  id: number
  name: string
  created_at: Date
  updated_at: Date
}

export async function GET() {
  try {
    console.log('Fetching brands...')

    // First get all brands
    const brands = await prisma.productBrands.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    // Then get the count of products for each brand
    const brandsWithCounts = await Promise.all(
      brands.map(async (brand: Brand) => {
        const productCount = await prisma.products.count({
          where: {
            product_brand_id: brand.id,
          },
        })
        return {
          ...brand,
          _count: {
            products: productCount,
          },
        }
      })
    )

    console.log('Successfully fetched brands with counts:', brandsWithCounts)

    return NextResponse.json(brandsWithCounts)
  } catch (error) {
    console.error('Detailed error fetching brands:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Error al obtener las marcas',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Error al obtener las marcas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Creating brand with data:', data)

    if (!data.name) {
      return NextResponse.json(
        { error: 'El nombre de la marca es requerido' },
        { status: 400 }
      )
    }

    const brand = await prisma.productBrands.create({
      data: {
        name: data.name,
      },
    })

    console.log('Successfully created brand:', brand)
    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error creating brand:', error)

    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una marca con ese nombre' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error al crear la marca' },
      { status: 500 }
    )
  }
}
