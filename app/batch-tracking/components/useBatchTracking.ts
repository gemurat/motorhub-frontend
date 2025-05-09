'use client'

import { useQuery } from '@tanstack/react-query'
import { BatchTrackingRow } from './columns'

async function fetchBatches(): Promise<BatchTrackingRow[]> {
  const response = await fetch('/api/product-batches')
  if (!response.ok) {
    throw new Error('Failed to fetch batches')
  }
  const data = await response.json()

  return data.batches.map((batch: any) => ({
    id: batch.id,
    batch_number: batch.batch_number,
    product_code: batch.Products?.internal_code || '',
    product_description: batch.Products?.description || '',
    expiry_date: batch.expiry_date,
    cost_price: Number(batch.cost_price),
    total_quantity: batch.StoreInventoryBatch.reduce(
      (sum: number, sib: any) => sum + sib.quantity,
      0
    ),
    store_quantities: batch.StoreInventoryBatch.map((sib: any) => ({
      store_name: sib.StoreInventory.Store.name,
      quantity: sib.quantity,
    })),
    status: getBatchStatus(batch),
  }))
}

function getBatchStatus(batch: any): 'ACTIVE' | 'EXPIRED' | 'LOW_STOCK' {
  if (batch.expiry_date && new Date(batch.expiry_date) < new Date()) {
    return 'EXPIRED'
  }

  const totalQuantity = batch.StoreInventoryBatch.reduce(
    (sum: number, sib: any) => sum + sib.quantity,
    0
  )

  if (totalQuantity < 10) {
    return 'LOW_STOCK'
  }

  return 'ACTIVE'
}

export function useBatchTracking() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  })
}
