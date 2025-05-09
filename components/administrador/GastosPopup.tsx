import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from '@nextui-org/react'
import { translateStatus } from '@/lib/utils'

export default function GastosPopup({
  gasto,
  onUpdate,
}: {
  gasto: any
  onUpdate: () => void
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = React.useState(false)
  const [size, setSize] = React.useState('md')

  const handleOpen = () => {
    setSize(size)
    onOpen()
  }

  const handleClose = () => {
    onClose()
  }

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cash-transaction', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: gasto.id,
          status: 'APPROVED',
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // Check for successful response status
        onUpdate()
        handleClose()
      } else {
        const errorMessage = data.error || 'Unknown error during approval' // Use server error if available
        console.error('Failed to approve gasto:', errorMessage)
        // Optionally display errorMessage to the user in the UI
      }
    } catch (error) {
      console.error('Error approving gasto:', error)
      // Optionally display a generic error message to the user
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <div className="flex justify-end">
        <Button color="success" key={size} onPress={() => handleOpen()}>
          Procesar
        </Button>
      </div>
      <Modal isOpen={isOpen} size={'md'} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                <p>ID: {gasto.id}</p>
                <p>Creado por: {gasto.created_by_username}</p>
                {new Date(gasto.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ModalHeader>
              <ModalBody>
                <p>Descripcion: {gasto.description}</p>
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-sm font-semibold">Monto</p>
                  {gasto.amount}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <span className="text-sm font-semibold">Estado</span>
                  {translateStatus(gasto.status)}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleClose}>
                  Cancelar
                </Button>
                <Button
                  color="success"
                  isLoading={isLoading}
                  onPress={handleApprove}
                >
                  Confirmar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
