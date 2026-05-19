import { useState, useMemo, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { usePerformanceExplorer } from '../hooks/usePerformanceData'

function PerformanceExplorer({ days = 30 }) {
  const [activeTab, setActiveTab] = useState('Campaigns')
  const [search, setSearch] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedAI, setSelectedAI] = useState(null)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [selectedScalingItem, setSelectedScalingItem] = useState(null)

  const {
    campaigns,
    adSets,
    ads,
    audiences,
    campaignsLoading,
    adSetsLoading,
    adsLoading,
    audiencesLoading,
    refreshAudienceLLM,
    refreshingAudienceIds,
    refreshAllAudiencesLLM,
    isRefreshingAll,
  } = usePerformanceExplorer(days)

  // Per-tab loading: each panel shows data as soon as its own query finishes; other tabs still show loading when selected.
  const loading = useMemo(() => {
    switch (activeTab) {
      case 'Campaigns':
        return campaignsLoading
      case 'Ad Sets':
        return adSetsLoading
      case 'Ads':
        return adsLoading
      case 'Audiences':
        return audiencesLoading
      default:
        return false
    }
  }, [activeTab, campaignsLoading, adSetsLoading, adsLoading, audiencesLoading])

  const isTabDataLoading = (tab) => {
    switch (tab) {
      case 'Campaigns':
        return campaignsLoading
      case 'Ad Sets':
        return adSetsLoading
      case 'Ads':
        return adsLoading
      case 'Audiences':
        return audiencesLoading
      default:
        return false
    }
  }

  const handleAIRequest = async (campaignId) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAIRecommendation(campaignId, days)
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching AI recommendation:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAdSetAIRequest = async (adsetId) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAdSetAIRecommendation(adsetId, days)
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching AdSet AI recommendation:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAdAIRequest = async (adId) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAdAIAnalysis(adId, days)
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching Ad AI analysis:', error)
    } finally {
      setAiLoading(false)
    }
  }

  // Handle refresh with selected assessment update
  const handleRefreshAudienceLLM = (audienceId) => {
    refreshAudienceLLM(audienceId)
  }

  const handleRefreshAllAudiencesLLM = () => {
    const allAudienceIds = audiences.map(aud => aud.audience_id || aud.id).filter(Boolean)
    if (allAudienceIds.length === 0) return
    refreshAllAudiencesLLM(allAudienceIds)
  }

  // Update selectedAssessment when audiences data changes (after refresh)
  useEffect(() => {
    if (selectedAssessment && audiences.length > 0) {
      const updated = audiences.find(aud =>
        (aud.audience_id === selectedAssessment.audience_id || aud.id === selectedAssessment.id) ||
        (selectedAssessment.audience_id && aud.audience_id === selectedAssessment.audience_id) ||
        (selectedAssessment.id && aud.id === selectedAssessment.id)
      )
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedAssessment)) {
        setSelectedAssessment(updated)
      }
    }
  }, [audiences, selectedAssessment])

  const handleAudienceAIRequest = async (aud) => {
    try {
      setAiLoading(true)
      setSelectedAI(null)
      const response = await analyticsAPI.getAudienceAIRecommendation({
        name: aud.name,
        role: aud.role,
        spend: aud.spend,
        roas: aud.roas,
        frequency: aud.frequency,
        size: aud.size,
        cpa: aud.cpa
      })
      setSelectedAI(response)
    } catch (error) {
      console.error('Error fetching audience AI:', error)
    } finally {
      setAiLoading(false)
    }
  }

  // Filter AdSets
  const filteredAdSets = useMemo(() => {
    return adSets.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.funnel_stage.toLowerCase().includes(search.toLowerCase())
    )
  }, [adSets, search])

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.funnel_stage.toLowerCase().includes(search.toLowerCase())
    )
  }, [campaigns, search])

  const filteredAds = useMemo(() => {
    return ads.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.format && a.format.toLowerCase().includes(search.toLowerCase()))
    )
  }, [ads, search])

  const filteredAudiences = useMemo(() => {
    const filtered = audiences.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
    )
    // Sort by audience_size (highest first), with null/undefined values at the bottom
    return filtered.sort((a, b) => {
      const sizeA = a.audience_size ?? a.assessment?.audience_characteristics?.size ?? null
      const sizeB = b.audience_size ?? b.assessment?.audience_characteristics?.size ?? null

      // Handle null/undefined values - put them at the bottom
      if (sizeA === null && sizeB === null) return 0
      if (sizeA === null) return 1
      if (sizeB === null) return -1

      // Sort descending (highest first)
      return sizeB - sizeA
    })
  }, [audiences, search])

  // Helper function to get assessment data with backward compatibility
  const getAssessment = (item) => {
    if (item.assessment) {
      return {
        summary: item.assessment.summary || item.assessment_summary || '',
        action: item.assessment.action || item.action || '',
        status: item.assessment.status || item.status_color || 'gray'
      }
    }
    // Fallback to old structure
    return {
      summary: item.assessment_summary || item.assessment || '',
      action: item.action || '',
      status: item.status_color || 'gray'
    }
  }

  // Helper function to truncate text for preview
  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  // Helper function to get ad assessment data
  const getAdAssessment = (ad) => {
    if (ad.assessment) {
      return {
        summary: ad.assessment.summary || '',
        // Status now based on creative_performance (new) or top-level status (fallback)
        status: ad.assessment.performance?.creative_performance?.status || ad.assessment.status || 'fair', // "excellent" | "good" | "fair" | "poor"
        fatigue: ad.assessment.creative?.fatigue_score || ad.fatigue || 0,
        fatigueLevel: ad.assessment.creative?.fatigue_level || 'normal'
      }
    }
    // Fallback to old structure
    return {
      summary: '',
      status: 'fair',
      fatigue: ad.fatigue || 0,
      fatigueLevel: ad.fatigue > 70 ? 'critical' : ad.fatigue > 40 ? 'high' : 'normal'
    }
  }

  // Helper function to get ad status color classes
  const getAdStatusClasses = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'good':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'fair':
        return 'bg-[#ffd89b] text-[#b45309]'
      case 'poor':
        return 'bg-[#ffa7a7] text-[#aa2929]'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  // Helper function to get readiness level color classes
  const getReadinessLevelClasses = (readinessLevel) => {
    switch (readinessLevel) {
      case 'ready_to_scale':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'optimizing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'needs_refresh':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'needs_different_approach':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  // Helper function to format date created/made live
  const formatDateCreated = (item) => {
    // Backend sends made_live_date as the primary field (ISO format string)
    // Falls back to other common date field names for backward compatibility
    const dateField = item.made_live_date || item.created_time || item.created_at || item.start_time || item.created_date || item.time_created || item.date_created
    if (!dateField) return 'N/A'

    try {
      const date = new Date(dateField)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  // Helper function to format audience size
  const formatAudienceSize = (size) => {
    if (size === null || size === undefined) return 'N/A'
    if (typeof size === 'string') return size // Already formatted
    if (typeof size === 'number') {
      if (size >= 1000000) {
        return `${(size / 1000000).toFixed(1)}M`
      } else if (size >= 1000) {
        return `${(size / 1000).toFixed(1)}K`
      }
      return size.toLocaleString()
    }
    return 'N/A'
  }

  // Helper function to get audience size (prioritizes audience_size from backend)
  const getAudienceSize = (audience) => {
    // Priority: audience_size > assessment.audience_characteristics.size > size (formatted string)
    if (audience.audience_size !== null && audience.audience_size !== undefined) {
      return formatAudienceSize(audience.audience_size)
    }
    if (audience.assessment?.audience_characteristics?.size !== null &&
      audience.assessment?.audience_characteristics?.size !== undefined) {
      return formatAudienceSize(audience.assessment.audience_characteristics.size)
    }
    // Fallback to formatted string if available
    return audience.size || 'N/A'
  }

  // Helper function to get audience assessment data
  const getAudienceAssessment = (audience) => {
    if (audience.assessment) {
      return {
        summary: audience.assessment.summary || '',
        readinessLevel: audience.assessment.readiness_level || 'optimizing', // "ready_to_scale" | "needs_refresh" | "needs_different_approach" | "optimizing"
        readinessReason: audience.assessment.readiness_reason || '',
        // Backward compatibility: map old status to readiness_level if needed
        status: audience.assessment.readiness_level || audience.assessment.status || 'optimizing'
      }
    }
    // Fallback to old structure
    return {
      summary: '',
      readinessLevel: 'optimizing',
      readinessReason: '',
      status: 'optimizing'
    }
  }

  // Helper function to get status text and background color classes
  const getStatusHoverColors = (status, action) => {
    // Check status first
    if (status === 'green') {
      return 'group-hover:!text-[#15803d] group-hover:!bg-[#c8f687]'
    }
    if (status === 'yellow') {
      return 'group-hover:!text-[#a26f05] group-hover:!bg-[#fee97e]'
    }
    if (status === 'red') {
      return 'group-hover:!text-[#aa2929] group-hover:!bg-[#ffa7a7]'
    }
    // Fallback to action-based colors for backward compatibility
    if (action === 'Scale Aggressively') {
      return 'group-hover:!text-[#15803d] group-hover:!bg-[#c8f687]'
    }
    if (action === 'Scale with Guard') {
      return 'group-hover:!text-[#a26f05] group-hover:!bg-[#fee97e]'
    }
    if (action === 'Fix Before Scaling') {
      return 'group-hover:!text-[#aa2929] group-hover:!bg-[#ffa7a7]'
    }
    // Default to blue if status is unknown
    return 'group-hover:!text-[#1e4a79] group-hover:!bg-blue-50'
  }

  const getStatusClasses = (actionOrStatus) => {
    // Handle new status-based system
    if (actionOrStatus === 'green') {
      return 'bg-[#c8f687] text-[#15803d]'
    }
    if (actionOrStatus === 'yellow') {
      return 'bg-[#fee97e] text-[#a26f05]'
    }
    if (actionOrStatus === 'red') {
      return 'bg-[#ffa7a7] text-[#aa2929]'
    }
    // Handle old action-based system (backward compatibility)
    switch (actionOrStatus) {
      case 'Scale Aggressively':
        return 'bg-[#c8f687] text-[#15803d]'
      case 'Scale with Guard':
        return 'bg-[#fee97e] text-[#a26f05]'
      case 'Fix Before Scaling':
        return 'bg-[#ffa7a7] text-[#aa2929]'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  const [isExpanded, setIsExpanded] = useState(false)

  // Reset expansion when tab changes
  useEffect(() => {
    setIsExpanded(false)
  }, [activeTab])

  // Helper to slice data
  const getDisplayData = (data) => {
    if (isExpanded) return data;
    return data.slice(0, 5);
  }

  return (
    <section className="mb-8 min-h-screen bg-[#f0f4f8] p-8">
      {/* ... Header and Search ... */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#1e4a79]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e4a79]">Performance Explorer</h2>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-[#c8c8a1] rounded-[30px] text-sm text-[#374151] shadow-sm focus:outline-none w-full md:w-64 focus:ring-1 focus:ring-[#1e4a79] focus:border-[#1e4a79] transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs - Floating Pill Style */}
      <div className="flex justify-center mb-10">
        <div className="bg-white border border-[#e2e8f0] rounded-full p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] inline-flex gap-2 overflow-x-auto max-w-full">
          {['Campaigns', 'Ad Sets', 'Ads', 'Audiences'].map((tab) => {
            const tabBusy = isTabDataLoading(tab)
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-busy={tabBusy}
                className={`px-10 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap text-[14px] inline-flex items-center justify-center gap-2 ${activeTab === tab
                  ? 'bg-[#f0f2b6] text-[#374151] shadow-sm'
                  : 'text-[#64748b] hover:text-[#1e4a79] hover:bg-gray-50'
                  }`}
              >
                {tab}
                {tabBusy && (
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#1e4a79] animate-pulse" title="Loading data…" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Data Table Area */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-2xl shadow-sm border border-[#e2e8f0]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4a79]"></div>
          </div>
        ) : activeTab === 'Ad Sets' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight">
                    <th className="px-6 py-6 text-left">Ad Set</th>
                    <th className="px-6 py-6 text-center hidden lg:table-cell">Made Live</th>
                    <th className="px-6 py-6 text-left">Audience Strategy</th>
                    <th className="px-6 py-6 text-center">Funnel Role</th>
                    <th className="px-6 py-6 text-center hidden lg:table-cell">Bid Strategy</th>
                    <th className="px-6 py-6 text-center">Budget</th>
                    <th className="px-6 py-6 text-center hidden md:table-cell">Status</th>
                    <th className="px-6 py-6 text-center hidden sm:table-cell">Ads</th>
                    <th className="px-6 py-6 text-center">AI Detection Signal</th>
                    <th className="px-6 py-6 text-center whitespace-nowrap">Assessment</th>
                    <th className="px-6 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAdSets).map((as) => {
                    const assessment = getAssessment(as)
                    return (
                      <tr key={as.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-8 text-[12px] text-[#334155] font-medium max-w-[220px] break-words">
                          {as.name}
                        </td>
                        <td className="px-6 py-8 text-center text-[11px] text-[#64748b] hidden lg:table-cell">
                          {formatDateCreated(as)}
                        </td>
                        <td className="px-6 py-8 text-[12px] text-[#64748b] font-medium">
                          {as.audience_type}
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="px-5 py-1 bg-white border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold rounded-full shadow-sm uppercase">
                              {as.funnel_stage}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center hidden lg:table-cell">
                          <div className="text-[11px] text-[#64748b] font-medium">
                            {as.bid_strategy ? (
                              <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                                {as.bid_strategy.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center text-[12px] text-[#64748b] font-bold tracking-tight">
                          {as.budget_readable}
                        </td>
                        <td className="px-6 py-8 text-center hidden md:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            {as.effective_status && (
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${as.effective_status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : as.effective_status === 'PAUSED'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {as.effective_status}
                              </span>
                            )}
                            {as.delivery_issues && as.delivery_issues.length > 0 && (
                              <span className="text-[9px] text-red-600 font-medium">
                                {as.delivery_issues.length} issue{as.delivery_issues.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center hidden sm:table-cell">
                          <div className="text-[12px] text-[#334155] font-medium">
                            {as.ad_count !== null && as.ad_count !== undefined ? (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold">
                                {as.ad_count}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center text-[12px] text-[#334155] leading-tight font-medium">
                            <div><span className="font-extrabold text-[#1e293b]">ROAS:</span> {as.roas}x</div>
                            <div><span className="font-extrabold text-[#1e293b]">CPA:</span> {as.cpa != null ? Number(as.cpa).toLocaleString() : 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center hidden md:table-cell">
                          <button
                            onClick={() => setSelectedAssessment(as)}
                            className={`text-[11px] text-gray-600 ${getStatusHoverColors(assessment.status, assessment.action)} hover:!text-[#1e4a79] hover:!bg-blue-50 transition-colors cursor-pointer text-left max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded`}
                            title={assessment.summary || 'Click to view full assessment'}
                          >
                            {assessment.summary ? truncateText(assessment.summary, 40) : 'No assessment available'}
                          </button>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <button
                            onClick={() => {
                              setSelectedScalingItem(as);
                              handleAdSetAIRequest(as.id);
                            }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${getStatusClasses(assessment.status || assessment.action)}`}
                          >
                            {assessment.action}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAdSets.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAdSets.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Ads' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-left">Ad</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Made Live</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden sm:table-cell">Format</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Fatigue</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Spend</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden md:table-cell">CTR</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Assessment</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Creative Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAds).map((ad) => {
                    const adAssessment = getAdAssessment(ad)
                    const fatigueScore = ad.assessment?.creative?.fatigue_score || ad.fatigue || 0
                    return (
                      <tr key={ad.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Ad Image */}
                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                              {ad.image_url ? (
                                <>
                                  <img
                                    src={ad.image_url}
                                    alt={ad.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.target
                                      const fallback = img.parentElement?.querySelector('.image-fallback')
                                      if (img) img.style.display = 'none'
                                      if (fallback) fallback.style.display = 'flex'
                                    }}
                                    onLoad={(e) => {
                                      const fallback = e.target.parentElement?.querySelector('.image-fallback')
                                      if (fallback) fallback.style.display = 'none'
                                    }}
                                  />
                                  <div className="image-fallback w-full h-full hidden items-center justify-center bg-gray-100 absolute inset-0">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {/* Ad Name and Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] sm:text-[12px] text-[#334155] font-medium break-words line-clamp-2">
                                  {ad.name}
                                </span>
                                <span className="sm:hidden">
                                  <span className={`px-2 py-0.5 bg-gray-100 rounded-full text-[9px] font-bold ${ad.format === 'Video' ? 'text-blue-600 bg-blue-50' : ad.format === 'Carousel' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}>
                                    {ad.format}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] hidden lg:table-cell">
                          {formatDateCreated(ad)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden sm:table-cell">
                          <span className={`px-2 sm:px-3 py-1 bg-gray-100 rounded-full font-bold text-[10px] sm:text-[11px] ${ad.format === 'Video' ? 'text-blue-600 bg-blue-50' : ad.format === 'Carousel' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}>
                            {ad.format}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold ${fatigueScore > 70 ? 'bg-red-100 text-red-700' : fatigueScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {fatigueScore}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-bold tracking-tight hidden lg:table-cell">
                          {ad.spend != null ? Number(ad.spend).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden md:table-cell">
                          {ad.ctr ? `${ad.ctr}%` : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">
                          {adAssessment.summary ? (
                            <button
                              onClick={() => setSelectedAssessment(ad)}
                              className="text-[10px] sm:text-[11px] text-gray-600 group-hover:!text-[#1e4a79] hover:!text-[#1e4a79] transition-colors cursor-pointer text-left max-w-[180px] sm:max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded"
                              title={adAssessment.summary || 'Click to view full assessment'}
                            >
                              {truncateText(adAssessment.summary, 35)}
                            </button>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] text-gray-400">No assessment</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => setSelectedAssessment(ad)}
                              className="lg:hidden text-[9px] text-[#1e4a79] font-bold underline hover:text-blue-600 transition-colors"
                            >
                              View
                            </button>
                            <span className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm whitespace-nowrap ${getAdStatusClasses(adAssessment.status)}`}>
                              {adAssessment.status?.toUpperCase() || 'FAIR'}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedScalingItem(ad);
                                handleAdAIRequest(ad.id);
                              }}
                              className="mt-1 px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                              AI Growth
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAds.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAds.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Audiences' ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-[#e2e8f0]">
              <h3 className="text-sm font-bold text-[#334155]">Audiences</h3>
              <button
                onClick={handleRefreshAllAudiencesLLM}
                disabled={isRefreshingAll || refreshingAudienceIds.size > 0}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1e4a79] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh AI analysis for all audiences"
              >
                {(isRefreshingAll || refreshingAudienceIds.size > 0) ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh All
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-[#334155] text-[13px] font-extrabold tracking-tight border-b border-[#cbd5e1]/40">
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-left">Audience</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Made Live</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Funnel Role</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden sm:table-cell">AVG Size</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">Assessment</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Status</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">Action</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">AI</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayData(filteredAudiences).map((aud) => {
                    const audienceAssessment = getAudienceAssessment(aud)
                    return (
                      <tr key={aud.id} className="group bg-white border-b border-[#cbd5e1]/40 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-[11px] sm:text-[12px] text-[#334155] font-medium max-w-[150px] sm:max-w-[220px] break-words">
                          <div className="flex flex-col gap-1">
                            <span className="truncate">{aud.name}</span>
                            <div className="sm:hidden flex flex-col gap-1">
                              <span className="text-[10px] text-gray-500">AVG Size: {getAudienceSize(aud)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] hidden lg:table-cell">
                          {formatDateCreated(aud)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <span className="px-3 sm:px-5 py-1 bg-white border border-[#e2e8f0] text-[#64748b] text-[10px] sm:text-[11px] font-bold rounded-full shadow-sm">
                              {aud.role}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-[#94a3b8] font-medium">
                              {aud.roleSub}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-[11px] sm:text-[12px] text-[#64748b] font-medium hidden sm:table-cell">
                          {getAudienceSize(aud)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center hidden lg:table-cell">
                          {audienceAssessment.summary ? (
                            <button
                              onClick={() => setSelectedAssessment(aud)}
                              className="text-[10px] sm:text-[11px] text-gray-600 group-hover:!text-[#1e4a79] hover:!text-[#1e4a79] transition-colors cursor-pointer text-left max-w-[180px] sm:max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded"
                              title={audienceAssessment.summary || 'Click to view full assessment'}
                            >
                              {truncateText(audienceAssessment.summary, 35)}
                            </button>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] text-gray-400">No assessment</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => setSelectedAssessment(aud)}
                              className="lg:hidden text-[9px] text-[#1e4a79] font-bold underline hover:text-blue-600 transition-colors"
                            >
                              View
                            </button>
                            <span className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full border text-[9px] sm:text-[10px] font-bold shadow-sm whitespace-nowrap ${getReadinessLevelClasses(audienceAssessment.readinessLevel)}`}>
                              {audienceAssessment.readinessLevel?.replace(/_/g, ' ').toUpperCase() || 'OPTIMIZING'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <button
                            onClick={() => {
                              setSelectedScalingItem(aud);
                              handleAudienceAIRequest(aud);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all transform hover:scale-110 active:scale-95 whitespace-nowrap"
                          >
                            Scale Growth
                          </button>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-center">
                          <button
                            onClick={() => handleRefreshAudienceLLM(aud.audience_id || aud.id)}
                            disabled={refreshingAudienceIds.has(aud.audience_id || aud.id)}
                            className="flex items-center justify-center px-2 py-1.5 text-[#1e4a79] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Refresh AI analysis for this audience"
                          >
                            {refreshingAudienceIds.has(aud.audience_id || aud.id) ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAudiences.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredAudiences.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Made Live</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Funnel</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Spend (AED)</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Metrics</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Assessment</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getDisplayData(filteredCampaigns).map((cp) => {
                    const assessment = getAssessment(cp)
                    return (
                      <tr key={cp.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {cp.name}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center text-xs text-gray-600 hidden lg:table-cell">
                          {formatDateCreated(cp)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] rounded-full shadow-sm font-bold uppercase tracking-tight">{cp.funnel_stage}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 text-center hidden sm:table-cell font-bold">
                          {cp.spend.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-xs text-gray-600">
                          <div className="flex flex-col items-center">
                            <div><span className="font-bold text-gray-800">ROAS:</span> {cp.roas}x</div>
                            <div><span className="font-bold text-gray-800">CPA:</span> {cp.cpa !== null && cp.cpa !== undefined ? cp.cpa.toLocaleString() : 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center hidden md:table-cell">
                          <button
                            onClick={() => setSelectedAssessment(cp)}
                            className={`text-[11px] text-gray-600 ${getStatusHoverColors(assessment.status, assessment.action)} hover:!text-[#1e4a79] hover:!bg-blue-50 transition-colors cursor-pointer text-left max-w-[200px] mx-auto block leading-relaxed break-words px-2 py-1 rounded`}
                            title={assessment.summary || 'Click to view full assessment'}
                          >
                            {assessment.summary ? truncateText(assessment.summary, 40) : 'No assessment available'}
                          </button>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedScalingItem(cp);
                              handleAIRequest(cp.id);
                            }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${getStatusClasses(assessment.status || assessment.action)}`}
                          >
                            {assessment.action}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredCampaigns.length > 5 && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#1e4a79] text-xs font-bold uppercase tracking-wider hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
                >
                  {isExpanded ? 'Show Less' : `Show All (${filteredCampaigns.length})`}
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-[30px] border-2 border-[#1e4a79] p-4 sm:p-6 md:p-8 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-4xl w-full shadow-2xl relative overflow-hidden my-2 sm:my-4 md:my-8 max-h-[95vh] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-[#1e4a79] opacity-20"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Ad Image (only for ads) */}
                  {selectedAssessment.format && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 shadow-sm relative">
                      {selectedAssessment.image_url ? (
                        <>
                          <img
                            src={selectedAssessment.image_url}
                            alt={selectedAssessment.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.target
                              const fallback = img.parentElement?.querySelector('.image-fallback')
                              if (img) img.style.display = 'none'
                              if (fallback) fallback.style.display = 'flex'
                            }}
                            onLoad={(e) => {
                              const fallback = e.target.parentElement?.querySelector('.image-fallback')
                              if (fallback) fallback.style.display = 'none'
                            }}
                          />
                          <div className="image-fallback w-full h-full hidden items-center justify-center bg-gray-100 absolute inset-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1e4a79] flex items-center gap-2 mb-1 sm:mb-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.12 14.12l-6.06 2.02c-.52.17-1.03-.34-.86-.86l2.02-6.06c.14-.42.48-.76.9-.9l6.06-2.02c.52-.17 1.03.34.86.86l-2.02 6.06c-.14.42-.48.76-.9.9z" />
                      </svg>
                      <span className="truncate">Assessment Details</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold truncate">{selectedAssessment.name}</p>
                    {selectedAssessment.format && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Format: <span className="font-semibold">{selectedAssessment.format}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAssessment(null);
                  setSelectedAI(null);
                  setAiLoading(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 flex-shrink-0 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Content based on assessment availability */}


                {selectedAssessment.assessment ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Check if it's an Ad (has format field) */}
                    {selectedAssessment.format ? (
                      // AD ASSESSMENT STRUCTURE
                      <>
                        {/* Creative Performance Metrics Section */}
                        {selectedAssessment.assessment.performance?.creative_performance && (
                          <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Creative Performance</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.ctr ? `${selectedAssessment.assessment.performance.creative_performance.ctr}%` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPC</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.cpc ? selectedAssessment.assessment.performance.creative_performance.cpc.toFixed(2) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPM</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.cpm ? selectedAssessment.assessment.performance.creative_performance.cpm.toFixed(2) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.spend ? selectedAssessment.assessment.performance.creative_performance.spend.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Impressions</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.impressions ? selectedAssessment.assessment.performance.creative_performance.impressions.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Clicks</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.creative_performance.clicks ? selectedAssessment.assessment.performance.creative_performance.clicks.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              {(selectedAssessment.unique_clicks !== null && selectedAssessment.unique_clicks !== undefined) && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unique Clicks</span>
                                  <span className="text-base sm:text-lg font-bold text-gray-800">
                                    {selectedAssessment.unique_clicks ? selectedAssessment.unique_clicks.toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {selectedAssessment.assessment.performance.creative_performance.summary && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs sm:text-sm text-gray-700 italic">
                                  {selectedAssessment.assessment.performance.creative_performance.summary}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Informational KPIs (ROAS/CPA) */}
                        {selectedAssessment.assessment.performance?.kpis && (
                          <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-600 mb-2 sm:mb-3 uppercase tracking-wide">Conversion Metrics (Informational)</h4>
                            {selectedAssessment.assessment.performance.kpis.note && (
                              <p className="text-[10px] sm:text-xs text-gray-500 italic mb-3">{selectedAssessment.assessment.performance.kpis.note}</p>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                              {selectedAssessment.assessment.performance.kpis.roas !== null && selectedAssessment.assessment.performance.kpis.roas !== undefined && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.kpis.roas}x
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.performance.kpis.cpa !== null && selectedAssessment.assessment.performance.kpis.cpa !== undefined && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.kpis.cpa.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.performance.kpis.revenue !== null && selectedAssessment.assessment.performance.kpis.revenue !== undefined && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.kpis.revenue.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.performance.kpis.purchases !== null && selectedAssessment.assessment.performance.kpis.purchases !== undefined && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Purchases</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-600">
                                    {selectedAssessment.assessment.performance.kpis.purchases.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Profitability Section */}
                        {selectedAssessment.assessment.performance?.profitability && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-4 sm:mb-5 uppercase tracking-wide">Profitability Analysis</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Profit Margin</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent != null
                                    ? `~ ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent).toFixed(1)}% (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.profit_margin_percent != null
                                      ? `${Number(selectedAssessment.assessment.performance.profitability.profit_margin_percent).toFixed(1)}%`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Net Profit</span>
                                <span className={`text-lg font-bold ${(selectedAssessment.assessment.performance.profitability.estimated_net_profit ?? selectedAssessment.assessment.performance.profitability.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.net_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.net_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                                <span className="text-lg font-bold text-[#1e4a79]">
                                  {selectedAssessment.assessment.performance.profitability.revenue != null ? `AED ${Number(selectedAssessment.assessment.performance.profitability.revenue).toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Gross Profit</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_gross_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_gross_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.gross_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.gross_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                            </div>
                            {selectedAssessment.assessment.performance.profitability.estimation_note && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 italic">
                                <span className="font-bold text-gray-600">Note:</span> {selectedAssessment.assessment.performance.profitability.estimation_note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary Section */}
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {selectedAssessment.assessment.summary || 'No summary available'}
                          </p>
                        </div>

                        {/* Status - Based on Creative Performance */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                          <div className="flex-1 flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</span>
                            <div className="mt-1">
                              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getAdStatusClasses(selectedAssessment.assessment.performance?.creative_performance?.status || selectedAssessment.assessment.status)}`}>
                                {(selectedAssessment.assessment.performance?.creative_performance?.status || selectedAssessment.assessment.status)?.toUpperCase() || 'FAIR'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.performance?.creative_performance?.status && (
                              <p className="text-[10px] text-gray-500 italic mt-1">Based on creative performance metrics</p>
                            )}
                          </div>
                        </div>

                        {/* Creative Health Section */}
                        {selectedAssessment.assessment.creative && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Creative Health</h4>

                            {/* Format & Frequency */}
                            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Format:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.creative.format || selectedAssessment.format || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Frequency:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.creative.frequency ? `${selectedAssessment.assessment.creative.frequency}x` : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Fatigue Score:</span>
                                  <span className={`font-bold ${selectedAssessment.assessment.creative.fatigue_score > 70 ? 'text-red-600' : selectedAssessment.assessment.creative.fatigue_score > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {selectedAssessment.assessment.creative.fatigue_score || 'N/A'}%
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Fatigue Level:</span>
                                  <span className={`font-bold uppercase ${selectedAssessment.assessment.creative.fatigue_level === 'critical' ? 'text-red-600' : selectedAssessment.assessment.creative.fatigue_level === 'high' ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {selectedAssessment.assessment.creative.fatigue_level || 'NORMAL'}
                                  </span>
                                </div>
                              </div>
                              {selectedAssessment.assessment.creative.frequency_status && (
                                <div className="mt-2 text-xs text-gray-600 italic">
                                  {selectedAssessment.assessment.creative.frequency_status}
                                </div>
                              )}
                            </div>

                            {/* CTR Trend */}
                            {selectedAssessment.assessment.creative_health?.ctr_trend && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR Trend</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CTR Decline:</span>
                                    <span className={`font-bold ${selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent > 30 ? 'text-red-600' : selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {selectedAssessment.assessment.creative_health.ctr_trend.ctr_decline_percent.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 italic">
                                    {selectedAssessment.assessment.creative_health.ctr_trend.status}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Quality Rankings */}
                            {selectedAssessment.assessment.creative_health?.quality_rankings && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Quality Rankings</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                                  <div>
                                    <span className="text-gray-600">Quality:</span>
                                    <span className="ml-2 font-bold text-gray-800">
                                      {selectedAssessment.assessment.creative_health.quality_rankings.quality?.replace('_', ' ') || 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Engagement:</span>
                                    <span className="ml-2 font-bold text-gray-800">
                                      {selectedAssessment.assessment.creative_health.quality_rankings.engagement?.replace('_', ' ') || 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Conversion:</span>
                                    <span className="ml-2 font-bold text-gray-800">
                                      {selectedAssessment.assessment.creative_health.quality_rankings.conversion?.replace('_', ' ') || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Engagement Quality (including Video metrics) */}
                            {selectedAssessment.assessment.creative_health?.engagement_quality && (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Engagement Quality</h5>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  {selectedAssessment.assessment.creative_health.engagement_quality.link_clicks && (
                                    <div className="text-gray-700">
                                      <span className="font-semibold">Link Clicks: </span>
                                      {selectedAssessment.assessment.creative_health.engagement_quality.link_clicks}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.creative_health.engagement_quality.engagement_rate && (
                                    <div className="text-gray-700">
                                      <span className="font-semibold">Engagement Rate: </span>
                                      {selectedAssessment.assessment.creative_health.engagement_quality.engagement_rate}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.creative_health.engagement_quality.social && (
                                    <div className="text-gray-700">
                                      <span className="font-semibold">Social Engagement: </span>
                                      {selectedAssessment.assessment.creative_health.engagement_quality.social}
                                    </div>
                                  )}
                                  {/* Video Metrics (only for Video format) */}
                                  {selectedAssessment.format === 'Video' && selectedAssessment.assessment.creative_health.engagement_quality.video && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <span className="text-[10px] font-bold text-blue-600 mb-2 block">Video Performance</span>
                                      <div className="space-y-1.5">
                                        {selectedAssessment.assessment.creative_health.engagement_quality.video.play_rate && (
                                          <div className="text-gray-700">
                                            <span className="font-semibold">Play Rate: </span>
                                            {selectedAssessment.assessment.creative_health.engagement_quality.video.play_rate}
                                          </div>
                                        )}
                                        {selectedAssessment.assessment.creative_health.engagement_quality.video.completion && (
                                          <div className="text-gray-700">
                                            <span className="font-semibold">Completion Rate: </span>
                                            {selectedAssessment.assessment.creative_health.engagement_quality.video.completion}
                                          </div>
                                        )}
                                        {selectedAssessment.assessment.creative_health.engagement_quality.video['30_sec_rate'] && (
                                          <div className="text-gray-700">
                                            <span className="font-semibold">30+ Sec Watch Rate: </span>
                                            {selectedAssessment.assessment.creative_health.engagement_quality.video['30_sec_rate']}
                                          </div>
                                        )}
                                        {selectedAssessment.assessment.creative_health.engagement_quality.video.avg_watch_time && (
                                          <div className="text-gray-700">
                                            <span className="font-semibold">Avg Watch Time: </span>
                                            {selectedAssessment.assessment.creative_health.engagement_quality.video.avg_watch_time}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Performance Section - Creative Performance, CTR Assessment, Relative Performance, Cost Efficiency, Conversion Funnel, Click Quality, Ad Recall */}
                        {selectedAssessment.assessment.performance && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Performance Analysis</h4>

                            {/* Creative Performance Summary */}
                            {selectedAssessment.assessment.performance.creative_performance && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Creative Performance</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getAdStatusClasses(selectedAssessment.assessment.performance.creative_performance.status)}`}>
                                      {selectedAssessment.assessment.performance.creative_performance.status?.toUpperCase() || 'FAIR'}
                                    </span>
                                  </div>
                                  {selectedAssessment.assessment.performance.creative_performance.summary && (
                                    <div className="text-gray-700 italic">
                                      {selectedAssessment.assessment.performance.creative_performance.summary}
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
                                    <div>
                                      <span className="text-gray-600 text-[10px]">CTR:</span>
                                      <span className="ml-1 font-bold text-gray-800">
                                        {selectedAssessment.assessment.performance.creative_performance.ctr}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-[10px]">CPC:</span>
                                      <span className="ml-1 font-bold text-gray-800">
                                        {selectedAssessment.assessment.performance.creative_performance.cpc.toFixed(2)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-[10px]">CPM:</span>
                                      <span className="ml-1 font-bold text-gray-800">
                                        {selectedAssessment.assessment.performance.creative_performance.cpm.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* CTR Assessment */}
                            {selectedAssessment.assessment.performance.ctr_assessment && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR Assessment</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-gray-600">CTR:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.ctr_assessment.ctr}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-gray-600">Format Benchmark:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.ctr_assessment.format_benchmark}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-gray-600">vs Benchmark:</span>
                                    <span className={`font-bold ${selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.ctr_assessment.vs_benchmark_pct.toFixed(1)}%
                                    </span>
                                  </div>
                                  {selectedAssessment.assessment.performance.ctr_assessment.status && (
                                    <div className="text-[10px] text-gray-600 italic">
                                      {selectedAssessment.assessment.performance.ctr_assessment.status}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Relative Performance */}
                            {selectedAssessment.assessment.performance.relative_performance && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Relative to AdSet</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span className="text-gray-600">ROAS vs AdSet:</span>
                                    <span className={`font-bold ${selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.relative_performance.vs_adset_roas_pct.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span className="text-gray-600">CTR vs AdSet:</span>
                                    <span className={`font-bold ${selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct >= 0 ? '+' : ''}{selectedAssessment.assessment.performance.relative_performance.vs_adset_ctr_pct.toFixed(1)}%
                                    </span>
                                  </div>
                                  {selectedAssessment.assessment.performance.relative_performance.underdelivery_detected && (
                                    <div className="col-span-full mt-2 pt-2 border-t border-yellow-200 bg-yellow-50 px-2 py-1 rounded text-[10px] text-yellow-800 font-semibold">
                                      ⚠️ Underdelivery detected
                                    </div>
                                  )}
                                </div>
                                {selectedAssessment.assessment.performance.relative_insights && (
                                  <div className="mt-2 text-[10px] text-gray-600 italic">
                                    {selectedAssessment.assessment.performance.relative_insights}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Cost Efficiency */}
                            {selectedAssessment.assessment.performance.cost_efficiency && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Efficiency</h5>
                                <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                  {selectedAssessment.assessment.performance.cost_efficiency.cpc && (
                                    <div>
                                      <span className="font-semibold">CPC: </span>
                                      {selectedAssessment.assessment.performance.cost_efficiency.cpc}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.cost_efficiency.cpm && (
                                    <div>
                                      <span className="font-semibold">CPM: </span>
                                      {selectedAssessment.assessment.performance.cost_efficiency.cpm}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Conversion Funnel */}
                            {selectedAssessment.assessment.performance.conversion_funnel && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Conversion Funnel</h5>
                                <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                  {selectedAssessment.assessment.performance.conversion_funnel.click_to_purchase && (
                                    <div>
                                      <span className="font-semibold">Click to Purchase: </span>
                                      {selectedAssessment.assessment.performance.conversion_funnel.click_to_purchase}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.conversion_funnel.add_to_cart && (
                                    <div>
                                      <span className="font-semibold">Add to Cart: </span>
                                      {selectedAssessment.assessment.performance.conversion_funnel.add_to_cart}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.conversion_funnel.cost_per_link_click !== null && (
                                    <div>
                                      <span className="font-semibold">Cost per Link Click: </span>
                                      {selectedAssessment.assessment.performance.conversion_funnel.cost_per_link_click.toFixed(2)}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.conversion_funnel.cost_per_add_to_cart !== null && (
                                    <div>
                                      <span className="font-semibold">Cost per Add to Cart: </span>
                                      {selectedAssessment.assessment.performance.conversion_funnel.cost_per_add_to_cart.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Click Quality */}
                            {selectedAssessment.assessment.performance.click_quality && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Click Quality</h5>
                                <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                  {selectedAssessment.assessment.performance.click_quality.quality_score && (
                                    <div>
                                      <span className="font-semibold">Quality Score: </span>
                                      {selectedAssessment.assessment.performance.click_quality.quality_score}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.click_quality.unique_ctr !== null && selectedAssessment.assessment.performance.click_quality.unique_ctr !== undefined && (
                                    <div>
                                      <span className="font-semibold">Unique CTR: </span>
                                      {selectedAssessment.assessment.performance.click_quality.unique_ctr.toFixed(2)}%
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.click_quality.website_ctr && (
                                    <div>
                                      <span className="font-semibold">Website CTR: </span>
                                      {selectedAssessment.assessment.performance.click_quality.website_ctr}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Ad Recall */}
                            {selectedAssessment.assessment.performance.ad_recall && (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Ad Recall</h5>
                                <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                                  {selectedAssessment.assessment.performance.ad_recall.recall_rate && (
                                    <div>
                                      <span className="font-semibold">Recall Rate: </span>
                                      {selectedAssessment.assessment.performance.ad_recall.recall_rate}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.ad_recall.cost_per_recall && (
                                    <div>
                                      <span className="font-semibold">Cost per Recall: </span>
                                      {selectedAssessment.assessment.performance.ad_recall.cost_per_recall}
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.ad_recall.estimated_recallers !== null && selectedAssessment.assessment.performance.ad_recall.estimated_recallers !== undefined && (
                                    <div>
                                      <span className="font-semibold">Estimated Recallers: </span>
                                      ~ {selectedAssessment.assessment.performance.ad_recall.estimated_recallers.toLocaleString()} (Estimated)
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delivery Section */}
                        {selectedAssessment.assessment.delivery && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Delivery Status</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Effective Status:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedAssessment.assessment.delivery.effective_status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : selectedAssessment.assessment.delivery.effective_status === 'PAUSED'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {selectedAssessment.assessment.delivery.effective_status}
                                </span>
                              </div>
                              {selectedAssessment.assessment.delivery.configured_status && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="text-gray-600">Configured Status:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.delivery.configured_status}
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.delivery.issues && selectedAssessment.assessment.delivery.issues.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-red-200">
                                  <span className="text-[10px] font-bold text-red-600 mb-1 block">Delivery Issues:</span>
                                  <ul className="list-disc list-inside space-y-1 text-[10px] text-red-700">
                                    {selectedAssessment.assessment.delivery.issues.map((issue, idx) => (
                                      <li key={idx}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {selectedAssessment.assessment.recommendations && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Recommendations</h4>
                            <div className="space-y-3">
                              {selectedAssessment.assessment.recommendations.primary && (
                                <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 font-semibold mb-1 sm:mb-0 sm:mr-2">Primary:</span>
                                  <span className="font-bold text-[#1e4a79] break-words">
                                    {selectedAssessment.assessment.recommendations.primary}
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.recommendations.all && selectedAssessment.assessment.recommendations.all.length > 0 && (
                                <div>
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">All Recommendations</span>
                                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 pl-2">
                                    {selectedAssessment.assessment.recommendations.all.map((action, idx) => (
                                      <li key={idx} className="break-words">{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : selectedAssessment.role ? (
                      // AUDIENCE ASSESSMENT STRUCTURE
                      <>
                        {/* Metrics Section */}
                        <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Key Metrics</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance?.roas ? `${selectedAssessment.assessment.performance.roas}x` : selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance?.cpa !== null && selectedAssessment.assessment.performance?.cpa !== undefined
                                  ? selectedAssessment.assessment.performance.cpa.toLocaleString()
                                  : selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined
                                    ? selectedAssessment.cpa.toLocaleString()
                                    : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance?.ctr ? `${selectedAssessment.assessment.performance.ctr}%` : selectedAssessment.ctr ? `${selectedAssessment.ctr}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance?.spend ? selectedAssessment.assessment.performance.spend.toLocaleString() : selectedAssessment.spend ? selectedAssessment.spend.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.assessment.performance?.revenue ? selectedAssessment.assessment.performance.revenue.toLocaleString() : selectedAssessment.revenue ? selectedAssessment.revenue.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            {(selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Reaction Quality</span>
                                <span className={`text-sm sm:text-base font-bold px-2 py-1 rounded ${(selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                  (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                    (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'passive' ? 'bg-gray-100 text-gray-700' :
                                      (selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality) === 'disengaged' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-700'
                                  }`}>
                                  {(selectedAssessment.reaction_quality || selectedAssessment.assessment?.audience_reaction?.reaction_quality)?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                </span>
                              </div>
                            )}
                            {(selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sway Level</span>
                                <span className={`text-sm sm:text-base font-bold px-2 py-1 rounded ${(selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) === 'strong' ? 'bg-green-100 text-green-800' :
                                  (selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    (selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level) === 'weak' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-700'
                                  }`}>
                                  {(selectedAssessment.sway_level || selectedAssessment.assessment?.sway_analysis?.sway_level)?.toUpperCase() || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Profitability Section */}
                        {selectedAssessment.assessment.performance?.profitability && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-4 sm:mb-5 uppercase tracking-wide">Profitability Analysis</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Profit Margin</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent != null
                                    ? `~ ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent).toFixed(1)}% (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.profit_margin_percent != null
                                      ? `${Number(selectedAssessment.assessment.performance.profitability.profit_margin_percent).toFixed(1)}%`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Net Profit</span>
                                <span className={`text-lg font-bold ${(selectedAssessment.assessment.performance.profitability.estimated_net_profit ?? selectedAssessment.assessment.performance.profitability.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.net_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.net_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                                <span className="text-lg font-bold text-[#1e4a79]">
                                  {selectedAssessment.assessment.performance.profitability.revenue != null ? `AED ${Number(selectedAssessment.assessment.performance.profitability.revenue).toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Gross Profit</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_gross_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_gross_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.gross_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.gross_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                            </div>
                            {selectedAssessment.assessment.performance.profitability.estimation_note && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 italic">
                                <span className="font-bold text-gray-600">Note:</span> {selectedAssessment.assessment.performance.profitability.estimation_note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary Section */}
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {selectedAssessment.assessment.summary || 'No summary available'}
                          </p>
                        </div>

                        {/* Readiness Level */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                          <div className="flex-1 flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Readiness Level</span>
                            <div className="mt-1">
                              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm font-bold shadow-sm inline-block ${getReadinessLevelClasses(selectedAssessment.assessment.readiness_level)}`}>
                                {selectedAssessment.assessment.readiness_level?.replace(/_/g, ' ').toUpperCase() || 'OPTIMIZING'}
                              </span>
                            </div>
                            {selectedAssessment.assessment.readiness_reason && (
                              <p className="text-[10px] sm:text-xs text-gray-600 italic mt-2">
                                {selectedAssessment.assessment.readiness_reason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Audience Characteristics */}
                        {selectedAssessment.assessment.audience_characteristics && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Audience Characteristics</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Type:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.audience_characteristics.type || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Expected Stage:</span>
                                <span className="font-bold text-gray-800 uppercase">
                                  {selectedAssessment.assessment.audience_characteristics.expected_stage || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">AVG Size:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.audience_size !== null && selectedAssessment.audience_size !== undefined
                                    ? formatAudienceSize(selectedAssessment.audience_size)
                                    : selectedAssessment.assessment?.audience_characteristics?.size !== null && selectedAssessment.assessment?.audience_characteristics?.size !== undefined
                                      ? formatAudienceSize(selectedAssessment.assessment.audience_characteristics.size)
                                      : selectedAssessment.size || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current Reach:</span>
                                <span className="font-bold text-gray-800">
                                  {(() => {
                                    const reach = selectedAssessment.assessment.audience_characteristics?.current_reach ||
                                      selectedAssessment.assessment.audience_characteristics?.reach_value ||
                                      (selectedAssessment.assessment.performance?.cost_efficiency?.reach) ||
                                      (selectedAssessment.impressions && selectedAssessment.impressions > 0 ? selectedAssessment.impressions : null);
                                    return reach ? reach.toLocaleString() : 'N/A';
                                  })()}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Saturation:</span>
                                <span className={`font-bold ${selectedAssessment.assessment.audience_characteristics?.saturation_percent != null && selectedAssessment.assessment.audience_characteristics.saturation_percent > 80 ? 'text-red-600' :
                                  selectedAssessment.assessment.audience_characteristics?.saturation_percent != null && selectedAssessment.assessment.audience_characteristics.saturation_percent > 60 ? 'text-yellow-600' :
                                    selectedAssessment.assessment.audience_characteristics?.saturation_percent != null ? 'text-green-600' : 'text-gray-600'
                                  }`}>
                                  {selectedAssessment.assessment.audience_characteristics?.saturation_percent != null ? `${selectedAssessment.assessment.audience_characteristics.saturation_percent.toFixed(1)}%` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Saturation Level:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${selectedAssessment.assessment.audience_characteristics.saturation_level === 'saturated' ? 'bg-red-100 text-red-800' :
                                  selectedAssessment.assessment.audience_characteristics.saturation_level === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedAssessment.assessment.audience_characteristics.saturation_level === 'healthy' ? 'bg-blue-100 text-blue-800' :
                                      selectedAssessment.assessment.audience_characteristics.saturation_level === 'low' ? 'bg-green-100 text-green-800' :
                                        'text-gray-600'
                                  }`}>
                                  {selectedAssessment.assessment.audience_characteristics.saturation_level || 'N/A'}
                                </span>
                              </div>
                              {selectedAssessment.assessment.audience_characteristics.retention_days && (
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Retention Days:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_characteristics.retention_days} days
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.audience_characteristics.lookalike_ratio && (
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Lookalike Ratio:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_characteristics.lookalike_ratio}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Health Section */}
                        {selectedAssessment.assessment.health && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Health Metrics</h4>

                            {/* Frequency */}
                            {selectedAssessment.assessment.health.frequency && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Frequency</h5>
                                <div className="text-xs sm:text-sm">
                                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Value:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.health.frequency.value}x
                                    </span>
                                  </div>
                                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${selectedAssessment.assessment.health.frequency.status === 'critical' ? 'bg-red-100 text-red-800' :
                                      selectedAssessment.assessment.health.frequency.status === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedAssessment.assessment.health.frequency.status === 'normal' ? 'bg-green-100 text-green-800' :
                                          'bg-green-100 text-green-800'
                                      }`}>
                                      {selectedAssessment.assessment.health.frequency.status || 'NORMAL'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* CTR */}
                            {selectedAssessment.assessment.health.ctr !== undefined && (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">CTR</h5>
                                <div className="text-xs sm:text-sm">
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.health.ctr}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Targets */}
                        {selectedAssessment.assessment.targets && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Targets</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Stage:</span>
                                <span className="font-bold text-gray-800 uppercase">
                                  {selectedAssessment.assessment.targets.stage || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">ROAS Target:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.targets.roas_target}x
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current ROAS:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.targets.current_roas}x
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CPA Cap:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.targets.cpa_cap}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CPA:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.targets.current_cpa !== null && selectedAssessment.assessment.targets.current_cpa !== undefined
                                    ? selectedAssessment.assessment.targets.current_cpa.toLocaleString()
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Scaling */}
                        {selectedAssessment.assessment.scaling && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Scaling Potential</h4>
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600 text-xs sm:text-sm">Potential:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${selectedAssessment.assessment.scaling.potential === 'high' ? 'bg-green-100 text-green-800' :
                                  selectedAssessment.assessment.scaling.potential === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedAssessment.assessment.scaling.potential === 'low' ? 'bg-red-100 text-red-800' :
                                      'text-gray-600'
                                  }`}>
                                  {selectedAssessment.assessment.scaling.potential || 'N/A'}
                                </span>
                              </div>
                              {selectedAssessment.assessment.scaling.reason && (
                                <div className="text-xs sm:text-sm text-gray-600 italic">
                                  {selectedAssessment.assessment.scaling.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Audience Reaction */}
                        {selectedAssessment.assessment.audience_reaction && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Audience Reaction</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Engagement Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_reaction.engagement_rate}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Reaction Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_reaction.reaction_rate}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Comment Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_reaction.comment_rate}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Share Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.audience_reaction.share_rate}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Reaction Quality:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedAssessment.assessment.audience_reaction.reaction_quality === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                  selectedAssessment.assessment.audience_reaction.reaction_quality === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                    selectedAssessment.assessment.audience_reaction.reaction_quality === 'passive' ? 'bg-gray-100 text-gray-700' :
                                      selectedAssessment.assessment.audience_reaction.reaction_quality === 'disengaged' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-700'
                                  }`}>
                                  {selectedAssessment.assessment.audience_reaction.reaction_quality?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                </span>
                              </div>
                              {selectedAssessment.assessment.audience_reaction.insights && selectedAssessment.assessment.audience_reaction.insights.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <span className="text-[10px] font-bold text-gray-600 mb-2 block">Insights:</span>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                    {selectedAssessment.assessment.audience_reaction.insights.map((insight, idx) => (
                                      <li key={idx}>{insight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {selectedAssessment.assessment.audience_reaction.social_signals && selectedAssessment.assessment.audience_reaction.social_signals.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-[10px] font-bold text-gray-600 mb-2 block">Social Signals:</span>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                    {selectedAssessment.assessment.audience_reaction.social_signals.map((signal, idx) => (
                                      <li key={idx}>{signal}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Video Behavior */}
                        {selectedAssessment.assessment.video_behavior && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Video Behavior</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Play Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.video_behavior.play_rate}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Completion Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.video_behavior.completion_rate}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">30+ Sec Rate:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.video_behavior['30_sec_rate']}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 mb-1">Avg Watch Time:</span>
                                  <span className="font-bold text-gray-800">
                                    {selectedAssessment.assessment.video_behavior.avg_watch_time}s
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Behavior:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedAssessment.assessment.video_behavior.behavior === 'highly_engaged' ? 'bg-green-100 text-green-800' :
                                  selectedAssessment.assessment.video_behavior.behavior === 'engaged' ? 'bg-blue-100 text-blue-800' :
                                    selectedAssessment.assessment.video_behavior.behavior === 'disengaged' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {selectedAssessment.assessment.video_behavior.behavior?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Intent Signals */}
                        {selectedAssessment.assessment.intent_signals && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Intent Signals</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Link Click Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.intent_signals.link_click_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Add to Cart Rate:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.intent_signals.add_to_cart_rate}%
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Purchase Intent Score:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.intent_signals.purchase_intent_score}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-600 mb-1">Click Quality Ratio:</span>
                                <span className="font-bold text-gray-800">
                                  {selectedAssessment.assessment.intent_signals.click_quality_ratio.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sway Analysis */}
                        {selectedAssessment.assessment.sway_analysis && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Sway Analysis</h4>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Sway Score:</span>
                                <span className="text-lg sm:text-xl font-bold text-gray-800">
                                  {selectedAssessment.assessment.sway_analysis.sway_score}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">Sway Level:</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedAssessment.assessment.sway_analysis.sway_level === 'strong' ? 'bg-green-100 text-green-800' :
                                  selectedAssessment.assessment.sway_analysis.sway_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedAssessment.assessment.sway_analysis.sway_level === 'weak' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-700'
                                  }`}>
                                  {selectedAssessment.assessment.sway_analysis.sway_level?.toUpperCase() || 'N/A'}
                                </span>
                              </div>
                              {selectedAssessment.assessment.sway_analysis.factors && selectedAssessment.assessment.sway_analysis.factors.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <span className="text-[10px] font-bold text-gray-600 mb-2 block">Factors:</span>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                    {selectedAssessment.assessment.sway_analysis.factors.map((factor, idx) => (
                                      <li key={idx}>{factor}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {selectedAssessment.assessment.sway_analysis.interpretation && (
                                <div className="mt-2 text-xs text-gray-600 italic">
                                  {selectedAssessment.assessment.sway_analysis.interpretation}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Optimization Strategies */}
                        {selectedAssessment.assessment.optimization_strategies && selectedAssessment.assessment.optimization_strategies.length > 0 && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Optimization Strategies</h4>
                            <div className="space-y-4">
                              {selectedAssessment.assessment.optimization_strategies.map((strategy, idx) => (
                                <div key={idx} className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${strategy.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      strategy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                      {strategy.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                                    </span>
                                    <span className="font-bold text-gray-800 text-xs sm:text-sm">
                                      {strategy.action}
                                    </span>
                                  </div>
                                  {strategy.reason && (
                                    <p className="text-xs text-gray-600 mb-2">{strategy.reason}</p>
                                  )}
                                  {strategy.suggestions && strategy.suggestions.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 ml-2">
                                      {strategy.suggestions.map((suggestion, sIdx) => (
                                        <li key={sIdx}>{suggestion}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {selectedAssessment.assessment.recommendations && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Recommendations</h4>
                            <div className="space-y-3">
                              {selectedAssessment.assessment.recommendations.primary && (
                                <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center">
                                  <span className="text-gray-600 font-semibold mb-1 sm:mb-0 sm:mr-2">Primary:</span>
                                  <span className="font-bold text-[#1e4a79] break-words">
                                    {selectedAssessment.assessment.recommendations.primary}
                                  </span>
                                </div>
                              )}
                              {selectedAssessment.assessment.recommendations.all && selectedAssessment.assessment.recommendations.all.length > 0 && (
                                <div>
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">All Recommendations</span>
                                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 pl-2">
                                    {selectedAssessment.assessment.recommendations.all.map((action, idx) => (
                                      <li key={idx} className="break-words">{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // CAMPAIGN/ADSET ASSESSMENT STRUCTURE (existing code)
                      <>
                        {/* Metrics Section */}
                        <div className="bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Key Metrics</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ROAS</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CPA</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined ? selectedAssessment.cpa.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spend</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.spend ? selectedAssessment.spend.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.revenue ? selectedAssessment.revenue.toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Purchases</span>
                              <span className="text-base sm:text-lg font-bold text-gray-800">
                                {selectedAssessment.purchases != null ? Number(selectedAssessment.purchases).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            {(selectedAssessment.ctr !== null && selectedAssessment.ctr !== undefined) && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTR</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.ctr != null ? `${Number(selectedAssessment.ctr).toFixed(2)}%` : 'N/A'}
                                </span>
                              </div>
                            )}
                            {(selectedAssessment.impressions !== null && selectedAssessment.impressions !== undefined) && (
                              <div className="flex flex-col">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Impressions</span>
                                <span className="text-base sm:text-lg font-bold text-gray-800">
                                  {selectedAssessment.impressions != null ? Number(selectedAssessment.impressions).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-2 sm:mb-3 uppercase tracking-wide">Summary</h4>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                            {selectedAssessment.assessment.summary || 'No summary available'}
                          </p>
                        </div>

                        {/* Action & Status */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
                          <div className="flex-1 flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Action</span>
                            <div className="mt-1">
                              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getStatusClasses(selectedAssessment.assessment.status || selectedAssessment.assessment.action)}`}>
                                {selectedAssessment.assessment.action}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</span>
                            <div className="mt-1">
                              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-block ${getStatusClasses(selectedAssessment.assessment.status)}`}>
                                {selectedAssessment.assessment.status?.toUpperCase() || 'UNKNOWN'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Profitability Section */}
                        {selectedAssessment.assessment.performance?.profitability && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-4 sm:mb-5 uppercase tracking-wide">Profitability Analysis</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Profit Margin</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent != null
                                    ? `~ ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit_margin_percent).toFixed(1)}% (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.profit_margin_percent != null
                                      ? `${Number(selectedAssessment.assessment.performance.profitability.profit_margin_percent).toFixed(1)}%`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Net Profit</span>
                                <span className={`text-lg font-bold ${(selectedAssessment.assessment.performance.profitability.estimated_net_profit ?? selectedAssessment.assessment.performance.profitability.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedAssessment.assessment.performance.profitability.estimated_net_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_net_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.net_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.net_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Revenue</span>
                                <span className="text-lg font-bold text-[#1e4a79]">
                                  {selectedAssessment.assessment.performance.profitability.revenue != null ? `AED ${Number(selectedAssessment.assessment.performance.profitability.revenue).toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Gross Profit</span>
                                <span className="text-lg font-bold text-gray-800">
                                  {selectedAssessment.assessment.performance.profitability.estimated_gross_profit != null
                                    ? `~ AED ${Number(selectedAssessment.assessment.performance.profitability.estimated_gross_profit).toLocaleString()} (Estimated)`
                                    : selectedAssessment.assessment.performance.profitability.gross_profit != null
                                      ? `AED ${Number(selectedAssessment.assessment.performance.profitability.gross_profit).toLocaleString()}`
                                      : 'N/A'}
                                </span>
                              </div>
                            </div>
                            {selectedAssessment.assessment.performance.profitability.estimation_note && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 italic">
                                <span className="font-bold text-gray-600">Note:</span> {selectedAssessment.assessment.performance.profitability.estimation_note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Performance Section */}
                        {selectedAssessment.assessment.performance && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-4 sm:mb-5 uppercase tracking-wide">Performance vs Industry</h4>

                            {/* VS Industry */}
                            {selectedAssessment.assessment.performance.vs_industry && (
                              <div className="space-y-4">
                                {/* ROAS Comparison */}
                                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">ROAS</span>
                                  </div>
                                  <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      {/* Current */}
                                      <div className="text-center sm:text-left">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Your Campaign</div>
                                        <div className="text-xl sm:text-2xl font-bold text-[#1e4a79]">
                                          {selectedAssessment.roas ? `${selectedAssessment.roas}x` : 'N/A'}
                                        </div>
                                      </div>
                                      {/* Industry */}
                                      <div className="text-center sm:text-left border-l border-gray-200 pl-4">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Industry Avg</div>
                                        <div className="text-xl sm:text-2xl font-bold text-gray-600">
                                          {selectedAssessment.assessment.performance.vs_industry.industry_roas_benchmark}x
                                        </div>
                                      </div>
                                    </div>
                                    {/* Difference */}
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-center sm:justify-start gap-2">
                                      <span className="text-xs text-gray-600">Difference:</span>
                                      <span className={`text-sm font-bold ${selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark != null
                                          ? `${selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark >= 0 ? '+' : ''}${Number(selectedAssessment.assessment.performance.vs_industry.roas_vs_benchmark).toFixed(1)}%`
                                          : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CPA Comparison */}
                                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">CPA</span>
                                  </div>
                                  <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      {/* Current */}
                                      <div className="text-center sm:text-left">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Your Campaign</div>
                                        <div className="text-xl sm:text-2xl font-bold text-[#1e4a79]">
                                          {selectedAssessment.cpa !== null && selectedAssessment.cpa !== undefined ? selectedAssessment.cpa.toLocaleString() : 'N/A'}
                                        </div>
                                      </div>
                                      {/* Industry */}
                                      <div className="text-center sm:text-left border-l border-gray-200 pl-4">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Industry Avg</div>
                                        <div className="text-xl sm:text-2xl font-bold text-gray-600">
                                          {selectedAssessment.assessment.performance.vs_industry.industry_cpa_benchmark}
                                        </div>
                                      </div>
                                    </div>
                                    {/* Difference */}
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-center sm:justify-start gap-2">
                                      <span className="text-xs text-gray-600">Difference:</span>
                                      <span className={`text-sm font-bold ${selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark != null
                                          ? `${selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark >= 0 ? '+' : ''}${Number(selectedAssessment.assessment.performance.vs_industry.cpa_vs_benchmark).toFixed(1)}%`
                                          : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}



                            {/* Cost Efficiency */}
                            {selectedAssessment.assessment.performance.cost_efficiency && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Efficiency</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">CTR:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.ctr != null ? `${Number(selectedAssessment.assessment.performance.cost_efficiency.ctr).toFixed(2)}%` : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">CPC:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.cpc != null ? Number(selectedAssessment.assessment.performance.cost_efficiency.cpc).toFixed(2) : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">CPM:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.cpm != null ? Number(selectedAssessment.assessment.performance.cost_efficiency.cpm).toFixed(2) : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Unique CTR:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.unique_ctr != null ? `${Number(selectedAssessment.assessment.performance.cost_efficiency.unique_ctr).toFixed(2)}%` : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Impressions:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.impressions != null ? Number(selectedAssessment.assessment.performance.cost_efficiency.impressions).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Clicks:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.clicks != null ? Number(selectedAssessment.assessment.performance.cost_efficiency.clicks).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Reach:</span>
                                    <span className="font-bold text-gray-800">
                                      {(() => {
                                        const reach = selectedAssessment.assessment.performance?.cost_efficiency?.reach ||
                                          selectedAssessment.assessment.audience_characteristics?.current_reach ||
                                          selectedAssessment.assessment.audience_characteristics?.reach_value ||
                                          (selectedAssessment.assessment.performance?.cost_efficiency?.impressions && selectedAssessment.assessment.performance.cost_efficiency.impressions > 0 ? selectedAssessment.assessment.performance.cost_efficiency.impressions : null);
                                        return reach != null ? Number(reach).toLocaleString() : 'N/A';
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Unique Clicks:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.cost_efficiency.unique_clicks != null ? Number(selectedAssessment.assessment.performance.cost_efficiency.unique_clicks).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Engagement */}
                            {selectedAssessment.assessment.performance.engagement && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Engagement</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Link Clicks:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.link_clicks != null ? Number(selectedAssessment.assessment.performance.engagement.link_clicks).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Add to Cart:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.add_to_cart != null ? Number(selectedAssessment.assessment.performance.engagement.add_to_cart).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Leads:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.leads != null ? Number(selectedAssessment.assessment.performance.engagement.leads).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Video Views:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.video_views != null ? Number(selectedAssessment.assessment.performance.engagement.video_views).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Post Engagements:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.post_engagements != null ? Number(selectedAssessment.assessment.performance.engagement.post_engagements).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Post Reactions:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.post_reactions != null ? Number(selectedAssessment.assessment.performance.engagement.post_reactions).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Post Comments:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.post_comments != null ? Number(selectedAssessment.assessment.performance.engagement.post_comments).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Post Shares:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.post_shares != null ? Number(selectedAssessment.assessment.performance.engagement.post_shares).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Page Engagements:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.engagement.page_engagements != null ? Number(selectedAssessment.assessment.performance.engagement.page_engagements).toLocaleString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Cost Per Action */}
                            {selectedAssessment.assessment.performance.cost_per_action && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Cost Per Action</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_link_click !== null && (
                                    <div className="flex flex-col">
                                      <span className="text-gray-600 mb-1">Cost per Link Click:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.performance.cost_per_action.cost_per_link_click).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_add_to_cart !== null && (
                                    <div className="flex flex-col">
                                      <span className="text-gray-600 mb-1">Cost per Add to Cart:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.performance.cost_per_action.cost_per_add_to_cart).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_lead !== null && (
                                    <div className="flex flex-col">
                                      <span className="text-gray-600 mb-1">Cost per Lead:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.performance.cost_per_action.cost_per_lead).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_video_view !== null && (
                                    <div className="flex flex-col">
                                      <span className="text-gray-600 mb-1">Cost per Video View:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.performance.cost_per_action.cost_per_video_view).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.performance.cost_per_action.cost_per_engagement !== null && (
                                    <div className="flex flex-col">
                                      <span className="text-gray-600 mb-1">Cost per Engagement:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.performance.cost_per_action.cost_per_engagement).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Conversion Rates */}
                            {selectedAssessment.assessment.performance.conversion_rates && (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Conversion Rates</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Click to Purchase Rate:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate !== null && selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate !== undefined
                                        ? `${Number(selectedAssessment.assessment.performance.conversion_rates.click_to_purchase_rate).toFixed(2)}%`
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 mb-1">Add to Cart Rate:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate !== null && selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate !== undefined
                                        ? `${Number(selectedAssessment.assessment.performance.conversion_rates.add_to_cart_rate).toFixed(2)}%`
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Health Section */}
                        {selectedAssessment.assessment.health && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Health Metrics</h4>

                            {/* Frequency */}
                            {selectedAssessment.assessment.health.frequency && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Frequency</h5>
                                <div className="text-xs sm:text-sm">
                                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Value:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.health.frequency.value}x
                                    </span>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 italic break-words">
                                    {selectedAssessment.assessment.health.frequency.status}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Creative Fatigue */}
                            {selectedAssessment.assessment.health.creative_fatigue && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Creative Fatigue</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CTR Decline:</span>
                                    <span className={`font-bold break-words ${selectedAssessment.assessment.health.creative_fatigue.ctr_decline_percent > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {Number(selectedAssessment.assessment.health.creative_fatigue.ctr_decline_percent).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 italic break-words">
                                    {selectedAssessment.assessment.health.creative_fatigue.status}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Learning Phase */}
                            {selectedAssessment.assessment.health.learning_phase && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Learning Phase</h5>
                                <div className="text-xs sm:text-sm">
                                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">In Learning:</span>
                                    <span className={`font-bold ${selectedAssessment.assessment.health.learning_phase.is_in_learning ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {selectedAssessment.assessment.health.learning_phase.is_in_learning ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 break-words">
                                    Status: {selectedAssessment.assessment.health.learning_phase.status_display || selectedAssessment.assessment.health.learning_phase.status}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Delivery Status */}
                            {(selectedAssessment.assessment.health.delivery_status || selectedAssessment.effective_status || selectedAssessment.configured_status || (selectedAssessment.delivery_issues && selectedAssessment.delivery_issues.length > 0)) && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Delivery Status</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  {(selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Effective Status:</span>
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${(selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : (selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status) === 'PAUSED'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedAssessment.assessment.health.delivery_status?.effective_status || selectedAssessment.effective_status}
                                      </span>
                                    </div>
                                  )}
                                  {(selectedAssessment.assessment.health.delivery_status?.configured_status || selectedAssessment.configured_status) && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Configured Status:</span>
                                      <span className="font-bold text-gray-800">
                                        {selectedAssessment.assessment.health.delivery_status?.configured_status || selectedAssessment.configured_status}
                                      </span>
                                    </div>
                                  )}
                                  {((selectedAssessment.assessment.health.delivery_status?.has_issues && selectedAssessment.assessment.health.delivery_status.issues && selectedAssessment.assessment.health.delivery_status.issues.length > 0) ||
                                    (selectedAssessment.delivery_issues && selectedAssessment.delivery_issues.length > 0)) && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <span className="text-[10px] font-bold text-red-600 mb-1 block">
                                          Delivery Issues ({selectedAssessment.assessment.health.delivery_status?.issues?.length || selectedAssessment.delivery_issues?.length || 0}):
                                        </span>
                                        <div className="space-y-1">
                                          {(selectedAssessment.assessment.health.delivery_status?.issues || selectedAssessment.delivery_issues || []).slice(0, 5).map((issue, idx) => (
                                            <div key={idx} className="text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded">
                                              {issue.error_code || issue.error_message || issue.error_title || issue.error_subcode || JSON.stringify(issue)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            )}

                            {/* Quality Rankings */}
                            {selectedAssessment.assessment.health.quality_rankings && (
                              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#e2e8f0]">
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Quality Rankings</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Quality Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedAssessment.assessment.health.quality_rankings.quality_status === 'GOOD'
                                      ? 'bg-green-100 text-green-800'
                                      : selectedAssessment.assessment.health.quality_rankings.quality_status === 'WARNING'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                      }`}>
                                      {selectedAssessment.assessment.health.quality_rankings.quality_status}
                                    </span>
                                  </div>
                                  {selectedAssessment.assessment.health.quality_rankings.total_ads !== null && selectedAssessment.assessment.health.quality_rankings.total_ads !== undefined && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Total Ads:</span>
                                      <span className="font-bold text-gray-800">
                                        {selectedAssessment.assessment.health.quality_rankings.total_ads}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.health.quality_rankings.average_quality_score !== null && selectedAssessment.assessment.health.quality_rankings.average_quality_score !== undefined && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Average Quality Score:</span>
                                      <span className="font-bold text-gray-800">
                                        {Number(selectedAssessment.assessment.health.quality_rankings.average_quality_score).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.health.quality_rankings.distribution && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-[10px] font-bold text-gray-600 mb-1 block">Distribution:</span>
                                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                                        {selectedAssessment.assessment.health.quality_rankings.distribution.ABOVE_AVERAGE !== undefined && (
                                          <div className="text-center">
                                            <div className="font-bold text-green-700">{selectedAssessment.assessment.health.quality_rankings.distribution.ABOVE_AVERAGE || 0}</div>
                                            <div className="text-gray-600">Above Avg</div>
                                          </div>
                                        )}
                                        {selectedAssessment.assessment.health.quality_rankings.distribution.AVERAGE !== undefined && (
                                          <div className="text-center">
                                            <div className="font-bold text-yellow-700">{selectedAssessment.assessment.health.quality_rankings.distribution.AVERAGE || 0}</div>
                                            <div className="text-gray-600">Average</div>
                                          </div>
                                        )}
                                        {selectedAssessment.assessment.health.quality_rankings.distribution.BELOW_AVERAGE !== undefined && (
                                          <div className="text-center">
                                            <div className="font-bold text-red-700">{selectedAssessment.assessment.health.quality_rankings.distribution.BELOW_AVERAGE || 0}</div>
                                            <div className="text-gray-600">Below Avg</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Age Fields */}
                            {(selectedAssessment.assessment.health.adset_age_days !== null && selectedAssessment.assessment.health.adset_age_days !== undefined) ||
                              (selectedAssessment.assessment.health.data_age_days !== null && selectedAssessment.assessment.health.data_age_days !== undefined) ? (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2">Age Information</h5>
                                <div className="text-xs sm:text-sm space-y-2">
                                  {selectedAssessment.assessment.health.adset_age_days !== null && selectedAssessment.assessment.health.adset_age_days !== undefined && (
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">AdSet Age:</span>
                                      <span className="font-bold text-gray-800">
                                        {selectedAssessment.assessment.health.adset_age_days} days
                                      </span>
                                    </div>
                                  )}
                                  {selectedAssessment.assessment.health.data_age_days !== null && selectedAssessment.assessment.health.data_age_days !== undefined && (
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                      <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Data Age:</span>
                                      <span className="font-bold text-gray-800">
                                        {selectedAssessment.assessment.health.data_age_days} days
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Top/Bottom Ads Section */}
                        {(selectedAssessment.top_ads && selectedAssessment.top_ads.length > 0) || (selectedAssessment.bottom_ads && selectedAssessment.bottom_ads.length > 0) ? (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Ad Performance Summary</h4>

                            {/* Top Ads */}
                            {selectedAssessment.top_ads && selectedAssessment.top_ads.length > 0 && (
                              <div className="mb-4 sm:mb-6">
                                <h5 className="text-[10px] sm:text-xs font-bold text-green-700 mb-2 sm:mb-3">Top Performing Ads ({selectedAssessment.top_ads.length})</h5>
                                <div className="space-y-2 sm:space-y-3">
                                  {selectedAssessment.top_ads.map((ad, idx) => (
                                    <div key={ad.id || idx} className="bg-white border border-green-200 rounded-lg p-3 sm:p-4">
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                          <div className="font-bold text-xs sm:text-sm text-gray-800 mb-1">{ad.name || `Ad ${idx + 1}`}</div>
                                          <div className="text-[10px] text-gray-500">ID: {ad.id}</div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                          {ad.quality_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.quality_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Quality: {ad.quality_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                          {ad.engagement_rate_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.engagement_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.engagement_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Engagement: {ad.engagement_rate_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                          {ad.conversion_rate_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.conversion_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.conversion_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Conversion: {ad.conversion_rate_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-xs">
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">ROAS</div>
                                          <div className="font-bold text-gray-800">{ad.roas ? `${ad.roas}x` : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Spend</div>
                                          <div className="font-bold text-gray-800">{ad.spend ? ad.spend.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Revenue</div>
                                          <div className="font-bold text-gray-800">{ad.revenue ? ad.revenue.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Purchases</div>
                                          <div className="font-bold text-gray-800">{ad.purchases ? ad.purchases.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">CTR</div>
                                          <div className="font-bold text-gray-800">{ad.ctr ? `${ad.ctr}%` : 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Bottom Ads */}
                            {selectedAssessment.bottom_ads && selectedAssessment.bottom_ads.length > 0 && (
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-bold text-red-700 mb-2 sm:mb-3">Underperforming Ads ({selectedAssessment.bottom_ads.length})</h5>
                                <div className="space-y-2 sm:space-y-3">
                                  {selectedAssessment.bottom_ads.map((ad, idx) => (
                                    <div key={ad.id || idx} className="bg-white border border-red-200 rounded-lg p-3 sm:p-4">
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                          <div className="font-bold text-xs sm:text-sm text-gray-800 mb-1">{ad.name || `Ad ${idx + 1}`}</div>
                                          <div className="text-[10px] text-gray-500">ID: {ad.id}</div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                          {ad.quality_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.quality_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Quality: {ad.quality_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                          {ad.engagement_rate_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.engagement_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.engagement_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Engagement: {ad.engagement_rate_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                          {ad.conversion_rate_ranking && (
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${ad.conversion_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-800' :
                                              ad.conversion_rate_ranking === 'AVERAGE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                              Conversion: {ad.conversion_rate_ranking.replace(/_/g, ' ')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-xs">
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">ROAS</div>
                                          <div className="font-bold text-gray-800">{ad.roas ? `${ad.roas}x` : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Spend</div>
                                          <div className="font-bold text-gray-800">{ad.spend ? ad.spend.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Revenue</div>
                                          <div className="font-bold text-gray-800">{ad.revenue ? ad.revenue.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">Purchases</div>
                                          <div className="font-bold text-gray-800">{ad.purchases ? ad.purchases.toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-500 mb-0.5">CTR</div>
                                          <div className="font-bold text-gray-800">{ad.ctr ? `${ad.ctr}%` : 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Trend Section */}
                        {selectedAssessment.assessment.trend && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Performance Trend</h4>
                            <div className="space-y-3">
                              {/* Period Comparison Info */}
                              {selectedAssessment.assessment.trend.period_days && (
                                <div className="mb-3 pb-3 border-b border-gray-200">
                                  <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-2">
                                    Comparing last {selectedAssessment.assessment.trend.period_days} days vs previous {selectedAssessment.assessment.trend.period_days} days
                                  </p>
                                  {selectedAssessment.assessment.trend.current_period && selectedAssessment.assessment.trend.previous_period && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-xs text-gray-500">
                                      <div>
                                        <span className="font-semibold text-gray-600">Current Period: </span>
                                        {(() => {
                                          const start = new Date(selectedAssessment.assessment.trend.current_period.start_date);
                                          const end = new Date(selectedAssessment.assessment.trend.current_period.end_date);
                                          const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                          const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined });
                                          return `${startFormatted} - ${endFormatted}`;
                                        })()}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-600">Previous Period: </span>
                                        {(() => {
                                          const start = new Date(selectedAssessment.assessment.trend.previous_period.start_date);
                                          const end = new Date(selectedAssessment.assessment.trend.previous_period.end_date);
                                          const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                          const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined });
                                          return `${startFormatted} - ${endFormatted}`;
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="text-gray-600 text-xs sm:text-sm font-semibold">Trend:</span>
                                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${selectedAssessment.assessment.trend.trend === 'improving' ? 'bg-green-100 text-green-800' : selectedAssessment.assessment.trend.trend === 'declining' ? 'bg-red-100 text-red-800' : selectedAssessment.assessment.trend.trend === 'stable' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {selectedAssessment.assessment.trend.trend?.toUpperCase() || 'INSUFFICIENT_DATA'}
                                </span>
                              </div>
                              {selectedAssessment.assessment.trend.change_pct !== null && selectedAssessment.assessment.trend.change_pct !== undefined && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span className="text-gray-600 text-xs sm:text-sm">Change:</span>
                                  <span className={`text-sm sm:text-base font-bold ${selectedAssessment.assessment.trend.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedAssessment.assessment.trend.change_pct != null ? `${selectedAssessment.assessment.trend.change_pct >= 0 ? '+' : ''}${Number(selectedAssessment.assessment.trend.change_pct).toFixed(1)}%` : 'N/A'}
                                  </span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Current ROAS</span>
                                  <span className="text-base sm:text-lg font-bold text-gray-800">
                                    {selectedAssessment.assessment.trend.current_roas ? `${selectedAssessment.assessment.trend.current_roas}x` : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Previous ROAS</span>
                                  <span className="text-base sm:text-lg font-bold text-gray-600">
                                    {selectedAssessment.assessment.trend.previous_roas ? `${selectedAssessment.assessment.trend.previous_roas}x` : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Budget Pacing Section */}
                        {selectedAssessment.assessment.budget_pacing ? (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] uppercase tracking-wide">Budget Pacing</h4>
                              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                CBO ACTIVE
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="text-gray-600 text-xs sm:text-sm font-semibold">Utilization:</span>
                                <span className={`text-base sm:text-lg font-bold ${(selectedAssessment.assessment.budget_pacing.utilization_percent || (selectedAssessment.assessment.budget_pacing.actual_spend / selectedAssessment.assessment.budget_pacing.daily_budget * 100)) > 100 ? 'text-red-600' : (selectedAssessment.assessment.budget_pacing.utilization_percent || (selectedAssessment.assessment.budget_pacing.actual_spend / selectedAssessment.assessment.budget_pacing.daily_budget * 100)) > 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {selectedAssessment.assessment.budget_pacing.utilization_percent != null
                                    ? `${Number(selectedAssessment.assessment.budget_pacing.utilization_percent).toFixed(1)}%`
                                    : selectedAssessment.assessment.budget_pacing.actual_spend != null && selectedAssessment.assessment.budget_pacing.daily_budget
                                      ? `${((selectedAssessment.assessment.budget_pacing.actual_spend / selectedAssessment.assessment.budget_pacing.daily_budget) * 100).toFixed(1)}%`
                                      : 'N/A'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Daily Budget</span>
                                  <span className="text-sm sm:text-base font-bold text-gray-800">
                                    {selectedAssessment.assessment.budget_pacing.daily_budget != null ? Number(selectedAssessment.assessment.budget_pacing.daily_budget).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Actual Spend</span>
                                  <span className={`text-sm sm:text-base font-bold ${selectedAssessment.assessment.budget_pacing.actual_spend > selectedAssessment.assessment.budget_pacing.expected_spend ? 'text-red-600' : selectedAssessment.assessment.budget_pacing.actual_spend < selectedAssessment.assessment.budget_pacing.expected_spend * 0.9 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {selectedAssessment.assessment.budget_pacing.actual_spend != null ? Number(selectedAssessment.assessment.budget_pacing.actual_spend).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                  Campaign Budget Optimization (CBO) is active. Pacing is calculated against the campaign-level budget.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 border-dashed">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">Budget Pacing</h4>
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full border border-gray-200">ABO DETECTED</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              This campaign uses <span className="text-[#1e4a79] font-bold">Ad Set Budget Optimization (ABO)</span>. The campaign itself has a budget of $0 because the money is allocated inside the individual Ad Sets. In this case, the Campaign-level audit won't show pacing because there is no single "top-level" budget to pace against.
                            </p>
                          </div>
                        )}

                        {/* Targets Section */}
                        {selectedAssessment.assessment.targets && (
                          <div className="bg-[#f8fafc] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#e2e8f0]">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e4a79] mb-3 sm:mb-4 uppercase tracking-wide">Targets</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Stage:</span>
                                <span className="font-bold text-gray-800 uppercase break-words">
                                  {selectedAssessment.assessment.targets.stage}
                                </span>
                              </div>

                              {selectedAssessment.assessment.targets.stage === 'TOFU' ? (
                                <>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CPC Target:</span>
                                    <span className="font-bold text-gray-800">
                                      ${selectedAssessment.assessment.targets.explorer_config?.tofu_cpc_target || '1.5'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CPC:</span>
                                    <span className={`font-bold ${(selectedAssessment.cpc ?? selectedAssessment.assessment.performance?.cost_efficiency?.cpc) <= (selectedAssessment.assessment.targets.explorer_config?.tofu_cpc_target || 1.5) ? 'text-green-600' : 'text-red-600'}`}>
                                      ${(Number(selectedAssessment.cpc ?? selectedAssessment.assessment.performance?.cost_efficiency?.cpc)).toFixed(2) || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CTR Target:</span>
                                    <span className="font-bold text-gray-800">
                                      {selectedAssessment.assessment.targets.explorer_config?.tofu_ctr_target || '1.0'}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CTR:</span>
                                    <span className={`font-bold ${(selectedAssessment.ctr ?? selectedAssessment.assessment.performance?.cost_efficiency?.ctr) >= (selectedAssessment.assessment.targets.explorer_config?.tofu_ctr_target || 1.0) ? 'text-green-600' : 'text-red-600'}`}>
                                      {(Number(selectedAssessment.ctr ?? selectedAssessment.assessment.performance?.cost_efficiency?.ctr)).toFixed(2) || 'N/A'}%
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">ROAS Target:</span>
                                    <span className="font-bold text-gray-800 break-words">
                                      {selectedAssessment.assessment.targets.roas_target}x
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current ROAS:</span>
                                    <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.roas ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedAssessment.assessment.targets.current_roas}x
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">CPA Cap:</span>
                                    <span className="font-bold text-gray-800 break-words">
                                      {selectedAssessment.assessment.targets.cpa_cap}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Current CPA:</span>
                                    <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.cpa ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedAssessment.assessment.targets.current_cpa != null
                                        ? Number(selectedAssessment.assessment.targets.current_cpa).toLocaleString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 mb-1 sm:mb-0 sm:mr-2">Meets Target:</span>
                                <span className={`font-bold break-words ${selectedAssessment.assessment.targets.meets_target?.overall === true ? 'text-green-600' : selectedAssessment.assessment.targets.meets_target?.overall === false ? 'text-red-600' : 'text-gray-500'}`}>
                                  {selectedAssessment.assessment.targets.meets_target?.overall === true ? 'Yes' : selectedAssessment.assessment.targets.meets_target?.overall === false ? 'No' : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {selectedAssessment.assessment.targets.stage === 'TOFU' && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500 leading-relaxed italic">
                                <span className="font-bold text-[#1e4a79]">ROAS/CPA Exemption:</span> TOFU campaigns are optimized for engagement (CTR/CPC) rather than raw conversions. Overall status reflects efficiency in reaching new audiences cheaply.
                              </div>
                            )}
                          </div>
                        )}


                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-xs sm:text-sm">No detailed assessment available for this campaign.</p>
                    {getAssessment(selectedAssessment).summary && (
                      <div className="mt-4 bg-[#f8fafc] p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-700 break-words">{getAssessment(selectedAssessment).summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 flex justify-center sm:justify-end flex-shrink-0 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedAssessment(null);
                  setSelectedAI(null);
                  setAiLoading(false);
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-2 bg-[#1e4a79] text-white rounded-full text-sm sm:text-base font-bold shadow-lg hover:bg-[#2c6aa8] transition-all transform hover:scale-105 touch-manipulation"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Scale Modal - Matches Assessment Modal Theme */}
      {selectedScalingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-[30px] border-2 border-[#1e4a79] p-4 sm:p-6 md:p-8 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-4xl w-full shadow-2xl relative overflow-hidden my-2 sm:my-4 md:my-8 max-h-[95vh] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-[#1e4a79] opacity-20"></div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#1e4a79] flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1e4a79] flex items-center gap-2 mb-1 sm:mb-2">
                      <span className="truncate">{selectedScalingItem.name}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wider truncate">AI Growth Analysis</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedScalingItem(null);
                  setSelectedAI(null);
                  setAiLoading(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 flex-shrink-0 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                    <div className="w-12 h-12 border-4 border-t-[#1e4a79] rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Analyzing performance data...</p>
                </div>
              ) : selectedAI ? (
                <div className="space-y-4 sm:space-y-5">

                  {/* Header Info Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedAI.rule_assessment?.status_color === 'green' ? 'bg-green-100 text-green-700' :
                      selectedAI.rule_assessment?.status_color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        selectedAI.rule_assessment?.status_color === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {selectedAI.rule_assessment?.action || 'Analysis Complete'}
                    </span>
                    {/* Funnel Stage */}
                    {selectedAI.funnel_stage && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        {selectedAI.funnel_stage}
                      </span>
                    )}
                    {/* Priority */}
                    {selectedAI.ai_recommendation?.priority && (
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedAI.ai_recommendation.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                        selectedAI.ai_recommendation.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        {selectedAI.ai_recommendation.priority} Priority
                      </span>
                    )}
                    {/* Cached Badge */}
                    {selectedAI.saved && (
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414l-5.293 5.293-2.293-2.293z" /></svg>
                        Cached
                      </span>
                    )}
                    {selectedAI.saved === false && (
                      <span className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">Fresh</span>
                    )}
                    {selectedAI.objective && (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{selectedAI.objective.replace('OUTCOME_', '')}</span>
                    )}
                    {selectedAI.budget_mode && (
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">{selectedAI.budget_mode}</span>
                    )}
                    {selectedAI.daily_budget && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-600 rounded-full text-xs font-bold">Daily Budget: ${selectedAI.daily_budget}</span>
                    )}
                  </div>

                  {/* Rule-Based Assessment */}
                  {selectedAI.rule_assessment?.assessment && (
                    <div className={`rounded-lg p-4 border-l-4 ${selectedAI.rule_assessment?.status_color === 'green' ? 'bg-green-50 border-green-500' :
                      selectedAI.rule_assessment?.status_color === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
                        selectedAI.rule_assessment?.status_color === 'red' ? 'bg-red-50 border-red-500' :
                          'bg-gray-50 border-gray-400'
                      }`}>
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Rule Assessment</h4>
                      <p className="text-sm text-gray-800 font-medium">{selectedAI.rule_assessment.assessment}</p>
                    </div>
                  )}

                  {/* AI Executive Summary */}
                  {(selectedAI.ai_recommendation?.executive_summary || selectedAI.ai_recommendation?.description) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-[#1e4a79] uppercase tracking-wide mb-2">AI Executive Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.executive_summary || selectedAI.ai_recommendation.description}</p>
                    </div>
                  )}

                  {/* Structural Audit / Health */}
                  {(selectedAI.ai_recommendation?.structural_audit || selectedAI.ai_recommendation?.structural_health) && (
                    <div className={`rounded-lg p-3 border flex items-start gap-3 ${(selectedAI.ai_recommendation.structural_audit?.is_aligned || selectedAI.ai_recommendation.structural_health?.score === 'ALIGNED') ? 'bg-green-50 border-green-200' :
                      selectedAI.ai_recommendation.structural_health?.score === 'NAMING_MISMATCH' ? 'bg-orange-50 border-orange-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${(selectedAI.ai_recommendation.structural_audit?.is_aligned || selectedAI.ai_recommendation.structural_health?.score === 'ALIGNED') ? 'bg-green-500' :
                        selectedAI.ai_recommendation.structural_health?.score === 'NAMING_MISMATCH' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}>
                        {(selectedAI.ai_recommendation.structural_audit?.is_aligned || selectedAI.ai_recommendation.structural_health?.score === 'ALIGNED') ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                        ) : selectedAI.ai_recommendation.structural_health?.score === 'NAMING_MISMATCH' ? (
                          <span className="text-white text-xs font-bold">?</span>
                        ) : (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {selectedAI.ai_recommendation.structural_health?.score === 'MISALIGNED' ? 'Structural Misalignment Detected' :
                            selectedAI.ai_recommendation.structural_health?.score === 'NAMING_MISMATCH' ? 'Naming Convention Issue' :
                              selectedAI.ai_recommendation.structural_audit?.is_aligned ? 'Setup is Properly Aligned' : 'Setup Issues'}
                        </p>
                        {(selectedAI.ai_recommendation.structural_audit?.issue || selectedAI.ai_recommendation.structural_health?.issue_detected) && (
                          <p className={`text-sm mt-0.5 ${selectedAI.ai_recommendation.structural_health?.score === 'NAMING_MISMATCH' ? 'text-orange-800' : 'text-red-700'}`}>
                            {selectedAI.ai_recommendation.structural_health?.issue_detected || selectedAI.ai_recommendation.structural_audit?.issue}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Health Indicators */}
                  {selectedAI.health_indicators && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Health Indicators</h4>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-gray-200">
                        {/* Frequency */}
                        {selectedAI.health_indicators.frequency && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Frequency</p>
                            <p className={`text-lg font-bold ${selectedAI.health_indicators.frequency.frequency > 2 ? 'text-red-600' : 'text-green-600'}`}>
                              {selectedAI.health_indicators.frequency.frequency?.toFixed(2) || '-'}
                            </p>
                            <p className={`text-[10px] ${selectedAI.health_indicators.frequency.is_fatigued ? 'text-red-600' : 'text-green-600'}`}>
                              {selectedAI.health_indicators.frequency.is_fatigued ? 'Fatigued' : 'Healthy'}
                            </p>
                          </div>
                        )}
                        {/* CTR Trend */}
                        {selectedAI.health_indicators.ctr_trend && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CTR Trend</p>
                            <p className={`text-lg font-bold ${selectedAI.health_indicators.ctr_trend.decline_percentage > 15 ? 'text-red-600' : 'text-green-600'}`}>
                              {selectedAI.health_indicators.ctr_trend.decline_percentage?.toFixed(1) || 0}%
                            </p>
                            <p className={`text-[10px] ${selectedAI.health_indicators.ctr_trend.status === 'Stable' ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedAI.health_indicators.ctr_trend.status}
                            </p>
                          </div>
                        )}
                        {/* Learning Phase */}
                        {selectedAI.health_indicators.learning_phase && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Delivery</p>
                            <p className={`text-lg font-bold ${selectedAI.health_indicators.learning_phase.learning_status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {selectedAI.health_indicators.learning_phase.learning_status || 'ACTIVE'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {selectedAI.health_indicators.learning_phase.is_in_learning ? 'In Learning' : 'Optimized'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Creative Verdict */}
                  {selectedAI.ai_recommendation?.creative_verdict && (
                    <div className={`rounded-lg p-4 border-l-4 ${selectedAI.ai_recommendation.creative_verdict === 'SCALE_WINNER' ? 'bg-green-50 border-green-500' :
                      selectedAI.ai_recommendation.creative_verdict === 'FATIGUED' ? 'bg-red-50 border-red-500' :
                        selectedAI.ai_recommendation.creative_verdict === 'FIX_HOOK' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-orange-50 border-orange-500'
                      }`}>
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Creative Verdict</h4>
                      <p className={`text-lg font-bold ${selectedAI.ai_recommendation.creative_verdict === 'SCALE_WINNER' ? 'text-green-700' :
                        selectedAI.ai_recommendation.creative_verdict === 'FATIGUED' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                        {selectedAI.ai_recommendation.creative_verdict.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}

                  {/* Ad-Specific: Hook Analysis */}
                  {selectedAI.ai_recommendation?.hook_analysis && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Hook Analysis</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAI.ai_recommendation.hook_analysis.score === 'STRONG' ? 'bg-green-100 text-green-600' :
                            selectedAI.ai_recommendation.hook_analysis.score === 'WEAK' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                          }`}>
                          {selectedAI.ai_recommendation.hook_analysis.score}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.hook_analysis.observation}</p>
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Retention Analysis */}
                  {selectedAI.ai_recommendation?.retention_analysis && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Retention Analysis</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAI.ai_recommendation.retention_analysis.score === 'STRONG' ? 'bg-green-100 text-green-600' :
                            selectedAI.ai_recommendation.retention_analysis.score === 'WEAK' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                          }`}>
                          {selectedAI.ai_recommendation.retention_analysis.score}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.retention_analysis.observation}</p>
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Fatigue Analysis */}
                  {selectedAI.ai_recommendation?.fatigue_analysis && (
                    <div className={`border rounded-lg overflow-hidden ${selectedAI.ai_recommendation.fatigue_analysis.is_fatigued ? 'border-red-300' : 'border-green-300'
                      }`}>
                      <div className={`px-3 py-2 border-b flex items-center justify-between ${selectedAI.ai_recommendation.fatigue_analysis.is_fatigued ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Fatigue Analysis</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAI.ai_recommendation.fatigue_analysis.is_fatigued ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                          {selectedAI.ai_recommendation.fatigue_analysis.is_fatigued ? 'FATIGUED' : 'HEALTHY'}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.fatigue_analysis.observation}</p>
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Messaging Analysis */}
                  {selectedAI.ai_recommendation?.messaging_analysis && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Messaging Analysis</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAI.ai_recommendation.messaging_analysis.copy_hook_gap ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                          {selectedAI.ai_recommendation.messaging_analysis.copy_hook_gap ? 'COPY-HOOK GAP' : 'ALIGNED'}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.messaging_analysis.observation}</p>
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Quality Analysis */}
                  {selectedAI.ai_recommendation?.quality_analysis && (
                    <div className={`border rounded-lg overflow-hidden ${selectedAI.ai_recommendation.quality_analysis.meta_penalty ? 'border-red-300' : 'border-green-300'
                      }`}>
                      <div className={`px-3 py-2 border-b flex items-center justify-between ${selectedAI.ai_recommendation.quality_analysis.meta_penalty ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quality Analysis</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAI.ai_recommendation.quality_analysis.meta_penalty ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                          {selectedAI.ai_recommendation.quality_analysis.meta_penalty ? 'META PENALTY' : 'NO PENALTY'}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-700 leading-relaxed">{selectedAI.ai_recommendation.quality_analysis.observation}</p>
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Video Performance */}
                  {selectedAI.video_performance && Object.keys(selectedAI.video_performance).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Video Performance</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
                        {selectedAI.video_performance.video_play_rate !== undefined && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Play Rate</p>
                            <p className="text-lg font-bold text-[#1e4a79]">{selectedAI.video_performance.video_play_rate?.toFixed(1)}%</p>
                          </div>
                        )}
                        {selectedAI.video_performance.video_30_sec_rate !== undefined && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">30s Hold</p>
                            <p className="text-lg font-bold text-[#1e4a79]">{selectedAI.video_performance.video_30_sec_rate?.toFixed(1)}%</p>
                          </div>
                        )}
                        {selectedAI.video_performance.video_completion_rate !== undefined && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Completion</p>
                            <p className="text-lg font-bold text-[#1e4a79]">{selectedAI.video_performance.video_completion_rate?.toFixed(1)}%</p>
                          </div>
                        )}
                        {selectedAI.video_performance.video_avg_time_watched !== undefined && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Avg Watch</p>
                            <p className="text-lg font-bold text-[#1e4a79]">{selectedAI.video_performance.video_avg_time_watched?.toFixed(1)}s</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Engagement Quality */}
                  {selectedAI.engagement_quality && Object.keys(selectedAI.engagement_quality).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Engagement Quality</h4>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                        {selectedAI.engagement_quality.click_quality_score !== undefined && (
                          <div>
                            <span className="text-gray-500">Click Quality Score:</span>
                            <span className={`ml-2 font-bold ${selectedAI.engagement_quality.click_quality_score > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {selectedAI.engagement_quality.click_quality_score?.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {selectedAI.engagement_quality.link_click_rate !== undefined && (
                          <div>
                            <span className="text-gray-500">Link Click Rate:</span>
                            <span className="ml-2 font-bold text-gray-800">{selectedAI.engagement_quality.link_click_rate?.toFixed(1)}%</span>
                          </div>
                        )}
                        {selectedAI.engagement_quality.add_to_cart_rate !== undefined && (
                          <div>
                            <span className="text-gray-500">ATC Rate:</span>
                            <span className="ml-2 font-bold text-gray-800">{selectedAI.engagement_quality.add_to_cart_rate?.toFixed(1)}%</span>
                          </div>
                        )}
                        {selectedAI.engagement_quality.click_to_purchase_rate !== undefined && (
                          <div>
                            <span className="text-gray-500">Click → Purchase:</span>
                            <span className="ml-2 font-bold text-gray-800">{selectedAI.engagement_quality.click_to_purchase_rate?.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ad-Specific: Meta Quality Scores */}
                  {selectedAI.meta_quality_scores && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Meta Quality Rankings</h4>
                      </div>
                      <div className="p-3 space-y-2">
                        {selectedAI.meta_quality_scores.quality_ranking && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Quality Ranking:</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${selectedAI.meta_quality_scores.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-600' :
                              selectedAI.meta_quality_scores.quality_ranking === 'BELOW_AVERAGE' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                              {selectedAI.meta_quality_scores.quality_ranking.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        {selectedAI.meta_quality_scores.engagement_rate_ranking && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Engagement Ranking:</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${selectedAI.meta_quality_scores.engagement_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-600' :
                              selectedAI.meta_quality_scores.engagement_rate_ranking === 'BELOW_AVERAGE' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                              {selectedAI.meta_quality_scores.engagement_rate_ranking.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        {selectedAI.meta_quality_scores.conversion_rate_ranking && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Conversion Ranking:</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${selectedAI.meta_quality_scores.conversion_rate_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-600' :
                              selectedAI.meta_quality_scores.conversion_rate_ranking === 'BELOW_AVERAGE' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                              {selectedAI.meta_quality_scores.conversion_rate_ranking.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                  {/* Budget Analysis / Allocation Audit */}
                  {(selectedAI.ai_recommendation?.budget_analysis || selectedAI.ai_recommendation?.budget_allocation_audit) && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {selectedAI.ai_recommendation.budget_allocation_audit ? 'Budget Allocation' : 'Budget Analysis'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(selectedAI.ai_recommendation.budget_analysis?.efficiency_score === 'HIGH' ||
                          selectedAI.ai_recommendation.budget_allocation_audit?.verdict === 'Efficient' ||
                          selectedAI.ai_recommendation.budget_analysis?.verdict?.toLowerCase().includes('scale')) ? 'bg-green-100 text-green-600' :
                          (selectedAI.ai_recommendation.budget_analysis?.efficiency_score === 'MEDIUM' ||
                            selectedAI.ai_recommendation.budget_allocation_audit?.verdict === 'Average' ||
                            selectedAI.ai_recommendation.budget_analysis?.verdict?.toLowerCase().includes('maintain')) ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                          {selectedAI.ai_recommendation.budget_analysis?.verdict ||
                            selectedAI.ai_recommendation.budget_allocation_audit?.verdict ||
                            (selectedAI.ai_recommendation.budget_analysis?.efficiency_score ? selectedAI.ai_recommendation.budget_analysis.efficiency_score + ' Efficiency' : 'Action Required')}
                        </span>
                      </div>
                      <div className="p-3 space-y-3">
                        {/* Budget Analysis Verdict & Observation */}
                        {selectedAI.ai_recommendation.budget_analysis?.verdict && (
                          <div className={`p-4 rounded-xl border-l-4 ${selectedAI.ai_recommendation.budget_analysis.verdict.toLowerCase().includes('scale') ? 'bg-green-50 border-green-500' :
                            selectedAI.ai_recommendation.budget_analysis.verdict.toLowerCase().includes('kill') || selectedAI.ai_recommendation.budget_analysis.verdict.toLowerCase().includes('reduce') ? 'bg-red-50 border-red-500' :
                              'bg-yellow-50 border-yellow-500'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-500 uppercase">Growth Verdict</span>
                              <div className="flex gap-1">
                                {['Kill', 'Reduce', 'Maintain', 'Scale'].map((level) => {
                                  const verdict = selectedAI.ai_recommendation.budget_analysis.verdict.toLowerCase();
                                  const isActive = verdict.includes(level.toLowerCase());
                                  return (
                                    <div key={level} className={`w-8 h-1.5 rounded-full ${isActive ? (
                                      level === 'Kill' || level === 'Reduce' ? 'bg-red-500' :
                                        level === 'Maintain' ? 'bg-yellow-500' : 'bg-green-500'
                                    ) : 'bg-gray-200'
                                      }`} title={level}></div>
                                  );
                                })}
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-800 mb-1">{selectedAI.ai_recommendation.budget_analysis.verdict}</p>
                            {selectedAI.ai_recommendation.budget_analysis.observation && (
                              <p className="text-xs text-gray-600 leading-relaxed">{selectedAI.ai_recommendation.budget_analysis.observation}</p>
                            )}
                          </div>
                        )}

                        {/* New Allocation Audit Observation */}
                        {selectedAI.ai_recommendation.budget_allocation_audit && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-orange-600">📊</span>
                              <span className="text-xs font-bold text-orange-700 uppercase">Mode: {selectedAI.ai_recommendation.budget_allocation_audit.mode}</span>
                            </div>
                            <p className="text-xs text-gray-800 font-medium">{selectedAI.ai_recommendation.budget_allocation_audit.observation}</p>
                          </div>
                        )}
                        {/* Top Performer */}
                        {selectedAI.ai_recommendation.budget_analysis?.top_performer && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-green-600">🏆</span>
                              <span className="text-xs font-bold text-green-700 uppercase">Top Performer</span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{selectedAI.ai_recommendation.budget_analysis.top_performer.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedAI.ai_recommendation.budget_analysis.top_performer.reason}</p>
                          </div>
                        )}
                        {/* Budget Leaks */}
                        {selectedAI.ai_recommendation.budget_analysis?.budget_leaks?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
                              <span>⚠️</span> Budget Leaks Detected
                            </p>
                            {selectedAI.ai_recommendation.budget_analysis.budget_leaks.map((leak, i) => (
                              <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">{leak.name}</p>
                                    <p className="text-xs text-gray-600">Spend: ${leak.spend?.toLocaleString()} | ROAS: {leak.roas}x</p>
                                  </div>
                                  <span className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold">{leak.recommendation}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4-Factor Strategic Breakdown */}
                  {selectedAI.ai_recommendation?.factors && Object.keys(selectedAI.ai_recommendation.factors).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Strategic Factor Analysis</h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {Object.entries(selectedAI.ai_recommendation.factors).map(([key, value]) => (
                          <div key={key} className="px-4 py-3">
                            <h5 className="text-xs font-bold text-[#1e4a79] uppercase tracking-wide mb-1 flex items-center gap-2">
                              {key === 'audience_creative' && <span>🎯</span>}
                              {key === 'budget' && <span>💰</span>}
                              {key === 'bid' && <span>📊</span>}
                              {key === 'placement' && <span>📍</span>}
                              {key.replace(/_/g, ' ')}
                            </h5>
                            <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actionable Recommendations */}
                  {selectedAI.ai_recommendation?.recommendations?.length > 0 && (
                    <div className="border border-[#1e4a79]/30 rounded-lg overflow-hidden">
                      <div className="bg-[#1e4a79] px-4 py-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">Recommended Actions</h4>
                      </div>
                      <div className="divide-y divide-gray-100 bg-blue-50/30">
                        {selectedAI.ai_recommendation.recommendations.map((rec, i) => (
                          <div key={i} className="p-3 bg-blue-50/30">
                            <div className="flex gap-3">
                              <span className={`flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${rec.priority === 'HIGH' ? 'bg-red-500' : rec.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}>
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' : rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                    }`}>{rec.priority}</span>
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase">{rec.type || rec.optimizer}</span>
                                  <span className="text-sm font-bold text-gray-800">{rec.action} {rec.target_entity_name ? `: ${rec.target_entity_name}` : ''}</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{rec.rationale}</p>
                                {(rec.technical_detail || rec.instruction || rec.expected_impact) && (
                                  <div className="bg-white border border-gray-200 rounded p-2 text-xs space-y-1">
                                    {(rec.instruction || rec.technical_detail) && (
                                      <p><span className="font-bold text-gray-500">Instruction:</span> {rec.instruction || rec.technical_detail}</p>
                                    )}
                                    {rec.expected_impact && (
                                      <p><span className="font-bold text-green-600">Expected:</span> {rec.expected_impact}</p>
                                    )}
                                    {rec.implementation_data && (
                                      <p className="text-gray-500">
                                        <span className="font-bold">Change:</span> {rec.implementation_data.field}: {rec.implementation_data.current_value} → {rec.implementation_data.new_value}
                                      </p>
                                    )}
                                    {rec.target_id && (
                                      <p className="text-gray-400 text-[10px] mt-1">Target ID: {rec.target_id}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Performance Metrics */}
                  {selectedAI.metrics && Object.keys(selectedAI.metrics).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Performance Metrics</h4>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-10 divide-x divide-gray-200">
                        {Object.entries(selectedAI.metrics).map(([key, value]) => (
                          <div key={key} className="p-2 text-center">
                            <p className="text-[8px] font-bold text-gray-500 uppercase mb-0.5">{key}</p>
                            <p className="text-xs font-bold text-[#1e4a79]">
                              {key === 'roas' ? `${Number(value).toFixed(2)}x` :
                                key === 'ctr' ? `${Number(value).toFixed(2)}%` :
                                  ['cpc', 'cpm', 'cpa'].includes(key) ? `$${Number(value).toFixed(2)}` :
                                    ['spend', 'revenue'].includes(key) ? `$${Number(value).toLocaleString()}` :
                                      ['purchases', 'impressions', 'reach'].includes(key) ? Number(value).toLocaleString() :
                                        value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AdSets */}
                  {selectedAI.adsets?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">AdSets ({selectedAI.adsets.length})</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left font-bold text-gray-600">Name</th>
                              <th className="px-2 py-2 text-center font-bold text-gray-600">Status</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Spend</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">ROAS</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">CPA</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Purch</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Freq</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Share</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedAI.adsets.map((adset) => (
                              <tr key={adset.id} className={adset.roas < 1 ? 'bg-red-50' : adset.roas > 3 ? 'bg-green-50' : ''}>
                                <td className="px-3 py-2 font-medium text-gray-800 truncate max-w-[150px]">{adset.name}</td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${adset.effective_status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {adset.effective_status}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-right text-gray-700">${adset.spend?.toFixed(0)}</td>
                                <td className={`px-2 py-2 text-right font-bold ${adset.roas >= 2 ? 'text-green-600' : adset.roas < 1 ? 'text-red-600' : 'text-yellow-600'}`}>{adset.roas?.toFixed(1)}x</td>
                                <td className="px-2 py-2 text-right text-gray-700">${adset.cpa?.toFixed(0)}</td>
                                <td className="px-2 py-2 text-right text-gray-700">{adset.purchases}</td>
                                <td className={`px-2 py-2 text-right ${adset.frequency > 2 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{adset.frequency?.toFixed(1)}</td>
                                <td className="px-2 py-2 text-right text-gray-700">{adset.spend_share_pct}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Ads */}
                  {selectedAI.ads?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Ads ({selectedAI.ads.length})</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left font-bold text-gray-600">Name</th>
                              <th className="px-2 py-2 text-center font-bold text-gray-600">Quality</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Spend</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">ROAS</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">CTR</th>
                              <th className="px-2 py-2 text-right font-bold text-gray-600">Purch</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedAI.ads.map((ad) => (
                              <tr key={ad.id}>
                                <td className="px-3 py-2 font-medium text-gray-800 truncate max-w-[150px]">{ad.name}</td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ad.quality_ranking === 'ABOVE_AVERAGE' ? 'bg-green-100 text-green-600' : ad.quality_ranking === 'BELOW_AVERAGE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {ad.quality_ranking?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-right text-gray-700">${ad.spend?.toFixed(0)}</td>
                                <td className={`px-2 py-2 text-right font-bold ${ad.roas >= 2 ? 'text-green-600' : ad.roas < 1 ? 'text-red-600' : 'text-yellow-600'}`}>{ad.roas?.toFixed(1)}x</td>
                                <td className="px-2 py-2 text-right text-gray-700">{ad.ctr?.toFixed(2)}%</td>
                                <td className="px-2 py-2 text-right text-gray-700">{ad.purchases}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Placements */}
                  {selectedAI.placements?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Placements</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
                        {selectedAI.placements.map((p, i) => (
                          <div key={i} className="p-3 text-center">
                            <p className="text-xs font-bold text-gray-800 capitalize">{p.platform} {p.position}</p>
                            <p className="text-lg font-bold text-[#1e4a79]">{p.roas?.toFixed(1)}x</p>
                            <p className="text-[10px] text-gray-500">${p.spend?.toLocaleString()} | {p.ctr?.toFixed(1)}% CTR</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500 text-sm">No analysis data available.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedScalingItem(null);
                  setSelectedAI(null);
                }}
                className="px-6 py-2 bg-[#1e4a79] text-white rounded-full text-sm font-bold hover:bg-[#163a5f] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PerformanceExplorer
