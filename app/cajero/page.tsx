'use client'

import { useRouter } from 'next/navigation'
import { useShoppingCart } from '@/components/ventas/ShoppingCartContext'
import { Button } from '@mui/material'
import { toast } from 'sonner'

export default function CajeroPage() {
  const router = useRouter()
  const { addedProducts, customerId, loading, handlePagar, handleCancelar } =
    useShoppingCart()

  const total = addedProducts.reduce(
    (sum, product) => sum + product.precio1 * product.cantidad,
    0
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cajero</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Resumen de la Venta</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <p className="font-medium">ID del Cliente: {customerId}</p>
          </div>

          <div className="space-y-2 mb-4">
            {addedProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-2 border rounded"
              >
                <div>
                  <p className="font-medium">{product.parte}</p>
                  <p className="text-sm text-gray-600">
                    {product.marca} - {product.modelo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${product.precio1.toLocaleString()} x {product.cantidad}
                  </p>
                  <p className="text-sm">
                    Subtotal: $
                    {(product.precio1 * product.cantidad).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-xl font-bold text-right">
              Total: ${total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handlePagar}
          disabled={loading || addedProducts.length === 0}
        >
          {loading ? 'Procesando...' : 'Procesar Pago'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleCancelar}
          disabled={loading || addedProducts.length === 0}
        >
          Cancelar
        </Button>
        <Button variant="outlined" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  )
}
