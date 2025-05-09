'use client'

import { useState, useEffect } from 'react'
import { Store } from '@/types/prisma'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Pencil,
  Loader2,
  Building2,
  X,
  CreditCard,
  ChevronDown,
  Check,
  Shield,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StoreForm } from '@/components/forms/store-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  fetchMediosPago,
  createMedioPago,
  updateMedioPago,
  deleteMedioPago,
} from '@/app/api/dataFetcher'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CashBoxForm } from '@/components/forms/cashbox-form'
import { formatCurrency } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface MedioPago {
  id: number
  name: string
  requires_approval: boolean
  affects_cashbox: boolean
}

interface MedioPagoForm {
  name: string
  requires_approval: boolean
  affects_cashbox: boolean
}

// Define CashBoxes type since it's not exported from @prisma/client
interface CashBoxes {
  id: number
  local_name: string
  current_balance: number
  last_updated: Date
  store_id: number
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Payment methods state
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([])
  const [isLoadingMediosPago, setIsLoadingMediosPago] = useState(true)
  const [isSubmittingMediosPago, setIsSubmittingMediosPago] = useState(false)
  const [isMediosPagoDialogOpen, setIsMediosPagoDialogOpen] = useState(false)
  const [selectedMedioPago, setSelectedMedioPago] = useState<MedioPago | null>(
    null
  )
  const [medioPagoForm, setMedioPagoForm] = useState<MedioPagoForm>({
    name: '',
    requires_approval: false,
    affects_cashbox: true,
  })

  const [cashboxes, setCashboxes] = useState<CashBoxes[]>([])
  const [isLoadingCashboxes, setIsLoadingCashboxes] = useState(false)
  const [isCashboxDialogOpen, setIsCashboxDialogOpen] = useState(false)
  const [selectedCashbox, setSelectedCashbox] = useState<CashBoxes | null>(null)
  const [selectedStoreForCashbox, setSelectedStoreForCashbox] =
    useState<Store | null>(null)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        await fetchStores()
        await fetchMediosPagoData()
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar los datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Add a separate useEffect to handle cashbox fetching when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreForCashbox) {
      setSelectedStoreForCashbox(stores[0])
      fetchCashboxes(stores[0].id)
    }
  }, [stores])

  const fetchStores = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/stores')

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor inicie sesión.')
        }
        throw new Error(errorData.error || 'Error al cargar las tiendas')
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido')
      }

      setStores(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar las tiendas'
      setError(message)
      toast.error(message)
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMediosPagoData = async () => {
    try {
      setIsLoadingMediosPago(true)
      const data = await fetchMediosPago()
      setMediosPago(data)
    } catch (error) {
      toast.error('Error al cargar los medios de pago')
      console.error('Error loading payment methods:', error)
    } finally {
      setIsLoadingMediosPago(false)
    }
  }

  const handleMedioPagoInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setMedioPagoForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetMedioPagoForm = () => {
    setMedioPagoForm({
      name: '',
      requires_approval: false,
      affects_cashbox: true,
    })
    setSelectedMedioPago(null)
  }

  const handleCreateMedioPago = async () => {
    try {
      if (!medioPagoForm.name) {
        toast.error('Por favor ingrese el nombre del medio de pago')
        return
      }

      setIsSubmittingMediosPago(true)
      await createMedioPago(medioPagoForm)
      toast.success('Medio de pago creado exitosamente')
      resetMedioPagoForm()
      setIsMediosPagoDialogOpen(false)
      await fetchMediosPagoData()
    } catch (error) {
      toast.error('Error al crear el medio de pago')
      console.error('Error creating payment method:', error)
    } finally {
      setIsSubmittingMediosPago(false)
    }
  }

  const handleEditMedioPago = async (id: number) => {
    try {
      if (!medioPagoForm.name) {
        toast.error('Por favor ingrese el nombre del medio de pago')
        return
      }

      setIsSubmittingMediosPago(true)
      await updateMedioPago(id, medioPagoForm)
      toast.success('Medio de pago actualizado exitosamente')
      resetMedioPagoForm()
      setIsMediosPagoDialogOpen(false)
      await fetchMediosPagoData()
    } catch (error) {
      toast.error('Error al actualizar el medio de pago')
      console.error('Error updating payment method:', error)
    } finally {
      setIsSubmittingMediosPago(false)
    }
  }

  const handleDeleteMedioPago = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar este medio de pago?')) {
      return
    }

    try {
      setIsSubmittingMediosPago(true)
      await deleteMedioPago(id)
      toast.success('Medio de pago eliminado exitosamente')
      await fetchMediosPagoData()
    } catch (error) {
      toast.error('Error al eliminar el medio de pago')
      console.error('Error deleting payment method:', error)
    } finally {
      setIsSubmittingMediosPago(false)
    }
  }

  const handleEditMedioPagoClick = (medio: MedioPago) => {
    setSelectedMedioPago(medio)
    setMedioPagoForm({
      name: medio.name,
      requires_approval: medio.requires_approval,
      affects_cashbox: medio.affects_cashbox,
    })
    setIsMediosPagoDialogOpen(true)
  }

  const handleEditStore = (store: Store) => {
    setSelectedStore(store)
    setIsDialogOpen(true)
  }

  const handleNewStore = () => {
    setSelectedStore(null)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'success',
      INACTIVE: 'destructive',
      MAINTENANCE: 'warning',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  const fetchCashboxes = async (storeId: number) => {
    try {
      setIsLoadingCashboxes(true)
      const response = await fetch(`/api/caja/cashboxes?storeId=${storeId}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error response:', errorData)
        throw new Error('Error al cargar las cajas')
      }

      const data = await response.json()
      setCashboxes(data)
    } catch (error) {
      console.error('Error fetching cashboxes:', error)
      toast.error('Error al cargar las cajas')
      setCashboxes([])
    } finally {
      setIsLoadingCashboxes(false)
    }
  }

  const handleDeleteCashbox = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta caja?')) {
      return
    }

    try {
      const response = await fetch(`/api/caja/cashboxes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la caja')
      }

      toast.success('Caja eliminada exitosamente')
      if (selectedStoreForCashbox) {
        fetchCashboxes(selectedStoreForCashbox.id)
      }
    } catch (error) {
      console.error('Error deleting cashbox:', error)
      toast.error('Error al eliminar la caja')
    }
  }

  const handleEditCashbox = (cashbox: CashBoxes) => {
    setSelectedCashbox(cashbox)
    setIsCashboxDialogOpen(true)
  }

  const handleNewCashbox = (store: Store) => {
    setSelectedStoreForCashbox(store)
    setSelectedCashbox(null)
    setIsCashboxDialogOpen(true)
    // Fetch cashboxes for the selected store
    fetchCashboxes(store.id)
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '-'
      }
      return format(date, 'PPP', { locale: es })
    } catch (error) {
      return '-'
    }
  }

  const handleAccordionChange = (value: string) => {
    if (value) {
      const storeId = parseInt(value)
      const store = stores.find((s) => s.id === storeId)
      if (store) {
        setSelectedStoreForCashbox(store)
        fetchCashboxes(store.id)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Accordion
        type="multiple"
        className="w-full"
        onValueChange={(value) => {
          if (value.includes('cajas')) {
            const storeId = selectedStoreForCashbox?.id
            if (storeId) {
              fetchCashboxes(storeId)
            }
          }
        }}
      >
        {/* Tiendas Section */}
        <AccordionItem value="tiendas">
          <AccordionTrigger className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Tiendas
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gestiona las tiendas y sus configuraciones
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {stores.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No hay tiendas registradas
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Comienza creando una nueva tienda
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Moneda</TableHead>
                        <TableHead>IVA</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Última Actualización</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">
                            {store.name}
                          </TableCell>
                          <TableCell>{store.address || '-'}</TableCell>
                          <TableCell>{store.phone || '-'}</TableCell>
                          <TableCell>{store.email || '-'}</TableCell>
                          <TableCell>{store.currency}</TableCell>
                          <TableCell>{store.tax_rate}%</TableCell>
                          <TableCell>{getStatusBadge(store.status)}</TableCell>
                          <TableCell>{formatDate(store.updated_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStore(store)}
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Editar tienda</span>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleNewStore} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Tienda
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Medios de Pago Section */}
        <AccordionItem value="medios-pago">
          <AccordionTrigger className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Medios de Pago
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona los medios de pago disponibles
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {isLoadingMediosPago ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mediosPago.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay medios de pago registrados.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Requiere Aprobación</TableHead>
                        <TableHead>Afecta Caja</TableHead>
                        <TableHead className="text-end">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mediosPago.map((medio) => (
                        <TableRow key={medio.id}>
                          <TableCell className="text-left font-medium">
                            {medio.id}
                          </TableCell>
                          <TableCell>{medio.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {medio.requires_approval ? (
                                <div className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" />
                                  <span>Sí</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  No
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {medio.affects_cashbox ? (
                                <div className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" />
                                  <span>Sí</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  No
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMedioPagoClick(medio)}
                                disabled={isSubmittingMediosPago}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedioPago(medio.id)}
                                disabled={isSubmittingMediosPago}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end">
                <Dialog
                  open={isMediosPagoDialogOpen}
                  onOpenChange={setIsMediosPagoDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        resetMedioPagoForm()
                        setSelectedMedioPago(null)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo Medio de Pago
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedMedioPago
                          ? 'Editar Medio de Pago'
                          : 'Nuevo Medio de Pago'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Nombre
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Nombre del medio de pago"
                          value={medioPagoForm.name}
                          onChange={handleMedioPagoInputChange}
                          maxLength={100}
                          disabled={isSubmittingMediosPago}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requires_approval"
                          name="requires_approval"
                          checked={medioPagoForm.requires_approval}
                          onCheckedChange={(
                            checked: boolean | 'indeterminate'
                          ) =>
                            setMedioPagoForm((prev) => ({
                              ...prev,
                              requires_approval: checked === true,
                            }))
                          }
                          disabled={isSubmittingMediosPago}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="requires_approval"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Requiere aprobación administrativa
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Los pagos con este método deberán ser aprobados por
                            un administrador
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="affects_cashbox"
                          name="affects_cashbox"
                          checked={medioPagoForm.affects_cashbox}
                          onCheckedChange={(
                            checked: boolean | 'indeterminate'
                          ) =>
                            setMedioPagoForm((prev) => ({
                              ...prev,
                              affects_cashbox: checked === true,
                            }))
                          }
                          disabled={isSubmittingMediosPago}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="affects_cashbox"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Afecta al balance de la caja
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Los pagos con este método afectarán al balance de la
                            caja
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() =>
                            selectedMedioPago
                              ? handleEditMedioPago(selectedMedioPago.id)
                              : handleCreateMedioPago()
                          }
                          disabled={isSubmittingMediosPago}
                          className="flex items-center"
                        >
                          {isSubmittingMediosPago && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {selectedMedioPago ? 'Actualizar' : 'Crear'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsMediosPagoDialogOpen(false)}
                          disabled={isSubmittingMediosPago}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cajas Section */}
        <AccordionItem value="cajas">
          <AccordionTrigger className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Cajas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona las cajas de las tiendas
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay tiendas disponibles para gestionar cajas.
                  </p>
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                  onValueChange={handleAccordionChange}
                >
                  {stores.map((store) => (
                    <AccordionItem key={store.id} value={store.id.toString()}>
                      <AccordionTrigger className="text-lg font-medium">
                        {store.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {isLoadingCashboxes &&
                          selectedStoreForCashbox?.id === store.id ? (
                            <div className="flex items-center justify-center h-32">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Saldo Actual</TableHead>
                                    <TableHead>Última Actualización</TableHead>
                                    <TableHead className="w-[80px]">
                                      Acciones
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cashboxes
                                    .filter((cb) => cb.store_id === store.id)
                                    .map((cashbox) => (
                                      <TableRow key={cashbox.id}>
                                        <TableCell className="font-medium">
                                          {cashbox.local_name}
                                        </TableCell>
                                        <TableCell>
                                          {formatCurrency(
                                            cashbox.current_balance.toString()
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {formatDate(cashbox.last_updated)}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex space-x-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleEditCashbox(cashbox)
                                              }
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteCashbox(cashbox.id)
                                              }
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleNewCashbox(store)}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Nueva Caja
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-semibold">
                {selectedStore ? 'Editar Tienda' : 'Nueva Tienda'}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {selectedStore
                  ? 'Modifica los datos de la tienda seleccionada.'
                  : 'Completa los datos para crear una nueva tienda.'}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-0">
              <StoreForm
                store={selectedStore}
                onSuccess={() => {
                  setIsDialogOpen(false)
                  fetchStores()
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cashbox Dialog */}
      <Dialog open={isCashboxDialogOpen} onOpenChange={setIsCashboxDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-semibold">
                {selectedCashbox ? 'Editar Caja' : 'Nueva Caja'}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {selectedCashbox
                  ? 'Modifica los datos de la caja seleccionada.'
                  : 'Completa los datos para crear una nueva caja.'}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-0">
              {selectedStoreForCashbox && (
                <CashBoxForm
                  storeId={selectedStoreForCashbox.id}
                  cashbox={selectedCashbox}
                  onSuccess={() => {
                    setIsCashboxDialogOpen(false)
                    if (selectedStoreForCashbox) {
                      fetchCashboxes(selectedStoreForCashbox.id)
                    }
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
