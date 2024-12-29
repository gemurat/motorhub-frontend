import { withPageAuthRequired } from '@auth0/nextjs-auth0'

async function Caja() {
  return (
    <div>
      <h1>Caja</h1>
    </div>
  )
}
export default withPageAuthRequired(Caja)
