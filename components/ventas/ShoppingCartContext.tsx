'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react'
import { AddedProduct } from '@/types'
import { toast } from 'sonner'

interface ShoppingCartContextType {
  addedProducts: AddedProduct[]
  customerId: string
  loading: boolean
  handleIncrement: (productId: string) => void
  handleDecrement: (productId: string) => void
  handleRemove: (productId: string) => void
  handlePagar: () => Promise<void>
  handleCancelar: () => void
  setCustomerId: (id: string) => void
  setAddedProducts: React.Dispatch<React.SetStateAction<AddedProduct[]>>
  setLoading: (loading: boolean) => void
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(
  undefined
)

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([])
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleIncrement = useCallback((productId: string) => {
    setAddedProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId)
      if (!product) return prevProducts

      const stock = parseInt(product.existencia)
      if (stock <= product.cantidad) {
        toast.error('No hay suficiente stock disponible')
        return prevProducts
      }

      return prevProducts.map((p) =>
        p.id === productId ? { ...p, cantidad: p.cantidad + 1 } : p
      )
    })
  }, [])

  const handleDecrement = useCallback((productId: string) => {
    setAddedProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId)
      if (!product) return prevProducts

      if (product.cantidad <= 1) {
        return prevProducts.filter((p) => p.id !== productId)
      }

      return prevProducts.map((p) =>
        p.id === productId ? { ...p, cantidad: p.cantidad - 1 } : p
      )
    })
  }, [])

  const handleRemove = useCallback((productId: string) => {
    setAddedProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    )
    toast.success('Producto eliminado del carrito')
  }, [])

  const handlePagar = useCallback(async () => {
    if (addedProducts.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setLoading(true)
    try {
      const totalAmount = addedProducts.reduce(
        (sum, product) => sum + product.precio1 * product.cantidad,
        0
      )

      // Use first product name as customer name if no customerId provided
      const customerName = customerId || addedProducts[0].parte
      if (!customerId) {
        toast.info(`Se usará "${customerName}" como nombre del cliente`)
      }

      const orderData = {
        customerId: customerName, // Use the name as customerId
        items: addedProducts.map((product) => ({
          id: parseInt(product.id),
          cantidad: product.cantidad,
          price: product.precio1,
        })),
        total_amount: totalAmount,
      }

      console.log('Sending order data:', orderData)

      const response = await fetch('/api/vendedor/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al crear la orden')
      }

      if (responseData.success) {
        toast.success('Orden creada exitosamente')
        setAddedProducts([])
        setCustomerId('')
      } else {
        throw new Error(responseData.message || 'Error al crear la orden')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al crear la orden'
      )
    } finally {
      setLoading(false)
    }
  }, [customerId, addedProducts])

  const handleCancelar = useCallback(() => {
    if (addedProducts.length === 0) {
      toast.error('El carrito ya está vacío')
      return
    }
    setAddedProducts([])
    setCustomerId('')
    toast.success('Carrito vaciado')
  }, [addedProducts.length])

  return (
    <ShoppingCartContext.Provider
      value={{
        addedProducts,
        customerId,
        loading,
        handleIncrement,
        handleDecrement,
        handleRemove,
        handlePagar,
        handleCancelar,
        setCustomerId,
        setAddedProducts,
        setLoading,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  )
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext)
  if (context === undefined) {
    throw new Error(
      'useShoppingCart must be used within a ShoppingCartProvider'
    )
  }
  return context
}
