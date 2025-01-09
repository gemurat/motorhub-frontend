import React from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react' // Adjust the import according to your table library

interface ShoppingCartProps {
  addedProducts: Array<{
    id: string
    modelo: string
    ano: string
    parte: string
    marca: string
    existencia: string
    measurements: string
    precio1: number
    cantidad: number
  }>
  removeProduct: (id: string) => void
  removeAllProducts: () => void
}

const getKeyValue = (item: any, key: string) => {
  return item[key]
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  addedProducts,
  removeProduct,
  removeAllProducts,
}) => {
  const totalPrice = addedProducts.reduce(
    (total, item) => total + item.precio1 * item.cantidad,
    0
  )

  return (
    <div className="my-2 max-h-56 ">
      <div className="flex justify-end gap-2">
        <button className="bg-green-500 text-white px-2 py-1 rounded">
          Ir a Pagar
        </button>
        <button className="bg-yellow-500 text-white px-2 py-1 rounded">
          Cotizar
        </button>
        <button
          onClick={removeAllProducts}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Cancelar
        </button>
      </div>
      <Table aria-label="Added products table">
        <TableHeader>
          {/* <TableColumn key="id">ID</TableColumn> */}
          {/* <TableColumn key="existencia">Existencia</TableColumn> */}
          {/* <TableColumn key="measurements">Medida</TableColumn> */}
          <TableColumn key="parte">Parte</TableColumn>
          <TableColumn key="modelo">Modelo</TableColumn>
          <TableColumn key="ano">Año</TableColumn>
          <TableColumn key="marca">Marca</TableColumn>
          <TableColumn key="precio1">Precio</TableColumn>
          <TableColumn key="cantidad">Cantidad</TableColumn>
          <TableColumn key="remove"> </TableColumn>
        </TableHeader>
        <TableBody items={addedProducts}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === 'precio1' ? (
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'CLP',
                    }).format(item[columnKey])
                  ) : columnKey === 'remove' ? (
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => removeProduct(item.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    getKeyValue(item, columnKey as string)
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <h3 className="text-right text-lg font-bold">
          Total:{' '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'CLP',
          }).format(totalPrice)}
        </h3>
      </div>
    </div>
  )
}

export default ShoppingCart
