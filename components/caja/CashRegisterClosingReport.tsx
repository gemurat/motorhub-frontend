'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CashRegisterClosingReportProps {
  storeId: string
  cashboxId: string
}

interface ReportData {
  store: {
    name: string
    address: string
  }
  cashbox: {
    name: string
    current_balance: number
  }
  date: string
  time: string
  summary: {
    total_sales: number
    total_transactions: number
    payment_methods: Array<{
      method: string
      total: number
      count: number
    }>
    expenses: Array<{
      status: string
      total: number
      count: number
    }>
  }
  seller_sales: Array<{
    seller_id: number
    total_sales: number
    order_count: number
  }>
  orders: Array<{
    id: number
    total: number
    items: Array<{
      product: string
      quantity: number
      price: number
    }>
    seller: string
  }>
}

export default function CashRegisterClosingReport({ storeId, cashboxId }: CashRegisterClosingReportProps) {
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['cash-register-closing', storeId, cashboxId],
    queryFn: async () => {
      const response = await fetch('/api/caja/close-cash-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId, cashboxId }),
      })
      if (!response.ok) throw new Error('Failed to generate report')
      return response.json()
    },
    enabled: !!storeId && !!cashboxId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center text-red-500">
        No se pudo generar el reporte
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Cierre de Caja</CardTitle>
          <div className="text-center text-gray-600">
            <p>{reportData.store.name}</p>
            <p>{reportData.store.address}</p>
            <p>
              {reportData.date} - {reportData.time}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Cashbox Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Caja:</p>
              <p className="font-medium">{reportData.cashbox.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Balance Final:</p>
              <p className="font-medium">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(reportData.cashbox.current_balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Ventas Totales:</p>
              <p className="font-medium">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                }).format(reportData.summary.total_sales)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total de Transacciones:</p>
              <p className="font-medium">{reportData.summary.total_transactions}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Métodos de Pago</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Transacciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.summary.payment_methods.map((method, index) => (
                  <TableRow key={index}>
                    <TableCell>{method.method}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(method.total)}
                    </TableCell>
                    <TableCell className="text-right">{method.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Gastos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.summary.expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell>{expense.status}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(expense.total)}
                    </TableCell>
                    <TableCell className="text-right">{expense.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Seller Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Total Ventas</TableHead>
                <TableHead className="text-right">Órdenes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.seller_sales.map((seller, index) => (
                <TableRow key={index}>
                  <TableCell>Vendedor {seller.seller_id}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    }).format(seller.total_sales)}
                  </TableCell>
                  <TableCell className="text-right">{seller.order_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Orden #{order.id}</CardTitle>
                    <span className="font-medium">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(order.total)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Vendedor: {order.seller}</p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                            }).format(item.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                            }).format(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 