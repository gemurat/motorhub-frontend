import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: {
        Store: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await prisma.users.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: body.role || 'cajero',
        status: body.status || 'ACTIVE',
        store_id: body.store_id,
        permissions: body.permissions,
        is_super_admin: body.is_super_admin || false,
      },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}
