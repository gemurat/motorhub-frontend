'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import CashActions from './CashActions'
import OrderProcessing from './OrderProcessing'
import OrdersInReview from './OrdersInReview'
import CashSummary from './CashSummary'
import StoreCashboxSelector, { Store, Cashbox } from './StoreCashboxSelector'
import { userRole } from '@/actions/userRole'
import WithdrawalsInProgress from './WithdrawalsInProgress'

interface UserCashbox {
  storeId: string
  storeName: string
  cashboxId: string
  cashboxName: string
}

export default function CashRegister() {
  const { user, isLoading: isUserLoading } = useUser()
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [selectedCashbox, setSelectedCashbox] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [cashboxName, setCashboxName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRoleState, setUserRoleState] = useState<string>('')

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await userRole()
        console.log('User role from database:', role)
        setUserRoleState(role)
      } catch (error) {
        console.error('Error fetching user role:', error)
        setError('Error al obtener el rol del usuario')
      }
    }

    if (user) {
      fetchUserRole()
    }
  }, [user])

  useEffect(() => {
    const fetchUserCashbox = async () => {
      try {
        console.log('Fetching user cashbox for user:', user?.email)
        const response = await fetch('/api/user/cashbox')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch user cashbox')
        }
        const data: UserCashbox = await response.json()
        console.log('Received cashbox data:', data)

        if (userRoleState === 'CAJERO') {
          if (data.storeId && data.cashboxId) {
            setSelectedStore(data.storeId)
            setSelectedCashbox(data.cashboxId)
            setStoreName(data.storeName)
            setCashboxName(data.cashboxName)
          } else {
            setError('No se encontró una caja asignada')
          }
        }
      } catch (error) {
        console.error('Error fetching user cashbox:', error)
        setError(error instanceof Error ? error.message : 'Error al cargar la caja asignada')
      } finally {
        setIsLoading(false)
      }
    }

    if (user && userRoleState) {
      fetchUserCashbox()
    } else {
      setIsLoading(false)
    }
  }, [user, userRoleState])

  const handleStoreChange = (storeId: string, storeName: string) => {
    setSelectedStore(storeId)
    setStoreName(storeName)
    // Reset cashbox when store changes
    setSelectedCashbox('')
    setCashboxName('')
  }

  const handleCashboxChange = (cashboxId: string, cashboxName: string) => {
    setSelectedCashbox(cashboxId)
    setCashboxName(cashboxName)
  }

  // Show loading state while user data is being fetched
  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show error state for cashiers
  if (error && userRoleState === 'CAJERO') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          No se ha iniciado sesión
        </div>
      </div>
    )
  }

  // For cashiers, show their assigned store and cashbox
  if (userRoleState === 'CAJERO' && selectedStore && selectedCashbox) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-1 p-1.5 bg-white rounded-lg shadow">
          <div className="flex gap-1.5">
            <div className="flex-1">
              <h3 className="text-[9px] font-medium text-gray-700">Tienda Asignada</h3>
              <p className="text-xs font-semibold">{storeName}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-[9px] font-medium text-gray-700">Caja Asignada</h3>
              <p className="text-xs font-semibold">{cashboxName}</p>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Left Side - Processing and Review */}
          <div className="w-2/3 p-1.5 border-r space-y-1.5">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <OrderProcessing
                storeId={selectedStore}
                cashboxId={selectedCashbox}
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-2">
              <h2 className="text-base font-bold mb-1.5">Órdenes en Revisión</h2>
              <OrdersInReview
                storeId={selectedStore}
                cashboxId={selectedCashbox}
              />
            </div>
          </div>

          {/* Right Side - Actions and Summary */}
          <div className="w-1/3 p-1.5 space-y-1.5">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <h2 className="text-base font-bold mb-1.5">Acciones de Caja</h2>
              <CashActions
                storeId={selectedStore}
                cashboxId={selectedCashbox}
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-2">
              <WithdrawalsInProgress
                storeId={selectedStore}
                cashboxId={selectedCashbox}
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-2">
              <CashSummary
                storeId={selectedStore}
                cashboxId={selectedCashbox}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For administrators, show the store/cashbox selector
  if (userRoleState === 'ADMIN') {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4 p-4 bg-white rounded-lg shadow w-full">
          <StoreCashboxSelector
            selectedStore={selectedStore}
            selectedCashbox={selectedCashbox}
            onStoreChange={handleStoreChange}
            onCashboxChange={handleCashboxChange}
          />
        </div>

        {/* Show warning if no store/cashbox is selected */}
        {(!selectedStore || !selectedCashbox) && (
          <div className="mb-2 p-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm text-center max-w-xl mx-auto">
            Por favor, seleccione una tienda y una caja para continuar
          </div>
        )}

        {/* Show main content when store and cashbox are selected */}
        {selectedStore && selectedCashbox && (
          <div className="flex h-full">
            {/* Left Side - Processing and Review */}
            <div className="w-2/3 p-1 border-r space-y-1">
              <div className="bg-white rounded shadow p-1.5">
                <OrderProcessing
                  storeId={selectedStore}
                  cashboxId={selectedCashbox}
                />
              </div>
              <div className="bg-white rounded shadow p-1.5">
                <h2 className="text-sm font-bold mb-1">Órdenes en Revisión</h2>
                <OrdersInReview
                  storeId={selectedStore}
                  cashboxId={selectedCashbox}
                />
              </div>
            </div>

            {/* Right Side - Actions and Summary */}
            <div className="w-1/3 p-1 space-y-1">
              <div className="bg-white rounded shadow p-1.5">
                <h2 className="text-sm font-bold mb-1">Acciones de Caja</h2>
                <CashActions
                  storeId={selectedStore}
                  cashboxId={selectedCashbox}
                />
              </div>
              <div className="bg-white rounded shadow p-1.5">
                <WithdrawalsInProgress
                  storeId={selectedStore}
                  cashboxId={selectedCashbox}
                />
              </div>
              <div className="bg-white rounded shadow p-1.5">
                <h2 className="text-sm font-bold mb-1">Resumen de Caja</h2>
                <CashSummary
                  storeId={selectedStore}
                  cashboxId={selectedCashbox}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // If we get here, something went wrong
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Error: Rol de usuario no válido ({userRoleState})
      </div>
    </div>
  )
}
