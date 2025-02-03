import { NextResponse } from 'next/server'
import { query } from '@/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const semejanteId = searchParams.get('semejanteId')

  if (!semejanteId) {
    return NextResponse.json(
      { error: 'semejanteId is required' },
      { status: 400 }
    )
  }

  try {
    const result = await query(
      `SELECT 
      producto."Id",
      producto."Parte",
      producto."Medidas",
      marca."Marca",
      modelos."Modelo",
      producto."Ano",
      producto."Precio1",
      producto."Moneda",
      producto."Existencia",
      producto."CodigoParte" AS "CodigoProveedor",
      producto."CodigoOriginal"
      FROM "TblCat_Semejantes" AS semejante
      LEFT JOIN "TblCat_Productos" AS producto
      ON semejante."Producto" = producto."Id"
      LEFT JOIN "TblCat_Modelos" AS modelos
      ON semejante."Modelo" = modelos."Id"
      LEFT JOIN "TblCat_Marcas" AS marca
      ON marca."Id" = semejante."Marca"
      LEFT JOIN "TblCat_MarcasProductos" AS marcaProducto
      ON marcaProducto."Id" = producto."MarcaProducto"
      WHERE producto."Id" = $1`,
      [semejanteId]
    )
    const processedResult = result.rows.map(
      (row: {
        Id: string
        Parte: string
        Medidas: string
        Marca: string
        Modelo: string
        Ano: string
        Precio1: number
        Moneda: string
        Existencia: number
        CodigoProveedor: string
        CodigoOriginal: string
      }) => ({
        id: row.Id,
        modelo: row.Modelo,
        ano: row.Ano,
        parte: row.Parte,
        existencia: row.Existencia,
        marca: row.Marca,
        precio1: row.Precio1,
        measurements: row.Medidas,
        currency: row.Moneda,
        supplierCode: row.CodigoProveedor,
        originalCode: row.CodigoOriginal,
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
