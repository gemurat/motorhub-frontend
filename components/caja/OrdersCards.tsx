import { Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react'
import React from 'react'

interface Order {
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

interface OrdersCardsProps {
  loading: boolean
  orders: Order[]
  selectedOrder: Order | null
  cancelPayment: (order: Order) => void
  addOrderToProcess: (order: Order) => void
}

const OrdersCards: React.FC<OrdersCardsProps> = ({
  loading,
  orders,
  selectedOrder,
  cancelPayment,
  addOrderToProcess,
}) => {
  console.log('Orders:', orders)

  const pendingOrders = orders.filter((order) => order.status === 'PENDING')
  const otherOrders = orders.filter((order) => order.status !== 'PENDING')

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-3/4 h-fit flex flex-col gap-8">
          {/* Pending Orders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {pendingOrders
              .sort(
                (a, b) =>
                  new Date(a.order_date).getTime() -
                  new Date(b.order_date).getTime()
              )
              .map((order) => (
                <Card
                  key={order.id}
                  isDisabled={selectedOrder?.id === order.id}
                  className="min-w-[300px] h-fit p-4 m-4 rounded-lg shadow-lg border border-gray-200"
                >
                  <CardHeader className="flex gap-3 mb-4">
                    <div className="flex flex-col text-left">
                      <p className="text-lg font-semibold">
                        Cliente: {order.customer_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hora:{' '}
                        {new Date(order.order_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vendedor: {order.seller_name}
                      </p>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="mt-4">
                    <div className="flex flex-wrap gap-4 justify-end">
                      <Button
                        isDisabled={selectedOrder?.id === order.id}
                        color="danger"
                        onClick={() => cancelPayment(order)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        isDisabled={selectedOrder?.id === order.id}
                        color="success"
                        onClick={() => addOrderToProcess(order)}
                      >
                        Procesar
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
          </div>

          {/* Other Orders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {otherOrders
              .sort(
                (a, b) =>
                  new Date(a.order_date).getTime() -
                  new Date(b.order_date).getTime()
              )
              .map((order) => (
                <Card
                  key={order.id}
                  isDisabled={selectedOrder?.id === order.id}
                  className={`min-w-[300px] h-fit p-4 m-4 rounded-lg shadow-lg border ${
                    order.status === 'IN REVIEW'
                      ? 'border-yellow-500'
                      : 'border-gray-200'
                  }`}
                >
                  <CardHeader className="flex gap-3 mb-4">
                    <div className="flex flex-col text-left">
                      <p className="text-lg font-semibold">
                        Cliente: {order.customer_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hora:{' '}
                        {new Date(order.order_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vendedor: {order.seller_name}
                      </p>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="mt-4">
                    <div className="flex flex-wrap gap-4 justify-end">
                      <Button
                        isDisabled={selectedOrder?.id === order.id}
                        color="danger"
                        onClick={() => cancelPayment(order)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        isDisabled={order.status === 'IN REVIEW'}
                        color={
                          order.status === 'IN REVIEW' ? 'warning' : 'success'
                        }
                        onClick={() => addOrderToProcess(order)}
                      >
                        {order.status === 'IN REVIEW'
                          ? 'Pendiente'
                          : 'Procesar'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
          </div>
        </div>
      )}
    </>
  )
}

export default OrdersCards
