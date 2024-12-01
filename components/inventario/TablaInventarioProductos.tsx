'use client'
import React, { useState, useMemo } from 'react'
import { PlusIcon } from '@/public/plusIcon'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Input,
} from '@nextui-org/react'
// import LazySelect from "../ventas/LazySelect"
import ShoppingCart from '../ventas/ShoppingCart'
import { SearchIcon } from '@/public/searchIcon'

interface Product {
  marcaid: any
  modeloid: any
  familiaid: any
  id: number
  modelo: string
  ano: number
  parte: string
  marca: string
  existencia: number
  precio1: number
  moneda: string
  cantidad?: number
}

interface ProductTableProps {
  products: Product[]
  isShoppingCart?: boolean
}

interface FilterVal {
  id: any
  value: string
  label: string
  identifier: string
}

const TablaInventarioProductos: React.FC<ProductTableProps> = ({
  products,
  isShoppingCart = true,
}) => {
  const [filterValue, setFilterValue] = React.useState('')
  const [addedProducts, setAddedProducts] = useState<Product[]>([])
  const handleAddProduct = (product: Product) => {
    setAddedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.id === product.id)
      if (existingProduct) {
        return prevProducts.map((p) =>
          p.id === product.id ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p
        )
      } else {
        return [...prevProducts, { ...product, cantidad: 1 }]
      }
    })
  }
  const handleRemoveProduct = (id: string) => {
    setAddedProducts((prevProducts) => {
      return prevProducts
        .map((p) =>
          p.id.toString() === id ? { ...p, cantidad: (p.cantidad || 1) - 1 } : p
        )
        .filter((p) => p.cantidad !== 0)
    })
  }
  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])
  const onClear = React.useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])
  const [page, setPage] = React.useState(1)
  const rowsPerPage = 7

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product?.id
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase()) ||
        product?.modelo?.toLowerCase().includes(filterValue.toLowerCase()) ||
        product?.parte
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase()) ||
        product?.marca?.toLowerCase().includes(filterValue.toLowerCase()) ||
        product?.ano
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase())
    )
  }, [filterValue, products])
  const pages = Math.ceil(filteredProducts.length / rowsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredProducts.slice(start, end)
  }, [page, filteredProducts])

  return (
    <div>
      <div className=" flex gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by name..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
      </div>
      <Table
        className="mt-5"
        aria-label="Product table with client side pagination"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: 'min-h-[550px]',
        }}
      >
        <TableHeader>
          <TableColumn key="id">ID</TableColumn>
          <TableColumn key="modelo">Modelo</TableColumn>
          <TableColumn key="ano">Año</TableColumn>
          <TableColumn key="parte">Parte</TableColumn>
          <TableColumn key="marca">Marca</TableColumn>
          <TableColumn key="existencia">Existencia</TableColumn>
          <TableColumn key="precio1">Precio</TableColumn>
          <TableColumn key="action"> </TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow
              key={item.id}
              className={`h-16 ${item.existencia === 0 ? 'opacity-50' : ''}`}
            >
              {(columnKey) => (
                <TableCell>
                  {columnKey === 'precio1' ? (
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'CLP',
                    }).format(item[columnKey])
                  ) : columnKey === 'action' ? (
                    <button
                      onClick={() => handleAddProduct(item)}
                      disabled={item.existencia === 0}
                    >
                      <PlusIcon />
                    </button>
                  ) : (
                    getKeyValue(item, columnKey)
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {isShoppingCart && (
        <ShoppingCart
          addedProducts={addedProducts.map((product) => ({
            id: product.id.toString(),
            modelo: product.modelo,
            ano: product.ano.toString(),
            parte: product.parte,
            marca: product.marca,
            existencia: product.existencia.toString(),
            precio1: product.precio1,
            cantidad: product.cantidad ?? 0,
          }))}
          removeProduct={handleRemoveProduct}
        />
      )}
    </div>
  )
}

export default TablaInventarioProductos
