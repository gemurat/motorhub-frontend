import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Dashboard from './components/Dashboard'

export default withPageAuthRequired(async function Page() {
  return <Dashboard />
}, {
  returnTo: '/reportes'
})
