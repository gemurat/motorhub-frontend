'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Payment {
  id: number
  amount: number
  status: string
  payment_method: {
    id: number
    name: string
  }
}

interface Order {
  id: number
  status: string
  customer_id: string
  seller_name?: string
  order_date: Date
  total_amount: number
  payments: Payment[]
  status_updated_at?: Date
}

interface OrdersInReviewProps {
  storeId: string
  cashboxId: string
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in review':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function OrdersInReview({ storeId, cashboxId }: OrdersInReviewProps) {
  const queryClient = useQueryClient()

  const { data: ordersInReview, isLoading } = useQuery({
    queryKey: ['orders-in-review', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch(`/api/caja/orders-in-review?storeId=${storeId}&cashboxId=${cashboxId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders IN REVIEW')
      }
      const data = await response.json()
      return data.orders as Order[]
    },
    enabled: !!storeId && !!cashboxId,
  })

  const { mutate: completeOrder, isPending: isCompleting } = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/caja/orders-in-review?orderId=${orderId}&action=complete&storeId=${storeId}&cashboxId=${cashboxId}`, {
        method: 'PATCH',
      })
      if (!response.ok) {
        throw new Error('Failed to complete order')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-in-review'] })
    },
  })

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/caja/cancel-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          storeId,
          cashboxId,
        })
      })
      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-in-review'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!ordersInReview?.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No hay órdenes en revisión
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ordersInReview.map((order: Order) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Orden #{order.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Cliente: {order.customer_id}
                {order.seller_name && ` | Vendedor: ${order.seller_name}`}
              </p>
              <p className="text-sm text-gray-600">
                Fecha:{' '}
                {format(new Date(order.order_date), 'PPP', { locale: es })}
              </p>
              {order.status_updated_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Estado actualizado: {format(new Date(order.status_updated_at), 'PPp', { locale: es })}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="font-semibold text-lg">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Métodos de pago:
            </h4>
            <div className="space-y-1">
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((payment: Payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>{payment.payment_method.name}</span>
                    <span>
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(payment.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No hay métodos de pago registrados</div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {order.status.toLowerCase() === 'in review' && (
                <button
                  onClick={() => cancelOrder(order.id)}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCancelling ? 'Cancelando...' : 'Cancelar Orden'}
                </button>
              )}
              {order.status.toLowerCase() === 'approved' && (
                <button
                  onClick={() => completeOrder(order.id)}
                  disabled={isCompleting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCompleting ? 'Completando...' : 'Completar Transacción'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
