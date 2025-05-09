import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@auth0/nextjs-auth0'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { ManagementClient } from 'auth0'
import { Decimal } from '@prisma/client/runtime/library'
import {
  Prisma,
  Users,
  UserStoreAccess,
  Store,
  CashBoxes,
} from '@prisma/client'

// Debug logging
console.log('Prisma client:', prisma)
console.log('Prisma client methods:', Object.keys(prisma))

type Auth0User = {
  user_id: string
  email_verified: boolean
  last_login: string | null
  logins_count: number
  blocked: boolean
  app_metadata: {
    role?: string
  }
}

type StoreAccess = {
  store_id: number
  store_name: string
  role: string
  status: string
}

type Employee = {
  id: number
  username: string | null
  email: string | null
  role: string
  status: string
  store_id: number | null
  store_name: string | null
  cashbox_id: number | null
  cashbox: {
    id: number
    local_name: string
    current_balance: number
    store_id: number
  } | null
  store_access: {
    store_id: number
    store_name: string
    role: string
    status: string
  }[]
  first_name: string | null
  last_name: string | null
  phone: string | null
  password?: string
  message?: string
}

type UserWithRelations = Prisma.UsersGetPayload<{
  include: {
    Store: true
    CashBoxes: true
    UserStoreAccess: {
      include: {
        Store: true
      }
    }
  }
}> & {
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type EmployeeWithRelations = {
  id: number
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  position: string
  hire_date: Date
  status: string
  store_id: number | null
  created_at: Date
  updated_at: Date
  Store: {
    id: number
    name: string
  } | null
  UserStoreAccess: {
    role: string
    status: string
    Users: {
      id: number
      email: string | null
      role: string
      status: string
      permissions: string | null
    } | null
  }[]
}

type UserUpdateData = {
  email: string
  role: string
  username: string | null
  status: string
  Store?: Prisma.UsersUpdateInput['Store']
  cashbox_id?: number | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
}

export async function GET() {
  try {
    const employees = await prisma.users.findMany({
      where: {
        role: {
          in: ['CAJERO', 'ADMIN', 'VENDEDOR'],
        },
      },
      include: {
        Store: true,
        CashBoxes: true,
        UserStoreAccess: {
          include: {
            Store: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Format the response to include store access information
    const formattedEmployees: Employee[] = employees.map((employee) => ({
      id: employee.id,
      username: employee.username,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      store_id: employee.store_id,
      store_name: (employee as any).Store?.name || null,
      cashbox_id: employee.cashbox_id,
      cashbox: (employee as any).CashBoxes
        ? {
            id: (employee as any).CashBoxes.id,
            local_name: (employee as any).CashBoxes.local_name,
            current_balance: Number(
              (employee as any).CashBoxes.current_balance
            ),
            store_id: (employee as any).CashBoxes.store_id,
          }
        : null,
      store_access: (employee as any).UserStoreAccess.map((access: any) => ({
        store_id: access.Store.id,
        store_name: access.Store.name,
        role: access.role,
        status: access.status,
      })),
      first_name: (employee as any).first_name,
      last_name: (employee as any).last_name,
      phone: (employee as any).phone,
    }))

    return NextResponse.json(formattedEmployees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Error al cargar los empleados' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session user:', session.user)

    // Initialize Auth0 Management API client
    const management = new ManagementClient({
      domain: 'dev-bos58zv788xaggfv.us.auth0.com',
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    })

    const body = await request.json()
    console.log('Request body:', body)

    const {
      username,
      email,
      role,
      status = 'ACTIVE',
      store_id,
      cashbox_id,
      first_name,
      last_name,
      phone,
    } = body

    // Generate a strong password
    const password =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8) +
      '!@#$%^&*'

    console.log('Creating Auth0 user with:', {
      email,
      username,
      role,
      first_name,
      last_name,
      phone,
      store_id,
      cashbox_id,
    })

    // Create user in Auth0 with only essential fields
    const auth0User = await management.users.create({
      connection: 'Username-Password-Authentication',
      email,
      password,
      user_metadata: {
        username,
        role,
        first_name,
        last_name,
        phone,
        store_id,
        cashbox_id,
      },
    })

    console.log('Auth0 user created successfully:', auth0User)

    // Only create in database if Auth0 user was created successfully
    const user = await prisma.users.create({
      data: {
        username,
        email,
        role,
        status,
        store_id: store_id ? parseInt(store_id) : null,
        cashbox_id:
          role === 'CAJERO' && cashbox_id ? parseInt(cashbox_id) : null,
        first_name,
        last_name,
        phone,
      } as Prisma.UsersCreateInput,
      include: {
        Store: true,
        CashBoxes: true,
      },
    })

    console.log('Database user created successfully:', user)

    // Format the response with password
    const formattedResponse: Employee = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      store_id: user.store_id,
      store_name: (user as any).Store?.name || null,
      cashbox_id: user.cashbox_id,
      cashbox: (user as any).CashBoxes
        ? {
            id: (user as any).CashBoxes.id,
            local_name: (user as any).CashBoxes.local_name,
            current_balance: Number((user as any).CashBoxes.current_balance),
            store_id: (user as any).CashBoxes.store_id,
          }
        : null,
      first_name: (user as any).first_name,
      last_name: (user as any).last_name,
      phone: (user as any).phone,
      store_access: [],
      password,
      message: 'User created successfully. Please save the password below.',
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Detailed error in employee creation:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      username,
      email,
      role = 'CAJERO',
      status,
      store_id,
      cashbox_id,
      store_access,
      first_name,
      last_name,
      phone,
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // Update user record
      const updateData = {
        email,
        role,
        username,
        status,
        store_id: store_id ? parseInt(store_id) : null,
        cashbox_id:
          role === 'CAJERO' && cashbox_id ? parseInt(cashbox_id) : null,
        ...(first_name !== undefined ? { first_name } : {}),
        ...(last_name !== undefined ? { last_name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      } as const

      const user = await prisma.users.update({
        where: {
          id: parseInt(id),
        },
        data: updateData,
        include: {
          Store: true,
          CashBoxes: true,
          UserStoreAccess: {
            include: {
              Store: true,
            },
          },
        },
      })

      // Handle store access updates if provided
      if (store_access) {
        // First, remove all existing store access
        await prisma.userStoreAccess.deleteMany({
          where: {
            user_id: parseInt(id),
          },
        })

        // Then create new store access records
        if (Array.isArray(store_access) && store_access.length > 0) {
          const storeAccessData = store_access.map((access: any) => ({
            user_id: parseInt(id),
            store_id: parseInt(access.store_id),
            role: access.role || role,
            status: access.status || 'ACTIVE',
          }))

          await prisma.userStoreAccess.createMany({
            data: storeAccessData,
          })
        }
      }

      // Fetch updated user with all relations
      const updatedUserWithRelations = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        include: {
          Store: true,
          CashBoxes: true,
          UserStoreAccess: {
            include: {
              Store: true,
            },
          },
        },
      })

      if (!updatedUserWithRelations) {
        throw new Error('Failed to fetch updated user')
      }

      return updatedUserWithRelations
    })

    if (!updatedUser) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Format the response
    const formattedResponse: Employee = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      store_id: updatedUser.store_id,
      store_name: (updatedUser as any).Store?.name || null,
      cashbox_id: updatedUser.cashbox_id,
      cashbox: (updatedUser as any).CashBoxes
        ? {
            id: (updatedUser as any).CashBoxes.id,
            local_name: (updatedUser as any).CashBoxes.local_name,
            current_balance: Number(
              (updatedUser as any).CashBoxes.current_balance
            ),
            store_id: (updatedUser as any).CashBoxes.store_id,
          }
        : null,
      first_name: (updatedUser as any).first_name,
      last_name: (updatedUser as any).last_name,
      phone: (updatedUser as any).phone,
      store_access: (updatedUser as any).UserStoreAccess.map((access: any) => ({
        store_id: access.Store.id,
        store_name: access.Store.name,
        role: access.role,
        status: access.status,
      })),
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      {
        error: 'Failed to update employee',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
