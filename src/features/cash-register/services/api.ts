import {
  ApiResponse,
  CashBoxOperation,
  EmployeeSale,
  GiftCard,
  Order,
  PaymentMethod,
} from '../types'

const API_BASE_URL = '/api/cash-register'

// Payment Methods API
export const paymentMethodsApi = {
  getAll: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    const response = await fetch(`${API_BASE_URL}/payment-methods`)
    return response.json()
  },
}

// Orders API
export const ordersApi = {
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const response = await fetch(`${API_BASE_URL}/orders`)
    return response.json()
  },

  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`)
    return response.json()
  },

  create: async (order: Partial<Order>): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    return response.json()
  },

  updateStatus: async (
    id: number,
    status: string
  ): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    return response.json()
  },
}

// Cash Box API
export const cashBoxApi = {
  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    const response = await fetch(`${API_BASE_URL}/cash-box/balance`)
    return response.json()
  },

  getOperations: async (): Promise<ApiResponse<CashBoxOperation[]>> => {
    const response = await fetch(`${API_BASE_URL}/cash-box/operations`)
    return response.json()
  },

  createOperation: async (
    operation: Omit<CashBoxOperation, 'id' | 'createdAt' | 'createdBy'>
  ): Promise<ApiResponse<CashBoxOperation>> => {
    const response = await fetch(`${API_BASE_URL}/cash-box/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation),
    })
    return response.json()
  },
}

// Gift Cards API
export const giftCardsApi = {
  validate: async (code: string): Promise<ApiResponse<GiftCard>> => {
    const response = await fetch(
      `${API_BASE_URL}/gift-cards/validate?code=${code}`
    )
    return response.json()
  },

  use: async (code: string, amount: number): Promise<ApiResponse<GiftCard>> => {
    const response = await fetch(`${API_BASE_URL}/gift-cards/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount }),
    })
    return response.json()
  },
}

// Employee Sales API
export const employeeSalesApi = {
  getAll: async (): Promise<ApiResponse<EmployeeSale[]>> => {
    const response = await fetch(`${API_BASE_URL}/employee-sales`)
    return response.json()
  },

  create: async (
    sale: Omit<EmployeeSale, 'id' | 'date'>
  ): Promise<ApiResponse<EmployeeSale>> => {
    const response = await fetch(`${API_BASE_URL}/employee-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    })
    return response.json()
  },
}
