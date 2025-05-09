import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Products } from '@/lib/generated/prisma'

export async function GET(request: Request) {
  //   const semejanteId = searchParams.get("semejanteId")

  try {
    const products = await prisma.products.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        ProductBrands: true,
        ProductCategories: true,
        ProductCompatibility: {
          include: {
            VehicleModels: {
              include: {
                VehicleBrands: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    const processedResult = products.map(
      (
        product: Products & {
          ProductBrands: { name: string } | null
          ProductCompatibility: Array<{
            VehicleModels: {
              name: string
              VehicleBrands: { name: string } | null
            } | null
          }>
        }
      ) => ({
        id: product.id,
        internal_code: product.internal_code,
        description: product.description,
        measurements: product.measurements,
        brands:
          product.ProductCompatibility[0]?.VehicleModels?.VehicleBrands?.name ||
          '',
        models: product.ProductCompatibility[0]?.VehicleModels?.name || '',
        year: product.year,
        price: product.price,
        stock: product.stock,
        moneda: product.moneda,
        codigoParte: product.codigo_parte,
        codigoOriginal: product.codigo_original,
        productBrands: product.ProductBrands?.name || '',
      })
    )

    return NextResponse.json(processedResult)
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
