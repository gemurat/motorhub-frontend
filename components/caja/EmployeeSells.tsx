import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import {
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
  Divider,
} from '@nextui-org/react'
import React, { useState } from 'react'

const EmployeeSells = ({
  isEmployeeSellsVisible,
  handleEmployeeSellsVisible,
  employeeSells,
  sellsByEmployee,
}: {
  isEmployeeSellsVisible: boolean
  handleEmployeeSellsVisible: () => void
  employeeSells: any
  sellsByEmployee: () => void
}) => {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Resumen Ventas
      </h2>
      {!isEmployeeSellsVisible ? (
        <Button onClick={() => handleEmployeeSellsVisible()}>
          Ver Ventas por Empleado
        </Button>
      ) : (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            <div className="grid grid-cols-4 gap-3">
              <span className="col-span-2">Descripcion</span>
              <span className="col-span-2">Valor</span>
            </div>
          </div>
          <Divider />
          {employeeSells && employeeSells.length > 0 ? (
            <div className="space-y-2 ">
              {employeeSells.map(
                (employeeSell: {
                  seller_id: string
                  seller_name: string
                  total_amount: number
                }) => (
                  <div
                    key={employeeSell.seller_id}
                    className="text-sm font-medium"
                  >
                    <div className="grid grid-cols-4 gap-5">
                      <span className="col-span-2 ">
                        <p className="text-xs">
                          {capitalizeFirstLetter(employeeSell.seller_name)}
                        </p>
                      </span>
                      <span className="col-span-2">
                        <p>
                          {formatCurrency(employeeSell.total_amount.toString())}
                        </p>
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p>No hay ventas disponibles.</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button onClick={handleEmployeeSellsVisible}>Volver</Button>
            <Button color="warning" onClick={sellsByEmployee}>
              Actualizar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeSells
