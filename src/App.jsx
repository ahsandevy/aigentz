import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import AIExecutiveBrief from './components/AIExecutiveBrief'
import PerformanceExplorer from './components/PerformanceExplorer'
import AIRecommendations from './components/AIRecommendations'
import EfficiencyDrivers from './components/EfficiencyDrivers'
import ChangeControl from './components/ChangeControl'
import WeeklyAISummary from './components/WeeklyAISummary'

// Create a query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
        <Header />

        <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
          <AIExecutiveBrief />
          <PerformanceExplorer />
          <AIRecommendations />
          <EfficiencyDrivers />
          <ChangeControl />
          <WeeklyAISummary />
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
