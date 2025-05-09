'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store } from '@/types/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface StoreFormProps {
  store?: Store | null
  onSuccess?: () => void
}

export function StoreForm({ store, onSuccess }: StoreFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: store?.name || '',
    address: store?.address || '',
    phone: store?.phone || '',
    email: store?.email || '',
    status: store?.status || 'ACTIVE',
    timezone: store?.timezone || 'America/Santiago',
    currency: store?.currency || 'CLP',
    tax_rate: store?.tax_rate?.toString() || '19',
    parent_store_id: store?.parent_store_id || null,
    logo_url: store?.logo_url || '',
    business_hours: store?.business_hours || '',
  })

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('El nombre es requerido')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido')
    }

    if (formData.phone && !/^[0-9+\-\s()]*$/.test(formData.phone)) {
      errors.push(
        'El teléfono solo puede contener números, +, -, () y espacios'
      )
    }

    const taxRate = parseFloat(formData.tax_rate)
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.push('La tasa de impuesto debe estar entre 0 y 100')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '))
      setIsLoading(false)
      return
    }

    try {
      const url = store ? `/api/admin/stores/${store.id}` : '/api/admin/stores'
      const method = store ? 'PUT' : 'POST'

      // Prepare data for submission
      const submissionData = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        status: formData.status,
        timezone: formData.timezone,
        currency: formData.currency,
        tax_rate: parseFloat(formData.tax_rate),
        logo_url: formData.logo_url.trim() || null,
        business_hours: formData.business_hours.trim() || null,
        parent_store_id: formData.parent_store_id || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Error al guardar la tienda (${response.status})`
        )
      }

      toast.success(
        store ? 'Tienda actualizada exitosamente' : 'Tienda creada exitosamente'
      )
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving store:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error al guardar la tienda'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Dirección
        </label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Estado
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full p-2 border rounded-md"
        >
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="timezone" className="text-sm font-medium">
          Zona Horaria
        </label>
        <Input
          id="timezone"
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="currency" className="text-sm font-medium">
          Moneda
        </label>
        <Input
          id="currency"
          value={formData.currency}
          onChange={(e) =>
            setFormData({ ...formData, currency: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tax_rate" className="text-sm font-medium">
          Tasa de Impuesto (%)
        </label>
        <Input
          id="tax_rate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.tax_rate}
          onChange={(e) =>
            setFormData({ ...formData, tax_rate: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="business_hours" className="text-sm font-medium">
          Horario de Atención
        </label>
        <Input
          id="business_hours"
          value={formData.business_hours}
          onChange={(e) =>
            setFormData({ ...formData, business_hours: e.target.value })
          }
          placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="logo_url" className="text-sm font-medium">
          URL del Logo
        </label>
        <Input
          id="logo_url"
          value={formData.logo_url}
          onChange={(e) =>
            setFormData({ ...formData, logo_url: e.target.value })
          }
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? 'Guardando...'
          : store
            ? 'Actualizar Tienda'
            : 'Crear Tienda'}
      </Button>
    </form>
  )
}
