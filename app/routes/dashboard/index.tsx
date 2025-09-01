import React from 'react'
import { ChartAreaInteractive } from '~/components/chart-area-interactive'
import { SectionCards } from '~/components/section-cards'

export default function DashboardIndex(){
  return (
    <div>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
