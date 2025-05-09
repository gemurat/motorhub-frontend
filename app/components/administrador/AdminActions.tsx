'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  RotateCcw,
  Users,
  DollarSign,
  RefreshCw,
} from 'lucide-react'

interface EmployeeSell {
  seller_id: string
  seller_name: string
  total_amount: number
}

interface SellByType {
  payment_method: string
  payment_count: number
  total_amount: number
}

interface AdminActionsProps {
  employeeSells: EmployeeSell[]
  sellByType: SellByType[]
  onRefresh: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export default function AdminActions({
  employeeSells,
  sellByType,
  onRefresh,
}: AdminActionsProps) {
  const totalSales = sellByType.reduce(
    (sum, sell) => sum + sell.total_amount,
    0
  )
  const topSeller = employeeSells.reduce(
    (max, curr) => (curr.total_amount > (max?.total_amount || 0) ? curr : max),
    employeeSells[0]
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Gift Cards Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gift Cards</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Gestionar Gift Cards
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Returns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Devoluciones</CardTitle>
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Ver Devoluciones
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ventas por Empleado
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topSeller ? topSeller.seller_name : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {topSeller
              ? `Mejor vendedor: ${formatCurrency(topSeller.total_amount)}`
              : 'Sin datos'}
          </p>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Resumen de Ventas
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          <div className="space-y-1">
            {sellByType.map((sell) => (
              <div
                key={sell.payment_method}
                className="text-xs text-muted-foreground"
              >
                {sell.payment_method}: {sell.payment_count} ventas (
                {formatCurrency(sell.total_amount)})
              </div>
            ))}
          </div>
          <Button
            className="mt-2 w-full"
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
