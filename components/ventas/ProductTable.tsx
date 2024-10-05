"use client"
import React, { useState, useMemo } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
} from "@nextui-org/react"
import LazySelect from "./LazySelect"

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
}

interface ProductTableProps {
  products: Product[]
  brands: any
  model: any
  category: any
}

interface FilterVal {
  id: any
  value: string
  label: string
  identifier: string
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  brands,
  model,
  category,
}) => {
  // const [selectedValue, setSelectedValue] = useState<FilterVal | null>(null)
  const [brandFilter, setBrandFilter] = useState<FilterVal | null>(null)
  const [modelFilter, setModelFilter] = useState<FilterVal | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<FilterVal | null>(null)

  // const handleSelect = (selected: any) => {
  //   setSelectedValue(selected)
  //   setPage(1) // Reset to first page on filter change
  //   console.log("Selected value:", selected)
  //   console.log(products)
  // }
  const handleBrandSelect = (selected: any) => {
    setBrandFilter(selected)
    setPage(1) // Reset to first page on filter change
  }
  const handleModelSelect = (selected: any) => {
    setModelFilter(selected)
    setPage(1) // Reset to first page on filter change
  }
  const handleCategorySelect = (selected: any) => {
    setCategoryFilter(selected)
    setPage(1) // Reset to first page on filter change
  }
  const [page, setPage] = React.useState(1)
  const rowsPerPage = 7

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const brandMatch = brandFilter ? product.marcaid === brandFilter.id : true
      const modelMatch = modelFilter
        ? product.modeloid === modelFilter.id
        : true
      const categoryMatch = categoryFilter
        ? product.familiaid === categoryFilter.id
        : true
      return brandMatch && modelMatch && categoryMatch
    })
  }, [brandFilter, modelFilter, categoryFilter, products])

  const pages = Math.ceil(filteredProducts.length / rowsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredProducts.slice(start, end)
  }, [page, filteredProducts])

  return (
    <div className="max-h-[600px] ">
      <div className=" flex gap-4">
        <LazySelect
          label={"Filtro Marcas"}
          placeholder={"Marcas"}
          filterVal={brands}
          onSelect={handleBrandSelect}
        />
        <LazySelect
          label={"Filtro Modelo"}
          placeholder={"Modelos"}
          filterVal={model}
          onSelect={handleModelSelect}
        />
        <LazySelect
          label={"Filtro Categoria"}
          placeholder={"Categoria"}
          filterVal={category}
          onSelect={handleCategorySelect}
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
          wrapper: "min-h-[550px]",
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
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id} className="h-16">
              {(columnKey) => (
                <TableCell>
                  {columnKey === "precio1"
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "CLP",
                      }).format(item[columnKey])
                    : getKeyValue(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductTable
