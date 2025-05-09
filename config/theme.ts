import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const themeConfig = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-800',
  },
}
