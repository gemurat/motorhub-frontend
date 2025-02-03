import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider, Select, SelectItem } from '@nextui-org/react'
import React from 'react'
const orders = [
  { pedido: '1', vale: 'Vale 1', valor: 1000, status: 'pending' },
  { pedido: '2', vale: 'Vale 2', valor: 2000, status: 'completed' },
  { pedido: '3', vale: 'Vale 3', valor: 3000, status: 'cancelled' },
]

const updateOrderStatus = (index, status) => {
  orders[index].status = status
  // Add any additional logic to handle status update
}
const PedidosLocal = ({}) => {
  const order = true
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
        Detalle Pedido
      </h2>
      {/* Detalle boleta */}
      {order ? (
        <div className="text-left">
          <ul>
            <div className="text-sm font-medium">
              <div className="grid grid-cols-5 gap-3">
                <span className="col-span-1">Pedido</span>
                <span className="col-span-1">Vale</span>
                <span className="col-span-1">Valor</span>
                <span className="col-span-2">Status</span>
              </div>
            </div>
          </ul>
          <Divider className="my-1" />
          {orders.map((order, index) => (
            <div
              key={index}
              className={`grid grid-cols-5 gap-3 items-center cursor-pointer p-2 rounded ${
                order.selected
                  ? 'bg-blue-100 dark:bg-blue-800'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                orders.forEach((o, i) => (o.selected = i === index))
                console.log(`Selected order: ${order.pedido}`)
              }}
            >
              <span className="col-span-1">{order.pedido}</span>
              <span className="col-span-1">{order.vale}</span>
              <span className="col-span-1">{formatCurrency(order.valor)}</span>
              <span className="col-span-2">
                {capitalizeFirstLetter(order.status)}
              </span>
            </div>
          ))}
          <Divider className="my-3" />
          <div className="flex gap-3 items-center">
            <Select
              placeholder="Select status"
              label="Status"
              onChange={(e) =>
                updateOrderStatus(
                  orders.findIndex((o) => o.selected),
                  e.target.value
                )
              }
            >
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </Select>
          </div>
          <div className="mt-5">
            <div className="flex gap-3 justify-end">
              <Button
                // onClick={handleVolver}
                className="mt-3"
                color="default"
              >
                Volver
              </Button>
              <Button
                // onClick={() => processPayment(Order)}
                className="mt-3"
                color="success"
                // isDisabled={selectedMedioPago === null}
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-md font-medium">No order data available</p>
      )}
    </div>
  )
}

export default PedidosLocal
