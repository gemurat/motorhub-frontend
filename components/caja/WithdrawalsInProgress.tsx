'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Withdrawal {
  id: number
  amount: number
  description: string
  date: string
  created_by: string
}

interface WithdrawalsInProgressProps {
  storeId: string
  cashboxId: string
}

export default function WithdrawalsInProgress({ storeId, cashboxId }: WithdrawalsInProgressProps) {
  const [inProgressWithdrawals, setInProgressWithdrawals] = useState<Withdrawal[]>([])
  const [todayWithdrawals, setTodayWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showTodayWithdrawals, setShowTodayWithdrawals] = useState(false)

  const fetchWithdrawals = async (type: 'in-progress' | 'today') => {
    try {
      const endpoint = type === 'in-progress'
        ? `/api/caja/withdrawals/in-progress?cashbox_id=${cashboxId}`
        : `/api/caja/withdrawals/today?cashbox_id=${cashboxId}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals')
      }
      const data = await response.json()
      if (type === 'in-progress') {
        setInProgressWithdrawals(data.withdrawals)
      } else {
        setTodayWithdrawals(data.withdrawals)
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      setError('Error al cargar los retiros')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (cashboxId) {
      // Initial fetch
      fetchWithdrawals('in-progress')
      fetchWithdrawals('today')

      // Set up polling interval (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchWithdrawals('in-progress')
        fetchWithdrawals('today')
      }, 30000)

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId)
    }
  }, [cashboxId])

  const renderWithdrawal = (withdrawal: Withdrawal, isInProgress: boolean = false) => (
    <div
      key={withdrawal.id}
      className={`p-3 rounded-lg border ${isInProgress
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-gray-50 border-gray-200'
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-900">{withdrawal.description}</p>
          <p className="text-xs text-gray-500">
            Creado por: {withdrawal.created_by}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(withdrawal.date), "HH:mm", { locale: es })}
          </p>
        </div>
        <div className={`text-sm font-semibold ${isInProgress ? 'text-yellow-700' : 'text-gray-700'
          }`}>
          ${withdrawal.amount.toLocaleString()}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Retiros en Progreso</h3>
        <span className="text-xs text-gray-500">
          Actualizado: {format(lastUpdate, "HH:mm:ss", { locale: es })}
        </span>
      </div>

      {inProgressWithdrawals.length === 0 ? (
        <div className="p-4 text-gray-500 text-sm text-center">
          No hay retiros en progreso
        </div>
      ) : (
        <div className="space-y-2">
          {inProgressWithdrawals.map(withdrawal => renderWithdrawal(withdrawal, true))}
        </div>
      )}

      <div className="border-t pt-4">
        <button
          onClick={() => setShowTodayWithdrawals(!showTodayWithdrawals)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
        >
          <span>Retiros Completados de Hoy</span>
          {showTodayWithdrawals ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showTodayWithdrawals && (
          todayWithdrawals.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">
              No hay retiros completados hoy
            </div>
          ) : (
            <div className="space-y-2">
              {todayWithdrawals.map(withdrawal => renderWithdrawal(withdrawal))}
            </div>
          )
        )}
      </div>
    </div>
  )
} 