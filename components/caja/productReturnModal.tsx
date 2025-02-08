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

export default function ProductReturnModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [size, setSize] = React.useState('md')
  const handleOpen = () => {
    setSize(size)
    onOpen()
  }

  const handleClose = () => {
    onClose()
  }

  // async function addPedido(
  //   orderDate: string,
  //   supplierId: number,
  //   totalAmount: string,
  //   status: string,
  //   vale: string
  // ): Promise<void> {}
  //   try {
  //     const response = await fetch('/api/pedidos-caja', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         order_date: orderDate,
  //         supplier_id: supplierId,
  //         total_amount: Number(totalAmount),
  //         status: status,
  //         vale: Number(vale),
  //       } as Pedido),
  //     })

  //     if (!response.ok) {
  //       throw new Error('Payment processing failed')
  //     }
  //     const result = await response.json()
  //     console.log('Payment processed successfully:', result)
  //     if (result.success) {
  //       alert('Pedido Agregado')
  //       window.location.reload()
  //       handleClose()
  //     }
  //   } catch (error) {
  //     console.error('Error agregando orden:', error)
  //   }
  // }
  // const handleAgregar = () => {
  //   addPedido(orderDate, supplierId, totalAmount, status, vale)
  // }
  return (
    <>
      <div className="flex justify-end">
        <Button
          key={size}
          onPress={() => handleOpen()}
          // isIconOnly
        >
          Devoluciones
        </Button>
      </div>
      <Modal isOpen={isOpen} size={'md'} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                Devoluciones
              </ModalHeader>
              <ModalBody>body aqui</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleClose}>
                  Cancelar
                </Button>
                <Button color="success" onPress={handleClose}>
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
