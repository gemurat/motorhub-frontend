'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ExpenseForm from './ExpenseForm'
import CashRegisterClosingReport from './CashRegisterClosingReport'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Cashbox {
  id: number
  local_name: string
  current_balance: number
  last_updated: string
}

interface CashActionsProps {
  storeId: string
  cashboxId: string
}

export default function CashActions({ storeId, cashboxId }: CashActionsProps) {
  const [showClosingReport, setShowClosingReport] = useState(false)

  const {
    data: cashboxes,
    isLoading,
    error,
  } = useQuery<Cashbox[]>({
    queryKey: ['cashbox-balance', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch(`/api/caja/cashboxes?storeId=${storeId}`)
      if (!response.ok) throw new Error('Failed to fetch cashbox balance')
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!storeId && !!cashboxId,
  })

  // Find the selected cashbox from the array
  const selectedCashbox = cashboxes?.find(cashbox => cashbox.id === parseInt(cashboxId))

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm">
          Gift Cards
        </button>
        <button
          onClick={() => setShowClosingReport(true)}
          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Cierre de Caja
        </button>
      </div>

      {/* Cash Balance */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Balance de Caja</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">Error al cargar el balance</div>
        ) : !selectedCashbox ? (
          <div className="text-red-500 text-sm">No se encontró la caja seleccionada</div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-1">
              {selectedCashbox.local_name}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
              }).format(selectedCashbox.current_balance || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Última actualización:{' '}
              {new Date(selectedCashbox.last_updated || '').toLocaleTimeString(
                'es-CL',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* Expense Form */}
      {selectedCashbox && (
        <ExpenseForm
          storeId={storeId}
          cashboxId={cashboxId}
          currentBalance={selectedCashbox.current_balance}
        />
      )}

      {/* Cash Register Closing Report Dialog */}
      <Dialog open={showClosingReport} onOpenChange={setShowClosingReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cierre de Caja</DialogTitle>
          </DialogHeader>
          <CashRegisterClosingReport storeId={storeId} cashboxId={cashboxId} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
