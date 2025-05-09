import { query } from '@/db'

export const API_ENDPOINTS = {
  CASH_TRANSACTION: '/api/cash-transaction',
  ORDERS: '/api/orders',
  EMPLOYEE_SELLS: '/api/employee-sells',
  PEDIDOS_CAJA: '/api/pedidos-caja',
  PROCESS_PAYMENT: '/api/process-payment',
  CANCEL_ORDER: '/api/cancel-order',
  GIFTCARD_VALIDATOR: '/api/giftcard-validator',
}

// API Error type
interface ApiError extends Error {
  response?: Response
}

// Types
export interface PaymentMethod {
  id: number
  name: string
}

export interface Order {
  id: number
  status: string
  customer_id: string
  seller_name: string
  total_amount: string
  order_date: Date
  items: {
    price: string
    product_name: string
    quantity: number
  }[]
}

export interface Pedido {
  id: number
  order_date: Date
  supplier_id: number
  vale: number
  total_amount: number
  status: string
}

export interface EmployeeSell {
  seller_id: string
  seller_name: string
  total_amount: number
}

export type TransactionType = 'expense' | 'income'

// API Functions
export const fetchOrders = async () => {
  const response = await fetch(API_ENDPOINTS.ORDERS)
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

export const fetchCashData = async () => {
  const response = await fetch(API_ENDPOINTS.CASH_TRANSACTION)
  if (!response.ok) throw new Error('Failed to fetch cash data')
  return response.json()
}

export const fetchEmployeeSells = async () => {
  const response = await fetch(API_ENDPOINTS.EMPLOYEE_SELLS)
  if (!response.ok) throw new Error('Failed to fetch employee sells')
  return response.json()
}

export const fetchPedidos = async () => {
  const response = await fetch(API_ENDPOINTS.PEDIDOS_CAJA)
  if (!response.ok) throw new Error('Failed to fetch pedidos')
  return response.json()
}

export const fetchGastos = async () => {
  const response = await fetch(
    `${API_ENDPOINTS.CASH_TRANSACTION}?specialProp=gastos`
  )
  if (!response.ok) throw new Error('Failed to fetch gastos')
  return response.json()
}

export const processPayment = async (data: {
  orderId: number
  amount: string
  paymentMethodId: number[]
  items: any[]
  paymentAmounts: Record<string, number>
  giftcardId?: string
}) => {
  const response = await fetch(API_ENDPOINTS.PROCESS_PAYMENT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Payment processing failed')
  return response.json()
}

export const cancelOrder = async (orderId: number) => {
  const response = await fetch(API_ENDPOINTS.CANCEL_ORDER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
  if (!response.ok) throw new Error('Failed to cancel order')
  return response.json()
}

export const validateGiftcard = async (giftCardCode: string) => {
  const response = await fetch(
    `${API_ENDPOINTS.GIFTCARD_VALIDATOR}?giftcardcode=${giftCardCode}`
  )
  if (!response.ok) throw new Error('Failed to validate giftcard')
  return response.json()
}
