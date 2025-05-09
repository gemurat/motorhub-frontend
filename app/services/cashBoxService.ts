import { query } from '@/db'
import {
  MovementType,
  MovementStatus,
  CashBoxMovement,
  CashBox,
  User,
} from '../types/cashBox'

export class CashBoxService {
  static async getUserCashBox(email: string): Promise<User> {
    const queryText = `
      SELECT id, caja
      FROM public."Users"
      WHERE username = $1;
    `
    const result = await query(queryText, [email])
    if (result.rows.length === 0) {
      throw new Error('User not found')
    }
    return result.rows[0]
  }

  static async getCashBoxBalance(cashBoxId: number): Promise<CashBox> {
    const queryText = `
      SELECT current_balance, last_updated
      FROM public."CashBoxes"
      WHERE id = $1;
    `
    const result = await query(queryText, [cashBoxId])
    if (result.rows.length === 0) {
      throw new Error('Cash box not found')
    }
    return result.rows[0]
  }

  static async getTodayExpenses(email: string): Promise<CashBoxMovement[]> {
    const queryText = `
      SELECT 
        c.id,
        c.type,
        c.description,
        c.amount, 
        c.date, 
        c.status,
        u1.username AS created_by_username,
        u2.username AS approved_by_username
      FROM public."CashBoxMovements" c
      JOIN public."Users" u1 ON u1.id = c.created_by
      LEFT JOIN public."Users" u2 ON u2.id = c.approved_by
      WHERE c.type = $1 
        AND u1.username = $2 
        AND c.date::date = CURRENT_DATE
      ORDER BY c.id DESC
    `
    const result = await query(queryText, [MovementType.EXPENSE, email])
    return result.rows
  }

  static async createCashBoxMovement(
    cashBoxId: number,
    type: MovementType,
    amount: number,
    description: string,
    userId: number
  ): Promise<number> {
    const queryText = `
      INSERT INTO public."CashBoxMovements" 
        (cash_box_id, type, amount, description, date, status, created_by)
      VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      RETURNING id;
    `
    const result = await query(queryText, [
      cashBoxId,
      type,
      amount,
      description,
      MovementStatus.PENDING,
      userId,
    ])
    return result.rows[0].id
  }

  static async updateMovementStatus(
    movementId: number,
    status: MovementStatus,
    userId: number,
    cashBoxId: number,
    type: MovementType,
    amount: number
  ): Promise<void> {
    const queryText = `
      BEGIN;
      
      UPDATE public."CashBoxMovements"
      SET status = $1,
          approved_by = $2,
          approval_date = NOW()
      WHERE id = $3
      RETURNING *;

      ${
        status === MovementStatus.APPROVED
          ? `
        UPDATE public."CashBoxes"
        SET current_balance = current_balance + $4,
            last_updated = NOW()
        WHERE id = $5;
      `
          : ''
      }
      
      COMMIT;
    `

    const params = [status, userId, movementId]
    if (status === MovementStatus.APPROVED) {
      const balanceChange = type === MovementType.INCOME ? amount : -amount
      params.push(balanceChange, cashBoxId)
    }

    await query(queryText, params)
  }
}
