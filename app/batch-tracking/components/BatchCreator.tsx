'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useBatchTracking } from './useBatchTracking'

export function BatchCreator() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { refetch } = useBatchTracking()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      product_id: formData.get('product_id'),
      batch_number: formData.get('batch_number'),
      expiry_date: formData.get('expiry_date'),
      cost_price: formData.get('cost_price'),
    }

    try {
      const response = await fetch('/api/product-batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create batch')
      }

      toast.success('Batch created successfully')
      setIsOpen(false)
      refetch()
    } catch (error) {
      toast.error('Error creating batch')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Batch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Product ID</Label>
            <Input
              id="product_id"
              name="product_id"
              type="number"
              required
              placeholder="Enter product ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number</Label>
            <Input
              id="batch_number"
              name="batch_number"
              required
              placeholder="Enter batch number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="date"
              placeholder="Select expiry date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost Price</Label>
            <Input
              id="cost_price"
              name="cost_price"
              type="number"
              step="0.01"
              required
              placeholder="Enter cost price"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Batch'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
