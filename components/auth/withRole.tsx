import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { userRole } from '@/actions/userRole'
import { redirect } from 'next/navigation'

export function withRole(roles: string[]) {
  return function withRoleWrapper(Component: React.ComponentType) {
    return withPageAuthRequired(async function WithRoleWrapper() {
      const role = await userRole()

      if (!roles.includes(role)) {
        redirect('/unauthorized')
      }

      return <Component />
    })
  }
}
