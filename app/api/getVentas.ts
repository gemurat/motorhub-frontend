import { NextApiRequest, NextApiResponse } from "next"
import { query } from "../../db"

export async function getVentas(startDate?: string, endDate?: string) {
  try {
    let result
    if (startDate && endDate) {
      result = await query(
        'SELECT * FROM "TblCtrl_SaldosVentas" WHERE "Fecha" BETWEEN $1 AND $2',
        [startDate, endDate]
      )
    } else if (startDate) {
      result = await query(
        'SELECT * FROM "TblCtrl_SaldosVentas" WHERE "Fecha" >= $1',
        [startDate]
      )
    } else if (endDate) {
      result = await query(
        'SELECT * FROM "TblCtrl_SaldosVentas" WHERE "Fecha" <= $1',
        [endDate]
      )
    } else {
      result = await query('SELECT * FROM "TblCtrl_SaldosVentas"')
    }
    console.log("result", result.rows)
    // return result.rows
  } catch (error) {
    console.error("Error fetching data from PostgreSQL:", error)
    throw new Error("Internal Server Error")
  }
}
