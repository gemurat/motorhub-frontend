// import { NextResponse } from 'next/server'
// import { query } from '@/db'

// export async function GET(request: Request) {
//   try {
//     const result = await query(`
//       SELECT
// 	semejante."Id" as "id_semejante",
// 	producto."Id",
//     producto."Parte",
//       producto."Medidas",
//       marca."Marca",
//       modelos."Modelo",
//       producto."Ano",
//       producto."Precio1",
//       producto."Moneda",
//       producto."Existencia",
//       producto."CodigoParte" AS "CodigoProveedor",
//       producto."CodigoOriginal",
// 	    marcaProducto."Marca" AS "MarcaProducto"
//       FROM "TblCat_Semejantes" AS semejante
//       LEFT JOIN "TblCat_Productos" AS producto
//       ON semejante."Producto" = producto."Id"
//       LEFT JOIN "TblCat_Modelos" AS modelos
//       ON semejante."Modelo" = modelos."Id"
//       LEFT JOIN "TblCat_Marcas" AS marca
//       ON marca."Id" = semejante."Marca"
//       LEFT JOIN "TblCat_MarcasProductos" AS marcaProducto
//       ON marcaProducto."Id" = producto."MarcaProducto"`)
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('Error fetching data from PostgreSQL:', error)
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     )
//   }
// }
// export async function PUT(semejanteId: string, existencia: any) {
//   console.log('PUT', semejanteId, existencia)
//   // try {
//   //   const result = await query(
//   //     `
//   //     WITH updated AS (
//   //       SELECT
//   //         semejante."Id" as "id_semejante",
//   //         producto."Id",
//   //         producto."Parte",
//   //         producto."Medidas",
//   //         marca."Marca",
//   //         modelos."Modelo",
//   //         producto."Ano",
//   //         producto."Precio1",
//   //         producto."Moneda",
//   //         producto."Existencia",
//   //         producto."CodigoParte" AS "CodigoProveedor",
//   //         producto."CodigoOriginal",
//   //         marcaProducto."Marca" AS "MarcaProducto"
//   //       FROM "TblCat_Semejantes" AS semejante
//   //       LEFT JOIN "TblCat_Productos" AS producto
//   //       ON semejante."Producto" = producto."Id"
//   //       LEFT JOIN "TblCat_Modelos" AS modelos
//   //       ON semejante."Modelo" = modelos."Id"
//   //       LEFT JOIN "TblCat_Marcas" AS marca
//   //       ON marca."Id" = semejante."Marca"
//   //       LEFT JOIN "TblCat_MarcasProductos" AS marcaProducto
//   //       ON marcaProducto."Id" = producto."MarcaProducto"
//   //       WHERE semejante."Id" = $1
//   //     )
//   //     UPDATE "TblCat_Productos" AS producto
//   //     SET
//   //       "Existencia" = COALESCE($2, producto."Existencia")
//   //     FROM updated
//   //     WHERE producto."Id" = updated."Id"
//   //     RETURNING updated.*
//   //   `,
//   //     [semejanteId, existencia]
//   //   )

//   //   return NextResponse.json(result.rows)
//   // } catch (error) {
//   //   console.error('Error updating data in PostgreSQL:', error)
//   //   return NextResponse.json(
//   //     { error: 'Internal Server Error' },
//   //     { status: 500 }
//   //   )
//   // }
// }
