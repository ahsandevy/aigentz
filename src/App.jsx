import Header from './components/Header'
import AIExecutiveBrief from './components/AIExecutiveBrief'
import PerformanceExplorer from './components/PerformanceExplorer'
import AIRecommendations from './components/AIRecommendations'
import EfficiencyDrivers from './components/EfficiencyDrivers'
import ChangeControl from './components/ChangeControl'
import WeeklyAISummary from './components/WeeklyAISummary'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
      <Header />

      <main className="w-[85%] mx-auto px-8 py-8">
        <AIExecutiveBrief />
        <PerformanceExplorer />
        <AIRecommendations />
        <EfficiencyDrivers />
        <ChangeControl />
        <WeeklyAISummary />
      </main>
    </div>
  )
}

export default App
