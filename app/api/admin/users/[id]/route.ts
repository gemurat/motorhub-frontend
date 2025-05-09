import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        Store: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updateData: any = {
      username: body.username,
      email: body.email,
      role: body.role,
      status: body.status,
      store_id: body.store_id,
      permissions: body.permissions,
      is_super_admin: body.is_super_admin,
    }

    // Only update password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.users.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.users.delete({
      where: { id: parseInt(params.id) },
    })
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 })
  }
}
