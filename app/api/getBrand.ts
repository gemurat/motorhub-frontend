import { query } from '../../db'

export async function getBrand() {
  try {
    const result = await query('SELECT * FROM "TblCat_Marcas"')
    const processedResult = result.rows.map((row: { Id: any; Marca: any }) => ({
      id: row.Id,
      name: row.Marca,
    }))
    return processedResult
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error)
    throw new Error('Internal Server Error')
  }
}
