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

interface TransferModalProps {
  product: ProductWithInventory
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TransferModal({
  product,
  open,
  onOpenChange,
  onSuccess,
}: TransferModalProps) {
  const [sourceStore, setSourceStore] = useState<number | null>(null)
  const [targetStore, setTargetStore] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stores')
      if (!response.ok) throw new Error('Error fetching stores')
      return response.json()
    },
  })

  const availableStores = stores.filter((store) => {
    const inventory = product.store_inventories.find(
      (inv) => inv.store_id === store.id
    )
    return inventory && inventory.quantity > 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceStore || !targetStore || !quantity) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          fromStoreId: sourceStore,
          toStoreId: targetStore,
          quantity: parseInt(quantity),
          type: 'TRANSFER',
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error transferring stock')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
      // Show error to user
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Error transferring stock')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableQuantity = (storeId: number) => {
    const inventory = product.store_inventories.find(
      (inv) => inv.store_id === storeId
    )
    return inventory ? inventory.quantity - inventory.reserved_quantity : 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir Stock</DialogTitle>
          <DialogDescription>
            Transferir stock de {product.description || product.internal_code}{' '}
            entre tiendas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tienda Origen</Label>
            <Select
              value={sourceStore?.toString() || ''}
              onValueChange={(value) => {
                setSourceStore(parseInt(value))
                setTargetStore(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda origen" />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name} (Disponible: {getAvailableQuantity(store.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tienda Destino</Label>
            <Select
              value={targetStore?.toString() || ''}
              onValueChange={(value) => setTargetStore(parseInt(value))}
              disabled={!sourceStore}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda destino" />
              </SelectTrigger>
              <SelectContent>
                {stores
                  .filter((store) => store.id !== sourceStore)
                  .map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              max={sourceStore ? getAvailableQuantity(sourceStore) : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingrese cantidad"
              disabled={!sourceStore}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ingrese notas (opcional)"
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
              disabled={!sourceStore || !targetStore || !quantity || isLoading}
            >
              {isLoading ? 'Transferiendo...' : 'Transferir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
