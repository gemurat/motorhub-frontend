import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from '@nextui-org/react'
import React, { useState, useEffect } from 'react'

interface Order {
  id: number
  status: string
  customer_id: string
  seller_name: string
  total_amount: string
  order_date: string
  items: {
    price: string
    product_name: string
    quantity: number
  }[]
}

const AprovalCards: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleApprove = async (order: Order, approved: boolean) => {
    if (selectedTransactionId === order.id) {
      try {
        const response = await fetch('/api/transactions/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: order.id,
            approved,
            notes: approvalNotes,
          }),
        })

        if (!response.ok) throw new Error('Failed to approve transaction')

        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, status: approved ? 'APPROVED' : 'REJECTED' }
              : o
          )
        )
        setSelectedTransactionId(null)
        setApprovalNotes('')
      } catch (error) {
        console.error('Error approving transaction:', error)
      }
    } else {
      setSelectedTransactionId(order.id)
    }
  }

  const handleCancel = async (order: Order) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?'))
      return

    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!response.ok) throw new Error('Failed to cancel order')

      // Update local state
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
    } catch (error) {
      console.error('Error canceling order:', error)
    }
  }

  const sortedOrders =
    orders.length > 0
      ? [...orders].sort(
          (a, b) =>
            new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
        )
      : []

  return (
    <div className="w-full h-fit flex flex-col gap-8">
      <h3 className="text-xl font-semibold">Aprobación de Transacciones</h3>
      {loading ? (
        <p>Loading...</p>
      ) : sortedOrders.length === 0 ? (
        <p>No hay transacciones pendientes</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {sortedOrders.map((order) => (
            <Card
              key={order.id}
              className={`min-w-[300px] h-fit p-4 m-4 rounded-lg shadow-lg border ${
                order.status === 'PENDING'
                  ? 'border-yellow-500'
                  : order.status === 'APPROVED'
                    ? 'border-green-500'
                    : 'border-red-500'
              }`}
            >
              <CardHeader className="flex gap-3 mb-4">
                <div className="flex flex-col text-left">
                  <p className="text-lg font-semibold">
                    Cliente: {order.customer_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: {order.total_amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(order.order_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vendedor: {order.seller_name}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="mt-4">
                {selectedTransactionId === order.id && (
                  <div className="mb-4">
                    <Input
                      label="Notas de aprobación"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Ingrese notas de aprobación"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button color="danger" onClick={() => handleCancel(order)}>
                    Cancelar
                  </Button>
                  <Button
                    color={order.status === 'PENDING' ? 'warning' : 'success'}
                    onClick={() => handleApprove(order, true)}
                  >
                    {selectedTransactionId === order.id
                      ? 'Confirmar Aprobación'
                      : order.status === 'PENDING'
                        ? 'Aprobar'
                        : 'Aprobado'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AprovalCards
