import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateUserRequest {
  email: string
  given_name: string
  family_name: string
  connection: string
  password: string
  role: string
  store_id?: number
  cashbox_id?: number
}

const ALLOWED_ROLES = [
  'ADMIN',
  'STORE_MANAGER',
  'EMPLOYEE',
  'CASHIER',
  'WAREHOUSE_MANAGER',
]

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as CreateUserRequest
    const {
      email,
      given_name,
      family_name,
      connection,
      password,
      role,
      store_id,
      cashbox_id,
    } = body

    // Validate required fields
    if (
      !email ||
      !given_name ||
      !family_name ||
      !connection ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists in database
    const existingUser = await prisma.users.findFirst({
      where: { email: email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate Auth0 configuration
    if (
      !process.env.AUTH0_ISSUER_BASE_URL ||
      !process.env.AUTH0_CLIENT_ID ||
      !process.env.AUTH0_CLIENT_SECRET
    ) {
      console.error('Missing Auth0 configuration')
      return NextResponse.json(
        { error: 'Auth0 configuration is missing' },
        { status: 500 }
      )
    }

    // Get Auth0 access token
    const tokenResponse = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
          grant_type: 'client_credentials',
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Error getting Auth0 token:', errorData)
      return NextResponse.json(
        { error: 'Failed to get Auth0 token', details: errorData },
        { status: tokenResponse.status }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Create Auth0 user
    const createUserResponse = await fetch(
      `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          email,
          given_name,
          family_name,
          name: `${given_name} ${family_name}`,
          connection,
          password,
          verify_email: true,
          email_verified: false,
          app_metadata: {
            role,
            store_id,
            cashbox_id,
          },
        }),
      }
    )

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json()
      console.error('Error creating Auth0 user:', errorData)

      // Handle specific Auth0 error cases
      if (
        errorData.error === 'Bad Request' &&
        errorData.message.includes('PasswordStrengthError')
      ) {
        return NextResponse.json(
          {
            error: 'Password does not meet strength requirements',
            details:
              'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create Auth0 user', details: errorData },
        { status: createUserResponse.status }
      )
    }

    const auth0User = await createUserResponse.json()
    console.log('Auth0 user created:', auth0User)

    // Create user in database
    const dbUser = await prisma.users.create({
      data: {
        auth0_id: auth0User.user_id,
        email: email,
        username: `${given_name} ${family_name}`,
        role: role,
        store_id: store_id,
        cashbox_id: cashbox_id,
        status: 'ACTIVE',
      } as any, // Temporarily bypass type checking
    })
    console.log('Database user created:', dbUser)

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Error in Auth0 user creation:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
