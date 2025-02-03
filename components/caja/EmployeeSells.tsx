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

const EmployeeSells = ({}: {}) => {
  const [isEmployeeSellsVisible, setIsEmployeeSellsVisible] = useState(false)
  interface EmployeeSell {
    seller_id: string
    seller_name: string
    total_amount: number
  }

  const [employeeSells, setEmployeeSells] = useState<EmployeeSell[]>([])
  const handleEmployeeSellsVisible = () => {
    setIsEmployeeSellsVisible(!isEmployeeSellsVisible)
  }
  const sellsByEmployee = async () => {
    try {
      const response = await fetch('/api/employee-sells', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('caja chica failed')
      }

      const result = await response.json()
      setEmployeeSells(result)
      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('Error Caja chica:', error)
      // Handle error in payment processing (e.g., show an error
    }
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
        Resumen Ventas
      </h2>
      {!isEmployeeSellsVisible ? (
        <Button onClick={handleEmployeeSellsVisible}>
          Ver Ventas por Empleado
        </Button>
      ) : (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            <div className="grid grid-cols-4 gap-3">
              <span className="col-span-2">Descripcion</span>
              <span className="col-span-2">Precio</span>
            </div>
          </div>
          <Divider />
          <div className="space-y-2 ">
            {employeeSells.map((employeeSell) => (
              <div key={employeeSell.seller_id} className="text-sm font-medium">
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
            ))}
          </div>
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
