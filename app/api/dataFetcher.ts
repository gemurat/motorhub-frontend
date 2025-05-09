'use client'

export const fetchBrands = async () => {
  const response = await fetch('/api/getBrand')
  if (!response.ok) {
    throw new Error('Failed to fetch brands')
  }
  return response.json()
}

export const fetchModels = async () => {
  const response = await fetch('/api/getModel')
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return response.json()
}

export const fetchCategory = async () => {
  const response = await fetch('/api/getCategory')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export const fetchMediosPago = async () => {
  const response = await fetch('/api/getMediosPago')
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods')
  }
  return response.json()
}

export const createMedioPago = async (data: {
  name: string
  requires_approval: boolean
  affects_cashbox: boolean
}) => {
  const response = await fetch('/api/mediosPago', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create payment method')
  }
  return response.json()
}

export const updateMedioPago = async (
  id: number,
  data: { name: string; requires_approval: boolean; affects_cashbox: boolean }
) => {
  const response = await fetch(`/api/mediosPago/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update payment method')
  }
  return response.json()
}

export const deleteMedioPago = async (id: number) => {
  const response = await fetch(`/api/mediosPago/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete payment method')
  }
  return response.json()
}
