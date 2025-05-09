export enum MovementType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum MovementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CashBoxMovement {
  id: number
  type: MovementType
  amount: number
  description: string
  date: string
  status: MovementStatus
  created_by_username?: string
  approved_by_username?: string
}

export interface CashBox {
  id: number
  current_balance: number
  last_updated: string
}

export interface User {
  id: number
  caja: number
}
