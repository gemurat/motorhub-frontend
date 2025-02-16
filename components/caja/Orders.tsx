'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardBody, Divider, Button } from '@nextui-org/react'
import Sidebar from './Sidebar'
import CashBox from './CashBox'
import EmployeeSells from './EmployeeSells'
import PedidosLocal from './PedidosLocal'
import GiftCardModal from './GiftCardModal'
import ProductReturnModal from './productReturnModal'
type Pedido = {
  id: number
  order_date: Date
  supplier_id: number
  vale: number
  total_amount: number
  status: string
}
type selectedPedido = Pedido | null
interface PaymentMethod {
  id: number
  name: string
}
interface Order {
  id: number
  customer_id: string
  seller_name: string
  total_amount: string
  order_date: Date
  items: {
    price: string
    product_name: string
    quantity: number
  }[]
}
type estadoPedido = 'PENDING' | 'COMPLETED' | 'CANCELLED'
type TransactionType = 'expense' | 'income'

const OrderSection = ({ mediosPago }: { mediosPago: PaymentMethod[] }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentBalance, setCurrentBalance] = useState('0.00')
  const [lastUpdatedBalance, setLastUpdatedBalance] = useState('')
  const cajaChica = async () => {
    try {
      const response = await fetch('/api/cash-transaction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('caja chica failed')
      }

      const result = await response.json()
      setCurrentBalance(result.current_balance)
      setLastUpdatedBalance(result.last_updated)
      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('Error Caja chica:', error)
      // Handle error in payment processing (e.g., show an error
    }
  }
  const [loading, setLoading] = useState(true)
  const [paymentLoader, setPaymentLoader] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedMedioPago, setSelectedMedioPago] = React.useState<
    number[] | null
  >(null)
  const getOrders = useCallback(async () => {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    setOrders(data.orders)
    setLoading(false)
    return data
  }, [])
  // caja chica
  const [cashboxAmount, setCashboxAmount] = useState('')
  const [cashBoxDescription, setCashBoxDescription] = useState('')
  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null)
  const [isCajaChicaVisible, setIsCajaChicaVisible] = useState(false)
  const [isEmployeeSellsVisible, setIsEmployeeSellsVisible] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<selectedPedido>(null)
  const [pedidosLocalData, setPedidosLocalData] = useState<Pedido[]>([])
  const [validGiftcardValue, setValidGiftcardValue] = useState('')
  interface EmployeeSell {
    seller_id: string
    seller_name: string
    total_amount: number
  }
  const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('')

  const [employeeSells, setEmployeeSells] = useState<EmployeeSell[]>([])
  const handleEmployeeSellsVisible = () => {
    setIsEmployeeSellsVisible(!isEmployeeSellsVisible)
  }
  const sellsByEmployee = async () => {
    try {
      const response = await fetch('/api/employee-sells', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('caja chica failed')
      }
      const result = await response.json()
      setEmployeeSells(result)
      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('Error Caja chica:', error)
      // Handle error in payment processing (e.g., show an error
    }
  }
  const getPedidosLocal = async () => {
    try {
      const response = await fetch('/api/pedidos-caja', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('caja chica failed')
      }
      const result = await response.json()
      setPedidosLocalData(result.response)
      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('Error Pedidos Caja:', error)
      // Handle error in payment processing (e.g., show an error
    }
  }
  useEffect(() => {
    cajaChica()
    getOrders()
    sellsByEmployee()
    getPedidosLocal()
  }, [getOrders])
  // console.log(orders)
  const handleVolver = useCallback(() => {
    setSelectedOrder(null)
    setSelectedMedioPago(null)
    setValidGiftcardValue('')
  }, [])
  const addOrderToProcess = (order: Order) => {
    setSelectedMedioPago(null)
    setValidGiftcardValue('')
    setSelectedOrder(order)
    setValidGiftcardValue('')
  }

  async function processPayment(order: any) {
    if (!order) {
      alert('No order to process')
      return
    }
    console.log('Processing payment for order:', order)

    // try {
    //   const response = await fetch('/api/process-payment', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       orderId: order.id,
    //       amount: order.total_amount,
    //       paymentMethodId: selectedMedioPago,
    //       newStatus: 'PAID',
    //       items: order.items,
    //       giftCardValue: validGiftcardValue,
    //     }),
    //   })

    //   if (!response.ok) {
    //     throw new Error('Payment processing failed')
    //   }
    //   const result = await response.json()
    //   console.log('Payment processed successfully:', result)
    //   if (result.success) {
    //     setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id))
    //     setSelectedOrder(null)
    //   }

    //   // Call other post and get functions
    //   await cajaChica()
    //   await sellsByEmployee()
    //   await getPedidosLocal()
    //   // Handle successful payment processing (e.g., show a success message, update UI)
    // } catch (error) {
    //   console.error('Error processing payment:', error)
    //   // Handle error in payment processing (e.g., show an error message)
    // }
  }
  async function cancelPayment(order: any) {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return
    }
    try {
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()
      console.log('Payment processed successfully:', result)
      if (result.success) {
        setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id))
        setSelectedOrder(null)
      }
      // Handle successful payment processing (e.g., show a success message, update UI)
    } catch (error) {
      console.error('Error processing payment:', error)
      // Handle error in payment processing (e.g., show an error message)
    }
  }
  const handleCashboxAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCashboxAmount(e.target.value)
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setCashBoxDescription(e.target.value)
  }

  const handleTransactionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTransactionType(e.target.value as TransactionType)
  }
  const handleCashboxSubmit = async () => {
    if (!transactionType || !cashboxAmount || !cashBoxDescription) {
      alert('Please fill in all fields before submitting.')
      return
    }
    try {
      const response = await fetch('/api/cash-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: transactionType,
          amount: cashboxAmount,
          description: cashBoxDescription,
        }),
      })
      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()
      console.log('Payment processed successfully:', result)
      if (result.success) {
        setCashboxAmount('')
        setCashBoxDescription('')
        setTransactionType(null)
        setIsCajaChicaVisible(false)
        cajaChica()
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      // Handle error in payment processing (e.g., show an error message)
    }
  }
  const handleCashboxVolver = () => {
    setCashboxAmount('')
    setCashBoxDescription('')
    setTransactionType(null)
    setIsCajaChicaVisible(false)
  }
  const handleSelectedPedido = (pedido: Pedido) => {
    console.log(pedido)

    setSelectedPedido(pedido)
  }
  const handleVolverPedido = () => {
    setSelectedPedido(null)
  }
  const handleActualizarEstadoPedido = async (pedido: Pedido) => {
    try {
      const response = await fetch('/api/pedidos-caja', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pedido,
          status: nuevoEstadoPedido,
        }),
      })
      if (!response.ok) {
        throw new Error('Error updating pedido')
      }
      const result = await response.json()
      console.log('Pedido updated successfully:', result)
      if (result.success) {
        setNuevoEstadoPedido('')
        setSelectedPedido(null)
        setPedidosLocalData((prevPedidos) =>
          prevPedidos.map((p) => (p.id === pedido.id ? pedido : p))
        )
        setSelectedPedido(null)
        window.location.reload()
      }
    } catch (error) {
      setNuevoEstadoPedido('')
      setSelectedPedido(null)
      console.error('Error updating pedido:', error)
    }
  }
  const handleSelectOrderStatus = (status: string) => {
    setNuevoEstadoPedido(status)
  }
  const handleValidateGiftcard = async (giftCardCode: string) => {
    console.log('Buscando GiftCard por cliente:', giftCardCode)
    try {
      const response = await fetch(
        `/api/giftcard-validator?giftcardcode=${giftCardCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Error buscando GiftCard')
      }
      const result = await response.json()
      console.log('GiftCard encontrado:', result.data.balance)
      if (result.success && result.data) {
        console.log(result.data)
        setValidGiftcardValue(result.data.balance)
      }
    } catch (error) {
      console.error('Error buscando GiftCard:', error)
    }
  }
  return (
    <div className="flex">
      <div className="h-full w-1/4 space-y-4">
        <div className="flex justify-between gap-4">
          <GiftCardModal />
          <ProductReturnModal />
          <Button onClick={getOrders}>Actualizar</Button>
        </div>
        <div className=" w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          {paymentLoader ? (
            <p>Procesando Pago...</p>
          ) : selectedOrder ? (
            <Sidebar
              Order={selectedOrder}
              validGiftcardValue={validGiftcardValue}
              handleValidateGiftcard={handleValidateGiftcard}
              mediosPago={mediosPago}
              handleVolver={handleVolver}
              selectedMedioPago={selectedMedioPago}
              setSelectedMedioPago={setSelectedMedioPago}
              processPayment={async (order) => {
                setPaymentLoader(true)
                await processPayment(order)
                setPaymentLoader(false)
              }}
            />
          ) : (
            <p>Seleccione Orden para Procesar</p>
          )}
        </div>
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          <CashBox
            handleCashboxVisible={() => setIsCajaChicaVisible(true)}
            isCajaChicaVisible={isCajaChicaVisible}
            handleCashboxVolver={handleCashboxVolver}
            handleCashboxSubmit={handleCashboxSubmit}
            transactionType={transactionType}
            handleTransactionTypeChange={handleTransactionTypeChange}
            currentCash={currentBalance}
            lasUpdated={lastUpdatedBalance}
            amount={cashboxAmount}
            description={cashBoxDescription}
            handleCashboxAmountChange={handleCashboxAmountChange}
            handleDescriptionChange={handleDescriptionChange}
          />
        </div>
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          <EmployeeSells
            isEmployeeSellsVisible={isEmployeeSellsVisible}
            handleEmployeeSellsVisible={handleEmployeeSellsVisible}
            employeeSells={employeeSells}
            sellsByEmployee={sellsByEmployee ?? []}
          />
        </div>
        <div className=" w-full p-4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-lg">
          <PedidosLocal
            pedidosLocalData={pedidosLocalData}
            selectedPedido={selectedPedido}
            handleSelectedPedido={handleSelectedPedido}
            handleVolver={handleVolverPedido}
            handleActualizarEstadoPedido={handleActualizarEstadoPedido}
            handleSelectOrderStatus={handleSelectOrderStatus}
          />
        </div>
      </div>

      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
        {loading ? (
          <p>Loading...</p>
        ) : (
          orders
            .sort(
              (a, b) =>
                new Date(a.order_date).getTime() -
                new Date(b.order_date).getTime()
            )
            .map((order) => (
              <Card
                key={order.id}
                isDisabled={selectedOrder?.id === order.id}
                className="min-w-[300px] h-fit p-4 m-4 rounded-lg shadow-lg border border-gray-200"
              >
                <CardHeader className="flex gap-3 mb-4">
                  <div className="flex flex-col text-left">
                    <p className="text-lg font-semibold">
                      Cliente: {order.customer_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hora:{' '}
                      {new Date(order.order_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Vendedor: {order.seller_name}
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="mt-4">
                  <div className="flex flex-wrap gap-4 justify-end">
                    <Button
                      isDisabled={selectedOrder?.id === order.id}
                      color="danger"
                      onClick={() => cancelPayment(order)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      isDisabled={selectedOrder?.id === order.id}
                      color="success"
                      onClick={() => addOrderToProcess(order)}
                    >
                      Procesar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}

export default OrderSection
