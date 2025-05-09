'use client'

import { useState } from 'react'
import { AddedProduct } from '@/types'
import TableNew from './TableNew'

const Cart = () => {
  const [tableData, setTableData] = useState<AddedProduct[]>([])
  const [customerName, setCustomerName] = useState('')

  const handleClearCart = () => {
    setTableData([])
    setCustomerName('')
  }

  const handleAddProduct = (product: AddedProduct) => {
    setTableData((prev) => [...prev, product])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="customerName" className="text-sm font-medium">
          Nombre del Cliente
        </label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border rounded p-2"
          placeholder="Ingrese el nombre del cliente"
        />
      </div>

      <TableNew addedProducts={tableData} onAddProduct={handleAddProduct} />

      <div className="flex justify-end gap-4">
        <button
          onClick={handleClearCart}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Limpiar Carrito
        </button>
      </div>
    </div>
  )
}

export default Cart
