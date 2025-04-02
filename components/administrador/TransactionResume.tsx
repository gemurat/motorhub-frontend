import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Divider } from '@nextui-org/react'
import React, { useState } from 'react'

const TransactionResume = ({
  isTransactionResumeVisible,
  handleTransactionResumeVisible,
  sellByType,
  updateSellsByType,
}: {
  isTransactionResumeVisible: boolean
  handleTransactionResumeVisible: () => void
  sellByType: any
  updateSellsByType: () => void
}) => {
  // console.log(sellByType)

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Ventas Por Tipo
      </h2>
      {!isTransactionResumeVisible ? (
        <Button onClick={() => handleTransactionResumeVisible()}>
          Ver Ventas por Empleado
        </Button>
      ) : (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            <div className="grid grid-cols-6 gap-3 text-left">
              <span className="col-span-2">Nombre</span>
              <span className="col-span-2">Cantidad</span>
              <span className="col-span-2">Total</span>
            </div>
          </div>
          <Divider />
          {sellByType && sellByType.length > 0 ? (
            <div className="space-y-2">
              {sellByType.map(
                (payment: {
                  payment_method: string
                  payment_count: string
                  total_amount: string
                }) => (
                  <div
                    key={payment.payment_method}
                    className="text-sm font-medium text-left"
                  >
                    <div className="grid grid-cols-4 gap-5">
                      <span className="col-span-2">
                        <p className="text-xs">
                          {capitalizeFirstLetter(payment.payment_method)}
                        </p>
                      </span>
                      <span className="col-span-1">
                        <p>{payment.payment_count}</p>
                      </span>
                      <span className="col-span-1">
                        <p>{formatCurrency(payment.total_amount)}</p>
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p>No hay ventas disponibles.</p>
          )}
          <Divider />
          <div className="grid grid-cols-4 gap-3">
            <span className="col-span-2 font-semibold text-left">Total</span>
            <span className="col-span-2 font-semibold text-right">
              {sellByType &&
                formatCurrency(
                  sellByType
                    .reduce(
                      (acc: number, payment: { total_amount: string }) =>
                        acc + parseFloat(payment.total_amount),
                      0
                    )
                    .toString()
                )}
            </span>
          </div>
          <div className="flex gap-3 justify-end">
            <Button onClick={handleTransactionResumeVisible}>Volver</Button>
            <Button color="warning" onClick={updateSellsByType}>
              Actualizar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionResume
