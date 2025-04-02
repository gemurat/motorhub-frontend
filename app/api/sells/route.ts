import { NextResponse } from 'next/server'
import { query } from '@/db'

export async function GET(request: Request) {
  try {
    const result = await query(
      `SELECT 
        pm.name AS payment_method,
        COUNT(p.id) AS payment_count,
        SUM(p.amount) AS total_amount
    FROM 
        public."Payments" p
    JOIN 
        public."PaymentMethods" pm ON p.payment_method_id = pm.id
    WHERE 
        p.status = 'APPROVED'
        AND p.date::date = CURRENT_DATE
    GROUP BY 
        pm.name
    ORDER BY 
        total_amount DESC;`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
