'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Store = {
  id: number
  name: string
}

type StoreAccess = {
  store_id: number
  role: string
  status: string
}

type Empleados = {
  id: number
  username: string | null
  email: string | null
  role: string
  status: string
  store_id: number | null
  store_name: string | null
  cashbox_id: number | null
  cashbox: {
    id: number
    local_name: string
    current_balance: number
    store_id: number
  } | null
  store_access: StoreAccess[]
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type CashBox = {
  id: number
  local_name: string
}

type EmployeeFormValues = {
  username: string
  email: string
  role: string
  status?: string
  store_id?: string
  cashbox_id?: string
  first_name: string
  last_name: string
  phone?: string
  store_access?: StoreAccess[]
}

const employeeSchema = z.object({
  username: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.string().min(2, 'El rol debe tener al menos 2 caracteres'),
  status: z.string().optional(),
  store_id: z.string().optional(),
  cashbox_id: z.string().optional(),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  store_access: z
    .array(
      z.object({
        store_id: z.number(),
        role: z.string(),
        status: z.string().default('ACTIVE'),
      })
    )
    .optional(),
})

interface EmployeeFormProps {
  employee?: Empleados | null
  onSuccess?: () => void
}

const generateStrongPassword = () => {
  const length = 12
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [cashboxes, setCashboxes] = useState<CashBox[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  )
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStores, setSelectedStores] = useState<StoreAccess[]>([])
  const { user } = useUser()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      username: employee?.username || '',
      email: employee?.email || '',
      role: employee?.role || '',
      status: employee?.status || 'ACTIVE',
      store_id: employee?.store_id?.toString() || '',
      cashbox_id: employee?.cashbox_id?.toString() || '',
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      phone: employee?.phone || '',
      store_access: employee?.store_access || [],
    },
  })

  useEffect(() => {
    fetchStores()
    if (employee?.store_access) {
      setSelectedStores(employee.store_access)
    }
  }, [employee])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (!response.ok) {
        throw new Error('Error al cargar las tiendas')
      }
      const data = await response.json()
      setStores(data)
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Error al cargar las tiendas')
    }
  }

  const fetchCashboxes = async (storeId: string) => {
    try {
      const response = await fetch(`/api/caja/cashboxes?storeId=${storeId}`)
      if (!response.ok) {
        throw new Error('Error al cargar las cajas')
      }
      const data = await response.json()
      console.log('Fetched cashboxes:', data)
      setCashboxes(data)
    } catch (error) {
      console.error('Error fetching cashboxes:', error)
      toast.error('Error al cargar las cajas')
    }
  }

  // Watch for store_id changes to fetch cashboxes
  const storeId = form.watch('store_id')
  useEffect(() => {
    if (storeId) {
      fetchCashboxes(storeId)
    }
  }, [storeId])

  // Watch for role changes to show/hide cashbox field
  const role = form.watch('role')

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Contraseña copiada al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Error al copiar la contraseña')
    }
  }

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleStoreSelection = (storeId: string) => {
    const store = stores.find((s) => s.id.toString() === storeId)
    if (!store) return

    const existingStore = selectedStores.find(
      (s) => s.store_id.toString() === storeId
    )
    if (existingStore) {
      setSelectedStores(
        selectedStores.filter((s) => s.store_id.toString() !== storeId)
      )
    } else {
      setSelectedStores([
        ...selectedStores,
        {
          store_id: parseInt(storeId),
          role: form.getValues('role'),
          status: 'ACTIVE',
        },
      ])
    }
  }

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      // Prepare the request body
      const requestBody = {
        ...data,
        id: employee?.id,
        status: data.status || 'ACTIVE',
        store_access: selectedStores,
      }

      const url = employee
        ? `/api/admin/employees?id=${employee.id}`
        : '/api/admin/employees'
      const method = employee ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = 'Error al guardar el empleado'
        if (result.error) {
          if (typeof result.error === 'object' && result.error.message) {
            errorMessage = result.error.message
          } else if (typeof result.error === 'string') {
            errorMessage = result.error
          } else if (result.statusCode === 409) {
            errorMessage = `El email ${data.email} ya está registrado. Por favor, use un email diferente.`
          }
        }
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      if (result.password) {
        setGeneratedPassword(result.password)
        setShowPassword(true)
        setShowPasswordDialog(true)
        toast.success(
          employee
            ? 'Empleado actualizado correctamente'
            : 'Empleado creado correctamente'
        )
      } else {
        handleSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      if (!error) {
        toast.error('Error al guardar el empleado')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                    <SelectItem value="CAJERO">Cajero</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Tiendas Asignadas</FormLabel>
            <div className="grid grid-cols-1 gap-2">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`store-${store.id}`}
                    checked={selectedStores.some(
                      (s) => s.store_id === store.id
                    )}
                    onChange={() => handleStoreSelection(store.id.toString())}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`store-${store.id}`} className="text-sm">
                    {store.name}
                  </label>
                </div>
              ))}
            </div>
            {selectedStores.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecciona al menos una tienda
              </p>
            )}
          </div>

          {role === 'CAJERO' && (
            <FormField
              control={form.control}
              name="cashbox_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caja</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar caja" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cashboxes.map((cashbox) => (
                        <SelectItem
                          key={cashbox.id}
                          value={cashbox.id.toString()}
                        >
                          {cashbox.local_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : employee ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña generada</DialogTitle>
            <DialogDescription>
              Por favor guarda esta contraseña. No podrás verla nuevamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={generatedPassword || ''}
                readOnly
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(generatedPassword || '')}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setShowPasswordDialog(false)
                handleSuccess()
              }}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
