'use client'

import { Button, CircularProgress } from '@mui/material'
import { PlusIcon } from '@/public/plusIcon'
import MinusIcon from '@/public/minusIcon'
import { useShoppingCart } from './ShoppingCartContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ShoppingCart() {
  const router = useRouter()
  const {
    addedProducts,
    customerId,
    loading,
    handleIncrement,
    handleDecrement,
    handleRemove,
    handlePagar,
    handleCancelar,
    setCustomerId,
  } = useShoppingCart()

  const total = addedProducts.reduce(
    (sum, product) => sum + (product.precio1 || 0) * (product.cantidad || 0),
    0
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="ID del Cliente (opcional)"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        />
        {!customerId && (
          <p className="text-sm text-gray-500 mt-1">
            Si no ingresa un ID, se usará el nombre del primer producto como
            referencia
          </p>
        )}
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {addedProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex-1">
              <p className="font-medium">{product.parte}</p>
              <p className="text-sm text-gray-600">
                {product.marca} - {product.modelo}
              </p>
              <p className="text-sm">
                ${product.precio1.toLocaleString()} x {product.cantidad}
              </p>
              <p className="text-xs text-gray-500">
                Stock disponible: {product.existencia}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDecrement(product.id)}
                disabled={product.cantidad <= 1 || loading}
              >
                <MinusIcon />
              </Button>
              <span className="w-8 text-center">{product.cantidad}</span>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleIncrement(product.id)}
                disabled={
                  !product.existencia ||
                  parseInt(product.existencia) <= product.cantidad ||
                  loading
                }
              >
                <PlusIcon />
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleRemove(product.id)}
                disabled={loading}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-lg font-bold">Total: ${total.toLocaleString()}</p>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePagar}
          disabled={addedProducts.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creando Orden...' : 'Crear Orden'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleCancelar}
          disabled={addedProducts.length === 0 || loading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
