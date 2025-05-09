'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type BatchTrackingRow = {
  id: number
  batch_number: string
  product_code: string
  product_description: string
  expiry_date: Date | null
  cost_price: number
  total_quantity: number
  store_quantities: {
    store_name: string
    quantity: number
  }[]
  status: 'ACTIVE' | 'EXPIRED' | 'LOW_STOCK'
}

export const columns: ColumnDef<BatchTrackingRow>[] = [
  {
    accessorKey: 'batch_number',
    header: 'Lote',
  },
  {
    accessorKey: 'product_code',
    header: 'Código',
  },
  {
    accessorKey: 'product_description',
    header: 'Descripción',
  },
  {
    accessorKey: 'expiry_date',
    header: 'Fecha de Expiración',
    cell: ({ row }) => {
      const date = row.getValue('expiry_date') as Date | null
      return date ? format(date, 'PPP', { locale: es }) : '-'
    },
  },
  {
    accessorKey: 'cost_price',
    header: 'Precio de Costo',
    cell: ({ row }) => {
      const amount = row.getValue('cost_price') as number
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(amount)
    },
  },
  {
    accessorKey: 'total_quantity',
    header: 'Cantidad Total',
  },
  {
    accessorKey: 'store_quantities',
    header: 'Stock por Tienda',
    cell: ({ row }) => {
      const stores = row.getValue('store_quantities') as {
        store_name: string
        quantity: number
      }[]
      return (
        <div className="flex flex-col gap-1">
          {stores.map((store) => (
            <div key={store.store_name} className="flex justify-between">
              <span className="text-sm">{store.store_name}:</span>
              <span className="text-sm font-medium">{store.quantity}</span>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant =
        status === 'ACTIVE'
          ? 'default'
          : status === 'EXPIRED'
            ? 'destructive'
            : 'warning'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]
