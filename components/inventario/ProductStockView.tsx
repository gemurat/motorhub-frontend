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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StockMovementsView } from './StockMovementsView'

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

interface StoreStock {
  store_id: number
  store_name: string
  quantity: number
  min_stock: number | null
  max_stock: number | null
  reserved_quantity: number
  is_warehouse: boolean
  status: string
}

interface ProductStockViewProps {
  productId: number
  isOpen: boolean
  onClose: () => void
}

export function ProductStockView({
  productId,
  isOpen,
  onClose,
}: ProductStockViewProps) {
  const [data, setData] = useState<ProductStockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMovements, setShowMovements] = useState(false)

  useEffect(() => {
    async function fetchProductStock() {
      if (!isOpen) return // Don't fetch if modal is closed

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
  }, [productId, isOpen])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Stock Details</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : !data ? (
            <div className="flex justify-center items-center h-32">
              <div>No data available</div>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowMovements(true)}>
                  Ver Movimientos
                </Button>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Stock Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Product Code</p>
                        <p className="font-medium">
                          {data.product.internal_code}
                        </p>
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
                    <div className="overflow-x-auto">
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <StockMovementsView
        productId={productId}
        isOpen={showMovements}
        onClose={() => setShowMovements(false)}
      />
    </>
  )
}
