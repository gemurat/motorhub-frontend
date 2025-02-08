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

export default function GiftCardModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [size, setSize] = React.useState('md')
  const handleOpen = () => {
    setSize(size)
    onOpen()
  }
  const [code, setCode] = React.useState<string>('')
  const [searchCode, setSearchCode] = React.useState<string>('')
  const [customerId, setCustomerId] = React.useState<string>('')
  const [balance, setBalance] = React.useState<number>(0)
  const [issueDate, setIssueDate] = React.useState<Date>(new Date())
  const [status, setStatus] = React.useState<string>('ACTIVE')
  const [searchResults, setSearchResults] = React.useState<any[]>([])

  const handleClose = () => {
    setCustomerId('')
    setCode('')
    setBalance(0)
    setSearchCode('')
    setSearchResults([])
    onClose()
  }
  const searchGiftCardByCustomerId = async (customerId: string) => {
    console.log('Buscando GiftCard por cliente:', customerId)
    try {
      const response = await fetch(`/api/giftcard?customerId=${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error buscando GiftCard')
      }
      const result = await response.json()
      console.log('GiftCard encontrado:', result)
      if (result.success && result.data.length > 0) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error('Error buscando GiftCard:', error)
    }
  }

  async function addGiftCard(
    code: string,
    customerId: string,
    balance: number,
    issueDate: Date,
    status: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/giftcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          customerId: customerId,
          balance: balance,
          issueDate: issueDate,
          status: status,
        }),
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
    addGiftCard(code, customerId, balance, issueDate, status)
  }
  const currentDate = new Date()
  const formattedDate = `-${currentDate.getDate()}${currentDate.getMonth() + 1}${currentDate.getFullYear().toString()}`
  const handleCustomerIdChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setCustomerId(event.target.value)
    setCode(event.target.value + formattedDate)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button key={size} onPress={() => handleOpen()}>
          GiftCard
        </Button>
      </div>
      <Modal isOpen={isOpen} size={'md'} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                <p className="mb-2">GiftCard</p>
                <div className="flex gap-4 justify-between">
                  <Input
                    type="text"
                    placeholder="Buscar por Identificador Cliente"
                    className="input"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <Button
                    onPress={() => searchGiftCardByCustomerId(customerId)}
                  >
                    Buscar
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody>
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-6 gap-3">
                      <span className="col-span-3">Vale</span>
                      <span className="col-span-2">Valor</span>
                      <span className="col-span-1">Estado</span>
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="grid grid-cols-6 gap-3 p-2 border-b border-gray-200"
                      >
                        <span className="col-span-3">{result.code}</span>
                        <span className="col-span-2">{result.balance}</span>
                        <span className="col-span-1">
                          {translateStatus(result.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  codigo: {code}
                  <Input
                    type="text"
                    placeholder="RUT / Email"
                    label="Identificador Cliente"
                    labelPlacement="outside"
                    className="input"
                    value={customerId}
                    onChange={handleCustomerIdChange}
                  />
                  <Input
                    type="number"
                    placeholder="Monto"
                    label="Monto"
                    labelPlacement="outside"
                    className="input"
                    step="0.01"
                    required
                    value={balance.toString()}
                    onChange={(e) => setBalance(Number(e.target.value))}
                  />
                  <p>Creado el: {new Date().toLocaleDateString()}</p>
                  Estado: {translateStatus(status)}
                </div>
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
