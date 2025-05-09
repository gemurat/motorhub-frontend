'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Check, X, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmployeeForm } from '@/components/forms/employee-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUser } from '@auth0/nextjs-auth0/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type StoreAccess = {
  store_id: number
  store_name: string
  role: string
  status: string
}

type Empleados = {
  id: number
  username: string | null
  email: string | null
  role: string
  status: string
  store_id: number | null
  store_name: string | null
  cashbox_id: number | null
  cashbox: {
    id: number
    local_name: string
    current_balance: number
    store_id: number
  } | null
  store_access: StoreAccess[]
  first_name: string | null
  last_name: string | null
  phone: string | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Empleados[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Empleados | null>(
    null
  )
  const { user } = useUser()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Fetching employees...')
      const response = await fetch('/api/admin/employees')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar los empleados')
      }

      const data = await response.json()
      console.log('Received employees:', data)
      setEmployees(data)
    } catch (err) {
      console.error('Error fetching employees:', err)
      const message =
        err instanceof Error ? err.message : 'Error al cargar los empleados'
      setError(message)
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEmployee = (employee: Empleados) => {
    setSelectedEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDialogOpen = () => {
    setSelectedEmployee(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedEmployee(null)
    fetchEmployees() // Refresh the list after closing the dialog
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return format(new Date(date), 'PPp', { locale: es })
  }

  const getEmployeeStore = (employee: Empleados) => {
    if (employee.store_access && employee.store_access.length > 0) {
      return employee.store_access.map((access) => access.store_name).join(', ')
    }
    return employee.store_name || '-'
  }

  const getEmployeeRole = (employee: Empleados) => {
    if (employee.store_access && employee.store_access.length > 0) {
      return employee.store_access
        .map((access) => `${access.role} (${access.store_name})`)
        .join(', ')
    }
    return employee.role || '-'
  }

  const getEmployeeCashbox = (employee: Empleados) => {
    if (employee.role === 'CAJERO') {
      return employee.cashbox?.local_name || '-'
    }
    return '-'
  }

  const getEmployeeStatus = (employee: Empleados) => {
    if (employee.status === 'BLOCKED') {
      return (
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          <X className="mr-1 h-3 w-3" />
          Bloqueado
        </span>
      )
    }

    if (employee.status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
          <Clock className="mr-1 h-3 w-3" />
          Inactivo
        </span>
      )
    }

    return (
      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
        <Check className="mr-1 h-3 w-3" />
        Activo
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando empleados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Empleados</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              handleDialogOpen()
            } else {
              handleDialogClose()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={() => handleDialogOpen()}
            >
              <Plus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={selectedEmployee}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 && !error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay empleados registrados.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Caja</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.username || '-'}</TableCell>
                <TableCell>{employee.email || '-'}</TableCell>
                <TableCell>{getEmployeeRole(employee)}</TableCell>
                <TableCell>{getEmployeeStore(employee)}</TableCell>
                <TableCell>{getEmployeeCashbox(employee)}</TableCell>
                <TableCell>{getEmployeeStatus(employee)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
