import { title } from '@/components/primitives'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'

async function AboutPage() {
  return (
    <div>
      <h1 className={title()}>reportes</h1>
      {/* <DonutChartLabelExample /> */}
    </div>
  )
}

export default withPageAuthRequired(AboutPage)
