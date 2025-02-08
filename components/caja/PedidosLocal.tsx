import {
  capitalizeFirstLetter,
  formatCurrency,
  selectStatusItems,
  translateStatus,
} from '@/lib/utils'
import { Button, Divider, Select, SelectItem } from '@nextui-org/react'
import React from 'react'
import AddPedidoModal from './AddPedidoModal'
type Pedido = {
  id: number
  order_date: Date
  supplier_id: number
  vale: number
  total_amount: number
  status: string
}

const pedidos: Pedido[] = [
  {
    id: 1,
    vale: 1,
    order_date: new Date(),
    supplier_id: 101,
    total_amount: 1000,
    status: 'pending',
  },
  {
    id: 2,
    vale: 1,
    order_date: new Date(),
    supplier_id: 102,
    total_amount: 2000,
    status: 'completed',
  },
  {
    id: 3,
    vale: 1,
    order_date: new Date(),
    supplier_id: 103,
    total_amount: 3000,
    status: 'cancelled',
  },
]

const PedidosLocal = ({
  selectedPedido,
  handleSelectedPedido,
  handleVolver,
  pedidosLocalData,
  handleActualizarEstadoPedido,
  handleSelectOrderStatus,
}: {
  selectedPedido: any
  handleSelectedPedido: (arg0: Pedido) => void
  handleVolver: () => void
  pedidosLocalData: Pedido[]
  handleActualizarEstadoPedido: (arg0: Pedido) => void
  handleSelectOrderStatus: (arg0: string) => void
}) => {
  const order = true
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100 flex justify-between">
        Detalle Pedido
        <AddPedidoModal />
      </h2>
      {/* Detalle boleta */}
      {pedidosLocalData.length > 0 ? (
        <div className="text-left">
          <ul>
            <div className="text-sm font-medium">
              <div className="grid grid-cols-5 gap-3">
                {/* <span className="col-span-1">Pedido</span> */}
                <span className="col-span-1">Vale</span>
                <span className="col-span-2">Valor</span>
                <span className="col-span-2">Estado</span>
              </div>
            </div>
          </ul>
          <Divider className="my-1" />
          {pedidosLocalData.map((pedido, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={`grid grid-cols-5 gap-3 items-center cursor-pointer p-2 rounded ${
                selectedPedido && pedido.id === selectedPedido?.id
                  ? 'bg-blue-100 dark:bg-blue-800'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                handleSelectedPedido(pedidosLocalData[index])
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectedPedido(pedidosLocalData[index])
                }
              }}
            >
              {/* <span className="col-span-1">{pedido.id}</span> */}
              <span className="col-span-1">{pedido.vale}</span>
              <span className="col-span-2">
                {formatCurrency(pedido.total_amount.toString())}
              </span>
              <span className="col-span-2">
                {capitalizeFirstLetter(translateStatus(pedido.status))}
              </span>
            </div>
          ))}
          <Divider className="my-3" />
          {selectedPedido?.id && (
            <>
              <p className="flex justify-center">
                {new Date(selectedPedido.order_date).toLocaleDateString()}
              </p>
              <div className="flex gap-3 items-center">
                <Select placeholder="Actualizar estado" label="Estado">
                  {selectStatusItems.map((item) => (
                    <SelectItem
                      key={item.key}
                      value={item.value}
                      isDisabled={item.key === '1'}
                      onClick={() => handleSelectOrderStatus(item.value)}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="mt-5">
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={handleVolver}
                    className="mt-3"
                    color="default"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={() =>
                      handleActualizarEstadoPedido(selectedPedido.id)
                    }
                    className="mt-3"
                    color="success"
                    // isDisabled={selectedMedioPago === null}
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-md font-medium">Sin pedidos pendientes</p>
      )}
    </div>
  )
}

export default PedidosLocal
