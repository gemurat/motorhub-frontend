import { capitalizeFirstLetter, formatCurrency } from '@/lib/utils'
import { Button, Select, SelectItem, Input, Textarea } from '@nextui-org/react'
import React, { useState } from 'react'

type TransactionType = 'expense' | 'income' | null

const CashBox = ({
  currentCash,
  lasUpdated,
  amount,
  description,
  handleCashboxAmountChange,
  handleDescriptionChange,
  transactionType,
  handleTransactionTypeChange,
  handleCashboxSubmit,
  handleCashboxVolver,
  isCajaChicaVisible,
  handleCashboxVisible,
}: {
  currentCash: string
  lasUpdated: string
  amount: string
  description: string
  isCajaChicaVisible: boolean
  handleTransactionTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  transactionType: TransactionType
  handleCashboxAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCashboxSubmit: () => void
  handleCashboxVolver: () => void
  handleCashboxVisible: () => void
  handleDescriptionChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
}) => {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-500">
          {new Date(lasUpdated).toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Santiago',
          })}
        </p>
        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
          Caja Chica: {formatCurrency(currentCash)}
        </h2>
        {!isCajaChicaVisible ? (
          <Button onClick={() => handleCashboxVisible()}>
            agregar movimiento
          </Button>
        ) : (
          <>
            <Input
              type="number"
              value={amount}
              onChange={handleCashboxAmountChange}
              placeholder="Ingrese monto"
              className="mb-2"
            />
            <Select
              value={transactionType ?? ''}
              onChange={handleTransactionTypeChange}
              className="mb-2"
              label="Tipo de transacción"
            >
              <SelectItem key={'expense'} value="EXPENSE">
                Gasto
              </SelectItem>
              <SelectItem key={'income'} value="INCOME">
                Ingreso
              </SelectItem>
            </Select>
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Ingrese descripción"
              className="mb-2"
            />
            <div className="flex gap-3 justify-end">
              <Button
                className="mt-3"
                color="default"
                onClick={() => handleCashboxVolver()}
              >
                Volver
              </Button>
              <Button
                onClick={() => handleCashboxSubmit()}
                className="mt-3"
                color="success"
                isDisabled={!transactionType || !amount || !description}
              >
                Confirmar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CashBox
