import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Product } from '@/types'

interface Store {
  id: number
  name: string
  is_warehouse: boolean
}

interface StoreInventory {
  id: number
  store_id: number
  product_id: number
  quantity: number
  reserved_quantity: number
  min_stock: number
  max_stock: number | null
  status: string
  is_warehouse: boolean
}

interface ProductWithInventory extends Product {
  store_inventories: StoreInventory[]
}

interface AdjustmentModalProps {
  product: ProductWithInventory
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustmentModal({
  product,
  open,
  onOpenChange,
  onSuccess,
}: AdjustmentModalProps) {
  const [storeId, setStoreId] = useState<number | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [quantity, setQuantity] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Error fetching stores')
      return response.json()
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !quantity || !reason) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/store-inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          store_id: storeId,
          quantity:
            adjustmentType === 'add' ? parseInt(quantity) : -parseInt(quantity),
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error adjusting stock')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentQuantity = (storeId: number) => {
    const inventory = product.store_inventories.find(
      (inv) => inv.store_id === storeId
    )
    return inventory ? inventory.quantity : 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Ajustar stock de {product.description || product.internal_code}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tienda</Label>
            <Select
              value={storeId?.toString() || ''}
              onValueChange={(value) => setStoreId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name} (Actual: {getCurrentQuantity(store.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Ajuste</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value: 'add' | 'remove') =>
                setAdjustmentType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Agregar Stock</SelectItem>
                <SelectItem value="remove">Quitar Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingrese cantidad"
              disabled={!storeId}
            />
          </div>

          <div className="space-y-2">
            <Label>Razón del Ajuste</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ingrese la razón del ajuste"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!storeId || !quantity || !reason || isLoading}
            >
              {isLoading ? 'Ajustando...' : 'Ajustar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
