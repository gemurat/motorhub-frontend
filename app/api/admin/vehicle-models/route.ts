import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const vehicleModels = await prisma.vehicleModels.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(vehicleModels)
  } catch (error) {
    console.error('Error fetching vehicle models:', error)
    return NextResponse.json(
      { error: 'Error fetching vehicle models' },
      { status: 500 }
    )
  }
}
