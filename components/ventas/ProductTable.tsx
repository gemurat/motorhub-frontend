"use client"
import React, { useState } from "react"
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
  value: string
  label: string
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  brands,
  model,
  category,
}) => {
  const [selectedValue, setSelectedValue] = useState<FilterVal | null>(null)

  const handleSelect = (selected: any) => {
    setSelectedValue(selected)
    console.log("Selected value:", selected)
  }

  const [page, setPage] = React.useState(1)
  const rowsPerPage = 7
  const pages = Math.ceil(products.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return products.slice(start, end)
  }, [page, products])

  return (
    <div className="max-h-[600px] ">
      <div className=" flex gap-4">
        <LazySelect
          label={"Filtro Marcas"}
          identifier={"marca"}
          placeholder={"Marcas"}
          filterVal={brands}
          onSelect={handleSelect}
        />
        <LazySelect
          label={"Filtro Modelo"}
          identifier={"modelo"}
          placeholder={"Modelos"}
          filterVal={model}
          onSelect={handleSelect}
        />
        <LazySelect
          label={"Filtro Categoria"}
          identifier={"familiaid"}
          placeholder={"Categoria"}
          filterVal={category}
          onSelect={handleSelect}
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
          <TableColumn key="moneda">Moneda</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id} className="h-16">
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductTable
