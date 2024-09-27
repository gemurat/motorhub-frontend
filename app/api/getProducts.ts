import { NextApiRequest, NextApiResponse } from "next"
import { query } from "../../db"

export async function getProducts() {
  try {
    const result = await query('SELECT * FROM "View_Productos"')
    const processedResult = result.rows.map(
      (row: { Id: any; Marca: any; Modelo: any }) => ({
        id: row.Id,
        brand: row.Marca,
        name: row.Modelo,
      })
    )
    // console.log("result", result)
    return result.rows
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error)
    throw new Error("Internal Server Error")
  }
}
