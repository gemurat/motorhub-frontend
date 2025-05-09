'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

interface Store {
  id: string
  name: string
}

interface Cashbox {
  id: string
  local_name: string
  current_balance: number
  last_updated: string
}

interface StoreCashboxSelectorProps {
  selectedStore: string
  selectedCashbox: string
  onStoreChange: (storeId: string, storeName: string) => void
  onCashboxChange: (cashboxId: string, cashboxName: string) => void
}

export type { Store, Cashbox }

export default function StoreCashboxSelector({ selectedStore, selectedCashbox, onStoreChange, onCashboxChange }: StoreCashboxSelectorProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores')
        if (!response.ok) throw new Error('Failed to fetch stores')
        const data = await response.json()
        setStores(data)
        // If no store is selected, select the first one
        if (data.length > 0 && !selectedStore) {
          const firstStore = data[0]
          onStoreChange(firstStore.id, firstStore.name)
        }
      } catch (error) {
        console.error('Error fetching stores:', error)
        setError('Error al cargar las tiendas')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchCashboxes = async () => {
      if (!selectedStore) {
        setCashboxes([])
        onCashboxChange('', '')
        return
      }
      try {
        const response = await fetch(`/api/caja/cashboxes?storeId=${selectedStore}`)
        if (!response.ok) throw new Error('Failed to fetch cashboxes')
        const data = await response.json()
        setCashboxes(data)
        // Do NOT auto-select the first cashbox. Only clear if none available.
        if (data.length === 0) {
          onCashboxChange('', '')
        }
      } catch (error) {
        console.error('Error fetching cashboxes:', error)
        setError('Error al cargar las cajas')
      }
    }
    fetchCashboxes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore])

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = e.target.value
    const storeName = stores.find(store => store.id === storeId)?.name || ''
    onStoreChange(storeId, storeName)
    // Cashbox will be set by useEffect when selectedStore changes
  }

  const handleCashboxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cashboxId = e.target.value
    const cashboxName = cashboxes.find(cashbox => cashbox.id === cashboxId)?.local_name || ''
    onCashboxChange(cashboxId, cashboxName)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
          Tienda
        </label>
        <select
          id="store"
          value={selectedStore}
          onChange={handleStoreChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1 px-2"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cashbox" className="block text-sm font-medium text-gray-700 mb-1">
          Caja
        </label>
        <select
          id="cashbox"
          value={selectedCashbox}
          onChange={handleCashboxChange}
          disabled={!selectedStore || cashboxes.length === 0}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 text-sm py-1 px-2"
        >
          <option value="">Seleccione una caja</option>
          {cashboxes.length === 0 ? (
            <option value="" disabled>No hay cajas disponibles</option>
          ) : (
            cashboxes.map((cashbox) => (
              <option key={cashbox.id} value={cashbox.id}>
                {cashbox.local_name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  )
} 