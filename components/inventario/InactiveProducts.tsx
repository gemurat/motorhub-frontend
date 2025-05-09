'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface InactiveProduct {
  id: number
  internal_code: string | null
  description: string | null
  price: number | null
  status: string
  created_at: Date
  updated_at: Date
}

export function InactiveProducts() {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<InactiveProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchInactiveProducts = async () => {
    try {
      const response = await fetch('/api/products/inactive')
      if (!response.ok) {
        throw new Error('Failed to fetch inactive products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast.error('Error fetching inactive products')
    }
  }

  const handleReactivate = async (productId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate product')
      }

      toast.success('Product reactivated successfully')
      fetchInactiveProducts() // Refresh the list
    } catch (error) {
      toast.error('Error reactivating product')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchInactiveProducts()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Inactive Products</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Inactive Products</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Internal Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.internal_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price !== null
                        ? `$${Number(product.price).toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button
                        variant="outline"
                        onClick={() => handleReactivate(product.id)}
                        disabled={isLoading}
                      >
                        Reactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
