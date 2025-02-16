import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider, Input, Select, SelectItem } from '@nextui-org/react'
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
  selectedMedioPago: number[] | null
  setSelectedMedioPago: React.Dispatch<React.SetStateAction<number[] | null>>
  processPayment: (order: any) => void
  handleValidateGiftcard: (giftCardCode: string) => void
  validGiftcardValue: string
  paymentAmounts: { [key: number]: number }
  setPaymentAmounts: React.Dispatch<
    React.SetStateAction<{ [key: number]: number }>
  >
}

const Sidebar: React.FC<SidebarProps> = ({
  Order,
  mediosPago,
  handleVolver,
  selectedMedioPago,
  setSelectedMedioPago,
  processPayment,
  handleValidateGiftcard,
  validGiftcardValue,
  paymentAmounts,
  setPaymentAmounts,
}) => {
  console.log('Order', selectedMedioPago)

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    medioPagoId: number
  ): void {
    const value = Number(e.target.value)
    setPaymentAmounts((prev) => ({
      ...prev,
      [medioPagoId]: value,
    }))
  }

  React.useEffect(() => {
    if (validGiftcardValue) {
      setPaymentAmounts((prev) => ({
        ...prev,
        4: Number(validGiftcardValue),
      }))
    }
  }, [validGiftcardValue])

  React.useEffect(() => {
    setPaymentAmounts({})
  }, [Order?.id])

  console.log(paymentAmounts)

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
          <div className="flex justify-between">
            <p className="text-md font-medium">Total:</p>
            <p className="text-md font-medium">
              {formatCurrency(Order.total_amount)}
            </p>
          </div>
          {selectedMedioPago?.map(
            (medioPagoId) =>
              paymentAmounts[medioPagoId] > 0 && (
                <div key={medioPagoId} className="flex justify-between">
                  <p className="text-md font-medium">
                    {mediosPago.find((medio) => medio.id === medioPagoId)?.name}
                    :
                  </p>
                  <p className="text-md font-medium">
                    {formatCurrency(paymentAmounts[medioPagoId].toString())}
                  </p>
                </div>
              )
          )}

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

          {selectedMedioPago?.includes(4) && (
            <div className="mt-3 flex justify-left gap-2">
              <div>
                <Input type="text" id="paymentCode" name="paymentCode" />
              </div>
              <Button
                onClick={() =>
                  handleValidateGiftcard(
                    (document.getElementById('paymentCode') as HTMLInputElement)
                      ?.value ?? ''
                  )
                }
                className="mb-1"
              >
                Validar
              </Button>
            </div>
          )}
          <div className="mt-5">
            <Select
              className="max-w-xs"
              label="Medio de Pago"
              labelPlacement="inside"
              value={selectedMedioPago?.map(String) ?? []}
              selectionMode="multiple"
              onSelectionChange={(keys) => {
                const selectedOptions = Array.from(keys, (key) => Number(key))
                setSelectedMedioPago(selectedOptions)
              }}
            >
              {mediosPago.map((medio) => (
                <SelectItem key={medio.id} value={medio.id}>
                  {medio.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex gap-3 justify-end flex-wrap mt-4">
              {selectedMedioPago !== null &&
                Array.isArray(selectedMedioPago) &&
                selectedMedioPago.length > 0 &&
                selectedMedioPago.map((medioPagoId) => (
                  <Input
                    key={medioPagoId}
                    type="number"
                    name={`medioPago-${medioPagoId}`}
                    label={`Monto para ${mediosPago.find((medio) => medio.id === medioPagoId)?.name}`}
                    labelPlacement="outside"
                    placeholder={`Monto para ${mediosPago.find((medio) => medio.id === medioPagoId)?.name}`}
                    className="mt-3"
                    disabled={medioPagoId === 4}
                    value={
                      medioPagoId === 4
                        ? validGiftcardValue
                        : paymentAmounts[medioPagoId]?.toString() || ''
                    }
                    onChange={(e) => handleInputChange(e, medioPagoId)}
                  />
                ))}
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleVolver} className="mt-3" color="default">
                Volver
              </Button>
              <Button
                onClick={() => processPayment(Order)}
                className="mt-3"
                color="success"
                isDisabled={
                  Object.values(paymentAmounts).reduce(
                    (acc, amount) => acc + amount,
                    0
                  ) < Number(Order.total_amount)
                }
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
