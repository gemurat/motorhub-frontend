'use client'
import { useMemo, useCallback, useState, useEffect } from 'react'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table'
import { Input, useDisclosure } from '@nextui-org/react'
import { SearchIcon } from '../icons'
import { PlusIcon } from '@/public/plusIcon'
import { Button } from '@mui/material'
import ShoppingCart from './ShoppingCart'
import { useUser } from '@auth0/nextjs-auth0/client'

interface Product {
  id: string
  internal_code: string
  description: string
  measurements: string
  brands: string
  models: string
  year: string
  price: number
  stock: number
  moneda: string
  codigoParte: string
  codigoOriginal: string
  productBrands: string
  cantidad?: number
}

type Data = {
  id: string
  internal_code: string
  parte: string
  marca: string
  modelo: string
  measurements: string
  ano: string
  precio1: number
  existencia: number
  supplierCode: string
  originalCode: string
  marcaProducto: string
  moneda: string
}

const TableNew = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [addedProducts, setAddedProducts] = useState<Product[]>([])
  const [idFilterValue, setIdFilterValue] = useState('')
  const [loading, setLoading] = useState(false)
  const session = useUser()
  const columns = useMemo<MRT_ColumnDef<Data>[]>(
    () => [
      {
        id: 'agregar',
        header: 'Agregar',
        columnDefType: 'display',
        size: 70,
        Cell: ({ row }) => (
          <Button
            onClick={() =>
              handleAddProduct({
                id: row.original.id,
                internal_code: row.original.internal_code,
                description: row.original.parte,
                measurements: row.original.measurements,
                brands: row.original.marca,
                models: row.original.modelo,
                year: row.original.ano.toString(),
                price: row.original.precio1,
                stock: row.original.existencia ?? 0,
                moneda: row.original.moneda,
                codigoParte: row.original.supplierCode,
                codigoOriginal: row.original.originalCode,
                productBrands: row.original.marcaProducto,
              })
            }
          >
            <PlusIcon />
          </Button>
        ),
      },
      { accessorKey: 'internal_code', header: 'Cod. Interno', size: 60 },
      { accessorKey: 'parte', header: 'Desc. Producto', size: 280 },
      { accessorKey: 'measurements', header: 'Medidas', size: 200 },
      { accessorKey: 'marca', header: 'Marca', size: 80 },
      { accessorKey: 'modelo', header: 'Modelo', size: 170 },
      { accessorKey: 'ano', header: 'Año', size: 80 },
      {
        accessorKey: 'precio1',
        header: 'Precio',
        size: 60,
        Cell: ({ cell }) => (
          <span>
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(cell.getValue<number>())}
          </span>
        ),
      },
      { accessorKey: 'existencia', header: 'Existencia', size: 10 },
      { accessorKey: 'supplierCode', header: 'Codigo Proveedor', size: 80 },
      { accessorKey: 'originalCode', header: 'Codigo Original', size: 80 },
      { accessorKey: 'marcaProducto', header: 'Marca Producto', size: 80 },
    ],
    []
  )

  const handleAddProduct = useCallback((product: Product) => {
    setAddedProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (p) =>
          p.id === product.id &&
          p.internal_code === product.internal_code &&
          p.description === product.description &&
          p.models === product.models &&
          p.brands === product.brands &&
          p.measurements === product.measurements &&
          p.year === product.year &&
          p.codigoParte === product.codigoParte &&
          p.codigoOriginal === product.codigoOriginal &&
          p.productBrands === product.productBrands
      )
      if (existingProduct) {
        return prevProducts.map((p) =>
          p.id === product.id &&
          p.internal_code === product.internal_code &&
          p.description === product.description &&
          p.models === product.models &&
          p.brands === product.brands &&
          p.measurements === product.measurements &&
          p.year === product.year &&
          p.codigoParte === product.codigoParte &&
          p.codigoOriginal === product.codigoOriginal &&
          p.productBrands === product.productBrands
            ? { ...p, cantidad: (p.cantidad || 1) + 1 }
            : p
        )
      } else {
        return [...prevProducts, { ...product, cantidad: 1 }]
      }
    })
  }, [])

  const handleRemoveProduct = useCallback((id: string) => {
    setAddedProducts((prevProducts) =>
      prevProducts
        .map((p) =>
          p.id.toString() === id ? { ...p, cantidad: (p.cantidad || 1) - 1 } : p
        )
        .filter((p) => p.cantidad !== 0)
    )
  }, [])
  const handleBuy = useCallback(async () => {
    if (addedProducts.length === 0) {
      alert('No hay productos en la compra')
      return
    }
    if (customerId === '') {
      if (
        !confirm(
          'No ha ingresado un cliente. ¿Desea continuar de todas formas?'
        )
      ) {
        return
      }
    }
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId:
          customerId.length === 0
            ? addedProducts[0]?.description || 'sin especificar'
            : customerId,
        items: addedProducts,
        sellerId: session.user?.email,
        total_amount: addedProducts.reduce(
          (total, item) => total + item.price * (item.cantidad ?? 1),
          0
        ),
      }),
    })
    const data = await response
    if (response.ok) {
      alert('Orden enviada al cajero!')
      setAddedProducts([])
      setCustomerId('')
      window.location.reload()
    } else {
      console.log(data)
      alert('Error al enviar orden')
    }
  }, [addedProducts, customerId])

  const handleRemoveAllProducts = useCallback(() => {
    alert('Compra Eliminada')
    setAddedProducts([])
    setCustomerId('')
  }, [])
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch('api/productos')
        const data = await response.json()
        // console.log('response', data)
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
  }, [])

  const normalizeQuery = (query: any) => {
    return query.toLowerCase().split(' ').filter(Boolean)
  }

  const filterProducts = useCallback(
    (products: Product[], query: string, idQuery: string): Product[] => {
      const queryParts: string[] = normalizeQuery(query)
      return products.filter((product: Product) => {
        const searchableText: string =
          `${product.models} ${product.description} ${product.measurements} ${product.brands} ${product.codigoParte} ${product.codigoOriginal}`.toLowerCase()
        const matchesQuery = queryParts.every((part) =>
          searchableText.includes(part)
        )
        const matchesId = idQuery
          ? product.internal_code?.toLowerCase() === idQuery.toLowerCase()
          : true
        return matchesQuery && matchesId
      })
    },
    []
  )

  const filteredProducts = useMemo(() => {
    return filterProducts(products, filterValue, idFilterValue)
  }, [products, filterValue, idFilterValue, filterProducts])

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setIdFilterValue('')
      setFilterValue(value)
    } else {
      setFilterValue('')
    }
  }, [])

  const onIdSearchChange = useCallback((value: string) => {
    setFilterValue('')
    setIdFilterValue(value)
  }, [])

  const data: Data[] = useMemo(() => {
    return filteredProducts.map((product) => ({
      id: product.id,
      internal_code: product.internal_code,
      parte: product.description,
      modelo: product.models,
      marca: product.brands,
      measurements: product.measurements,
      ano: product.year,
      precio1: product.price,
      existencia: product.stock,
      supplierCode: product.codigoParte,
      originalCode: product.codigoOriginal,
      marcaProducto: product.productBrands,
      moneda: product.moneda,
    }))
  }, [filteredProducts])

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableGlobalFilter: false,
    enableColumnFilters: false,
    initialState: {
      density: 'compact',
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    displayColumnDefOptions: { 'mrt-row-actions': { size: 80 } },
    muiTableBodyCellProps: {
      sx: {
        borderRight: '1px solid #e0e0e0',
        fontWeight: 'normal',
        fontSize: '11px',
        textWrap: 'nowrap',
        whiteSpace: 'wrap',
        maxHeight: '50px',
      },
    },
  })

  return (
    <>
      <div className="flex gap-4 my-4">
        <div className="w-[200px]">
          <Input
            fullWidth={false}
            isClearable
            className="w-full"
            placeholder="Buscar por ID..."
            startContent={<SearchIcon />}
            value={idFilterValue}
            onClear={() => onIdSearchChange('')}
            onValueChange={onIdSearchChange}
          />
        </div>
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Buscar..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        Cliente:
        <Input
          className="w-full sm:max-w-[20%]"
          placeholder="RUT o Correo..."
          value={customerId ?? ''}
          // onClear={onClear}
          onValueChange={setCustomerId}
        />
      </div>
      <MaterialReactTable table={table} />
      <ShoppingCart
        addedProducts={addedProducts.map((product) => ({
          id: product.id.toString(),
          modelo: product.models,
          ano: product.year.toString(),
          parte: product.description,
          marca: product.brands,
          existencia: product.stock.toString(),
          measurements: product.measurements,
          precio1: product.price,
          cantidad: product.cantidad ?? 0,
        }))}
        removeProduct={handleRemoveProduct}
        removeAllProducts={handleRemoveAllProducts}
        buyProducts={handleBuy}
      />
    </>
  )
}

export default TableNew
