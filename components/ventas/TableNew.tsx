'use client'
import { useMemo, useCallback, useState, useEffect } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table'
import { Input } from '@nextui-org/react'
import { SearchIcon } from '../icons'
import { PlusIcon } from '@/public/plusIcon'
import { Button } from '@mui/material'
import { useUser } from '@auth0/nextjs-auth0/client'
import { toast } from 'sonner'
import { useShoppingCart } from './ShoppingCartContext'
import { Product, AddedProduct } from '@/types'

type Data = {
  id: number
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
  const { addedProducts, handleIncrement, setAddedProducts } = useShoppingCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [idFilter, setIdFilter] = useState('')
  const session = useUser()

  const handleAddProduct = useCallback(
    (product: Product) => {
      const newProduct: AddedProduct = {
        id: product.id.toString(),
        parte: product.description || '',
        marca: '',
        modelo: '',
        ano: '',
        measurements: '',
        precio1: product.price || 0,
        existencia: product.total_stock?.toString() || '0',
        cantidad: 1,
      }

      setAddedProducts((prevProducts: AddedProduct[]) => {
        const existingProduct = prevProducts.find(
          (p: AddedProduct) => p.id === product.id.toString()
        )
        if (existingProduct) {
          return prevProducts.map((p: AddedProduct) =>
            p.id === product.id.toString()
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          )
        }
        return [...prevProducts, newProduct]
      })
    },
    [setAddedProducts]
  )

  const columns = useMemo<MRT_ColumnDef<Data>[]>(
    () => [
      {
        id: 'agregar',
        header: 'Agregar',
        columnDefType: 'display',
        size: 70,
        Cell: ({ row }) => (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              handleAddProduct({
                id: row.original.id,
                internal_code: row.original.internal_code,
                description: row.original.parte,
                price: row.original.precio1,
                total_stock: row.original.existencia,
                status: 'ACTIVE',
                store_stock: [],
                total_reserved: 0,
                needs_restock: false,
                overstock: false,
                warehouse_stock: 0,
                selected_store_stock: 0,
              })
            }
          >
            <PlusIcon />
          </Button>
        ),
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'internal_code',
        header: 'Cod. Interno',
        size: 100,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'parte',
        header: 'Desc. Producto',
        size: 280,
      },
      {
        accessorKey: 'marca',
        header: 'Marca',
        size: 100,
      },
      {
        accessorKey: 'modelo',
        header: 'Modelo',
        size: 170,
      },
      {
        accessorKey: 'ano',
        header: 'Año',
        size: 80,
      },
      {
        accessorKey: 'precio1',
        header: 'Precio',
        size: 100,
        Cell: ({ cell }) => (
          <span className="font-medium">
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
            }).format(cell.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: 'existencia',
        header: 'Existencia',
        size: 100,
        Cell: ({ cell }) => (
          <span
            className={
              cell.getValue<number>() <= 0 ? 'text-red-500' : 'text-green-500'
            }
          >
            {cell.getValue<number>()}
          </span>
        ),
      },
    ],
    [handleAddProduct]
  )

  useEffect(() => {
    const fetchProducts = async () => {
      if (!session.user) {
        console.log('User not authenticated')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('api/products')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Error al cargar productos')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [session.user])

  const tableData = useMemo(
    () =>
      Array.isArray(products)
        ? products.map((product) => ({
            id: product.id,
            internal_code: product.internal_code || '',
            parte: product.description || '',
            marca: '',
            modelo: '',
            measurements: '',
            ano: '',
            precio1: product.price || 0,
            existencia: product.store_stock[0]?.quantity || 0,
            supplierCode: '',
            originalCode: '',
            marcaProducto: '',
            moneda: 'CLP',
          }))
        : [],
    [products]
  )

  const filteredData = useMemo<Data[]>(() => {
    if (!idFilter) return tableData

    return tableData.filter(
      (item) => item.internal_code.toLowerCase() === idFilter.toLowerCase()
    )
  }, [tableData, idFilter])

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    state: {
      isLoading: loading,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowVirtualization: true,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: '600',
        fontSize: '0.875rem',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: '0.875rem',
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Buscar por código interno..."
          value={idFilter}
          onChange={(e) => setIdFilter(e.target.value)}
          startContent={<SearchIcon />}
          className="w-64"
        />
        <Input
          placeholder="Buscar en todos los campos (excepto código interno)..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          startContent={<SearchIcon />}
          className="w-64"
        />
      </div>
      <MaterialReactTable table={table} />
    </div>
  )
}

export default TableNew
