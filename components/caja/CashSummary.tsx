'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import SellerSalesSummary from './SellerSalesSummary'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PaymentSummary {
  payment_method: string
  total_amount: number
  transaction_count: number
}

interface DailySummary {
  total_sales: number
  total_transactions: number
  payment_methods: PaymentSummary[]
}

interface ExpenseInReview {
  id: number
  amount: number
  description: string
  date: string
  created_by_username: string
}

interface Expense {
  id: number
  description: string
  amount: number
  date: string
  status: string
  created_by_username: string
  approved_by_username?: string
  cashbox_name: string
  store_name: string
}

interface CashSummaryProps {
  storeId: string
  cashboxId: string
}

export default function CashSummary({ storeId, cashboxId }: CashSummaryProps) {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['cash-summary', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch(`/api/caja/daily-summary?storeId=${storeId}&cashboxId=${cashboxId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch daily summary')
      }
      const data = await response.json()
      return data as DailySummary
    },
    enabled: !!storeId && !!cashboxId,
  })

  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses', cashboxId],
    queryFn: async () => {
      const response = await fetch(
        `/api/caja/cash-transaction?showExpenses=true&cashBoxId=${cashboxId}`
      )
      if (!response.ok) throw new Error('Failed to fetch expenses')
      const data = await response.json()
      return data.expenses as Expense[]
    },
    enabled: !!cashboxId,
  })

  const expenses = expensesData || []

  // Group expenses by status
  const expensesByStatus = expenses.reduce((acc, expense) => {
    if (!acc[expense.status]) {
      acc[expense.status] = []
    }
    acc[expense.status].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  // Define the order of statuses
  const statusOrder = ['IN REVIEW', 'APPROVED', 'REJECTED']
  const statusLabels = {
    'IN REVIEW': 'En Revisión',
    'APPROVED': 'Aprobados',
    'REJECTED': 'Rechazados',
  }

  if (isSummaryLoading || isLoadingExpenses) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total Sales */}
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm text-gray-600 mb-1">Ventas Totales del Día</h3>
        <p className="text-2xl font-bold text-green-600">
          {new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(summary?.total_sales || 0)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {summary?.total_transactions || 0} transacciones
        </p>
      </div>

      {/* Payment Methods Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Desglose por Método de Pago
        </h3>
        <div className="space-y-2">
          {summary?.payment_methods.map((method, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <div>
                <p className="font-medium">{method.payment_method}</p>
                <p className="text-sm text-gray-500">
                  {method.transaction_count} transacciones
                </p>
              </div>
              <p className="font-semibold">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(method.total_amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gastos</h3>
        {isLoadingExpenses ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : expenses.length === 0 ? (
          <Alert>
            <AlertDescription>No hay gastos registrados</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${expense.status === 'IN REVIEW'
                          ? 'bg-yellow-100 text-yellow-800'
                          : expense.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {expense.status === 'IN REVIEW'
                          ? 'En Revisión'
                          : expense.status === 'APPROVED'
                            ? 'Aprobado'
                            : 'Rechazado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(expense.amount)}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Seller Sales Summary */}
      <div>
        <SellerSalesSummary storeId={storeId} cashboxId={cashboxId} />
      </div>
    </div>
  )
}
