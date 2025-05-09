import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

interface CashBoxes {
  id: number
  local_name: string
  current_balance: number
  last_updated: Date
  store_id: number
}

interface CashBoxFormProps {
  storeId: number
  cashbox: CashBoxes | null
  onSuccess: () => void
}

export function CashBoxForm({ storeId, cashbox, onSuccess }: CashBoxFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    local_name: cashbox?.local_name || '',
    current_balance: cashbox?.current_balance || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.local_name.trim()) {
      setError('El nombre de la caja es requerido')
      setIsLoading(false)
      return
    }

    try {
      const url = cashbox ? `/api/caja/cashboxes` : '/api/caja/cashboxes'
      const method = cashbox ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: cashbox?.id,
          store_id: storeId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar la caja')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving cashbox:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error al guardar la caja. Por favor, intente nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="local_name">Nombre de la Caja</Label>
          <Input
            id="local_name"
            value={formData.local_name}
            onChange={(e) =>
              setFormData({ ...formData, local_name: e.target.value })
            }
            placeholder="Ej: Caja Principal"
            maxLength={250}
          />
        </div>

        {cashbox && (
          <>
            <div className="space-y-2">
              <Label>Saldo Actual</Label>
              <div className="text-lg font-semibold">
                {formatCurrency(formData.current_balance.toString())}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Última Actualización</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(cashbox.last_updated).toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Santiago',
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : cashbox ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
