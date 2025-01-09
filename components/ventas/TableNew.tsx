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

interface Product {
  marcaid: any
  parte: string
  modeloid: any
  familiaid: any
  id: string
  modelo: string
  ano: number
  marca: string
  existencia: number
  precio1: number
  moneda: string
  cantidad?: number
  measurements: string
  supplierCode: string
  originalCode: string
  marcaProducto: string
}

type Data = {
  id: string
  parte: string
  marca: string
  modelo: string
  measurements: string
  ano: number
  precio1: number
  existencia: number
  supplierCode: string
  originalCode: string
  marcaProducto: string
  marcaid: any
  modeloid: any
  familiaid: any
  moneda: string
}

const TableNew = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [semejanteData, setSemejanteData] = useState<any>([])
  const [filterValue, setFilterValue] = useState('')
  const [addedProducts, setAddedProducts] = useState<Product[]>([])
  const [idFilterValue, setIdFilterValue] = useState('')
  const [loading, setLoading] = useState(false)

  const columns = useMemo<MRT_ColumnDef<Data>[]>(
    () => [
      {
        id: 'agregar',
        header: 'Agregar',
        columnDefType: 'display',
        size: 70,
        Cell: ({ row }) => (
          <Button onClick={() => handleAddProduct(row.original)}>
            <PlusIcon />
          </Button>
        ),
      },
      { accessorKey: 'id', header: 'Cod. Interno', size: 60 },
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
    console.log(product)

    setAddedProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (p) =>
          p.id === product.id &&
          p.parte === product.parte &&
          p.modelo === product.modelo &&
          p.marca === product.marca &&
          p.measurements === product.measurements &&
          p.ano === product.ano &&
          p.supplierCode === product.supplierCode &&
          p.originalCode === product.originalCode &&
          p.marcaProducto === product.marcaProducto
      )
      if (existingProduct) {
        return prevProducts.map((p) =>
          p.id === product.id &&
          p.parte === product.parte &&
          p.modelo === product.modelo &&
          p.marca === product.marca &&
          p.measurements === product.measurements &&
          p.ano === product.ano &&
          p.supplierCode === product.supplierCode &&
          p.originalCode === product.originalCode &&
          p.marcaProducto === product.marcaProducto
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
  const handleRemoveAllProducts = useCallback(() => {
    setAddedProducts([])
  }, [])
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch('api/productos')
        const data = await response.json()
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
          `${product.modelo} ${product.parte} ${product.measurements} ${product.marca} ${product.supplierCode} ${product.originalCode}`.toLowerCase()
        const matchesQuery = queryParts.every((part) =>
          searchableText.includes(part)
        )
        const matchesId = idQuery
          ? product.id?.toLowerCase() === idQuery.toLowerCase()
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
      parte: product.parte,
      modelo: product.modelo,
      marca: product.marca,
      measurements: product.measurements,
      ano: product.ano,
      precio1: product.precio1,
      existencia: product.existencia,
      supplierCode: product.supplierCode,
      originalCode: product.originalCode,
      marcaProducto: product.marcaProducto,
      marcaid: product.marcaid,
      modeloid: product.modeloid,
      familiaid: product.familiaid,
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
    initialState: { density: 'compact' },
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
      </div>
      <MaterialReactTable table={table} />
      <ShoppingCart
        addedProducts={addedProducts.map((product) => ({
          id: product.id.toString(),
          modelo: product.modelo,
          ano: product.ano.toString(),
          parte: product.parte,
          marca: product.marca,
          existencia: product.existencia.toString(),
          measurements: product.measurements,
          precio1: product.precio1,
          cantidad: product.cantidad ?? 0,
        }))}
        removeProduct={handleRemoveProduct}
        removeAllProducts={handleRemoveAllProducts}
      />
    </>
  )
}

export default TableNew
