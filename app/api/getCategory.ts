import { NextApiRequest, NextApiResponse } from "next"
import { query } from "../../db"

export async function getCategory() {
  try {
    const result = await query('SELECT * FROM "TblCat_Familias"')
    const processedResult = result.rows.map(
      (row: {
        Id: any
        Familia: any
        Porcentaje: any
        Prefijo: any
        Consecutivo: any
      }) => ({
        id: row.Id,
        name: row.Familia,
        consecutivo: row.Consecutivo,
      })
    )
    // console.log("result", processedResult)

    return processedResult
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error)
    throw new Error("Internal Server Error")
  }
}
