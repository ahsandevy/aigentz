import { useState } from 'react'
import Header from './Header'
import AIExecutiveBrief from './AIExecutiveBrief'
import PerformanceExplorer from './PerformanceExplorer'
import AIRecommendations from './AIRecommendations'
import EfficiencyDrivers from './EfficiencyDrivers'
import ChangeControl from './ChangeControl'
import WeeklyAISummary from './WeeklyAISummary'

function Dashboard() {
  const [selectedDays, setSelectedDays] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
      <Header days={selectedDays} onDaysChange={setSelectedDays} />

      <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
        <AIExecutiveBrief days={selectedDays} />
        <PerformanceExplorer days={selectedDays} />
        <AIRecommendations days={selectedDays} />
        <EfficiencyDrivers days={selectedDays} />
        <ChangeControl />
        <WeeklyAISummary days={selectedDays} />
      </main>
    </div>
  )
}

export default Dashboard


