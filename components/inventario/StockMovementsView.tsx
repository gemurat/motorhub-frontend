'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Store {
  id: number
  name: string
  is_warehouse: boolean
}

interface StockMovement {
  id: number
  product_id: number
  from_store_id: number | null
  to_store_id: number | null
  quantity: number
  type: string
  status: string
  notes: string | null
  created_at: string
  Products: {
    internal_code: string
    description: string | null
  }
  FromStore: {
    name: string
  } | null
  ToStore: {
    name: string
  } | null
  CreatedBy: {
    username: string
  }
}

interface StockMovementsViewProps {
  productId: number
  isOpen: boolean
  onClose: () => void
}

export function StockMovementsView({
  productId,
  isOpen,
  onClose,
}: StockMovementsViewProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState<number | null>(null)
  const [newMovement, setNewMovement] = useState({
    fromStoreId: 'none',
    toStoreId: 'none',
    quantity: '',
    type: 'TRANSFER',
    notes: '',
  })

  useEffect(() => {
    if (isOpen && productId) {
      fetchStores()
      fetchMovements()
    }
  }, [isOpen, productId])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      const data = await response.json()
      setStores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stores')
    }
  }

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/stock-movements?product_id=${productId}&status=PENDING&sortOrder=desc`
      )
      if (!response.ok) throw new Error('Failed to fetch movements')
      const data = await response.json()
      setMovements(data.movements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching movements')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovement = async () => {
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          fromStoreId:
            newMovement.fromStoreId !== 'none'
              ? parseInt(newMovement.fromStoreId)
              : null,
          toStoreId:
            newMovement.toStoreId !== 'none'
              ? parseInt(newMovement.toStoreId)
              : null,
          quantity: parseInt(newMovement.quantity),
          type: newMovement.type,
          notes: newMovement.notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to create movement')

      // Reset form and refresh movements
      setNewMovement({
        fromStoreId: 'none',
        toStoreId: 'none',
        quantity: '',
        type: 'TRANSFER',
        notes: '',
      })
      fetchMovements()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating movement')
    }
  }

  const handleApproveReject = async (
    movementId: number,
    action: 'APPROVE' | 'REJECT'
  ) => {
    try {
      setIsApproving(movementId)
      const response = await fetch(`/api/stock-movements/${movementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'APPROVE' ? 'COMPLETED' : 'REJECTED',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details || `Failed to ${action.toLowerCase()} movement`
        )
      }

      // Refresh movements list
      await fetchMovements()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Error ${action.toLowerCase()}ing movement`
      )
    } finally {
      setIsApproving(null)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Movimientos de Stock</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {/* New Movement Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Tienda Origen</Label>
                <Select
                  value={newMovement.fromStoreId}
                  onValueChange={(value) =>
                    setNewMovement({ ...newMovement, fromStoreId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tienda origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name} {store.is_warehouse ? '(Bodega)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tienda Destino</Label>
                <Select
                  value={newMovement.toStoreId}
                  onValueChange={(value) =>
                    setNewMovement({ ...newMovement, toStoreId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tienda destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name} {store.is_warehouse ? '(Bodega)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) =>
                    setNewMovement({ ...newMovement, quantity: e.target.value })
                  }
                  placeholder="Cantidad"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newMovement.type}
                  onValueChange={(value) =>
                    setNewMovement({ ...newMovement, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                    <SelectItem value="RETURN">Devolución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notas</Label>
                <Input
                  value={newMovement.notes}
                  onChange={(e) =>
                    setNewMovement({ ...newMovement, notes: e.target.value })
                  }
                  placeholder="Notas adicionales"
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleCreateMovement}>Crear Movimiento</Button>
              </div>
            </div>

            {/* Movements List */}
            <div className="space-y-4">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {movement.Products.internal_code}
                      </p>
                      <p className="text-sm text-gray-500">
                        {movement.Products.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {movement.quantity} unidades
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(movement.created_at), 'PPP', {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Desde:</p>
                      <p>{movement.FromStore?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hacia:</p>
                      <p>{movement.ToStore?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo:</p>
                      <p>{movement.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado:</p>
                      <p
                        className={`font-medium ${movement.status === 'PENDING'
                            ? 'text-yellow-600'
                            : movement.status === 'COMPLETED'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                      >
                        {movement.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Creado por:</p>
                      <p>{movement.CreatedBy?.username || 'N/A'}</p>
                    </div>
                  </div>
                  {movement.notes && (
                    <div className="text-sm">
                      <p className="text-gray-500">Notas:</p>
                      <p>{movement.notes}</p>
                    </div>
                  )}
                  {movement.status === 'PENDING' && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleApproveReject(movement.id, 'APPROVE')
                        }
                        disabled={isApproving === movement.id}
                      >
                        {isApproving === movement.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Aprobar'
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleApproveReject(movement.id, 'REJECT')
                        }
                        disabled={isApproving === movement.id}
                      >
                        {isApproving === movement.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Rechazar'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
