'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StoreInventory {
  store_id: number
  store_name: string
  is_warehouse: boolean
  quantity: number
  reserved_quantity: number
  min_stock: number | null
  max_stock: number | null
  available_stock: number
}

interface ProductStockData {
  product: {
    id: number
    internal_code: string | null
    description: string | null
    price: number | null
  }
  total_stock: number
  total_reserved: number
  store_inventory: StoreInventory[]
}

interface ProductStockViewProps {
  productId: number
}

export function ProductStockView({ productId }: ProductStockViewProps) {
  const [data, setData] = useState<ProductStockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProductStock() {
      try {
        const response = await fetch(
          `/api/product-stock?productId=${productId}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch product stock')
        }
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProductStock()
  }, [productId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return <div>No data available</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product Stock Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Product Code</p>
              <p className="font-medium">{data.product.internal_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stock</p>
              <p className="font-medium">{data.total_stock}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reserved</p>
              <p className="font-medium">{data.total_reserved}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Max Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.store_inventory.map((store) => (
                <TableRow key={store.store_id}>
                  <TableCell>{store.store_name}</TableCell>
                  <TableCell>
                    {store.is_warehouse ? 'Warehouse' : 'Store'}
                  </TableCell>
                  <TableCell>{store.quantity}</TableCell>
                  <TableCell>{store.reserved_quantity}</TableCell>
                  <TableCell>{store.available_stock}</TableCell>
                  <TableCell>{store.min_stock || '-'}</TableCell>
                  <TableCell>{store.max_stock || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
