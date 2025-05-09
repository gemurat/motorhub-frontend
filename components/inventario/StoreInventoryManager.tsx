import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Warehouse } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface StoreInventoryManagerProps {
  product: ProductWithInventory
}

export function StoreInventoryManager({ product }: StoreInventoryManagerProps) {
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<string>('')
  const [minStock, setMinStock] = useState<string>('')
  const [sourceStore, setSourceStore] = useState<number | null>(null)
  const [targetStore, setTargetStore] = useState<number | null>(null)
  const [transferQuantity, setTransferQuantity] = useState<string>('')

  const queryClient = useQueryClient()

  // Fetch stores
  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      return response.json()
    },
  })

  // Filter stores
  const regularStores = stores.filter((store) => !store.is_warehouse)
  const warehouse = stores.find((store) => store.is_warehouse)

  // Assign stock mutation
  const assignMutation = useMutation({
    mutationFn: async (data: {
      product_id: number
      store_id: number
      quantity: number
      min_stock: number
    }) => {
      const response = await fetch('/api/store-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign stock')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock assigned successfully')
      setQuantity('')
      setMinStock('')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Transfer stock mutation
  const transferMutation = useMutation({
    mutationFn: async (data: {
      product_id: number
      source_store_id: number
      target_store_id: number
      quantity: number
    }) => {
      const response = await fetch('/api/store-inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to transfer stock')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock transferred successfully')
      setTransferQuantity('')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleAssign = () => {
    if (!selectedStore || !quantity || !minStock) {
      toast.error('Please fill in all fields')
      return
    }

    const quantityNum = parseInt(quantity)
    const minStockNum = parseInt(minStock)

    if (
      isNaN(quantityNum) ||
      isNaN(minStockNum) ||
      quantityNum <= 0 ||
      minStockNum < 0
    ) {
      toast.error('Please enter valid quantities')
      return
    }

    assignMutation.mutate({
      product_id: product.id,
      store_id: selectedStore,
      quantity: quantityNum,
      min_stock: minStockNum,
    })
  }

  const handleTransfer = () => {
    if (!sourceStore || !targetStore || !transferQuantity) {
      toast.error('Please fill in all fields')
      return
    }

    const quantityNum = parseInt(transferQuantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    transferMutation.mutate({
      product_id: product.id,
      source_store_id: sourceStore,
      target_store_id: targetStore,
      quantity: quantityNum,
    })
  }

  const getProductStock = (storeId: number) => {
    const inventory = product.store_inventories.find(
      (i) => i.store_id === storeId
    )
    return inventory?.quantity || 0
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Producto</Label>
        <div className="p-2 border rounded-md">
          {product.description || product.internal_code}
        </div>
      </div>

      <Tabs defaultValue="assign" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assign">Asignar Stock</TabsTrigger>
          <TabsTrigger value="transfer">Transferir Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          <div className="space-y-2">
            <Label>Tienda</Label>
            <Select
              value={selectedStore?.toString() || ''}
              onValueChange={(value) => setSelectedStore(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda" />
              </SelectTrigger>
              <SelectContent>
                {regularStores.map((store) => (
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingrese cantidad"
            />
          </div>

          <div className="space-y-2">
            <Label>Stock Mínimo</Label>
            <Input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="Ingrese stock mínimo"
            />
          </div>

          <Button
            onClick={handleAssign}
            disabled={assignMutation.isPending}
            className="w-full"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Asignar Stock'
            )}
          </Button>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <div className="space-y-2">
            <Label>Tienda Origen</Label>
            <Select
              value={sourceStore?.toString() || ''}
              onValueChange={(value) => setSourceStore(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda origen" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name} (Stock: {getProductStock(store.id)})
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda destino" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name} (Stock: {getProductStock(store.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cantidad a Transferir</Label>
            <Input
              type="number"
              min="1"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
              placeholder="Ingrese cantidad a transferir"
            />
          </div>

          <Button
            onClick={handleTransfer}
            disabled={transferMutation.isPending}
            className="w-full"
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferiendo...
              </>
            ) : (
              'Transferir Stock'
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
