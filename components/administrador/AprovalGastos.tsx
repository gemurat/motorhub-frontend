import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from '@nextui-org/react'
import React, { useState, useEffect } from 'react'

interface Expense {
  id: number
  status: string
  description: string
  amount: string
  date: string
  store_name: string
  user_name: string
}

const AprovalGastos: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null
  )

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses')
        if (!response.ok) throw new Error('Failed to fetch expenses')
        const data = await response.json()
        setExpenses(data || [])
      } catch (error) {
        console.error('Error fetching expenses:', error)
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const handleApprove = async (expense: Expense, approved: boolean) => {
    if (selectedExpenseId === expense.id) {
      try {
        const response = await fetch('/api/expenses/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expenseId: expense.id,
            approved,
            notes: approvalNotes,
          }),
        })

        if (!response.ok) throw new Error('Failed to approve expense')

        // Update local state
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === expense.id
              ? { ...e, status: approved ? 'APPROVED' : 'REJECTED' }
              : e
          )
        )
        setSelectedExpenseId(null)
        setApprovalNotes('')
      } catch (error) {
        console.error('Error approving expense:', error)
      }
    } else {
      setSelectedExpenseId(expense.id)
    }
  }

  const sortedExpenses =
    expenses.length > 0
      ? [...expenses].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      : []

  return (
    <div className="w-full h-fit flex flex-col gap-8">
      <h3 className="text-xl font-semibold">Aprobación de Gastos</h3>
      {loading ? (
        <p>Loading...</p>
      ) : sortedExpenses.length === 0 ? (
        <p>No hay gastos pendientes</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {sortedExpenses.map((expense) => (
            <Card
              key={expense.id}
              className={`min-w-[300px] h-fit p-4 m-4 rounded-lg shadow-lg border ${
                expense.status === 'PENDING'
                  ? 'border-yellow-500'
                  : expense.status === 'APPROVED'
                    ? 'border-green-500'
                    : 'border-red-500'
              }`}
            >
              <CardHeader className="flex gap-3 mb-4">
                <div className="flex flex-col text-left">
                  <p className="text-lg font-semibold">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    Monto: {expense.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(expense.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tienda: {expense.store_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Usuario: {expense.user_name}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="mt-4">
                {selectedExpenseId === expense.id && (
                  <div className="mb-4">
                    <Input
                      label="Notas de aprobación"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Ingrese notas de aprobación"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button
                    color="danger"
                    onClick={() => handleApprove(expense, false)}
                  >
                    Rechazar
                  </Button>
                  <Button
                    color={expense.status === 'PENDING' ? 'warning' : 'success'}
                    onClick={() => handleApprove(expense, true)}
                  >
                    {selectedExpenseId === expense.id
                      ? 'Confirmar Aprobación'
                      : expense.status === 'PENDING'
                        ? 'Aprobar'
                        : 'Aprobado'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AprovalGastos
