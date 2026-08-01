import { useState, useEffect, useMemo } from 'react'
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
} from '../hooks/executiveBriefQueryUtils'
import AIExecutiveBrief from './AIExecutiveBrief'
import PerformanceExplorer from './PerformanceExplorer'
import AIRecommendations from './AIRecommendations'
import EfficiencyDrivers from './EfficiencyDrivers'
import ChangeControl from './ChangeControl'
import WeeklyAISummary from './WeeklyAISummary'
import {
  weeklySummaryQueryIsFresh,
  getWeeklySummaryLatestDataUpdatedAt,
} from '../hooks/useWeeklySummary'
import {
  efficiencyDriversQueryIsFresh,
  getEfficiencyDriversLatestDataUpdatedAt,
} from '../hooks/efficiencyDriversQueryUtils'

function RefreshableSection({ title, onRefresh, extraControls = null, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1e4a79]">{title}</h3>
        <div className="flex items-center gap-2">
          {extraControls}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e4a79] text-white rounded-lg hover:bg-[#1e3a69] transition-colors"
              title={`Refresh ${title}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">Refresh</span>
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

function FreshnessBanner({ ago }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#dbeafe] bg-[#f8fafc] px-4 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e4a79]/10">
        <svg className="h-4 w-4 text-[#1e4a79]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#334155]">
          Last loaded{' '}
          <span className="font-semibold text-[#1e4a79]">{ago} ago</span>
        </p>
        <p className="mt-0.5 text-xs text-[#64748b]">
          Still within the 24-hour freshness window — no reload needed.
        </p>
      </div>
    </div>
  )
}

function SectionWithFreshness({ freshnessAgo, children }) {
  return (
    <section className="mb-8">
      {freshnessAgo && <FreshnessBanner ago={freshnessAgo} />}
      {children}
    </section>
  )
}

function DeferredSectionPrompt({ title, onLoad }) {
  return (
    <div className="rounded-xl border border-dashed border-[#c8d6e8] bg-white/70 px-5 py-6 text-center">
      <p className="text-sm font-medium text-[#334155]">{title} loads on demand.</p>
      <p className="mt-1 text-xs text-[#64748b]">
        Load this analysis when you are ready to review it.
      </p>
      <button
        type="button"
        onClick={onLoad}
        className="mt-4 rounded-lg bg-[#1e4a79] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a69]"
      >
        Load {title}
      </button>
    </div>
  )
}

function getFreshnessAgo(latestUpdatedAt) {
  if (latestUpdatedAt == null) return null
  return formatRelativeAgo(Date.now() - latestUpdatedAt)
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
  const [efficiencyDriversDays, setEfficiencyDriversDays] = useState(30)
  const [performanceExplorerDays, setPerformanceExplorerDays] = useState(30)
  const [efficiencyDriversLoaded, setEfficiencyDriversLoaded] = useState(true)
  const [performanceExplorerLoaded, setPerformanceExplorerLoaded] = useState(true)
  const [freshnessTick, setFreshnessTick] = useState(0)
  const [refreshKeys, setRefreshKeys] = useState({
    efficiencyDrivers: 0,
    changeControl: 0,
    weeklySummary: 0,
    performanceExplorer: 0,
  })

  useEffect(() => {
    const id = setInterval(() => setFreshnessTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const executiveBriefFreshnessAgo = useMemo(() => {
    if (!executiveBriefQueriesAreFresh(queryClient)) return null
    return getFreshnessAgo(getExecutiveBriefLatestDataUpdatedAt(queryClient))
  }, [queryClient, freshnessTick])

  const aiRecommendationsFreshnessAgo = useMemo(() => {
    if (!aiRecommendationsQueriesAreFresh(queryClient, selectedDays, AI_RECOMMENDATIONS_APPLIED_LIMIT)) {
      return null
    }
    return getFreshnessAgo(
      getAIRecommendationsLatestDataUpdatedAt(
        queryClient,
        selectedDays,
        AI_RECOMMENDATIONS_APPLIED_LIMIT
      )
    )
  }, [queryClient, selectedDays, freshnessTick])

  const refreshSection = (section) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [section]: prev[section] + 1,
    }))
  }

  const handleWeeklySummarySectionRefresh = () => {
    if (weeklySummaryQueryIsFresh(queryClient, selectedDays)) {
      const latest = getWeeklySummaryLatestDataUpdatedAt(queryClient, selectedDays)
      const ago =
        latest != null ? formatRelativeAgo(Date.now() - latest) : 'just now'
      void showSuccess(
        'Weekly Summary is still fresh',
        `Your data was last loaded ${ago} ago and is still within the 24-hour freshness window, so no new requests were sent. Try again later, or change the header date range to request another period.`,
        'OK'
      )
      return
    }
    refreshSection('weeklySummary')
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
        `Your data was last loaded ${ago} ago and is still within the 24-hour freshness window, so no new requests were sent. Try again later, or change the date range to reload a different period.`,
        'OK'
      )
      return
    }
    refreshSection('performanceExplorer')
  }

  const handleEfficiencyDriversSectionRefresh = () => {
    if (efficiencyDriversQueryIsFresh(queryClient, efficiencyDriversDays)) {
      const latest = getEfficiencyDriversLatestDataUpdatedAt(
        queryClient,
        efficiencyDriversDays
      )
      const ago =
        latest != null ? formatRelativeAgo(Date.now() - latest) : 'just now'
      void showSuccess(
        'Efficiency Drivers is still fresh',
        `Your data was last loaded ${ago} ago and is still within the 24-hour freshness window, so no new requests were sent. Try again later, or change the period dropdown to load a different range.`,
        'OK'
      )
      return
    }
    refreshSection('efficiencyDrivers')
  }

  // --- Local testing toggles (set all to false for normal dashboard; see comments) ---
  /** `true` → only Header + empty main (no dashboard sections). */
  const HEADER_ONLY_DEBUG_MODE = false
  /**
   * `true` → **only** Performance Explorer (no Header — no header-metrics / meta dropdown calls).
   * Other debug flags are ignored for layout. Set to `false` when done debugging.
   */
  const PERFORMANCE_EXPLORER_ONLY_DEBUG_MODE = false
  /**
   * `true` → full dashboard except Performance Explorer (PE hooks / HTTP skipped).
   * Ignored while `PERFORMANCE_EXPLORER_ONLY_DEBUG_MODE` is true (PE-only branch does not render Header).
   */
  const SKIP_PERFORMANCE_EXPLORER = false

  const performanceExplorerSection = (
    <RefreshableSection
      title="Performance Explorer"
      onRefresh={() => {
        setPerformanceExplorerLoaded(true)
        handlePerformanceExplorerSectionRefresh()
      }}
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
      {performanceExplorerLoaded || PERFORMANCE_EXPLORER_ONLY_DEBUG_MODE ? (
        <PerformanceExplorer
          days={performanceExplorerDays}
          key={`performance-explorer-${refreshKeys.performanceExplorer}-${performanceExplorerDays}`}
        />
      ) : (
        <DeferredSectionPrompt
          title="Performance Explorer"
          onLoad={() => setPerformanceExplorerLoaded(true)}
        />
      )}
    </RefreshableSection>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white">
      {PERFORMANCE_EXPLORER_ONLY_DEBUG_MODE ? (
        <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
          <section className="mb-8 rounded-md border border-dashed border-sky-400/80 bg-sky-50/70 px-4 py-3 text-xs text-sky-950">
            Debug mode: Performance Explorer only — Header is not mounted (
            <code className="rounded bg-white/80 px-1">PERFORMANCE_EXPLORER_ONLY_DEBUG_MODE</code> in{' '}
            <code className="rounded bg-white/80 px-1">Dashboard.jsx</code>). Set it to{' '}
            <code className="rounded bg-white/80 px-1">false</code> to restore the full dashboard (including Header).
          </section>
          {performanceExplorerSection}
        </main>
      ) : (
        <>
          <Header days={selectedDays} onDaysChange={setSelectedDays} />

          {!HEADER_ONLY_DEBUG_MODE && (
            <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8">
              <SectionWithFreshness freshnessAgo={executiveBriefFreshnessAgo}>
                <AIExecutiveBrief days={selectedDays} />
              </SectionWithFreshness>

              <SectionWithFreshness freshnessAgo={aiRecommendationsFreshnessAgo}>
                <AIRecommendations days={selectedDays} />
              </SectionWithFreshness>

              <RefreshableSection
                title="Efficiency Drivers"
                onRefresh={() => {
                  setEfficiencyDriversLoaded(true)
                  handleEfficiencyDriversSectionRefresh()
                }}
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
                {efficiencyDriversLoaded ? (
                  <EfficiencyDrivers
                    days={efficiencyDriversDays}
                    key={`efficiency-drivers-${refreshKeys.efficiencyDrivers}-${efficiencyDriversDays}`}
                  />
                ) : (
                  <DeferredSectionPrompt
                    title="Efficiency Drivers"
                    onLoad={() => setEfficiencyDriversLoaded(true)}
                  />
                )}
              </RefreshableSection>

              <RefreshableSection title="Change Control">
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
              {!SKIP_PERFORMANCE_EXPLORER && performanceExplorerSection}
              {SKIP_PERFORMANCE_EXPLORER && (
                <section className="mb-8 rounded-md border border-dashed border-amber-300/80 bg-amber-50/60 px-4 py-3 text-xs text-amber-900">
                  Performance Explorer is not mounted (<code className="rounded bg-white/80 px-1">SKIP_PERFORMANCE_EXPLORER</code> in{' '}
                  <code className="rounded bg-white/80 px-1">Dashboard.jsx</code>). Set it to <code className="rounded bg-white/80 px-1">false</code>{' '}
                  to restore.
                </section>
              )}
            </main>
          )}
          {HEADER_ONLY_DEBUG_MODE && (
            <main className="w-full md:w-[85%] mx-auto px-4 md:px-8 py-8"></main>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard


