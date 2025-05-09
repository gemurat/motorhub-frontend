'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { useQuery } from '@tanstack/react-query'

// Function to generate internal code
function generateInternalCode(
  data: {
    product_brand_id?: number
    product_category_id?: number
    year?: string
    brand_id?: string
    model_id?: string
    codigo_parte?: string
  },
  brands: any[],
  categories: any[]
): string {
  // Get brand and category codes
  const brand = brands.find((b) => b.id === data.product_brand_id)
  const category = categories.find((c) => c.id === data.product_category_id)

  // Create code parts
  const brandCode =
    brand?.code || data.brand_id?.slice(0, 3).toUpperCase() || 'XXX'
  const categoryCode = category?.code || 'XXX'
  const yearCode = data.year?.slice(-2) || 'XX'
  const modelCode = data.model_id?.slice(0, 3).toUpperCase() || 'XXX'
  const partCode = data.codigo_parte?.slice(0, 4).toUpperCase() || 'XXXX'

  // Generate sequential number (you might want to fetch the last used number from the database)
  const sequentialNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')

  // Combine all parts
  return `${brandCode}-${categoryCode}-${yearCode}${modelCode}-${partCode}-${sequentialNumber}`
}

const productSchema = z.object({
  internal_code: z.string().min(1, 'Código interno es requerido'),
  description: z.string().min(1, 'Descripción es requerida'),
  price: z.number().min(0, 'Precio debe ser mayor a 0'),
  product_brand_id: z.number().optional(),
  product_category_id: z.number().optional(),
  measurements: z.string().optional(),
  brand_id: z.string().optional(),
  model_id: z.string().optional(),
  year: z.string().optional(),
  moneda: z.string().optional(),
  codigo_parte: z.string().optional(),
  codigo_original: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface DisplayProduct {
  id: number
  internal_code: string
  description: string | null
  price: number
  status: string
  store_stock: {
    store_id: number
    store_name: string
    quantity: number
    min_stock: number | null
    max_stock: number | null
    reserved_quantity: number
    is_warehouse: boolean
    status: string
  }[]
  total_stock: number
  warehouse_stock: number
  selected_store_stock: number
  product_brand: string | null
  product_category: string | null
  last_movement: Date | null
}

interface ProductManagerProps {
  product?: DisplayProduct
  onSuccess?: () => void
}

export function ProductManager({ product, onSuccess }: ProductManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoGenerateCode, setAutoGenerateCode] = useState(!product)

  // Fetch brands and categories
  const { data: brands = [] } = useQuery({
    queryKey: ['product-brands'],
    queryFn: async () => {
      const response = await fetch('/api/admin/brands')
      if (!response.ok) throw new Error('Failed to fetch brands')
      return response.json()
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/product-categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
  })

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      internal_code: product?.internal_code || '',
      description: product?.description || '',
      price: product?.price || 0,
      product_brand_id: undefined,
      product_category_id: undefined,
      measurements: '',
      brand_id: '',
      model_id: '',
      year: '',
      moneda: '',
      codigo_parte: '',
      codigo_original: '',
    },
  })

  // Watch for changes in relevant fields to update internal code
  const watchFields = form.watch([
    'product_brand_id',
    'product_category_id',
    'year',
    'brand_id',
    'model_id',
    'codigo_parte',
  ])

  useEffect(() => {
    if (autoGenerateCode) {
      const newCode = generateInternalCode(
        {
          product_brand_id: watchFields[0],
          product_category_id: watchFields[1],
          year: watchFields[2],
          brand_id: watchFields[3],
          model_id: watchFields[4],
          codigo_parte: watchFields[5],
        },
        brands,
        categories
      )
      form.setValue('internal_code', newCode)
    }
  }, [watchFields, autoGenerateCode, brands, categories, form])

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      toast.success(
        product
          ? 'Producto actualizado exitosamente'
          : 'Producto creado exitosamente'
      )
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      toast.success('Producto desactivado exitosamente')
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Error al desactivar el producto')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {product ? 'Editar Producto' : 'Agregar Producto'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-generate"
                checked={autoGenerateCode}
                onChange={(e) => setAutoGenerateCode(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="auto-generate" className="text-sm font-medium">
                Generar código interno automáticamente
              </label>
            </div>

            <FormField
              control={form.control}
              name="internal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Interno</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={autoGenerateCode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medidas</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Marca</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Modelo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moneda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo_parte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Parte</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo_original"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Original</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {product && (
              <div className="space-y-2">
                <FormLabel>Estado</FormLabel>
                <div className="text-sm text-gray-500">
                  {product.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {product && product.status === 'ACTIVE' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Desactivar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
