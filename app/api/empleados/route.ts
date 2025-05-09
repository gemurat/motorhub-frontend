import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const empleados = await prisma.empleados.findMany({
      include: {
        Store: true,
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

    return NextResponse.json(empleados)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Error al cargar los empleados' },
      { status: 500 }
    )
  }
}
