'use client'

import React, { useState, useEffect } from 'react'

import AdminActions from '@/app/components/administrador/AdminActions'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Store {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  status: string
  created_at: string
  updated_at: string
}

interface CashBox {
  id: number
  local_name: string
  current_balance: number
  last_updated: string
  store_id: number
}

interface Employee {
  id: number
  username: string | null
  email: string | null
  role: string
  status: string
  store_id: number | null
  store_name: string | null
}

interface EmployeeSell {
  seller_id: string
  seller_name: string
  total_amount: number
}

interface SellByType {
  payment_method: string
  payment_count: number
  total_amount: number
}

interface PendingTransfer {
  id: number
  product_id: number
  from_store_id: number
  to_store_id: number
  quantity: number
  type: string
  status: string
  notes: string | null
  created_at: string
  Products: {
    internal_code: string
    description: string | null
  }
  FromStore: {
    name: string
  }
  ToStore: {
    name: string
  }
  CreatedBy: {
    username: string
  }
}

interface PaymentReview {
  id: number
  order_id: number
  amount: number
  date: string
  status: string
  payment_method_id: number
  rejection_reason: string | null
  Orders: {
    id: number
    total_amount: number | null
    order_date: string | null
  }
  PaymentMethods: {
    id: number
    name: string
    requires_approval: boolean
  }
}

interface ExpenseInReview {
  id: number
  amount: number
  description: string
  date: string
  status: string
  cash_box_id: number
  store_id: number
  created_by_username: string
  cashbox_name: string
  store_name: string
}

interface CashboxWithdrawal {
  id: number
  amount: number
  description: string
  date: string
  status: string
  cash_box_id: number
  store_id: number
  created_by: number
  approved_by: number | null
  cashbox_name: string
  store_name: string
  created_by_username: string
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [cashboxes, setCashboxes] = useState<CashBox[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSells, setEmployeeSells] = useState<EmployeeSell[]>([])
  const [sellByType, setSellByType] = useState<SellByType[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>(
    []
  )
  const [pendingPayments, setPendingPayments] = useState<PaymentReview[]>([])
  const [isApproving, setIsApproving] = useState<number | null>(null)
  const [isApprovingPayment, setIsApprovingPayment] = useState<number | null>(
    null
  )
  const [expensesInReview, setExpensesInReview] = useState<ExpenseInReview[]>([])
  const [isApprovingExpense, setIsApprovingExpense] = useState<number | null>(null)
  const [cashboxWithdrawals, setCashboxWithdrawals] = useState<CashboxWithdrawal[]>([])
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState<number | null>(null)
  const [newWithdrawal, setNewWithdrawal] = useState({
    store_id: '',
    cash_box_id: '',
    amount: '',
    description: '',
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch stores
      const storesResponse = await fetch('/api/admin/stores')
      if (!storesResponse.ok) throw new Error('Failed to fetch stores')
      const storesData = await storesResponse.json()
      setStores(storesData)

      // Fetch employees
      const employeesResponse = await fetch('/api/admin/employees')
      if (!employeesResponse.ok) throw new Error('Failed to fetch employees')
      const employeesData = await employeesResponse.json()
      setEmployees(employeesData)

      // Fetch cashboxes for each store
      const cashboxesPromises = storesData.map((store: Store) =>
        fetch(`/api/caja/cashboxes?storeId=${store.id}`).then((res) =>
          res.json()
        )
      )
      const cashboxesData = await Promise.all(cashboxesPromises)
      // Add store_id to each cashbox and flatten the array
      const cashboxesWithStoreId = cashboxesData.flatMap((cashboxes, index) =>
        cashboxes.map((cb: any) => ({ ...cb, store_id: storesData[index].id }))
      )
      setCashboxes(cashboxesWithStoreId)

      // Fetch employee sells
      const employeeSellsResponse = await fetch('/api/employee-sells')
      if (!employeeSellsResponse.ok)
        throw new Error('Failed to fetch employee sells')
      const employeeSellsData = await employeeSellsResponse.json()
      setEmployeeSells(employeeSellsData)

      // Fetch sells by type
      const sellsByTypeResponse = await fetch('/api/employee-sells')
      if (!sellsByTypeResponse.ok)
        throw new Error('Failed to fetch sells by type')
      const sellsByTypeData = await sellsByTypeResponse.json()
      setSellByType(sellsByTypeData)

      // Fetch pending transfers
      const transfersResponse = await fetch(
        '/api/stock-movements?status=PENDING'
      )
      if (!transfersResponse.ok)
        throw new Error('Failed to fetch pending transfers')
      const transfersData = await transfersResponse.json()
      setPendingTransfers(transfersData.movements)

      // Fetch pending payments
      const paymentsResponse = await fetch('/api/payments?status=' + encodeURIComponent('IN REVIEW'))
      if (!paymentsResponse.ok)
        throw new Error('Failed to fetch pending payments')
      const paymentsData = await paymentsResponse.json()
      console.log('Payments IN REVIEW:', paymentsData)
      setPendingPayments(paymentsData.payments)

      // Fetch expenses in review
      const expensesResponse = await fetch('/api/caja/cash-transaction?showInReview=true')
      if (!expensesResponse.ok) throw new Error('Failed to fetch expenses in review')
      const expensesData = await expensesResponse.json()
      setExpensesInReview(expensesData.response)

      // Fetch cashbox withdrawals
      const withdrawalsResponse = await fetch('/api/caja/withdrawals')
      if (!withdrawalsResponse.ok) throw new Error('Failed to fetch cashbox withdrawals')
      const withdrawalsData = await withdrawalsResponse.json()
      setCashboxWithdrawals(withdrawalsData.withdrawals)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTransferAction = async (
    transferId: number,
    action: 'APPROVE' | 'REJECT'
  ) => {
    try {
      setIsApproving(transferId)
      const response = await fetch(`/api/stock-movements?id=${transferId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'APPROVE' ? 'COMPLETED' : 'REJECTED',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} transfer`
        )
      }

      // Refresh the data
      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Error ${action.toLowerCase()}ing transfer`
      )
    } finally {
      setIsApproving(null)
    }
  }

  const handlePaymentAction = async (
    paymentId: number,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) => {
    try {
      setIsApprovingPayment(paymentId)
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejection_reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} payment`
        )
      }

      // Update pendingPayments state by removing the approved/rejected payment
      setPendingPayments(prevPayments =>
        prevPayments.filter(payment => payment.id !== paymentId)
      )

      // Refresh the data
      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Error ${action.toLowerCase()}ing payment`
      )
    } finally {
      setIsApprovingPayment(null)
    }
  }

  const handleExpenseAction = async (
    expenseId: number,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ) => {
    try {
      setIsApprovingExpense(expenseId)
      const response = await fetch(`/api/caja/cash-transaction/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejection_reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to ${action.toLowerCase()} expense`
        )
      }

      // Update expensesInReview state by removing the approved/rejected expense
      setExpensesInReview(prevExpenses =>
        prevExpenses.filter(expense => expense.id !== expenseId)
      )

      // Refresh the data
      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Error ${action.toLowerCase()}ing expense`
      )
    } finally {
      setIsApprovingExpense(null)
    }
  }

  const handleCreateWithdrawal = async () => {
    try {
      const response = await fetch('/api/caja/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(newWithdrawal.store_id),
          cash_box_id: parseInt(newWithdrawal.cash_box_id),
          amount: parseFloat(newWithdrawal.amount),
          description: newWithdrawal.description,
          type: 'WITHDRAW',
          status: 'IN_PROGRESS',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create withdrawal')
      }

      // Reset form and refresh data
      setNewWithdrawal({
        store_id: '',
        cash_box_id: '',
        amount: '',
        description: '',
      })
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating withdrawal')
    }
  }

  const handleCompleteWithdrawal = async (withdrawalId: number) => {
    try {
      setIsProcessingWithdrawal(withdrawalId)
      const response = await fetch(`/api/caja/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete withdrawal')
      }

      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing withdrawal')
    } finally {
      setIsProcessingWithdrawal(null)
    }
  }

  const getEmployeeCount = (storeId: number) => {
    return employees.filter((emp) => emp.store_id === storeId).length
  }

  const getStoreCashboxes = (storeId: number) => {
    return cashboxes.filter((cb) => cb.store_id === storeId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Panel de Administración</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions and Summaries */}
      <AdminActions
        employeeSells={employeeSells}
        sellByType={sellByType}
        onRefresh={fetchData}
      />

      {/* Pending Transfers Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Transferencias de Stock Pendientes
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingTransfers.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay transferencias pendientes
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {transfer.Products.internal_code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.Products.description}
                      </div>
                    </TableCell>
                    <TableCell>{transfer.FromStore.name}</TableCell>
                    <TableCell>{transfer.ToStore.name}</TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>
                      {format(new Date(transfer.created_at), 'PPP', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>{transfer.CreatedBy.username}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleTransferAction(transfer.id, 'APPROVE')
                          }
                          disabled={isApproving === transfer.id}
                        >
                          {isApproving === transfer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Aprobar'
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleTransferAction(transfer.id, 'REJECT')
                          }
                          disabled={isApproving === transfer.id}
                        >
                          {isApproving === transfer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Rechazar'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pending Payments Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Pagos en Revisión</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingPayments.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay pagos pendientes de revisión
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">
                        Orden #{payment.order_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total:{' '}
                        {formatCurrency(payment.Orders.total_amount || 0)}
                      </div>
                    </TableCell>
                    <TableCell>{payment.PaymentMethods.name}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {format(new Date(payment.date), 'PPP', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handlePaymentAction(payment.id, 'APPROVE')
                          }
                          disabled={isApprovingPayment === payment.id}
                        >
                          {isApprovingPayment === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Aprobar'
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handlePaymentAction(payment.id, 'REJECT')
                          }
                          disabled={isApprovingPayment === payment.id}
                        >
                          {isApprovingPayment === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Rechazar'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Expenses in Review Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gastos en Revisión</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : expensesInReview.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay gastos pendientes de revisión
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Caja</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesInReview.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.store_name}</TableCell>
                    <TableCell>{expense.cashbox_name}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      {format(new Date(expense.date), 'PPP', { locale: es })}
                    </TableCell>
                    <TableCell>{expense.created_by_username}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleExpenseAction(expense.id, 'APPROVE')
                          }
                          disabled={isApprovingExpense === expense.id}
                        >
                          {isApprovingExpense === expense.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Aprobar'
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleExpenseAction(expense.id, 'REJECT')
                          }
                          disabled={isApprovingExpense === expense.id}
                        >
                          {isApprovingExpense === expense.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Rechazar'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Cashbox Withdrawals Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cuadrar Caja</h3>

        {/* New Withdrawal Form */}
        <div className="rounded-md border p-4 space-y-4">
          <h4 className="text-lg font-medium">Nuevo Retiro de Caja</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tienda</label>
              <select
                className="w-full rounded-md border p-2"
                value={newWithdrawal.store_id}
                onChange={(e) => setNewWithdrawal({
                  ...newWithdrawal,
                  store_id: e.target.value,
                  cash_box_id: '' // Reset cashbox when store changes
                })}
              >
                <option value="">Seleccionar tienda</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Caja</label>
              <select
                className="w-full rounded-md border p-2"
                value={newWithdrawal.cash_box_id}
                onChange={(e) => setNewWithdrawal({ ...newWithdrawal, cash_box_id: e.target.value })}
                disabled={!newWithdrawal.store_id}
              >
                <option value="">Seleccionar caja</option>
                {cashboxes
                  .filter(cb => cb.store_id === parseInt(newWithdrawal.store_id))
                  .map((cashbox) => (
                    <option key={cashbox.id} value={cashbox.id}>
                      {cashbox.local_name} - {formatCurrency(cashbox.current_balance)}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto</label>
              <input
                type="number"
                className="w-full rounded-md border p-2"
                value={newWithdrawal.amount}
                onChange={(e) => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input
                type="text"
                className="w-full rounded-md border p-2"
                value={newWithdrawal.description}
                onChange={(e) => setNewWithdrawal({ ...newWithdrawal, description: e.target.value })}
                placeholder="Motivo del retiro"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateWithdrawal}
            disabled={!newWithdrawal.store_id || !newWithdrawal.cash_box_id || !newWithdrawal.amount || !newWithdrawal.description}
          >
            Crear Retiro
          </Button>
        </div>

        {/* Active Withdrawals */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tienda</TableHead>
                <TableHead>Caja</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashboxWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{withdrawal.store_name}</TableCell>
                  <TableCell>{withdrawal.cashbox_name}</TableCell>
                  <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                  <TableCell>{withdrawal.description}</TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.date), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell>{withdrawal.created_by_username}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {withdrawal.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === 'IN_PROGRESS' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCompleteWithdrawal(withdrawal.id)}
                        disabled={isProcessingWithdrawal === withdrawal.id}
                      >
                        {isProcessingWithdrawal === withdrawal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Completar'
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Stores Summary */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tienda</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Empleados</TableHead>
                <TableHead>Cajas</TableHead>
                <TableHead>Total en Cajas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => {
                const storeCashboxes = getStoreCashboxes(store.id)
                const totalCashboxBalance = storeCashboxes.reduce(
                  (sum, cb) => sum + cb.current_balance,
                  0
                )

                return (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.address || '-'}</TableCell>
                    <TableCell>
                      {store.phone || '-'}
                      {store.email && (
                        <div className="text-sm">{store.email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${store.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : store.status === 'INACTIVE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {store.status}
                      </span>
                    </TableCell>
                    <TableCell>{getEmployeeCount(store.id)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {storeCashboxes.map((cashbox) => (
                          <div key={cashbox.id} className="text-sm">
                            {cashbox.local_name}:{' '}
                            {formatCurrency(cashbox.current_balance)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(totalCashboxBalance)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
