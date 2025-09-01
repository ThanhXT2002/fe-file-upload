import { ChartAreaInteractive } from '~/components/chart-area-interactive'
import { SectionCards } from '~/components/section-cards'

export default function DashboardIndex(){
  return (
    <div>
      <SectionCards />
      <div className="px-4 lg:px-6 mt-5">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
