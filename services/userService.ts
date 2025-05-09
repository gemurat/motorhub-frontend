import { getSession } from '@auth0/nextjs-auth0'
import { getUsersRoles } from '@/actions/getUsersRoles'
import { prisma } from '@/lib/prisma'

export class UserService {
  static async syncUserWithDatabase() {
    try {
      const session = await getSession()
      if (!session?.user?.email) {
        throw new Error('No authenticated user found')
      }

      // Check if user exists in database first
      const existingUser = await prisma.users.findUnique({
        where: {
          email: session.user.email,
        },
      })

      // If user exists and has a role, return early
      if (existingUser?.role) {
        return existingUser
      }

      // Only fetch roles from Auth0 if we need to create/update the user
      const userRoles = await getUsersRoles()
      if (!userRoles.roles || !Array.isArray(userRoles.roles)) {
        throw new Error('Invalid user roles data')
      }

      // Normalize role names
      const normalizedRoles = userRoles.roles.map((role) => ({
        ...role,
        name: role.name.toLowerCase().trim(),
      }))

      // Update or create user with Auth0 data
      const user = await prisma.users.upsert({
        where: {
          email: session.user.email,
        },
        update: {
          username: session.user.email,
          role: normalizedRoles[0].name,
        },
        create: {
          username: session.user.email,
          email: session.user.email,
          role: normalizedRoles[0].name,
          status: 'ACTIVE',
        },
      })

      return user
    } catch (error) {
      throw error
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      })
      return user
    } catch (error) {
      throw error
    }
  }

  static async updateUserLastLogin(email: string) {
    try {
      const user = await prisma.users.update({
        where: {
          email: email,
        },
        data: {
          last_login: new Date(),
        },
      })
      return user
    } catch (error) {
      throw error
    }
  }
}
