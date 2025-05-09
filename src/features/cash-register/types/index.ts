// Payment Method Types
export interface PaymentMethod {
  id: number
  name: string
  description?: string
  isActive: boolean
}

// Order Types
export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: number
  customerId?: string
  customerName?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

// Cash Box Types
export interface CashBoxOperation {
  id: number
  type: 'income' | 'expense'
  amount: number
  description: string
  createdAt: Date
  createdBy: string
}

export interface CashBoxBalance {
  currentBalance: number
  lastOperationDate: Date
}

// Gift Card Types
export interface GiftCard {
  id: string
  code: string
  balance: number
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
}

// Employee Sales Types
export interface EmployeeSale {
  id: number
  employeeId: string
  employeeName: string
  amount: number
  date: Date
  description?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
