'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ProductStockView } from './ProductStockView'

export function ProductStockModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')

  if (!productId) return null

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('productId')
    router.push(`/inventario?${newParams.toString()}`)
  }

  return (
    <ProductStockView
      productId={parseInt(productId)}
      isOpen={true}
      onClose={handleClose}
    />
  )
}
