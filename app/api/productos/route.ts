import { NextResponse } from 'next/server'
import { query } from '@/db'

export async function GET(request: Request) {
  //   const semejanteId = searchParams.get("semejanteId")

  try {
    const result = await query(
      `SELECT 
	  "prods".id,
	  "prods".internal_code,
	  "prods".description,
	  "prods".measurements,
	  "brands".name AS "brand",
	  "models".name AS "model",
	  "prods".year,
	  "prods".price,
	  "prods".stock,
	  "categories".name AS "category",
	  "prods".moneda,
	  "prods".codigo_parte,
	  "prods".codigo_original,
	  "ProductBrands".name AS "productBrand"
FROM "Products" AS "prods"
LEFT JOIN "ProductCategories" AS "categories"
ON "prods".product_category_id = "categories".id 
LEFT JOIN "ProductBrands"
ON "ProductBrands".id = "prods".product_brand_id
LEFT JOIN "ProductCompatibility"
ON "prods".id = "ProductCompatibility".product_id
LEFT JOIN "VehicleModels" AS "models"
ON "models".id = "ProductCompatibility".vehicle_model_id
LEFT JOIN "VehicleBrands" AS "brands"
ON "brands".id = "models".vehicle_brand_id
order by "prods".id`
    )
    const processedResult = result.rows.map(
      (row: {
        id: string
        internal_code: string
        description: string
        measurements: string
        brand: string
        model: string
        year: string
        price: number
        stock: number
        category: string
        moneda: string
        codigo_parte: string
        codigo_original: string
        productBrand: string
      }) => ({
        id: row.id,
        internal_code: row.internal_code,
        description: row.description,
        measurements: row.measurements,
        brands: row.brand,
        models: row.model,
        year: row.year,
        price: row.price,
        stock: row.stock,
        moneda: row.moneda,
        codigoParte: row.codigo_parte,
        codigoOriginal: row.codigo_original,
        productBrands: row.productBrand,
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
