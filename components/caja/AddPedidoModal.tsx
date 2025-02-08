import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react'
import { Input } from '@nextui-org/react'

export default function AddPedidoModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [size, setSize] = React.useState('md')
  const handleOpen = () => {
    setSize(size)
    onOpen()
  }
  const [orderDate, setOrderDate] = React.useState('')
  const [supplierId, setSupplierId] = React.useState(1)
  const [totalAmount, setTotalAmount] = React.useState('')
  const [status, setStatus] = React.useState('PENDING')
  const [vale, setVale] = React.useState('')

  const handleClose = () => {
    setOrderDate('')
    setTotalAmount('')
    setVale('')
    onClose()
  }
  interface Pedido {
    order_date: string
    supplier_id: number
    total_amount: number
    status: string
    vale: number
  }

  async function addPedido(
    orderDate: string,
    supplierId: number,
    totalAmount: string,
    status: string,
    vale: string
  ): Promise<void> {
    if (!orderDate || !totalAmount || !status || !vale) {
      alert('Faltan datos')
      return
    }
    try {
      const response = await fetch('/api/pedidos-caja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_date: orderDate,
          supplier_id: supplierId,
          total_amount: Number(totalAmount),
          status: status,
          vale: Number(vale),
        } as Pedido),
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }
      const result = await response.json()
      console.log('Payment processed successfully:', result)
      if (result.success) {
        alert('Pedido Agregado')
        window.location.reload()
        handleClose()
      }
    } catch (error) {
      console.error('Error agregando orden:', error)
    }
  }
  const handleAgregar = () => {
    addPedido(orderDate, supplierId, totalAmount, status, vale)
  }
  return (
    <>
      <div className="flex justify-end">
        <Button
          key={size}
          onPress={() => handleOpen()}
          size="sm"
          variant="light"
          className="rounded-full"
          isIconOnly
        >
          <span className="text-xl font-bold">+</span>
        </Button>
      </div>
      <Modal isOpen={isOpen} size={'md'} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                Agregar Pedido
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Fecha Del Pedido"
                  labelPlacement="outside"
                  placeholder="Fecha Del Pedido"
                  type="datetime-local"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Vale"
                  type="number"
                  labelPlacement="outside"
                  placeholder="123"
                  value={vale}
                  onChange={(e) => setVale(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Valor"
                  type="number"
                  labelPlacement="outside"
                  placeholder="123"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  fullWidth
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleClose}>
                  Cancelar
                </Button>
                <Button color="success" onPress={handleAgregar}>
                  Agregar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
