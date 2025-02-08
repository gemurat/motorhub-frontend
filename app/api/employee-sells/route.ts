import { NextResponse } from 'next/server'
import { query } from '@/db'

export async function GET(request: Request) {
  try {
    type SellerData = {
      seller_id: number
      seller_name: string
      total_amount: string
    }

    const result: { rows: SellerData[] } = await query(
      `SELECT
        u.id AS seller_id,
        u.username AS seller_name,
        SUM(o.total_amount) AS total_amount
    FROM
        public."Orders" o
    JOIN
        public."Users" u ON o.seller_id = u.id
    WHERE
        o.status = 'PAID'
        AND DATE(o.order_date) = CURRENT_DATE
    GROUP BY
        u.id, u.username
    ORDER BY
        total_amount DESC;`
    )

    const processedResult = result.rows

    return NextResponse.json(processedResult)
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
