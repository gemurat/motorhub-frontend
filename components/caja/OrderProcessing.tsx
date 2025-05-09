'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Order {
  id: number
  status: string
  customer_id: string
  seller_name?: string
  order_date: Date
  total_amount: number
  items: {
    product_id: number
    product_name?: string
    quantity: number
    price: number
  }[]
}

interface PaymentMethod {
  id: number
  name: string
  requires_approval: boolean
}

interface Payment {
  methodId: number
  amount: number
}

interface OrderProcessingProps {
  storeId: string
  cashboxId: string
}

const ORDER_STATUS = {
  IN_REVIEW: 'IN REVIEW',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const

export default function OrderProcessing({ storeId, cashboxId }: OrderProcessingProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [currentPayment, setCurrentPayment] = useState<{
    methodId: number | null
    amount: string
  }>({ methodId: null, amount: '' })

  // Fetch payment methods
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await fetch('/api/mediosPago')
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      const data = await response.json()
      return data as PaymentMethod[]
    },
  })

  // Fetch orders IN REVIEW
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders-review', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch(`/api/caja/process-payment?storeId=${storeId}&cashboxId=${cashboxId}`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      return data.orders as Order[]
    },
    enabled: !!storeId && !!cashboxId,
  })

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({
      orderId,
      paymentMethodId,
      amount,
      paymentAmounts,
    }: {
      orderId: number
      paymentMethodId: number
      amount: number
      paymentAmounts: Record<number, number>
    }) => {
      const response = await fetch('/api/caja/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethodId,
          amount,
          paymentAmounts,
          items: selectedOrder?.items || [],
          storeId,
          cashboxId,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Pago procesado exitosamente')
      refetch()
      setSelectedOrder(null)
      setPayments([])
      setCurrentPayment({ methodId: null, amount: '' })
    },
    onError: (error) => {
      toast.error(error.message || 'Error al procesar el pago')
    },
  })

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch('/api/caja/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, storeId, cashboxId }),
      })
      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Orden cancelada exitosamente')
      refetch()
      setSelectedOrder(null)
      setPayments([])
      setCurrentPayment({ methodId: null, amount: '' })
    },
    onError: (error) => {
      toast.error(error.message || 'Error al cancelar la orden')
    },
  })

  const handleAddPayment = () => {
    if (!currentPayment.methodId || !currentPayment.amount) {
      toast.error('Por favor complete todos los campos')
      return
    }

    const amount = parseFloat(currentPayment.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid + amount > (selectedOrder?.total_amount || 0)) {
      toast.error('El monto total excede el valor de la orden')
      return
    }

    setPayments([...payments, { methodId: currentPayment.methodId, amount }])
    setCurrentPayment({ methodId: null, amount: '' })
  }

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const handlePaymentSubmit = () => {
    if (!selectedOrder || payments.length === 0) {
      toast.error('Por favor agregue al menos un método de pago')
      return
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid !== selectedOrder.total_amount) {
      toast.error('El monto total debe ser igual al valor de la orden')
      return
    }

    const paymentAmounts = payments.reduce(
      (acc, payment) => {
        acc[payment.methodId] = payment.amount
        return acc
      },
      {} as Record<number, number>
    )

    processPaymentMutation.mutate({
      orderId: selectedOrder.id,
      paymentMethodId: payments[0].methodId,
      amount: totalPaid,
      paymentAmounts,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error al cargar las órdenes: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Procesar Órdenes</h2>

      {/* Orders List */}
      <div className="space-y-2">
        {ordersData?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay órdenes pendientes de procesar
          </div>
        ) : (
          ordersData?.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Orden #{order.id}</span>
                <span className="text-green-600">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  }).format(order.total_amount)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>{order.items.length} items</p>
                <p>Cliente: {order.customer_id}</p>
                <p>Vendedor: {order.seller_name || 'N/A'}</p>
                <p>
                  Fecha:{' '}
                  {format(new Date(order.order_date), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold">
                Detalles de la Orden #{selectedOrder.id}
              </h3>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Order Items */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Items:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-700 text-lg">
                        {item.product_name}
                      </span>
                      <div className="text-right">
                        <span className="text-gray-600 text-lg">
                          {item.quantity} x{' '}
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                          }).format(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-3 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    }).format(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-5">
                <h4 className="text-lg font-semibold">Métodos de Pago:</h4>

                {/* Added Payments List */}
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-lg">
                        {
                          paymentMethods?.find((m) => m.id === payment.methodId)
                            ?.name
                        }
                        :{' '}
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                        }).format(payment.amount)}
                      </span>
                      <button
                        onClick={() => handleRemovePayment(index)}
                        className="text-red-500 hover:text-red-700 text-lg"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Total de la Orden:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(selectedOrder.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Total Pagado:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Restante por Pagar:</span>
                    <span
                      className={`font-semibold ${selectedOrder.total_amount -
                        payments.reduce((sum, p) => sum + p.amount, 0) >
                        0
                        ? 'text-red-600'
                        : 'text-green-600'
                        }`}
                    >
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(
                        selectedOrder.total_amount -
                        payments.reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Add Payment Form */}
                <div className="flex gap-3">
                  <select
                    value={currentPayment.methodId || ''}
                    onChange={(e) =>
                      setCurrentPayment((prev) => ({
                        ...prev,
                        methodId: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 p-3 border rounded-lg text-base"
                  >
                    <option value="">Seleccione método de pago</option>
                    {paymentMethods?.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={currentPayment.amount}
                    onChange={(e) =>
                      setCurrentPayment((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="Monto"
                    className="flex-1 p-3 border rounded-lg text-base"
                  />
                  <button
                    onClick={handleAddPayment}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-base font-medium"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => cancelOrderMutation.mutate(selectedOrder.id)}
                  disabled={cancelOrderMutation.isPending}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelOrderMutation.isPending
                    ? 'Cancelando...'
                    : 'Cancelar Orden'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(null)
                      setPayments([])
                      setCurrentPayment({ methodId: null, amount: '' })
                    }}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-100 text-base font-medium"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={processPaymentMutation.isPending}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processPaymentMutation.isPending
                      ? 'Procesando...'
                      : 'Procesar Pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
