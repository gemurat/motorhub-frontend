import { NextApiRequest, NextApiResponse } from "next"
import { query } from "../../db"

export async function getProducts() {
  try {
    const result = await query('SELECT * FROM "View_Productos"')
    return result.rows
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error)
    throw new Error("Internal Server Error")
  }
}
