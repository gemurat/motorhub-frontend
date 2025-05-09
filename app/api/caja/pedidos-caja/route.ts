import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PedidoResponse {
  id: number
  order_date: Date
  supplier_id: number
  vale: number
  total_amount: number
  status: string
}

export async function GET() {
  try {
    const pedidos = await prisma.localOrders.findMany({
      orderBy: {
        order_date: 'desc',
      },
    })

    const formattedPedidos: PedidoResponse[] = pedidos.map(
      (pedido: {
        id: number
        order_date: Date
        supplier_id: number
        vale: number
        total_amount: number
        status: string
      }) => ({
        id: pedido.id,
        order_date: pedido.order_date,
        supplier_id: pedido.supplier_id,
        vale: pedido.vale,
        total_amount: Number(pedido.total_amount),
        status: pedido.status,
      })
    )

    return NextResponse.json({
      success: true,
      response: formattedPedidos,
    })
  } catch (error) {
    console.error('Error fetching pedidos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener los pedidos' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const updatedPedido = await prisma.localOrders.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      response: {
        id: updatedPedido.id,
        order_date: updatedPedido.order_date,
        supplier_id: updatedPedido.supplier_id,
        vale: updatedPedido.vale,
        total_amount: Number(updatedPedido.total_amount),
        status: updatedPedido.status,
      },
    })
  } catch (error) {
    console.error('Error updating pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}
