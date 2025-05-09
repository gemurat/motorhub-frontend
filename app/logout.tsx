'use client'

import { Button } from '@nextui-org/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Logout() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()

      // Clear all cookies
      document.cookie.split(';').forEach((cookie) => {
        const [name] = cookie.split('=')
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })

      // Force a hard redirect to the Auth0 logout endpoint
      window.location.href = `/api/auth/logout?returnTo=${encodeURIComponent('/')}`
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <Button
      color="primary"
      variant="flat"
      className="text-sm"
      onClick={handleLogout}
    >
      Logout
    </Button>
  )
}
