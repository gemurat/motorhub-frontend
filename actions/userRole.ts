'use server'

import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma'

// Define types for better type safety
type UserRole = 'vendedor' | 'admin' | 'CAJERO' | 'unknown'

export async function userRole(): Promise<UserRole> {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return 'unknown'
    }

    // Get role directly from database
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        role: true,
      },
    })

    console.log('User role from DB:', user?.role) // Debug log

    if (!user?.role) {
      return 'unknown'
    }

    // Return the role exactly as it is in the database
    return user.role as UserRole
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'unknown'
  }
}
