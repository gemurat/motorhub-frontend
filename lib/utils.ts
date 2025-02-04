export function capitalizeFirstLetter(val: string) {
  if (!val) return ''
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
}
export function formatCurrency(value: string) {
  const numberValue = parseFloat(value)
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(numberValue)
}
const statusTranslations: { [key: string]: string } = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export function translateStatus(status: string): string {
  return statusTranslations[status] || status
}
export const selectStatusItems = [
  { key: '1', value: 'PENDING', label: 'Pendiente' },
  { key: '2', value: 'COMPLETED', label: 'Completado' },
  { key: '3', value: 'CANCELLED', label: 'Cancelado' },
]
