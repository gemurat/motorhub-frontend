import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export type Store = {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  status: string
  type: string
  is_warehouse: boolean
  storage_capacity: number | null
  storage_units: string | null
  created_at: Date
  updated_at: Date
  timezone: string
  currency: string
  tax_rate: number
  logo_url: string | null
  business_hours: string | null
  parent_store_id: number | null
}

export type Users = {
  id: number
  username: string | null
  password: string | null
  email: string | null
  role: string
  status: string
  store_id: number | null
  created_at: Date
  updated_at: Date
  last_login: Date | null
  permissions: string | null
  is_super_admin: boolean
}
