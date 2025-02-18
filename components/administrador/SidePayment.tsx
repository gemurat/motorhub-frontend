import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider, Input, Select, SelectItem } from '@nextui-org/react'
import React from 'react'

interface SidePaymentProps {
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
  handleValidateGiftcard: (giftCardCode: string) => void
  validGiftcardValue: string
  paymentAmounts: { [key: number]: number }
  setPaymentAmounts: React.Dispatch<
    React.SetStateAction<{ [key: number]: number }>
  >
}
const estadosPedido = [
  { id: 1, name: 'Aprovado' },
  { id: 2, name: 'Rechazado' },
]
const SidePayment: React.FC<SidePaymentProps> = ({
  Order,
  mediosPago,
  handleVolver,
  selectedMedioPago,
  setSelectedMedioPago,
  processPayment,
  handleValidateGiftcard,
  paymentAmounts,
  setPaymentAmounts,
}) => {
  const getOrderDetails = async () => {
    try {
      const response = await fetch(`/api/paymets-by-id?orderId=${Order?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('caja chica failed')
      }

      const result = await response.json()
      console.log('result.data', result.data)
      const paymentAmountsFromResponse = Array.isArray(result.data)
        ? result.data.reduce((acc: { [key: number]: number }, payment: any) => {
            acc[payment.payment_method_id] =
              (acc[payment.payment_method_id] || 0) + Number(payment.amount)
            return acc
          }, {})
        : {}

      setPaymentAmounts(paymentAmountsFromResponse)

      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('error payments:', error)
      // Handle error in payment processing (e.g., show an error
    }
  }

  React.useEffect(() => {
    if (Order) {
      getOrderDetails()
    }
  }, [Order])
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
          {/* detalle de valores pagados y a pagar */}
          {Object.keys(paymentAmounts).map((medioPagoId) => {
            const amount = paymentAmounts[Number(medioPagoId)]
            if (amount > 0) {
              const medioPago = mediosPago.find(
                (medio: { id: number; name: string }) =>
                  medio.id === Number(medioPagoId)
              )
              return (
                <div key={medioPagoId} className="flex justify-between">
                  <p className="text-md font-medium">{medioPago?.name}:</p>
                  <p className="text-md font-medium">
                    {formatCurrency(amount.toString())}
                  </p>
                </div>
              )
            }
            return null
          })}

          <Divider className="my-2" />

          <div className="flex justify-between">
            <p className="text-md font-semibold">Total Pagado:</p>
            <p className="text-md font-semibold">
              {formatCurrency(
                Object.values(paymentAmounts)
                  .reduce((acc, amount) => acc + amount, 0)
                  .toString()
              )}
            </p>
          </div>

          <div className="flex justify-between">
            <p className="text-md font-semibold">Restante:</p>
            <p className="text-md font-semibold">
              {formatCurrency(
                Math.max(
                  0,
                  Number(Order.total_amount) -
                    Object.values(paymentAmounts).reduce(
                      (acc, amount) => acc + amount,
                      0
                    )
                ).toString()
              )}
            </p>
          </div>
          <div className="mt-5">
            <Select
              className="max-w-xs"
              label="Nuevo Estado de Pedido"
              labelPlacement="inside"
              value={
                selectedMedioPago !== null ? String(selectedMedioPago) : ''
              }
              onSelectionChange={(keys) => {
                const selectedOption = Number(Array.from(keys)[0])
                setSelectedMedioPago(selectedOption)
              }}
            >
              {estadosPedido.map((medio) => (
                <SelectItem key={medio.id} value={medio.id}>
                  {medio.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex gap-3 justify-end flex-wrap mt-4"></div>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleVolver} className="mt-3" color="default">
                Volver
              </Button>
              <Button
                onClick={() => processPayment({ ...Order, selectedMedioPago })}
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

export default SidePayment
