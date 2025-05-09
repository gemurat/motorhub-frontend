'use client'

import { useState } from 'react'
import TableNew from './TableNew'
import ShoppingCart from './ShoppingCart'
import { AddedProduct } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ShoppingCartProvider } from './ShoppingCartContext'

export default function VentasClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <ShoppingCartProvider>
      <div className="flex gap-4 p-4">
        <div className="flex-1">
          <TableNew />
        </div>
        <div className="w-96">
          <ShoppingCart />
        </div>
      </div>
    </ShoppingCartProvider>
  )
}
