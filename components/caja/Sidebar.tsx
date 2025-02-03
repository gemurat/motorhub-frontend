import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider, Select, SelectItem } from '@nextui-org/react'
import React from 'react'

interface SidebarProps {
  mediosPago: {
    id: number
    name: string
  }[]
  Order?: {
    id: number
    customer_id: string
    seller_name: string
    order_date: Date
    total_amount: string
    items: {
      price: string
      product_name: string
      quantity: number
    }[]
  } | null
  handleVolver: () => void
  selectedMedioPago: number | null
  setSelectedMedioPago: React.Dispatch<React.SetStateAction<number | null>>
  processPayment: (order: any) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  Order,
  mediosPago,
  handleVolver,
  selectedMedioPago,
  setSelectedMedioPago,
  processPayment,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
        Ticket {Order?.id}
      </h2>
      {/* Detalle boleta */}
      {Order ? (
        <div className="text-left">
          <ul>
            <div className="text-sm font-medium">
              <div className="grid grid-cols-4 gap-3">
                <span className="col-span-2">Descripcion</span>
                <span className="col-span-1">Cantidad</span>
                <span className="col-span-1">Precio</span>
              </div>
            </div>
            <Divider className="my-1" />
            {Order.items.map((item, index) => (
              <div key={index} className="text-sm font-medium">
                <div className="grid grid-cols-4 gap-5">
                  <span className="col-span-2">
                    {capitalizeFirstLetter(item.product_name)}
                  </span>
                  <span className="col-span-1">{item.quantity}</span>
                  <span className="col-span-1">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </ul>
          <Divider className="my-3" />
          <div className="flex justify-between">
            <p className="text-md font-medium">Total:</p>
            <p className="text-md font-medium">
              {formatCurrency(Order.total_amount)}
            </p>
          </div>
          <div className="mt-5">
            <Select
              className="max-w-xs"
              label="Medio de Pago"
              labelPlacement="inside"
              value={selectedMedioPago ?? ''}
              onChange={(e) => setSelectedMedioPago(Number(e.target.value))}
            >
              {mediosPago.map((medio) => (
                <SelectItem key={medio.id} value={medio.id}>
                  {medio.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleVolver} className="mt-3" color="default">
                Volver
              </Button>
              <Button
                onClick={() => processPayment(Order)}
                className="mt-3"
                color="success"
                isDisabled={selectedMedioPago === null}
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-md font-medium">No order data available</p>
      )}
      {/* Add payment processing components here */}
    </div>
  )
}

export default Sidebar
