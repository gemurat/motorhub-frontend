import { NextResponse } from 'next/server'
import { query } from '@/db'

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customerId')
    let result
    if (customerId) {
      result = await query(
        `SELECT * FROM public."GiftCards" WHERE customer_id LIKE $1 AND status = 'ACTIVE' ORDER BY issue_date DESC`,
        [`%${customerId}%`]
      )
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No gift cards found' },
          { status: 404 }
        )
      } else {
        return NextResponse.json(
          { success: true, data: result.rows },
          { status: 200 }
        )
      }
    } else {
      result = await query(`SELECT * FROM public."GiftCards"`)
    }

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json()

    const { code, customerId, balance, issueDate, expiryDate, status } = body

    if (!code || !balance || !issueDate || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const result = await query(
        `SELECT * FROM public."Clients" WHERE id = $1`,
        [customerId]
      )

      // If the user does not exist, insert the user data
      if (result.rows.length === 0) {
        await query(`INSERT INTO public."Clients" (id) VALUES ($1)`, [
          customerId,
        ])
      }
    } catch (error) {
      console.error('Database error:', error)
      throw new Error('Database error')
    }

    const result = await query(
      `SELECT * FROM public."GiftCards" WHERE code = $1`,
      [code]
    )

    // If the gift card already exists, return an error
    if (result.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Gift card already exists' },
        { status: 400 }
      )
    }

    // Insert Gift Card
    await query(
      `INSERT INTO public."GiftCards" (code, customer_id, balance, issue_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [code, customerId, balance, issueDate, expiryDate, status]
    )

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Database error')
  }
}
