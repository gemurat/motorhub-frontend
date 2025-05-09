import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export interface Product {
  id: number
  internal_code: string
  description: string
  price: number
  status: string
  store_stock: {
    store_id: number
    store_name: string
    quantity: number
    min_stock: number
    max_stock: number | null
    reserved_quantity: number
    is_warehouse: boolean
    status: string
    batches: {
      batch_number: string
      quantity: number
      expiry_date: string
      cost_price: number
    }[]
  }[]
  total_stock: number
  warehouse_stock: number
  selected_store_stock: number
  total_reserved: number
  needs_restock: boolean
  overstock: boolean
}

export type AddedProduct = {
  id: string
  modelo: string
  ano: string
  parte: string
  marca: string
  existencia: string
  measurements: string
  precio1: number
  cantidad: number
}
