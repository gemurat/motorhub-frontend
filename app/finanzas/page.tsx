import { withPageAuthRequired } from '@auth0/nextjs-auth0'

async function Finanzas() {
  return (
    <div>
      <h1>Finanzas</h1>
    </div>
  )
}

export default withPageAuthRequired(Finanzas)
