import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export function useCustomSession() {
  const { user, isLoading, error } = useUser()
  const [role, setRole] = useState<string | null>(null)
  const [isRoleLoading, setIsRoleLoading] = useState(true)

  // Function to refresh session
  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to refresh session')
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  // Function to fetch role
  const fetchRole = async () => {
    try {
      const response = await fetch('/api/user/role')
      if (!response.ok) {
        throw new Error('Failed to fetch user role')
      }
      const data = await response.json()
      return data.role
    } catch (err) {
      console.error('Error fetching role:', err)
      return null
    }
  }

  // Set up session refresh interval
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshSession, 30 * 60 * 1000) // Refresh every 30 minutes
      return () => clearInterval(interval)
    }
  }, [user])

  // Fetch and cache role
  useEffect(() => {
    async function loadRole() {
      if (user) {
        try {
          const userRole = await fetchRole()
          setRole(userRole)
        } catch (err) {
          console.error('Error loading user role:', err)
        } finally {
          setIsRoleLoading(false)
        }
      } else {
        setIsRoleLoading(false)
      }
    }

    loadRole()
  }, [user])

  return {
    user,
    role,
    isLoading: isLoading || isRoleLoading,
    error: error || null,
    refreshSession,
  }
}
