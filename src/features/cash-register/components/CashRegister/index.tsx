'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi, cashBoxApi } from '../../services/api'
import { Order } from '../../types'

export default function CashRegister() {
  // Fetch orders and cash box data
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  })

  const { data: cashBoxData, isLoading: cashBoxLoading } = useQuery({
    queryKey: ['cashBox'],
    queryFn: cashBoxApi.getBalance,
  })

  if (ordersLoading || cashBoxLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">Caja</h1>
        <div className="mt-2">
          <span className="font-semibold">Balance Actual: </span>
          <span className="text-green-600">
            ${cashBoxData?.data?.balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Órdenes Activas</h2>
            <div className="space-y-4">
              {ordersData?.data?.map((order: Order) => (
                <div
                  key={order.id}
                  className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Orden #{order.id}</span>
                    <span className="text-gray-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items.length} items
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Nueva Orden
              </button>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                Registrar Gasto
              </button>
              <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
                Registrar Ingreso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
