'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@nextui-org/react'
import GiftCardModal from '../caja/GiftCardModal'
import ProductReturnModal from '../caja/productReturnModal'
import EmployeeSells from '../caja/EmployeeSells'
import AprovalCards from './AprovalCards'
import SidePayment from './SidePayment'
import TransactionResume from './TransactionResume'
import CashBox from '../caja/GastosCaja'
import AprovalGastos from './AprovalGastos'

// Types
type PaymentMethod = {
  id: number
  name: string
}

type Order = {
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

type EmployeeSell = {
  seller_id: string
  seller_name: string
  total_amount: number
}

type SellByType = {
  payment_method: string
  payment_count: number
  total_amount: number
}

type TransactionType = 'expense' | 'income'

type CashBoxData = {
  current_balance: string
  last_updated: string
}

type GastosData = {
  id: number
  description: string
  amount: number
  date: string
  status: string
  created_by_username: string
}

type APIResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type GastosResponse = {
  success: boolean
  response: GastosData[]
}

// Constants
const ORDER_STATES = {
  APPROVED: { id: 1, name: 'APPROVED' },
  REJECTED: { id: 2, name: 'REJECTED' },
} as const

const API_ENDPOINTS = {
  CASH_TRANSACTION: '/api/cash-transaction',
  ORDER_PROCESS: '/api/order-process-review',
  EMPLOYEE_SELLS: '/api/employee-sells',
  SELLS: '/api/sells',
  CANCEL_ORDER: '/api/cancel-order',
  TRANSACTIONS_APPROVE: '/api/transactions/approve',
  EXPENSES_APPROVE: '/api/expenses/approve',
  CASH_REGISTER_OPERATIONS: '/api/cash-register/operations',
} as const

// Utility functions
const fetchWithErrorHandling = async <T,>(
  url: string,
  options?: RequestInit
): Promise<APIResponse<T>> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      )
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

const MainSection = ({ mediosPago }: { mediosPago: PaymentMethod[] }) => {
  // State
  const [paymentAmounts, setPaymentAmounts] = useState<{
    [key: number]: number
  }>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [currentBalance, setCurrentBalance] = useState('0.00')
  const [lastUpdatedBalance, setLastUpdatedBalance] = useState('')
  const [loading, setLoading] = useState(true)
  const [paymentLoader, setPaymentLoader] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [listaGastosCaja, setListaGastosCaja] = useState<GastosData[]>([])
  const [selectedMedioPago, setSelectedMedioPago] = useState<number | null>(
    null
  )
  const [cashboxAmount, setCashboxAmount] = useState('')
  const [cashBoxDescription, setCashBoxDescription] = useState('')
  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null)
  const [isCajaChicaVisible, setIsCajaChicaVisible] = useState(false)
  const [isEmployeeSellsVisible, setIsEmployeeSellsVisible] = useState(false)
  const [isTransactionResumeVisible, setIsTransactionResumeVisible] =
    useState(false)
  const [validGiftcardValue, setValidGiftcardValue] = useState('')
  const [employeeSells, setEmployeeSells] = useState<EmployeeSell[]>([])
  const [sellByType, setSellByType] = useState<SellByType[]>([])

  // Memoized values
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'PENDING'),
    [orders]
  )

  const pendingGastos = useMemo(
    () => listaGastosCaja.filter((gasto) => gasto.status === 'PENDING'),
    [listaGastosCaja]
  )

  // API Calls
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        cajaChicaData,
        ordersData,
        employeeSellsData,
        sellsByTypeData,
        gastosData,
      ] = await Promise.all([
        fetchWithErrorHandling<CashBoxData>(API_ENDPOINTS.CASH_TRANSACTION),
        fetchWithErrorHandling<{ orders: Order[] }>(
          API_ENDPOINTS.ORDER_PROCESS
        ),
        fetchWithErrorHandling<EmployeeSell[]>(API_ENDPOINTS.EMPLOYEE_SELLS),
        fetchWithErrorHandling<SellByType[]>(API_ENDPOINTS.SELLS),
        fetchWithErrorHandling<GastosResponse>(
          `${API_ENDPOINTS.CASH_TRANSACTION}?specialProp=gastos`
        ),
      ])

      if (!cajaChicaData.success) {
        throw new Error(cajaChicaData.error || 'Failed to fetch cash box data')
      }
      if (!ordersData.success) {
        throw new Error(ordersData.error || 'Failed to fetch orders')
      }
      if (!employeeSellsData.success) {
        throw new Error(
          employeeSellsData.error || 'Failed to fetch employee sells'
        )
      }
      if (!sellsByTypeData.success) {
        throw new Error(
          sellsByTypeData.error || 'Failed to fetch sells by type'
        )
      }
      if (!gastosData.success) {
        throw new Error(gastosData.error || 'Failed to fetch expenses')
      }

      if (cajaChicaData.data) {
        setCurrentBalance(cajaChicaData.data.current_balance)
        setLastUpdatedBalance(cajaChicaData.data.last_updated)
      }

      if (ordersData.data) {
        setOrders(ordersData.data.orders)
      }
      if (employeeSellsData.data) {
        setEmployeeSells(employeeSellsData.data)
      }
      if (sellsByTypeData.data) {
        setSellByType(sellsByTypeData.data)
      }
      if (gastosData.data) {
        setListaGastosCaja(gastosData.data.response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // TODO: Add error notification
    } finally {
      setLoading(false)
    }
  }, [])

  // Handlers
  const handleVolver = useCallback(() => {
    setSelectedOrder(null)
    setSelectedMedioPago(null)
    setValidGiftcardValue('')
  }, [])

  const addOrderToProcess = useCallback((order: Order) => {
    setSelectedMedioPago(null)
    setValidGiftcardValue('')
    setSelectedOrder(order)
  }, [])

  const addGastoToProcess = useCallback((gasto: GastosData) => {
    console.log('Processing gasto:', gasto)
  }, [])

  const handleRefreshGastos = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<{
        success: boolean
        response: GastosData[]
      }>(`${API_ENDPOINTS.CASH_TRANSACTION}?specialProp=gastos`)
      if (data.success) {
        setListaGastosCaja(data.response)
      }
    } catch (error) {
      console.error('Error refreshing gastos:', error)
      // TODO: Add error notification
    }
  }, [])

  const processPayment = useCallback(
    async (order: Order) => {
      if (!order) {
        alert('No order to process')
        return
      }

      setPaymentLoader(true)
      try {
        const newStatus =
          selectedMedioPago !== null
            ? ORDER_STATES.APPROVED.name
            : ORDER_STATES.REJECTED.name

        await fetchWithErrorHandling(API_ENDPOINTS.ORDER_PROCESS, {
          method: 'PUT',
          body: JSON.stringify({
            orderId: order.id,
            newStatus,
          }),
        })

        setOrders((prev) => prev.filter((o) => o.id !== order.id))
        setSelectedOrder(null)
        await fetchData()
      } catch (error) {
        console.error('Error processing payment:', error)
        // TODO: Add error notification
      } finally {
        setPaymentLoader(false)
      }
    },
    [selectedMedioPago, fetchData]
  )

  const cancelPayment = useCallback(async (order: Order) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?'))
      return

    try {
      await fetchWithErrorHandling(API_ENDPOINTS.CANCEL_ORDER, {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id }),
      })

      setOrders((prev) => prev.filter((o) => o.id !== order.id))
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error canceling payment:', error)
      // TODO: Add error notification
    }
  }, [])

  const handleValidateGiftcard = useCallback(async (giftCardCode: string) => {
    try {
      const response = await fetch(
        `/api/giftcard-validator?giftcardcode=${giftCardCode}`
      )
      if (!response.ok) throw new Error('Error validating gift card')

      const result = await response.json()
      if (result.success && result.data) {
        setValidGiftcardValue(result.data.balance)
      }
    } catch (error) {
      console.error('Error validating gift card:', error)
      // TODO: Add error notification
    }
  }, [])

  const handleApproveTransaction = async (
    transactionId: number,
    approved: boolean,
    notes: string
  ) => {
    try {
      const response = await fetchWithErrorHandling<{ success: boolean }>(
        API_ENDPOINTS.TRANSACTIONS_APPROVE,
        {
          method: 'POST',
          body: JSON.stringify({ transactionId, approved, notes }),
        }
      )

      if (response.success) {
        await fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error approving transaction:', error)
    }
  }

  const handleApproveExpense = async (
    expenseId: number,
    approved: boolean,
    notes: string
  ) => {
    try {
      const response = await fetchWithErrorHandling<{ success: boolean }>(
        API_ENDPOINTS.EXPENSES_APPROVE,
        {
          method: 'POST',
          body: JSON.stringify({ expenseId, approved, notes }),
        }
      )

      if (response.success) {
        await fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error approving expense:', error)
    }
  }

  const handleCashRegisterOperation = async (
    store_id: number,
    cash_register_id: number,
    operation_type: 'DEPOSIT' | 'WITHDRAWAL',
    amount: number,
    description: string,
    notes: string
  ) => {
    try {
      const response = await fetchWithErrorHandling<{ success: boolean }>(
        API_ENDPOINTS.CASH_REGISTER_OPERATIONS,
        {
          method: 'POST',
          body: JSON.stringify({
            store_id,
            cash_register_id,
            operation_type,
            amount,
            description,
            notes,
          }),
        }
      )

      if (response.success) {
        await fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error performing cash register operation:', error)
    }
  }

  // Effects
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // UI Handlers
  const handleEmployeeSellsVisible = useCallback(() => {
    setIsEmployeeSellsVisible((prev) => !prev)
  }, [])

  const handleTransactionResumeVisible = useCallback(() => {
    setIsTransactionResumeVisible((prev) => !prev)
  }, [])

  return (
    <div className="flex">
      <div className="h-full w-1/4 space-y-4">
        <div className="flex justify-between gap-4">
          <GiftCardModal />
          <ProductReturnModal />
          <Button onClick={fetchData}>Actualizar</Button>
        </div>

        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          {paymentLoader ? (
            <p>Procesando Pago...</p>
          ) : selectedOrder ? (
            <SidePayment
              paymentAmounts={paymentAmounts}
              setPaymentAmounts={setPaymentAmounts}
              Order={selectedOrder}
              validGiftcardValue={validGiftcardValue}
              handleValidateGiftcard={handleValidateGiftcard}
              mediosPago={mediosPago}
              handleVolver={handleVolver}
              selectedMedioPago={selectedMedioPago}
              setSelectedMedioPago={setSelectedMedioPago}
              processPayment={processPayment}
            />
          ) : (
            <p>Seleccione Orden para Procesar</p>
          )}
        </div>

        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          <EmployeeSells
            isEmployeeSellsVisible={isEmployeeSellsVisible}
            handleEmployeeSellsVisible={handleEmployeeSellsVisible}
            employeeSells={employeeSells}
            sellsByEmployee={fetchData}
          />
        </div>

        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          <TransactionResume
            isTransactionResumeVisible={isTransactionResumeVisible}
            handleTransactionResumeVisible={handleTransactionResumeVisible}
            sellByType={sellByType}
            updateSellsByType={fetchData}
          />
        </div>

        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          Administrar Caja Chica
        </div>
      </div>

      <div className="w-full">
        <AprovalCards
          loading={loading}
          orders={orders}
          selectedOrder={selectedOrder}
          cancelPayment={cancelPayment}
          addOrderToProcess={addOrderToProcess}
          onApproveTransaction={handleApproveTransaction}
        />
        <AprovalGastos
          loading={loading}
          gastos={pendingGastos}
          onApproveExpense={handleApproveExpense}
        />
        <TransactionResume
          loading={loading}
          orders={orders}
          employeeSells={employeeSells}
          sellByType={sellByType}
          onCashRegisterOperation={handleCashRegisterOperation}
        />
      </div>
    </div>
  )
}

export default MainSection
