import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider, Select, SelectItem } from '@nextui-org/react'
import React from 'react'

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
              <div className="grid grid-cols-4 gap-3">
                <span className="col-span-2">Pedido</span>
                <span className="col-span-1">Vale</span>
                <span className="col-span-1">Valor</span>
              </div>
            </div>
          </ul>
          <Divider className="my-1" />
          aqui la lista
          <Divider className="my-3" />
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
      {/* Add payment processing components here */}
    </div>
  )
}

export default PedidosLocal
