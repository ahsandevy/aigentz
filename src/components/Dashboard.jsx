import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Header from './Header'
import { useModal } from '../context/ModalContext'
import {
  performanceExplorerQueriesAreFresh,
  getPerformanceExplorerLatestDataUpdatedAt,
} from '../hooks/usePerformanceData'
import {
  AI_RECOMMENDATIONS_APPLIED_LIMIT,
  aiRecommendationsQueriesAreFresh,
  getAIRecommendationsLatestDataUpdatedAt,
} from '../hooks/aiRecommendationsQueryUtils'
import {
  executiveBriefQueriesAreFresh,
  getExecutiveBriefLatestDataUpdatedAt,
  EXECUTIVE_BRIEF_QUERY_KEY,
} from '../hooks/executiveBriefQueryUtils'
import AIExecutiveBrief from './AIExecutiveBrief'
import PerformanceExplorer from './PerformanceExplorer'
import AIRecommendations from './AIRecommendations'
import EfficiencyDrivers from './EfficiencyDrivers'
import ChangeControl from './ChangeControl'
import WeeklyAISummary from './WeeklyAISummary'
import CampaignLevelInfo from './CampaignLevelInfo'

function RefreshableSection({ title, onRefresh, extraControls = null, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1e4a79]">{title}</h3>
        <div className="flex items-center gap-2">
          {extraControls}
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs px-3 py-1.5 rounded-md border border-[#c8d6e8] text-[#1e4a79] bg-white hover:bg-[#f4f8fe]"
          >
            Refresh
          </button>
        </div>
      </div>
      {children}
    </section>
  )
}

function formatRelativeAgo(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  if (sec < 60) return `${sec} second${sec === 1 ? '' : 's'}`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'}`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr} hour${hr === 1 ? '' : 's'}`
  const d = Math.floor(hr / 24)
  return `${d} day${d === 1 ? '' : 's'}`
}

function Dashboard() {
  const queryClient = useQueryClient()
  const { showSuccess } = useModal()
  const [selectedDays, setSelectedDays] = useState(30)
  const [efficiencyDriversDays, setEfficiencyDriversDays] = useState(7)
  const [performanceExplorerDays, setPerformanceExplorerDays] = useState(30)
  const [refreshKeys, setRefreshKeys] = useState({
    efficiencyDrivers: 0,
    changeControl: 0,
    weeklySummary: 0,
    performanceExplorer: 0,
    campaignLevelInfo: 0,
  })

  const refreshSection = (section) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [section]: prev[section] + 1,
    }))
  }

  const handleWeeklySummarySectionRefresh = () => {
    refreshSection('weeklySummary')
  }

  const handleExecutiveBriefSectionRefresh = () => {
    if (executiveBriefQueriesAreFresh(queryClient)) {
      const latest = getExecutiveBriefLatestDataUpdatedAt(queryClient)
      const ago =
        latest != null ? formatRelativeAgo(Date.now() - latest) : 'just now'
      void showSuccess(
        'Executive Brief is still fresh',
        `Your data was last loaded ${ago} ago and is still within the 24-hour freshness window, so no new requests were sent. Try again later, or use Refresh inside the brief to force a full regeneration from the server.`,
        'OK'
      )
      return
    }
    void queryClient.invalidateQueries({ queryKey: EXECUTIVE_BRIEF_QUERY_KEY })
  }

  const handleAIRecommendationsSectionRefresh = () => {
    if (aiRecommendationsQueriesAreFresh(queryClient, selectedDays, AI_RECOMMENDATIONS_APPLIED_LIMIT)) {
      const latest = getAIRecommendationsLatestDataUpdatedAt(
        queryClient,
        selectedDays,
        AI_RECOMMENDATIONS_APPLIED_LIMIT
      )
      const ago =
        latest != null ? formatRelativeAgo(Date.now() - latest) : 'just now'
      void showSuccess(
        'AI Recommendations are still fresh',
        `Your data was last loaded ${ago} ago and is still within the 24-hour freshness window, so no new requests were sent. Try again later, or change the header date range if priorities should use a different period.`,
        'OK'
      )
      return
    }
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['budget-reallocation'] }),
      queryClient.invalidateQueries({ queryKey: ['creative-analysis'] }),
      queryClient.invalidateQueries({ queryKey: ['placement-optimization'] }),
      queryClient.invalidateQueries({ queryKey: ['audience-optimization'] }),
      queryClient.invalidateQueries({ queryKey: ['bidding-strategy-optimization'] }),
      queryClient.invalidateQueries({ queryKey: ['dayparting-optimization'] }),
      queryClient.invalidateQueries({
        queryKey: ['all-recommendations-priorities', selectedDays],
      }),
      queryClient.invalidateQueries({
        queryKey: ['applied-recommendations', AI_RECOMMENDATIONS_APPLIED_LIMIT],
      }),
    ])
  }

  const handlePerformanceExplorerSectionRefresh = () => {
    if (performanceExplorerQueriesAreFresh(queryClient, performanceExplorerDays)) {
      const latest = getPerformanceExplorerLatestDataUpdatedAt(
        queryClient,
        performanceExplorerDays
      )
      const ago =
        latest != null ? formatRelativeAgo(Date.now() - latest) : 'just now'
      void showSuccess(
        'Performance Explorer is still fresh',
        `Your data was last loaded ${ago} ago and is still within the 5-minute freshness window, so no new requests were sent. Try again in a little while, or change the date range to reload a different period.`,
        'OK'
      )
      return
    }
    refreshSection('performanceExplorer')
  }

  // TEMP DEBUG SWITCH: keep only Header active.
  // true  -> only Header renders
  // false -> full dashboard renders normally
  const HEADER_ONLY_DEBUG_MODE = false

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
      <Header days={selectedDays} onDaysChange={setSelectedDays} />

      {!HEADER_ONLY_DEBUG_MODE && (
        <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
          <RefreshableSection
            title="Executive Brief"
            onRefresh={handleExecutiveBriefSectionRefresh}
          >
            <AIExecutiveBrief days={selectedDays} />
          </RefreshableSection>

          <RefreshableSection
            title="AI Recommendations"
            onRefresh={handleAIRecommendationsSectionRefresh}
          >
            <AIRecommendations days={selectedDays} />
          </RefreshableSection>

          <RefreshableSection
            title="Efficiency Drivers"
            onRefresh={() => refreshSection('efficiencyDrivers')}
            extraControls={
              <select
                value={efficiencyDriversDays}
                onChange={(e) => setEfficiencyDriversDays(Number(e.target.value))}
                className="text-xs px-2 py-1.5 rounded-md border border-[#c8d6e8] text-[#1e4a79] bg-white"
                aria-label="Efficiency Drivers days"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            }
          >
            <EfficiencyDrivers
              days={efficiencyDriversDays}
              key={`efficiency-drivers-${refreshKeys.efficiencyDrivers}-${efficiencyDriversDays}`}
            />
          </RefreshableSection>

          <RefreshableSection title="Change Control" onRefresh={() => refreshSection('changeControl')}>
            <ChangeControl key={`change-control-${refreshKeys.changeControl}`} />
          </RefreshableSection>

          <RefreshableSection
            title="Weekly AI Summary"
            onRefresh={handleWeeklySummarySectionRefresh}
          >
            <WeeklyAISummary
              days={selectedDays}
              key={`weekly-summary-${refreshKeys.weeklySummary}-${selectedDays}`}
            />
          </RefreshableSection>
          <RefreshableSection
            title="Performance Explorer"
            onRefresh={handlePerformanceExplorerSectionRefresh}
            extraControls={
              <select
                value={performanceExplorerDays}
                onChange={(e) => setPerformanceExplorerDays(Number(e.target.value))}
                className="text-xs px-2 py-1.5 rounded-md border border-[#c8d6e8] text-[#1e4a79] bg-white"
                aria-label="Performance Explorer days"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            }
          >
            <PerformanceExplorer
              days={performanceExplorerDays}
              key={`performance-explorer-${refreshKeys.performanceExplorer}-${performanceExplorerDays}`}
            />
          </RefreshableSection>
          <RefreshableSection title="Campaign Level Info" onRefresh={() => refreshSection('campaignLevelInfo')}>
            <CampaignLevelInfo key={`campaign-level-info-${refreshKeys.campaignLevelInfo}`} />
          </RefreshableSection>
        </main>
      )}
      {HEADER_ONLY_DEBUG_MODE && (
        <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
          
        </main>
      )}
    </div>
  )
}

export default Dashboard


